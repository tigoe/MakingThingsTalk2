/*
  Test HTTPS Client
  To make this work you'll need to install the server's SSL certificate
  using these instructions:
  https://github.com/cvalenzuela/understanding-networks/blob/master/HTTPS.md

  created 12 Feb 2018
  by Tom Igoe
*/
// include required libraries and config files
#include <SPI.h>
#include <WiFi101.h>
#include <ArduinoHttpClient.h>
#include "arduino_secrets.h"

// Set your network name (ssid) and password in the arduino_secrets.h tab
const char ssid[] = SECRET_SSID;
const char pass[] = SECRET_PASS;

WiFiSSLClient netSocket;            // network socket to server
const char server[] = "yourserver.com";  // server name
String route = "/data";             // API route

void setup() {
  Serial.begin(9600);               // initialize serial communication

  // while you're not connected to a WiFi AP,
  while ( WiFi.status() != WL_CONNECTED) {
    Serial.print("Attempting to connect to Network named: ");
    Serial.println(ssid);           // print the network name (SSID)
    WiFi.begin(ssid, pass);         // try to connect
    delay(2000);
  }

  // When you're connected, print out the device's network status:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);
}

void loop() {
  HttpClient https(netSocket, server, 443);      // make an HTTPS client

  int sensor = analogRead(A0);
  String reading = "{\"sensor\"=" + String(sensor);
  reading += "}";                         // close the JSON object

  String contentType = "application/json";// Set the content type

  https.beginRequest();                    // start assembling the request
  https.post(route, contentType, reading );// make a post request
  delay(10);                               // delay to wait for reply

  while (https.connected()) {              // while connected to the server,
    if (https.available()) {               // if there is a response from the server,
      String result = https.readString();  // read it
      Serial.print(result);                // and print it
    }
  }
  // when there's nothing left to the response,
  https.stop();                     // close the request
  delay(10000);                    // wait 10 seconds
}

