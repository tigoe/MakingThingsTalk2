/*
 Toxic Gas Web Scraper
 Context: Arduino
 */
#include <SPI.h>
#include <Ethernet.h>
#include <TextFinder.h>

const int connectedLED = 2;          // indicates when there's a TCP connection
const int successLED = 3;            // indicates if the meter was set
const int resetLED = 4;              // indicates reset of Arduino
const int disconnectedLED = 5;       // indicates connection to server
const int requestInterval = 10000;  // delay between updates to the server

// Enter a MAC address and IP address for your controller below.
// The IP address will be dependent on your local network:
byte mac[] = { 0x00, 0xAA, 0xBB, 0xCC, 0xDE, 0x01 };
//IPAddress ip(192,168,1,20);
IPAddress ip(128,122,151,6);
char server[] = "www.tigoe.net";

// Initialize the Ethernet client library
// with the IP address and port of the server 
// that you want to connect to (port 80 is default for HTTP):
Client client;

boolean requested;                   // whether you've made a request since connecting
long lastAttemptTime = 0;            // last time you connected to the server, in milliseconds

void setup() {
  // start the Ethernet connection:
  Ethernet.begin(mac, ip);
  // start the serial library:
  Serial.begin(9600);
  // set all status LED pins:
  pinMode(connectedLED, OUTPUT);
  pinMode(successLED, OUTPUT);
  pinMode(resetLED, OUTPUT);
  pinMode(disconnectedLED, OUTPUT);

  // give the Ethernet shield a second to initialize:
  delay(1000);
  // blink the reset LED:
  blink(resetLED, 3);
  // attempt to connect:
  connectToServer();
}

void loop()
{
  // if you're connected, save any incoming bytes
  // to the input string:
  if (client.connected()) {
    if (!requested) {
      requested = makeRequest(); 
    }   
  }
  else if (millis() - lastAttemptTime > requestInterval) {
    // if you're not connected, and two minutes have passed since
    // your last connection, then attempt to connect again:
    client.stop();
    connectToServer();
  }

  // set the status LEDs:
  setLeds();
}

void connectToServer() {

  // attempt to connect, and wait a millisecond:
  Serial.println("connecting...");
  if (client.connect(server, 80)) {
    requested = false; 
  }
  // note the time of this connect attempt:
  lastAttemptTime = millis();
}

boolean makeRequest() {
  Serial.println("requesting...");
  // make HTTP GET request and fill in the path to
  // the PHP script on your server:
  client.print("GET /mtt3/toxic_report.php?");
  client.print()'
 client.println(" HTTP/1.1");
  // fill in your server's name:
  client.println("HOST: tigoe.net");
  client.println();
  return true;
}

boolean setMeter(int thisLevel) {
  Serial.println("setting meter...");
  boolean result = false;
  // map the result to a range the meter can use:   
  int meterSetting = map(thisLevel, 0, AQIMax, meterMin, meterMax);
  // set the meter:
  analogWrite(meterPin, meterSetting);
  if (meterSetting > 0) {
    result = true;
  }
  return result;
}

void setLeds() {
  // connected LED and disconnected LED can just use
  // the client's connected() status:
  digitalWrite(connectedLED, client.connected());
  digitalWrite(disconnectedLED, !client.connected());
  // success LED depends on reading being successful:
  digitalWrite(successLED, meterIsSet);
}

void blink(int thisPin, int howManyTimes) {
  //     Blink the reset LED:
  for (int blinks=0; blinks< howManyTimes; blinks++) {
    digitalWrite(thisPin, HIGH);
    delay(200);
    digitalWrite(thisPin, LOW);
    delay(200);  
  }
}
