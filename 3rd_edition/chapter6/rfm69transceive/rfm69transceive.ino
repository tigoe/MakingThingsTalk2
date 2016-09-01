/*
 RFM69 transceiver
 Context: Arduino
 */
#include <SPI.h>
#include <RFM69.h>

// define pin numbers:
// for 101:
//const int chipSelect = 10;  // to RFM69 chip select pin
//const int irq = 2;          // to RFM69 IRQ pin
//const int irqNum = 2;       // interrupt number on the microcontroller

// for Uno:
//const int chipSelect = 10; // to RFM69 chip select pin
//const int irq = 2;         // to RFM69 IRQ pin
//const int irqNum = digitalPinToInterrupt(irq); // interrupt number

// for MKR1000:
const int chipSelect = 7;  // to RFM69 chip select pin
const int irq = 5;        // to RFM69 IRQ pin
const int irqNum = digitalPinToInterrupt(irq); // interrupt number

// for all boards:
const int resetPin = 4;
const int buttonPin = 3;
const int receiveLED = 6;

// define radio’s network identity and address:
const int networkID = 100;
int nodeAddress = 1;
int destination = 2; 

// set radio’s frequency and encryption, and specific type
const int frequency = RF69_915MHZ;
const char encryptKey[] = "yourSecretString";
const int IS_RFM69HCW = true;
// initialize the library:
RFM69 radio = RFM69(chipSelect, irq, IS_RFM69HCW, irqNum);

String input;               // incoming message
String message;             // outgoing message
int receiveCount = 0;       // count of received messages
int lastButtonState = HIGH; // initial pushbutton state

void setup() {
  Serial.begin(9600);     // initialize serial communications

  // reset the RFM radio by taking RST high, then low:
  pinMode(resetPin, OUTPUT);
  digitalWrite(resetPin, HIGH);
  delay(100);
  digitalWrite(resetPin, LOW);
  delay(100);

  // set the I/O pin modes:
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(receiveLED, OUTPUT);

  // Initialize the RFM radio:
  radio.initialize(frequency, nodeAddress, networkID);
  if (IS_RFM69HCW) {         // if it is an RFM69HCW,
    radio.setHighPower();    // set the high power mode
  }
  radio.setPowerLevel(31);   // set power level (range: 0 - 31)
  radio.encrypt(encryptKey); // set encryption key

  // print out address and destination:
  Serial.println("Listening at 915 MHz");
  Serial.print("address: " );
  Serial.println(nodeAddress);
  Serial.print("sending to: ");
  Serial.println(destination);
}

void loop() {
  int buttonState = digitalRead(buttonPin); // read the pushbutton
  if (buttonState  != lastButtonState) {    // if it’s changed
    delay(3);                               // debounce delay
    if (buttonState == HIGH) {              // if it’s high
      message = "press";                    // send a message
      radio.sendWithRetry(destination, message.c_str(), message.length());
      Serial.println(message);              // print the message sent
    }
    lastButtonState = buttonState;          // save button state
  }

  //check if an incoming was message was received:
  if (radio.receiveDone()) {
    digitalWrite(receiveLED, LOW); // turn on  the LED
    if (radio.ACKRequested()) {     // if sender wanted acknowledgement,
      radio.sendACK();              // send it
      Serial.println("ACK sent");
    }
    // clear the input string for new incoming data:
    input = "";

    // loop over the incoming data and copy it to the input string:
    for ( int c = 0; c < sizeof(radio.DATA); c++) {
      // a 0 byte indicates the end of the string.
      // Break out of the loop then:
      if (radio.DATA[c] == 0) break;
      // convert each byte to a char and add it to the input String:
      input += (char)radio.DATA[c];
    }

    receiveCount++;       // increment the message received count
    Serial.print("From: ");       // print the message and stats
    int sender = radio.SENDERID;
    int rssi = radio.RSSI;
    Serial.print(sender);
    Serial.print(" ");

    Serial.print(input);
    Serial.print("  RSSI:");
    Serial.println(rssi);
    Serial.print("Msgs received: ");
    Serial.println(receiveCount);
    digitalWrite(receiveLED, LOW);
  }
}
