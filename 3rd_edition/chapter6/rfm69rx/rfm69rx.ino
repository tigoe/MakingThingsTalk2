
#include <RFM69.h>
#include <SPI.h>

#define NETWORKID     100  // The same on all nodes that talk to each other
#define NODEID        1    // The unique identifier of this node
#define RECEIVER      2    // The recipient of packets

#define FREQUENCY     RF69_915MHZ
#define ENCRYPTKEY    "sampleEncryptKey" //exactly the same 16 characters/bytes on all nodes!
#define IS_RFM69HCW   true // set to 'true' if you are using an RFM69HCW module

#define RFM69_CS      10
#define RFM69_IRQ     2
#define RFM69_IRQN    2  // Pin 2 is IRQ 0!
#define RFM69_RST     9

long packetnum = 0;  // packet counter, we increment per xmission
String input;


RFM69 radio = RFM69(RFM69_CS, RFM69_IRQ, IS_RFM69HCW, RFM69_IRQN);

void setup() {
  Serial.begin(9600);
  while (!Serial);
  Serial.println("Starting");
  // Hard Reset the RFM module
  pinMode(RFM69_RST, OUTPUT);
  digitalWrite(RFM69_RST, HIGH);
  delay(100);
  digitalWrite(RFM69_RST, LOW);
  delay(100);

  // Initialize radio
   // Initialize radio
  radio.initialize(FREQUENCY,NODEID,NETWORKID);
  if (IS_RFM69HCW) {
    radio.setHighPower();    // Only for RFM69HCW & HW!
  }
  radio.setPowerLevel(31); // power output ranges from 0 (5dBm) to 31 (20dBm)
  radio.encrypt(ENCRYPTKEY);
  
  Serial.print("\nListening at 915 MHz");
  input.reserve(30);
}

void loop() {


  //check if something was received (could be an interrupt from the radio)
  if (radio.receiveDone()) {
    input = "";
    //print message received to serial
    Serial.print("ID: ");
    Serial.print(radio.SENDERID);
    Serial.print(" ");
    for (unsigned int c = 0; c < sizeof(radio.DATA); c++) {
      if (radio.DATA[c] == 0) break;
      input += (char)radio.DATA[c];
    }
    Serial.print(input);
    Serial.print("  RSSI:");
    Serial.println(radio.RSSI);

    //check if received message contains Hello World
    if (contains(input, "Hello World")) {
      //check if sender wanted an ACK
      if (radio.ACKRequested()) {
        radio.sendACK();
        Serial.println("ACK sent");
      }
    }
  }

  Serial.flush(); //make sure all serial data is clocked out before sleeping the MCU
}


boolean contains(String main, const char* substr) {
  if (strstr(main.c_str(), substr)) return true;
  return false;
}

