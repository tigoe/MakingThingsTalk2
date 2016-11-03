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
    WiFi.begin(ssid, pass); //   try to connect
    delay(2000);       // wait 2 seconds before trying again
  }

  server.begin();      // When you're connected, start the server

  // print out the device's network status
  Serial.print("To see this device's web interface, go to http://");
  IPAddress ip = WiFi.localIP();
  Serial.println(ip);
}

void loop() {
  // listen for incoming clients
  WiFiClient client = server.available();
  while (client.connected()) {    // while the client is connected,
    if (client.available()) {     // and there are incoming bytes to read,
      // read the incoming line by line:
      String request  = client.readStringUntil('\n');
      Serial.println(request);            // print the line
      // if the request is a blank line (\n or \r\n):
      if (request.length() <= 2) {
        client.println("HTTP 200 OK\n"); // send an HTTP response
         client.println("\r\n\r\n"); // send an HTTP response
        client.print("Sensor Value: "); // send an HTTP response
        int sensorValue = analogRead(A0);
        client.println(sensorValue); // send an HTTP response
       
        delay(10);                       // give the server time to get the data
        if (client.connected()) {        // if the client's still connected
          client.stop();                 // disconnect the client
        }
      }
    }
  }
}
