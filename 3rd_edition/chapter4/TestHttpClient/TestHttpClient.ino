/*
  Test HTTP Client
  Context: Arduino, with WINC1500 module or uBlox NINA module
 
*/
// include required libraries and config files
#include <SPI.h>
//#include <WiFi101.h>        // use this for MKR1000 boards
//#include <ESP8266WiFi.h>  // use this instead of WiFi101 for ESP8266 modules
#include <WiFiNINA.h>       // use this for MKR1010 and Nano 33 IoT boards
#include "arduino_secrets.h"
#include <ArduinoHttpClient.h>
#include "arduino_secrets.h"

WiFiClient netSocket;               // network socket to server
const char server[] = "www.example.com";  // server name
String route = "/api/route";              // API route

void setup() {
  Serial.begin(9600);               // initialize serial communication

  // while you're not connected to a WiFi AP,
  while ( WiFi.status() != WL_CONNECTED) {
    Serial.print("Attempting to connect to Network named: ");
    Serial.println(SECRET_SSID);           // print the network name (SSID)
    WiFi.begin(SECRET_SSID, SECRET_PASS);         // try to connect
    delay(2000);
  }

  // When you're connected, print out the device's network status:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);
}

void loop() {
  Serial.println("making request");
  HttpClient http(netSocket, server, 80);      // make an HTTP client
  http.get(route);  // make a GET request

  // read the status code and body of the response
  int statusCode = http.responseStatusCode();
  String response = http.responseBody();

  // print them:
  Serial.print("Status code from server: ");
  Serial.println(statusCode);
  Serial.print("Server response: ");
  Serial.println(response);
  Serial.println();

  while (http.connected()) {       // while connected to the server,
    if (http.available()) {        // if there is a response from the server,
      String result = http.readString();  // read it
      Serial.print(result);               // and print it
    }
  }
  //  // when there's nothing left to the response,
  http.stop();                     // close the request
  delay(5000);                    // wait 10 seconds
}
