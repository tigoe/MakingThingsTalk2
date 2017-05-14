/*
  LoRa Duplex communication
  context: Arduino
*/
#include <SPI.h>              // include libraries
#include <LoRa.h>

const int buttonPin = 4;
const int receiveLED = 5;
const int csPin = 7;          // LoRa radio chip select
const int resetPin = 6;       // LoRa radio reset
const int irqPin = 1;         // change for your board; must be a hardware interrupt pin

int lastButtonState = HIGH;   // initial pushbutton state
byte msgCount = 0;            // count of outgoing messages
byte localAddress = 0xBB;     // address of this device
byte destination = 0xFF;      // destination to send to
byte syncWord = 0xB4;         // Sync word (network ID)
byte spreadingFactor = 8;     // spreading factor (6-12);

void setup() {
  Serial.begin(9600);                   // initialize serial
  LoRa.setPins(csPin, resetPin, irqPin);// set CS, reset, IRQ pin
  if (!LoRa.begin(915E6)) {             // initialize ratio at 915Mhz
    Serial.println("LoRa init failed. Check your connections.");
    while (true);                       // if failed, do nothing
  }
  LoRa.setSyncWord(syncWord);
  LoRa.setSpreadingFactor(spreadingFactor);
  LoRa.setTimeout(10);                  // set Stream timeout of 10ms
  Serial.println("LoRa init succeeded.");
  // set the I/O pin modes:
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(receiveLED, OUTPUT);
}

void loop() {
  int buttonState = digitalRead(buttonPin);// read the pushbutton
  if (buttonState  != lastButtonState) {   // if it’s changed
    delay(3);                              // debounce delay
    if (buttonState == LOW) {              // if it’s low
      String message = "HeLoRa!";          // send a message
      sendMessage(message);
      Serial.println(message);             // print the message sent
    }
    lastButtonState = buttonState;         // save button state
  }

  // parse for a packet, and call onReceive with the result:
  onReceive(LoRa.parsePacket());
}

void sendMessage(String outgoing) {
  LoRa.beginPacket();                      // start packet
  LoRa.write(destination);                 // add destination address
  LoRa.write(localAddress);                // add sender address
  LoRa.write(msgCount);                    // add message ID
  LoRa.write(outgoing.length());           // add payload length
  LoRa.print(outgoing);                    // add payload
  LoRa.endPacket();                        // finish packet and send it
  msgCount++;                              // increment message count
}

void onReceive(int packetSize) {
  if (packetSize == 0) return;        // if there's no packet, return

  digitalWrite(receiveLED, HIGH);     // turn on  the receive LED
  // read packet header bytes:
  int recipient = LoRa.read();        // recipient address
  byte sender = LoRa.read();          // sender address
  byte incomingMsgId = LoRa.read();   // incoming msg ID
  byte msgLength = LoRa.read();       // incoming msg length
  String incoming = LoRa.readString();// payload of packet

  if (msgLength != incoming.length()) { // check length for error
    Serial.println("error: message length is wrong.");
    return;           // skip rest of loop
  }
  // if the recipient isn't this device or broadcast,
  if (recipient != localAddress && recipient != 0xFF) {
    Serial.println("This message is not for me.");
    return;           // skip rest of loop
  }
  // if message is for this device, or broadcast, print details:
  Serial.print("Received from: ");
  Serial.println(sender, HEX);
  Serial.print("Sent to: ");
  Serial.println(recipient, HEX);
  Serial.print("Message ID: ");
  Serial.println(incomingMsgId);
  Serial.print("Message length: ");
  Serial.println(msgLength);
  Serial.print("Message: ");
  Serial.println(incoming);
  Serial.print("RSSI: ");
  Serial.println(LoRa.packetRssi());
  Serial.print("Snr: ");
  Serial.println(LoRa.packetSnr());
  Serial.println();
  digitalWrite(receiveLED, LOW);      // turn off receive LED
}

