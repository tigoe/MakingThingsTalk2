/*
 Twitter RFID Web Client
 Context: Arduino
 */
#include <SPI.h>
#include <Ethernet.h>
#include <TextFinder.h>
#include <Wire.h>
#include <LiquidCrystal.h>
#include <SonMicroReader.h>

SonMicroReader Rfid;       // instance of the reader library
unsigned long tag = 0;     // address of the current tag
unsigned long lastTag = 0; // address of the previous tag
int addressBlock = 4;      // memory block on the tag to read

int state = 0;   // go back to first state              // the state that the sketch is in

// Enter a MAC address and IP address for your controller below.
// The IP address will be dependent on your local network:
byte mac[] = { 
  0x00, 0xAA, 0xBB, 0xCC, 0xDE, 0x01 };
//IPAddress ip(192,168,1,20);          // will only be used if DHCP fails
IPAddress ip(128,12,151,6);          // will only be used if DHCP fails

IPAddress server(199,59,149,200);    // Twitter's API address
EthernetClient client;                       // the client connection

String twitterHandle = "";       // the tweeter
String tweet = "";               // the tweet
int tweetBufferLength;           // the space to reserve for the tweet
int tweetLength = 0;             // the actual length of the tweet

long lastRequestTime = 0;       // last time you connected to the server
int requestDelay = 15 * 1000;   // time between HTTP requests


// initialize the library with the numbers of the interface pins
LiquidCrystal lcd(9,8, 7, 6,5, 3);
const int screenWidth = 16;         // width of the LCD in characters
long lastScrollTime = 0;            // last time you scrolled the LCD   
int scrollDelay = 130;              // delay between LCD moves
int cursorPosition = 0;             // cursor position on the LCD

const int potVoltage = A0;
const int potGround = A2;
const int potInput = A1;

void setup() {
  // initalize serial communications and the reader:
  Serial.begin(9600); 
  //     start the Ethernet connection:
  if (Ethernet.begin(mac) == 0) {
    Serial.println(F("Failed to configure Ethernet using DHCP"));
    Ethernet.begin(mac, ip);
  }
  // set pins A0 and A2 to digital out, and use them as
  // power and ground for the scroll speed potentiometer:
  pinMode(potGround, OUTPUT);
  pinMode(potVoltage, OUTPUT);
  digitalWrite(potGround, LOW);
  digitalWrite(potVoltage, HIGH);

  // reserve 140 * 2 screenWidths + 3 bytes extra for tweet:
  tweetBufferLength = 140 + 2*screenWidth + 3;
  tweet.reserve(tweetBufferLength);   
  Rfid.begin();
  // set up the LCD's number of columns and rows: 
  lcd.begin(screenWidth,2);
  lcd.clear();
  lcd.print(F("Ready"));
}


void loop() {
  switch(state) {
  case 0:    // get tag
    tag = Rfid.selectTag();
    if (tag != 0) {
      // you have a tag, so print it:
      Serial.println(tag, HEX);  
      state++;    // go to the next state
    }
    break;
  case 1:    // read block
    if (Rfid.authenticate(addressBlock)) {
      Serial.print(F("authenticated "));
      // read the tag for the twitter handle:
      Rfid.readBlock(addressBlock);
      twitterHandle = Rfid.getString(); 
      // show the handle:
      lcd.clear();              // clear previous stuff
      lcd.setCursor(0,0);       // move the cursor to the beginning of the top line
      lcd.print(twitterHandle); // tweet handle on the top line 
      Serial.println(twitterHandle);
      state++;        // go to the next state
    } 
    else state = 0;   // go back to first state
    break;
  case 2:    //connect to server
    // if this is a new tag, or if the request delay
    // has passed since the last time you made a HTTP request:
    if (tag != lastTag || 
      millis() - lastRequestTime > requestDelay) {
      // attempt to connect:
      if (connectToServer()) {
        state++;        // go to the next state
      } 
      else state = 0;   // go back to first state
    } 
    else state = 0;     // go back to first state 
    lastTag = tag;  
    break;
  case 3:    // read response
    tweetLength = readResponse();
    state = 0;   // go back to first state
    break;
  }


  // if you haven't moved the LCD recently:
  if (tweetLength > 0 && millis() - lastScrollTime > scrollDelay) {
    // advance the LCD:
    scrollLongString(cursorPosition);
    // increment the LCD cursor position:
    if (cursorPosition < tweetLength) {
      cursorPosition++;
    } 
    else {
      cursorPosition = 0;
    }
    // note the last time you moved the LCD:
    lastScrollTime = millis();    
  } 

  // update the speed of scrolling from the second potentiometer:
  int sensorReading = analogRead(potInput);
  // map to a scrolling delay of 100 - 300 ms:
  scrollDelay = map(sensorReading, 0, 1023, 100, 300);
}


// this method takes a substring of the long
// tweet string to display on the screen

void scrollLongString(int startPos) {
  String shortString = "";           // the string to display on the screen
  // make sure there's enough of the long string left:
  if (startPos < tweetLength - screenWidth) {
    // take a 16-character substring:
    shortString = tweet.substring(startPos, startPos + screenWidth);
  } 
  // refresh the LCD:         
  lcd.clear();              // clear previous stuff
  lcd.setCursor(0,0);       // move the cursor to the beginning of the top line
  lcd.print(twitterHandle); // tweet handle on the top line
  lcd.setCursor(0,1);       // move the cursor to the beginning of the bottom line
  lcd.print(shortString);   // tweet, scrolling, on the bottom
}


// this method connects to the server
// and makes a HTTP request:

boolean connectToServer() {
  // note the time of this connect attempt:
  lastRequestTime = millis();
  // attempt to connect:
  Serial.println(F("connecting to server"));
  if (client.connect(server, 80)) {
    Serial.println(F("making HTTP request"));
    // make HTTP GET request:
    client.print(F("GET /1/statuses/user_timeline.xml?screen_name="));
    client.print(twitterHandle);
    client.println(F(" HTTP/1.1"));
    client.println(F("Host:api.twitter.com"));
    client.println();
    return true;
  } 
  else {
    Serial.print(F("failed to connect"));
    return false;
  }
}

int readResponse() {
  char tweetBuffer[141];    // 140 chars + 1 extra

  int result = 0;
  // if there are bytes available from the server:
  while (client.connected()) {
    if (client.available()) {
      // make an instance of TextFinder to search the response:
      TextFinder response(client);
      // see if the response from the server contains <text>:
      response.getString("<text>", "</text>", tweetBuffer, 141);
      // print the tweet string:
      Serial.println(tweetBuffer);
      // make a String with padding on both ends:
      tweet = "                " + String(tweetBuffer) 
        +  "                ";
      result = tweet.length();
      // you only care about the tweet:
      client.stop();
    }
  }
  return result;
}



