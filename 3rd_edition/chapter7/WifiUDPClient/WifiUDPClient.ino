/*
  UDP Query Responder
  context: Arduino
*/
#include <WiFi101.h>
//#include <ESP8266WiFi.h>
#include <WiFiUdp.h>
#include "settings.h"

WiFiUDP Udp;                // instance of UDP library
const int port = 8888;      // port on which this client receives

void setup() {
  Serial.begin(9600);
  // while you're not connected to a WiFi AP:
  while ( WiFi.status() != WL_CONNECTED) {
    Serial.print("Attempting to connect to Network named: ");
    Serial.println(ssid);
    WiFi.begin(ssid, password); //   try to connect
    delay(5000);       // wait 2 seconds before trying again
  }

  Serial.println("Connected to wifi");
  printWifiStatus();
  Udp.begin(port);
}

void loop() {
  // if there's data available, read a packet
  if (Udp.parsePacket() > 0) {        // parse incoming packet
    String message = "";              
    Serial.print("From: ");           // print the sender
    Serial.print(Udp.remoteIP());
    Serial.print(" on port: ");       // and the port they sent on
    Serial.println(Udp.remotePort());
    while (Udp.available() > 0) {     // parse the body of the message
      message = Udp.readString();
    }
    Serial.print("msg: " + message);  // print it
    sendPacket(message);              // send a reply
  }
}
void sendPacket(String message) {
  // start a new packet:
  Udp.beginPacket(Udp.remoteIP(), Udp.remotePort());
  Udp.print("Received: " + message); // add payload to it
  Udp.endPacket();                   // finish and send packet
}

void printWifiStatus() {
  // print the SSID of your network:
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  // print your IP address:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  // print the received signal strength:
  long rssi = WiFi.RSSI();
  Serial.print("signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
}
