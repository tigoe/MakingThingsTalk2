/*
  Web  Server
  Context: Arduino, with WINC1500 module
*/


#include <SPI.h>
#include <WiFi101.h>
//#include <ESP8266WiFi.h>    // use this instead of WiFi101 for ESP8266 modules
#include "config.h"

WiFiServer server(80);        // make an instance of the server class

void setup() {
  Serial.begin(9600);// initialize serial communications
  // while you're not connected to a WiFi AP:
  while ( WiFi.status() != WL_CONNECTED) {
    Serial.print("Attempting to connect to Network named: ");
    Serial.println(ssid);
    WiFi.begin(ssid, password); //   try to connect
    delay(2000);       // wait 2 seconds before trying again
  }

  server.begin();      // When you're connected, start the server

  // print out the device's network address
  Serial.print("To see this device's web interface, go to http://");
  IPAddress ip = WiFi.localIP();
  Serial.println(ip);
}


void loop() {
  // listen for incoming clients
  WiFiClient client = server.available();
  while (client.connected()) {    // while the client is connected,
    if (client.available()) {     // and there are incoming bytes to read
      // read the first line up to the first space to get the request type:
      String request  = client.readStringUntil(' ');
      // check if the request is GET or POST:
      if (request == "GET" || request == "POST") {
        // continue reading the stream, looking for  / characters:
        String lastToken = "";           // the last token you read
        while (!lastToken.endsWith("HTTP")) {   //  until lastToken ends with "HTTP"
          String currentToken = client.readStringUntil('/'); // read next token
          if (lastToken == "age") {
            int age = currentToken.toInt();  // here's the parameter you want
            Serial.print("age: ");
            Serial.println(age);
          }
          // check other tokens the same way
          lastToken = currentToken;
        }
        client.println("HTTP 200 OK\n\n"); // send an HTTP response
        if (client.connected()) {        // if the client's still connected
          client.stop();                 // disconnect the client
        }
      }
    }
  }
}
