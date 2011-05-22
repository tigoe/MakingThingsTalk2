
/*
 Twitter RFID Web Client
 Language: Arduino
 */
#include <SPI.h>
#include <Ethernet.h>
#include <TextFinder.h>
#include <Wire.h>
#include <LiquidCrystal.h>


// Enter a MAC address and IP address for your controller below.
// The IP address will be dependent on your local network:
byte mac[] = { 
  0x00, 0xAA, 0xBB, 0xCC, 0xDE, 0x01 };
IPAddress ip(192,168,1,20);               // will only be used if DHCP fails
char serverName[] = "api.twitter.com";    // Twitter's API URL
Client client;                            // the client connection

String twitterHandle = "@nobody";        // tweet handle to come from RFID tag
String tweet = "No tweets yet";          // the tweet
boolean readingTweet = false;            // if you're in the middle of a tweet

long lastRequestTime = 0;       // last time you connected to the server, in milliseconds
int requestDelay = 10 * 1000;   // time between HTTP requests to the same twitter ID

// commands for RFID reader:
const int RESET = 0x80;      
const int SELECT = 0x83;
const int AUTHENTICATE = 0x85;
const int READ = 0x86;

unsigned long tag = 0;              // address of the current tag
unsigned long lastTag = 0;          // address of the previous tag
int addressBlock = 4;               // memory block on the tag to read
boolean authenticated = false;      // whether you successfully authenticated the tag
byte responseBuffer[64];            // To hold the last response from the reader

// initialize the library with the numbers of the interface pins
LiquidCrystal lcd(9,8, 5, 4, 3, 2);
const int screenWidth = 16;         // width of the LCD in characters

long lastScrollTime = 0;            // last time you scrolled the LCD   
int scrollDelay = 250;              // delay between LCD moves
int cursorPosition = 0;                   // first position of the tweet that's on the LCD

void setup() {
  // start the serial library:
  Serial.begin(9600);
  // attempt to connect by DHCP:
  if (!Ethernet.begin(mac)) {
    // start the Ethernet connection manually:
    Ethernet.begin(mac, ip);
  }
  // reserve space for the tweet strings:
  twitterHandle.reserve(50);
  tweet.reserve(240);

  // start the I2C communication to the RFID reader:
  Wire.begin();  
  // reset the reader:
  sendCommand(RESET);

  // set up the LCD's number of columns and rows: 
  lcd.begin(screenWidth,2);
  // print something to the LCD:
  scrollLongString(0);
  // give the Ethernet shield and RFID reader
  // two seconds to initialize:
  delay(2000);
}

void loop() {
  // if you're not connected to the server:
  if (!client.connected() ) {
    tag = getTag();
    // while you're waiting for a tag:
    while (tag == 0) {
      // if you haven't moved the LCD recently:
      if (millis() - lastScrollTime > scrollDelay) {
        // advance the LCD:
        scrollLongString(cursorPosition);
        // increment the LCD cursor position:
        if (cursorPosition < tweet.length()) {
          cursorPosition++;
        } 
        else {
          cursorPosition = 0;
        }
        // note the last time you moved the LCD:
        lastScrollTime = millis();    
      }
      // try again to get a tag:
      tag = getTag();
    }
    // you have a tag, so print it:
    Serial.println(tag, HEX);

    // if you can authenticate the tag:
    if (authenticate(addressBlock)) {
      // read the tag for the twitter handle:
      int responseCode = readTwitterHandle();


      // if you're not connected and you read the handle:
      if (!client.connected() && responseCode == 'U') {
        Serial.println(twitterHandle);
        // if this is a new tag, or if the request delay
        // has passed since the last time you made a HTTP request:
        if (tag != lastTag || 
          millis() - lastRequestTime > requestDelay) {
          // attempt to connect:
          connectToServer();
        } 
      }
    } 
    // save the current tag as the previous
    // for next time:
    lastTag = tag;
  } 
  // if you're connected to the server:
  else {
    // if there are bytes available from the server:
    if (client.available()) {
      // make an instance of TextFinder to search the response:
      TextFinder response(client);
      // see if the response from the server contains <text>:
      if (response.find("<text>")) {
        // clear the tweet string:
        tweet = "";
        // read new bytes from the server:
        char inChar = client.read();
        // until you get "<", add the bytes to the tweet:
        while(inChar!='<')  {
          tweet += inChar;
          inChar = client.read();
        }
        // if you got a tweet, prepare it for display:
        if (tweet != "") {
          // add a separator between handle and tweet:
          twitterHandle += ":";
          // add spaces at the beginning and end of the tweet:
          for (int c=0; c < screenWidth; c++) {
            tweet = " " + tweet;
            tweet += " ";
          }
          // reset the cursor position:
          cursorPosition = 0;
          // print the tweet string:
          Serial.println(tweet);
          // you only care about the tweet:
          client.stop();
        }
      }
    }
  } 
}

// this method takes a substring of the long
// tweet string to display on the screen

