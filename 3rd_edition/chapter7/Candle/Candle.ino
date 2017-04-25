/*
  Networked NeoPixel Candle
  context: Arduino
*/
#include <SPI.h>
#include <WiFi101.h>
//#include <ESP8266WiFi.h>
#include <WiFiUdp.h>
#include <Adafruit_NeoPixel.h>
#include "settings.h"

WiFiUDP Udp;                        // an instance of the UDP library
IPAddress destination(192, 168, 0, 255); // UDP destination address for your network
const int port = 8888;              // UDP port

const int neoPixelPin = 5;          // NeoPixel control pin
const int numPixels = 7;            // number of NeoPixels you're using

// an instance of the NeoPixel library:
Adafruit_NeoPixel candle = Adafruit_NeoPixel(
                             numPixels, neoPixelPin, NEO_GRB + NEO_KHZ800);

// colors for the candle, in hex RGB:
unsigned long keyColors[] = {0xCB500F, 0xB4410C, 0x95230C, 0x853E0B};
unsigned long currentColor = keyColors[0];  // current color of the pixels
unsigned long target = keyColors[1];        // the color you're fading to
long lastFadeTime = millis();               // last time you changed the color
long interval = 30;                         // fading interval (30 ms)
int threshold = 500;                        // sensor threshold
boolean triggered;                          // sensor trigger flag variable

void setup() {
  Serial.begin(9600);   // initialize serial communication
  candle.begin();       // initialize NeoPixel control
  candle.clear();       // turn off all pixels
  candle.show();        // refresh the candle

  // while you're not connected to a WiFi AP:
  while ( WiFi.status() != WL_CONNECTED) {
    Serial.print("Attempting to connect to Network named: ");
    Serial.println(ssid);
    WiFi.begin(ssid, password); //   try to connect
    delay(2000);       // wait 2 seconds before trying again
  }

  Serial.println("Connected to wifi");
  printWifiStatus();
  Udp.begin(port);    // initialize UDP communications
}

void loop() {
  int sensorReading = analogRead(A0);   // read the sensor
  if (sensorReading > threshold) {      // it it's above the threshold
    Serial.println(sensorReading);        // print the sensor reading
    if (!triggered) {                   // and it's not already triggered
      currentColor = 0xFFFFFF;          // make the candle all white

      // send the message to the destination UDP address:
      Udp.beginPacket(destination, port);
      Udp.print("ping");
      Udp.endPacket();
      triggered = true;           // note that sensor was triggered
    }
  }
  // update candle every 30 ms:
  if (millis() - lastFadeTime >= interval) {
    triggered = false;             // reset sensor trigger

    if (currentColor != target) {
      // fade the current color toward the target color:
      currentColor = compare(currentColor, target);
    } else {
      // pick a new target color randomly from keyColors:
      int next = random(4);
      target = keyColors[next];
    }

    // set the color of all pixels:
    for (int pixel = 0; pixel < numPixels; pixel++) {
      candle.setPixelColor(pixel, currentColor);
    }

    if (WiFi.status() != WL_CONNECTED) {
      candle.setPixelColor(0, 0x0000FF);  // set one pixel to blue if network is disconnected
    }

    candle.show();            // refresh the candle
    lastFadeTime = millis();  // save the fade time for comparison
  }

  // if there's data available, read a packet
  if (Udp.parsePacket() > 0) {
    String line = "";
    // if there's a UDP packet, read it:
    while (Udp.available()) {
      line = Udp.readStringUntil('\n'); // read until the newline char
    }
    IPAddress sender = Udp.remoteIP(); // get the sender's IP
    Serial.print("From: ");            // print the sender
    Serial.print(sender);
    Serial.print(", message: ");       // and the message
    Serial.println(line);
    if (line == "ping") {              // if the message is "ping"
      currentColor = 0xFFFFFF;         // set the candle color to white
    }
  }
}

unsigned long compare(unsigned long thisColor, unsigned long thatColor) {
  // separate the first color:
  byte r = thisColor >> 16;       // shift bits to the right two bytes
  byte g = thisColor >>  8;       // shift bits to the right one byte
  byte b = thisColor;             // get the lowest byte

  // separate the second color:
  byte targetR = thatColor >> 16; // shift bits to the right two bytes
  byte targetG = thatColor >>  8; // shift bits to the right one byte
  byte targetB = thatColor;       // get the lowest byte

  // fade the first color toward the second color:
  if (r > targetR) r--; // if the current is greater, decrement it
  if (g > targetG) g--;
  if (b > targetB) b--;

  if (r < targetR) r++; // if the current is less, increment it
  if (g < targetG) g++;
  if (b < targetB) b++;

  // combine the values to get the new color:
  unsigned long  result = candle.Color(r, g, b);
  return result;
}

void printWifiStatus() {
  // print the SSID of the network you're attached to:
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

