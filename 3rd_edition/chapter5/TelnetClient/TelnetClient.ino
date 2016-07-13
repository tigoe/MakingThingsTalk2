/*
  Test HTTP Client
  Context: Arduino, with WINC1500 module
*/
// include required libraries and config files
#include <SPI.h>
#include <WiFi101.h>
//#include <ESP8266WiFi.h>    // use this instead of WiFi101 for ESP8266 modules
#include "config.h"

WiFiClient netSocket;               // network socket to server
const char serverAddress[] = "192.168.0.12";  // server name

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
  while (netSocket.connected()) {       // while connected to the server,
    if (netSocket.available()) {        // if there is a response from the server,
      String result = netSocket.readString();  // read it
      Serial.print(result);               // and print it
    }

    if (millis() % 5000 < 3) {
      netSocket.println("p");
      Serial.println("p");
    }
  }
  connect();
}

void connect() {
  if (netSocket.connect(serverAddress, 8080)) {
    Serial.println("connected");
  }
}

