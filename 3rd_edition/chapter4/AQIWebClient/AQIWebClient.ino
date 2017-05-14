/*
  AirNow Web Client
  Context: Arduino, with WINC1500 module
*/
// include required libraries and config files

#include <WiFi101.h>
//#include <ESP8266WiFi.h>    // use this instead of WiFi101 for ESP8266 modules
#include <ArduinoHttpClient.h>
#include "config.h"

// declare I/O pin numbers and global variables:
const int networkLED = LED_BUILTIN; // indicates network connection
const int connectedLED = 4;         // indicates connection to server
const int meterPin = 5;             // controls voltmeter
const int meterMin = 0;             // minimum level for the meter
const int meterMax = 255;           // maximum level for the meter
const int AQIMax = 200;             // maximum level for air quality
const long requestInterval = 120000;// delay between updates to the server

WiFiClient netSocket;               // network socket to server
const char serverAddress[] = "www.airnowapi.org";  // server name
String route = "/aq/observation/latLong/current/"; // API route
long lastRequestTime = 0;           // last request time, in ms

void setup() {
  Serial.begin(9600);               // initialize serial communication
  pinMode(networkLED, OUTPUT);      // set network LED pin as output
  pinMode(connectedLED, OUTPUT);    // set connected LED pin
  pinMode(meterPin, OUTPUT);        // set voltmeter pin

  // while you're not connected to a WiFi AP,
  while ( WiFi.status() != WL_CONNECTED) {
    Serial.print("Attempting to connect to Network named: ");
    Serial.println(ssid);           // print the network name (SSID)
    WiFi.begin(ssid, password);     // try to connect
    blink(networkLED, 5);           // blink the network LED
  }

  // When you're connected, print out the device's network status:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);
  //append the parameters and API key to the route:
  route += "?format=application/json&latitude=40.7296";
  route += "&longitude=-73.9936&date=2016-05-10T00-0000&distance=10";
  route += "&API_KEY=";
  route +=  APIKey;
}

void loop() {
  // make an HTTP request once every two minutes:
  if (millis() - lastRequestTime > requestInterval) {
    connectToServer();
  }
  // update the status LEDs:
  setLeds();
}

void connectToServer() {
  int AQI = -1;          // AQI value
 
  // make HTTP call:
  HttpClient http(netSocket, serverAddress); // make an HTTP client
  http.get(route);                           // make a GET request
  http.skipResponseHeaders();                // ignore the HTTP headers
  // while connected to the server:
  while (http.connected()) {
    setLeds();                       // update status LEDs
    if (http.available()) {          // if there's a response from the server,
      http.findUntil("PM2.5", "\n"); // parse response for "PM2.5"
      AQI = http.parseInt();         // read PM2.5 value from the response
      http.flush();                  // throw out the rest of the response
    }
  }
  if (AQI > -1) {                     // If you got an AQI value,
    Serial.print("PM2.5: ");          // print it out, and
    Serial.println(AQI);
    setMeter(AQI);                    //  set the meter
  }
  http.stop();                        // close the request
  lastRequestTime = millis();         // save the time of this HTTP call
}

void setMeter(int level) {
  // map the result to a range the meter can use:
  int meterSetting = map(level, 0, AQIMax, meterMin, meterMax);
  // set the meter:
  analogWrite(meterPin, meterSetting);
}

void setLeds() {
  // if the network is connected, turn on network LED:
  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(networkLED, HIGH);
  } else {
    digitalWrite(networkLED, LOW);
  }
  // if the TCP socket is connected, turn on connected LED:
  int connectedToServer = netSocket.connected();
  digitalWrite(connectedLED, connectedToServer);
}

void blink(int thisPin, int howManyTimes) {
  // Blink the LED:
  for (int blinks = 0; blinks < howManyTimes; blinks++) {
    digitalWrite(thisPin, HIGH);
    delay(200);
    digitalWrite(thisPin, LOW);
    delay(200);
  }
}
