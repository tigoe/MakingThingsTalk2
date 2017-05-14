/*
  RSSI HTTP Client
  Context: Arduino, with WINC1500 module
*/
// include required libraries and config files
#include <SPI.h>
#include <WiFi101.h>
//#include <ESP8266WiFi.h>    // use this instead of WiFi101 for ESP8266 modules
#include <ArduinoHttpClient.h>
#include "config.h"

WiFiClient netSocket;               // network socket to server
const char server[] = "192.168.0.8";  // server name
String route = "/rssi/";              // API route

void setup() {
  Serial.begin(9600);               // initialize serial communication
  // while you're not connected to a WiFi AP,
  while ( WiFi.status() != WL_CONNECTED) {
    Serial.print("Attempting to connect to Network named: ");
    Serial.println(ssid);           // print the network name (SSID)
    WiFi.begin(ssid, password);     // try to connect
    delay(2000);
  }
  Serial.print("Connected to: "); // Now that you're connected,
  Serial.println(ssid);           // print out the network name
}

void loop() {
  HttpClient http(netSocket, server, 8080); // make an HTTP client
  int rssi = WiFi.RSSI();                   // get the RSSI
  http.post(route + rssi);                  // make a POST request

  while (http.connected()) {                // while connected to the server,
    if (http.available()) {                 // if there is a response,
      String result = http.readString();    // read it
      Serial.println(result);               // and print it
    }
  }
  // when there's nothing left to the response,
  http.stop();                     // close the request
  delay(3000);                    // wait 3 seconds
}
