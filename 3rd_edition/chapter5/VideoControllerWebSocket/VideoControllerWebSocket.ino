/*
  Video Controller WebSocket Client
  Context: Arduino, with WINC1500 module
*/
#include <SPI.h>
#include <WiFi101.h>
#include <ArduinoHttpClient.h>
#define ENCODER_DO_NOT_USE_INTERRUPTS
#include <Encoder.h>
#include "config.h"     // includes char ssid[] and char pass[] for WiFi connect

const char serverAddress[] = "192.169.0.12";  // server address
int port = 8080;                              // port number
WiFiClient tcpSocket;                         // server socket

// make a websocket instance
WebSocketClient webSocket = WebSocketClient(tcpSocket, serverAddress, port);

Encoder myEncoder(0, 1);
const int playButton = 2;
const int connectButton = 3;
const int playLED = 4;
const int connectLED = 5;

boolean playing = false;
long lastPosition = 0;
int playButtonState = LOW;
int connectButtonState = LOW;

void setup() {
  Serial.begin(9600);               // initialize serial communication
  pinMode(0, INPUT_PULLUP);         // initialize encoder pins
  pinMode(1, INPUT_PULLUP);
  pinMode(connectLED, OUTPUT);      // intialize LED pins
  pinMode(playLED, OUTPUT);
  pinMode(connectButton, INPUT);            // initialize buttons
  pinMode(playButton, INPUT);

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
  readEncoder();
  readButtons();

  // while websocket is connected, listen for incoming messages:
  if (webSocket.connected()) {
    int msgLength = webSocket.parseMessage();  // get message length
    if (msgLength > 0) {                       // if it's > 0,
      String message = webSocket.readString(); // read it
      Serial.println(message);                 // print it
    }
  }
  // update the status LEDs:
  digitalWrite(connectLED, !webSocket.connected());
  digitalWrite(playLED, !playing);
}

void readEncoder() {
  long position = myEncoder.read();           // read the encoder
  long difference = position - lastPosition;  // compare to last position
  if (difference != 0) {                      // if it's changed,
    Serial.println(difference);

    if (webSocket.connected()) {              // and the webSocket's connected,
      sendJsonMessage("position", difference);// send a JSON message
    }
    lastPosition = position;                  // update lastPosition
  }
}

void readButtons() {
  int thisButton = digitalRead(connectButton);
  if (thisButton != connectButtonState) {         // if the connect button has changed
    if (connectButtonState == LOW) {   // and it's LOW
      if (!webSocket.connected()) {      // if you're not connected,
        connectToServer();               // connect to server
      } else {                           // if you're already connected,
        sendJsonMessage("exit", 1);      // disconnect
      }
    }
  }                                      // end of connectButton.toggled
  connectButtonState = thisButton;

  thisButton = digitalRead(playButton);
  if (thisButton != playButtonState) {            // if the play button has changed
    if (playButtonState == LOW) {      // and it's LOW
      playing = !playing;                // toggle playing state
      if (webSocket.connected()) {       // if you're connected,
        sendJsonMessage("playing", playing); // send a message
      }
    }
  }                                      // end of playButton.toggled
  playButtonState = thisButton;
}                                        // end of readButtons()

// This function forms a JSON message to send,
// from a key-value pair:
void sendJsonMessage(String key, int val) {
  webSocket.beginMessage(TYPE_TEXT);   // message type: text
  webSocket.print("{\"clientName\":\"MKR1000\"");
  if (key != "") {          // if there is no key, just send name
    webSocket.print(",\""); // comma, opening quotation mark
    webSocket.print(key);   // key
    webSocket.print("\":"); // closing quotation mark, colon
    webSocket.print(val);   // value
  }
  webSocket.print("}");
  webSocket.endMessage();
}

void connectToServer() {
  Serial.println("attempting to connect");
  boolean error = webSocket.begin();   // attempt to connect
  if (error) {
    Serial.println("failed to connect");
  } else {
    Serial.println("connected");
    sendJsonMessage("", 0);  // send the client name and nothing else
  }
}
