/*
  Test HTTPS Client
  Based on the Test HTTP Client from Making Things Talk, 3rd ed.

  If you need to install your server's SSL certificate, you can
  use these instructions:
  https://github.com/cvalenzuela/understanding-networks/blob/master/HTTPS.md
  (works for both MKR1000 and MKR1010/Nano33IoT)
  created 12 Feb 2018
  modified 8 Feb 2020
  by Tom Igoe
*/

// include required libraries and config files
#include <SPI.h>
#include <WiFiNINA.h>           // use this  for MKR1010/Nano 33 IoT modules
//#include <WiFi101.h>          // use this  for MKR1000/WINC1500 modules
//#include <ESP8266WiFi.h>      // use this for ESP8266 modules
#include <ArduinoHttpClient.h>
#include "arduino_secrets.h"

WiFiSSLClient netSocket;                  // network socket to server
const char server[] = "www.example.com";  // server name
String route = "/";                       // API route
int portNumber = 443;

void setup() {
  Serial.begin(9600);               // initialize serial communication

  // while you're not connected to a WiFi AP,
  while ( WiFi.status() != WL_CONNECTED) {
    Serial.print("Attempting to connect to Network named: ");
    Serial.println(SECRET_SSID);           // print the network name (SSID)
    WiFi.begin(SECRET_SSID, SECRET_PASS);  // try to connect
    delay(2000);
  }

  // When you're connected, print out the device's network status:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);
}

void loop() {
  HttpClient http(netSocket, server, portNumber); // make an HTTP client
  http.get(route);                                // make a GET request

  while (http.connected()) {              // while connected to the server,
    if (http.available()) {               // if there is a response from the server,
      String result = http.readString();  // read it
      Serial.print(result);               // and print it
    }
  }
  // when there's nothing left to the response,
  http.stop();                     // close the request
  delay(10000);                    // wait 10 seconds
}
