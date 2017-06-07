/*
  Video Controller WebSocket Client
  Context: Arduino, with WINC1500 module
*/
#include <SPI.h>
#include <WiFi101.h>
#include <ArduinoHttpClient.h>
#include "config.h"     // includes char ssid[] and char pass[] for WiFi connect

const char serverAddress[] = "192.168.0.22";  // server address
int port = 8080;                              // port number
WiFiClient tcpSocket;                         // server socket

// make a websocket instance
WebSocketClient webSocket = WebSocketClient(tcpSocket, serverAddress, port);


void setup() {
  Serial.begin(9600);               // initialize serial communication

  // while you're not connected to a WiFi AP,
  while ( WiFi.status() != WL_CONNECTED) {
    Serial.print("Attempting to connect to Network named: ");
    Serial.println(ssid);           // print the network name (SSID)
    WiFi.begin(ssid, password);     // try to connect
    delay(2000);
  }

  // When you're connected, print out the device's network status:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);
}

void loop() {

  // while websocket is connected, listen for incoming messages:
  if (webSocket.connected()) {
    int msgLength = webSocket.parseMessage();  // get message length
    if (msgLength > 0) {                       // if it's > 0,
      String message = webSocket.readString(); // read it
      Serial.println(message);                 // print it
    }
  }

  if (Serial.available()) {
    String input = Serial.readString();
    if (input == "c") {
      connectToServer();
    } else if (input == "x") {
      webSocket.stop();
    } else {
      if (webSocket.connected()) {              // and the webSocket's connected,
        webSocket.beginMessage(TYPE_TEXT);   // message type: text
        webSocket.print(input);
        webSocket.endMessage();
      }
    }
  }
}


void connectToServer() {
  Serial.println("attempting to connect");
  boolean error = webSocket.begin();   // attempt to connect
  if (error) {
    Serial.println("failed to connect");
  } else {
    Serial.println("connected");
  }
}
