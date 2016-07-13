/*
  Video Controller TCP Socket Client
  Context: Arduino, with WINC1500 module
*/
// include required libraries and config files
#include <SPI.h>
#include <WiFi101.h>
#define ENCODER_DO_NOT_USE_INTERRUPTS
#include <Encoder.h>
#include <Button.h>
#include "config.h"      // includes char ssid[] and char pass[] for WiFi connect

const char serverAddress[] = "192.168.0.12";  // server address
int port = 8080;                              // port number
WiFiClient tcpSocket;                         // server socket

Encoder myEncoder(0, 1);       // instance of the encoder library
Button playButton(2);          // instances of the button library
Button connectButton(3);
const int playLED = 4;         // pin numbers for the LEDs
const int connectLED = 5;

boolean playing = false;       // what the video state should be
long lastPosition  = 0;        // last read position of the encoder

void setup() {
  Serial.begin(9600);          // initialize serial communication
  pinMode(0, INPUT_PULLUP);    // initialize encoder pins
  pinMode(1, INPUT_PULLUP);
  pinMode(connectLED, OUTPUT); // intialize LED pins
  pinMode(playLED, OUTPUT);
  connectButton.begin();       // initialize buttons
  playButton.begin();

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
  // read the sensors:
  readEncoder();
  readButtons();

  // check for incoming data from the server:
  if (tcpSocket.connected()) {          // if connected to the server,
    if (tcpSocket.available()) {        // if there is a response from the server,
      String result = tcpSocket.readString();  // read it
      Serial.print(result);             // and print it (for diagnostics only)
    }
  }
  // update the status LEDs:
  digitalWrite(connectLED, tcpSocket.connected());
  digitalWrite(playLED, playing);
}

void readEncoder() {
  long position = myEncoder.read();       // read the encoder
  long difference = position - lastPosition;  // compare to last position
  if (difference != 0) {                  // if it's changed,
    if (tcpSocket.connected()) {          // if the socket's connected,
      tcpSocket.print("position:");       // send the key
      tcpSocket.println(difference);      // send the value
    }
    lastPosition = position;              // update lastPosition
  }
}

void readButtons() {
  if (connectButton.toggled()) {          // if connect button has changed
    if (connectButton.read() == LOW) {    // and it's pressed
      if (!tcpSocket.connected()) {       // if you're not connected,
        connectToServer();                // connect to server
      } else {                            // if you're already connected,
        tcpSocket.println("exit:1");      // disconnect
      }
    }
  }                                       // end of connectButton.toggled

  if (playButton.toggled()) {             // if the play button has changed
    if (playButton.read() == LOW) {       // and it's LOW
      playing = !playing;                 // toggle playing state
      if (tcpSocket.connected()) {        // if you're connected,
        tcpSocket.print("playing:");      // send the key
        tcpSocket.println(playing);       // send the value
      }
    }
  }                                       // end of playButton.toggled
}                                         // end of readButtons()

void connectToServer() {
  Serial.println("attempting to connect");
  // attempt to connect to the server on the given port:
  if (tcpSocket.connect(serverAddress, port)) {
    Serial.println("connected");
  } else {
    Serial.println("failed to connect");
  }
}

