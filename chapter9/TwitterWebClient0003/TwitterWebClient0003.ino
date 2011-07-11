/*
 Twitter RFID Web Client
 Language: Arduino
 */
#include <SPI.h>
#include <Ethernet.h>
#include <TextFinder.h>
#include <Wire.h>
#include <LiquidCrystal.h>
#include <SonMicroReader.h>

SonMicroReader Rfid;            // instance of the reader library
unsigned long tag = 0;
unsigned long lastTag = 0;          // address of the previous tag
int addressBlock = 4;               // memory block on the tag to read

String twitterHandle = "";
int status = 0;
// Enter a MAC address and IP address for your controller below.
// The IP address will be dependent on your local network:
byte mac[] = { 
  0x00, 0xAA, 0xBB, 0xCC, 0xDE, 0x01 };
//IPAddress ip(192,168,1,20);               // will only be used if DHCP fails
IPAddress ip(128,122,151,6);               // will only be used if DHCP fails

IPAddress server(199,59,149,200);    // Twitter's API address
Client client;                            // the client connection


String tweet = "";               // the tweet
char tweetBuffer[150];
int tweetLength = 0;
boolean readingTweet = false;    // if you're in the middle of a tweet

long lastRequestTime = 0;       // last time you connected to the server, in milliseconds
int requestDelay = 15 * 1000;   // time between HTTP requests to the same twitter ID


// initialize the library with the numbers of the interface pins
LiquidCrystal lcd(9,8, 7, 6,5, 3);
const int screenWidth = 16;         // width of the LCD in characters
String shortString = "";           // the string to display on the screen
long lastScrollTime = 0;            // last time you scrolled the LCD   
int scrollDelay = 250;              // delay between LCD moves
int cursorPosition = 0;                   // first position of the tweet that's on the LCD


void setup() {
  // initalize serial communications and the reader:
  Serial.begin(9600); 
//     start the Ethernet connection:
  if (Ethernet.begin(mac) == 0) {
    Serial.println("Failed to configure Ethernet using DHCP");
    Ethernet.begin(mac, ip);
  }
  Rfid.begin();
  // set up the LCD's number of columns and rows: 
  lcd.begin(screenWidth,2);
  lcd.clear();
  lcd.println("Starting");

}


void loop() {
  switch(status) {
  case 0:    // get tag
    tag = Rfid.selectTag();
    if (tag != 0) {
      // you have a tag, so print it:
      Serial.println(tag, HEX);  
      status++;
    }
    break;
  case 1:    // read block
    if (Rfid.authenticate(addressBlock)) {
      Serial.print("authenticated");
      // read the tag for the twitter handle:
      Rfid.readBlock(addressBlock);
      twitterHandle = Rfid.getString();
      Serial.println(twitterHandle);
      status++;
    } 
    else status = 0;

    break;
  case 2:    //connect to server
    // if this is a new tag, or if the request delay
    // has passed since the last time you made a HTTP request:
    if (tag != lastTag || 
      millis() - lastRequestTime > requestDelay) {
      // attempt to connect:
      if (connectToServer()) {
        status++;
      } 
      else status = 0;
    } 
    else status = 0; 
    lastTag = tag;  
    break;
  case 3:    // read response
    tweetLength = readResponse();
    status = 0;
    break;
  }


  // if you haven't moved the LCD recently:
  if (millis() - lastScrollTime > scrollDelay) {
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
}


// this method takes a substring of the long
// tweet string to display on the screen

void scrollLongString(int startPos) {
  // string that will be on the screen:
  shortString = "";
  // make sure there's enough of the long string left:
  if (startPos < tweetLength - screenWidth) {
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

boolean connectToServer() {
  // note the time of this connect attempt:
  lastRequestTime = millis();
  // attempt to connect:
  Serial.println("connecting to server");
  if (client.connect(server, 80)) {
    Serial.println("making HTTP request");
    // make HTTP GET request:
    client.print("GET /1/statuses/user_timeline.xml?screen_name=");
    client.print(twitterHandle);
    client.println(" HTTP/1.1");
    client.println("Host:api.twitter.com");
    client.println();
    return true;
  } 
  else {
    Serial.print("failed to connect");
    return false;
  }
}

int readResponse() {
  int result = 0;
  // if there are bytes available from the server:
  while (client.connected()) {
    if (client.available()) {
      // make an instance of TextFinder to search the response:
      TextFinder response(client);
      // see if the response from the server contains <text>:
      result = response.getString("<text>", "</text>", tweetBuffer, 150);
      // print the tweet string:
      Serial.println(tweetBuffer);
      tweet = String(tweetBuffer);
      // you only care about the tweet:
      client.stop();
    }
  }
  return result;
}








