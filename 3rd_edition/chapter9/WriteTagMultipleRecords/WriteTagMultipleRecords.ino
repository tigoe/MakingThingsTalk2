/*
  NDEF card writer
  context: Arduino
*/
#include <SPI.h>          // include SPI library
#include <PN532_SPI.h>    // include SPI library for PN532
#include <PN532.h>        // include PN532 library
#include <NfcAdapter.h>   // include NFC library

PN532_SPI pn532spi(SPI, 11);          // initialize adapter
NfcAdapter nfc = NfcAdapter(pn532spi);

void setup() {
  Serial.begin(9600); // open serial communications
  nfc.begin();        // open NFC communications  
}

void loop() {
  Serial.println("Put a formatted Mifare Classic tag on the reader.");
  if (nfc.tagPresent()) {
    NdefMessage message = NdefMessage();
    message.addTextRecord("Tom Igoe");     // user name
    message.addTextRecord("1");            // switch number
    message.addTextRecord("192.168.0.17"); // switch IP address
    if (nfc.write(message)) {
      Serial.println("Sucess. Tag written.");
    } else {
      Serial.println("Write failed");
    }
  }
  Serial.println();     // blank line at the end
  delay(3000);          // give the user time to remove the tag
}
