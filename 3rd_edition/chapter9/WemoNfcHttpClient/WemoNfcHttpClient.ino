/*
  WeMo NFC HTTP Client
  Context: Arduino, with WINC1500 module
*/
#include <SPI.h>          // include SPI library
#include <WiFi101.h>      // include WiFi101 library
//#include <ESP8266WiFi.h>// use this instead of WiFi101 for ESP8266 modules
#include <ArduinoHttpClient.h>
#include "config.h"
#include <PN532_SPI.h>    // include SPI library for PN532
#include <PN532.h>        // include PN532 library
#include <NfcAdapter.h>   // include NFC library

PN532_SPI pn532spi(SPI, 11);          // initialize adapter
NfcAdapter nfc = NfcAdapter(pn532spi);

const int tagLed = 5;               // LED to indicate tags' presence
const int wifiLed = 4;              // LED to indicate WiFi connection
WiFiClient netSocket;               // network socket to device
const int port = 49153;             // port number
String route = "/upnp/control/basicevent1";  // API route
boolean wemoStates[] = {0, 0};      // state of the wemo switches
String username = "";               // the username
String wemoAddress = "";            // address of the current wemo
int wemoNumber = -1;                // the current wemo number

// string for the SOAP request:
String soap = "<?xml version=\"1.0\" encoding=\"utf-8\"?> \
<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\" \
s:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\"> \
<s:Body> \
<u:SetBinaryState xmlns:u=\"urn:Belkin:service:basicevent:1\"> \
<BinaryState>1</BinaryState></u:SetBinaryState></s:Body> \
</s:Envelope>";

void setup() {
  Serial.begin(9600);               // initialize serial communication
  nfc.begin();                      // initialize NFC communication
  pinMode(tagLed, OUTPUT);          // make tagLed an output
  pinMode(wifiLed, OUTPUT);         // make wifiLed an output

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
  if (nfc.tagPresent()) {                          // read NFC tag
    digitalWrite(tagLed, HIGH);                    // indicate tag presence
    NfcTag tag = nfc.read();                       // get data
    if (tag.hasNdefMessage()) {                    // if tag has a message
      NdefMessage message = tag.getNdefMessage();  // get message
      int recordCount = message.getRecordCount();  // get records count

      for (int r = 0; r < recordCount; r++) {
        NdefRecord record = message.getRecord(r);  // get record
        int payloadLength = record.getPayloadLength();// get payload length
        byte payload[payloadLength];               // array for payload
        record.getPayload(payload);                // get payload
        String payloadString;                      // clear payloadString
        for (int c = 3; c < payloadLength; c++) {  // get bytes from byte 3
          payloadString += (char)payload[c];       // copy to payloadString
        }

        Serial.println(payloadString);            // print payloadString
        copyRecords(r, payloadString);
      }     // end of record for-loop
    }       // end of if tag.hasMessage()
  }         // end of if tagPresent()
  digitalWrite(tagLed, LOW);                      // indicate tag is gone
  if (WiFi.status() == WL_CONNECTED) {            // indicate  WiFi connection
    digitalWrite(wifiLed, HIGH);
  } else {
    digitalWrite(wifiLed, HIGH);
  }
  delay(3000);                                    // let the user remove tag
}

void copyRecords(int recordNum, String recordString) {
  switch (recordNum) {  // do something different for each record
    case 0:     // the username record; nothing to do
      break;
    case 1:     // the wemo number record; convert to integer
      wemoNumber = recordString.toInt();
      break;
    case 2:     // the IP address record; make request
      wemoAddress = recordString;           // if you have an IP address,
      wemoRequest(wemoNumber, wemoAddress); // then you can make a request
      break;
  }   // end of case statement
}

void wemoRequest( int thisWemo, String wemo) {
  if (wemoStates[thisWemo] == 0) { // if the wemo's off
    soap.replace(">0<", ">1<");   // turn it on
  } else {                        // otherwise
    soap.replace(">1<", ">0<");   // turn it off
  }
  wemoStates[thisWemo] = !wemoStates[thisWemo];   // toggle wemoState

  HttpClient http(netSocket, wemo.c_str(), port); // make an HTTP client
  http.connectionKeepAlive();             // keep the connection alive
  http.beginRequest();                    // start assembling the request
  http.post(route);                       // set the route
  // add the headers:
  http.sendHeader("Content-type", "text/xml; charset=utf-8");
  String soapAction = "\"urn:Belkin:service:basicevent:1#SetBinaryState\"";
  http.sendHeader("SOAPACTION", soapAction);
  http.sendHeader("Connection: keep-alive");
  http.sendHeader("Content-Length", soap.length());
  http.endRequest();                      // end the request
  http.println(soap);                     // add the body
  Serial.println("request sent");

  while (http.connected()) {              // while connected to the server,
    if (http.available()) {               // if there's a server response,
      String result = http.readString();  // read it
      Serial.println(result);             // and print it
    }
  }
}

