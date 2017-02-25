/*
  WeMo NFC HTTP Client
  Context: Arduino, with WINC1500 module

  card data:
    username
    wemo number
    wemo IP address
*/
// include required libraries and config files
#include <SPI.h>
#include <WiFi101.h>
//#include <ESP8266WiFi.h>    // use this instead of WiFi101 for ESP8266 modules
#include <ArduinoHttpClient.h>
#include <Wire.h>
#include <PN532_I2C.h>
#include <PN532.h>
#include <NfcAdapter.h>

PN532_I2C pn532_i2c(Wire);
NfcAdapter nfc = NfcAdapter(pn532_i2c);

#include "config.h"

WiFiClient netSocket;               // network socket to device
const char wemo[] = "192.168.0.17"; // device address
int port = 49153;                   // port number
String route = "/upnp/control/basicevent1";  // API route
String soap;                        // string for the SOAP request
boolean wemoStates[] = {1, 1};      // state of the wemo switches

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
  delay(2000);
  nfc.begin();

  // set up the SOAP request string. This formatting is just
  // for readability of the code:
  soap = "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
  soap += "<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\"";
  soap += "s:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\">";
  soap += "<s:Body>";
  soap += "<u:SetBinaryState xmlns:u=\"urn:Belkin:service:basicevent:1\">";
  soap += "<BinaryState>1</BinaryState></u:SetBinaryState>";
  soap += "</s:Body></s:Envelope>";
}

void loop() {
  String username = "";           // the username
  String wemoAddress = "";        // address of the wemo you are talking to
  int wemoNumber = -1;            // the wemo number you are talking to

  if (nfc.tagPresent()) {                             // read NFC tag
    NfcTag tag = nfc.read();                          // get data
    if (tag.hasNdefMessage()) {                       // if tag has a message
      NdefMessage message = tag.getNdefMessage();     // get message
      int recordCount = message.getRecordCount();     // get records count 
      
      for (int r = 0; r < recordCount; r++) {
        NdefRecord record = message.getRecord(r);     // get record
        int payloadLength = record.getPayloadLength();// get payload length
        byte payload[payloadLength];                  // array for payload 
        record.getPayload(payload);                   // get payload
        String payloadString;                         // clear payloadString
        for (int c = 3; c < payloadLength; c++) {     // get bytes from byte 3
          payloadString += (char)payload[c];          // copy to payloadString
        }     
        
        switch (r) {  // do something different for each record
          case 0:     // the username record; nothing to do
            break;
          case 1:     // the wemo number record; convert to integer
            wemoNumber = payloadString.toInt();
            break;
          case 2:     // the IP address record; make request
            wemoAddress = payloadString;          // if you have an IP address,
            wemoRequest(wemoNumber, wemoAddress); // then you can make a request
            break;
        }   // end of case statement
        Serial.println(payloadString);            // print the payload string
      }     // end of record for-loop
    }       // end of if tag.hasMessage()
  }         // end of if tagPresent()
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
  http.sendHeader("");                    // a blank line before the body
  http.sendHeader(soap);                  // add the body
  http.endRequest();                      // end the request
  Serial.println("request opened");

  while (http.connected()) {              // while connected to the server,
    if (http.available()) {               // if there's a server response,
      String result = http.readString();  // read it
      Serial.println(result);             // and print it
    }
  }
}

