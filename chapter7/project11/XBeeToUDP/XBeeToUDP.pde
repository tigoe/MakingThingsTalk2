/*
  XBee to UDP
 Language: Arduino
 
 */

#include <NewSoftSerial.h>

#include <SPI.h>
#include <Ethernet.h>
#include <Udp.h>      

NewSoftSerial mySerial(2, 3);

const int packetSize = 22;

// Enter a MAC address and IP address for your controller below.
// The IP address will be dependent on your local network:
byte mac[] = { 
  0x00, 0xAA, 0xBB, 0xCC, 0xDE, 0x02 };
//IPAddress myIp(192,168,1,20);
//IPAddress yourIp(192,168,1,21);
IPAddress myIp(128,122,151,6);
IPAddress yourIp(173,236,203,251);

unsigned int myPort = 10002;      // local port to listen on
unsigned int yourPort = 10002;  

// A UDP instance to send and receive packets over UDP
UDP udp;
int byteCount = 0;
byte outPacket[packetSize];

void setup() {
  // start the serial library:
  Serial.begin(9600);
  mySerial.begin(9600);
  // start the Ethernet connection:
  Ethernet.begin(mac, myIp);

  udp.begin(myPort);
  // give the Ethernet shield a second to initialize:
  delay(1000);
}

void loop()
{
  if (mySerial.available()) {
    int serialByte = mySerial.read();
    // if you reach max packet size, or get a 0x7E,
    // send the packet:
    if (byteCount == packetSize || serialByte == 0x7E) {
      Serial.println();
      sendPacket();
    } 
    // put serial bytes in a packet to send,
    //and increment the byte counter:
    outPacket[byteCount] = serialByte;
    byteCount++;
    Serial.print(serialByte, HEX);
    Serial.print(" ");
  }
}

void sendPacket() {
  // set up a packet to send:
  udp.beginPacket(yourIp, yourPort);
  for (int thisByte = 0; thisByte < packetSize; thisByte++) {
    // send the byte:
    udp.write(outPacket[thisByte]);
    // clear the byte once you've sent it:
    outPacket[thisByte] = 0;
  }
  udp.endPacket();
  // reset the byteCounter:
  byteCount = 0;
}