void scrollLongString(int startPos) {
  // string that will be on the screen:
  String shortString = "";
  // make sure there's enough of the long string left:
  if (startPos < tweet.length() - screenWidth) {
    // take a 16-character substring:
    shortString = tweet.substring(startPos, startPos + screenWidth);
  } 
  // refresh the LCD:
  lcd.clear();              // clear previous stuff
  lcd.print(twitterHandle);       // tweet handle on the top line
  lcd.setCursor(0,1);       // move cursor down
  lcd.print(shortString);   // tweet, scrolling, on the bottom
}

// this method connects to the server
// and makes a HTTP request:

void connectToServer() {
  // if you're still connected to the server,
  // disconnect for a new request:
  if (client.connected()) client.stop();

  // attempt to connect:
  Serial.println("connecting to server");
  if (client.connect(serverName, 80)) {
    Serial.println("making HTTP request");
    // make HTTP GET request:
    client.print("GET /1/statuses/user_timeline.xml?screen_name=");
    client.print(twitterHandle);
    client.println(" HTTP/1.1");
    client.println("HOST:api.twitter.com");
    client.println();
  }
  // note the time of this connect attempt:
  lastRequestTime = millis();
}



// Authenticate yourself to the RFID tag.
//
boolean authenticate(int block) {
  int length = 3;
  int command[] = {
    AUTHENTICATE,  // authenticate
    block,
    0xFF  // The rest are the keys
  };  
  // send the command:
  sendCommand(command, length);  
  // wait for a response:
  getResponse(4);
  // response 0x4C (ASCII L) means
  // you successfully authenticated
  if (responseBuffer[2] == 0x4C) {
    return true;
  } 
  else {
    // No tag or login failed
    return false;
  }
}

// Select a tag in the field:
unsigned long getTag(){
  unsigned long result = 0;
  // send the command:
  sendCommand(SELECT); 
  // wait for the response: 
  getResponse(8); 
  // first byte returned is the message length:
  int length = responseBuffer[0];
  // two bytes means no read:
  if (length == 2) {
    return 0;
  } 
  // a successful tag read is 6 or 9 bytes:
  if (length == 6 || length == 9) {
    // tag bytes come in reverse order:
    for (int thisByte = length; thisByte >= 3; thisByte--) {
      // shift the current byte up one byte:
      result = result << 8;
      // add the new byte to the end of the tag:
      result += responseBuffer[thisByte]; 
    }
    return result;
  }
}

// Retrieve a response from the reader
// from any command:

int getResponse(int numBytes) {  
  // The reader can't respond in less than
  // 50 ms:
  delay(50);
  // get response from reader:
  Wire.requestFrom(0x42, numBytes);

  int count = 0;
  // while data is coming from the reader,
  // add it to the response buffer:
  while(Wire.available())  {     
    responseBuffer[count] = Wire.read();  
    count++;
  }  
  // put a 0 in the last byte after the reponse:
  responseBuffer[count] = 0;
  // return the length of the response:
  return count;
}

// Read a block. You need to authenticate() 
// before you can call this.

int readBlock(int block) {
  int length = 2;
  int command[] = {
    READ,  // read block
    block 
  };
  // send the command:
  sendCommand(command, length);  
  // get 20 bytes (3 response + 16 bytes data + checksum)
  int count = getResponse(20);  
  // response 0x4E (ASCII N) means no tag:
  if (responseBuffer[2] == 0x4E) { 
    return 0;
  } 
  // response 0x46 (ASCII F) means read failed:
  else if (responseBuffer[2] == 0x46) {
    return 0;
  }
  return count;
}

// this method extracts the twitter handle
// from a block of memory in the tag:

int readTwitterHandle() {
  int response = 0;
  // Read the payload contained in this sector.
  int payloadSize = readBlock(addressBlock);
  // clear the twitter handle string:
  twitterHandle = "";
  if (payloadSize > 0) { 
    // the text is in bytes 4 to the
    // second last byte (the last is the checksum):
    for (int c = 4; c < payloadSize-1; c++) {
      char thisChar = (char)responseBuffer[c];
      // if the byte is a printable ASCII character,
      // add it to the twitter handle:
      if (isPrintable(thisChar)) {
        twitterHandle += thisChar;
      }
    }

    if (twitterHandle.length() > 0) {
      response = 'U';  // you got a good handle
    } 
    else {
      response = 'N';  // Got nothin' for ya pal
    }
  }
  return response; 
}

// This method sends a command to the 
// RFID readers via I2C. This function is 
// overloaded, meaning there are two versions, so you
// can call it in more than one way:
void sendCommand(int thisCommand) {
  byte length = 1;
  // convert the byte to an array:
  int commandBuffer[] = {
    thisCommand  };
  // call the other sendCommand method:
  sendCommand(commandBuffer, length);
}

// Send a command to the reader
//

void sendCommand(int command[], int length) {
  Wire.beginTransmission(0x42); 
  int checksum = length;       // Starting value for the checksum.
  Wire.write(length);          // send the length

  for (int i = 0; i < length; i++) {
    checksum += command[i];    // Add each byte to the checksum
    Wire.write(command[i]);    // send the byte
  }
  
  // checksum is the low byte of the sum of 
  // the other bytes:
  checksum = checksum % 256; 
  Wire.write(checksum);        // send the checksum
  Wire.endTransmission();      // end the I2C connection
}

