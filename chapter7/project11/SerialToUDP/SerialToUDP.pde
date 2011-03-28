/*
  Serial to UDP
 Language: Arduino
 
 */
 
#include <SPI.h>
#include <Ethernet.h>
#include <Udp.h>      

const int packetSize = 24;

// Enter a MAC address and IP address for your controller below.
// The IP address will be dependent on your local network:
byte mac[] = { 
  0x00, 0xAA, 0xBB, 0xCC, 0xDE, 0x01 };
IPAddress myIp(192,168,1,20);
IPAddress yourIp(192,168,1,21);

unsigned int myPort = 10002;      // local port to listen on
unsigned int yourPort = 0;  

// A UDP instance to send and receive packets over UDP
UDP udp;
int byteCount = 0;
int outPacket[packetSize];

void setup() {
  // start the serial library:
  Serial.begin(9600);

  // start the Ethernet connection:
  Ethernet.begin(mac, myIp);

  udp.begin(myPort);
  // give the Ethernet shield a second to initialize:
  delay(1000);
  pinMode(12, OUTPUT);
}

void loop()
{
  // check to see if there's an incoming packet, and
  // parse out the header:
  int messageSize = udp.parsePacket();
  // if there's a payload, parse it all out:
  if (messageSize > 0) {    
    // get remote address and port:
    yourIp = udp.remoteIP();
    yourPort = udp.remotePort();
    // send the payload out the serial port:
    while (udp.available() > 0) {
      // read the packet into packetBufffer
      int udpByte = udp.read();
      Serial.write(udpByte);
    } 
  }

  if (Serial.available()) {
    int serialByte = Serial.read();
  // put serial bytes in a packet to send,
  //and increment the byte counter:
    outPacket[byteCount] = serialByte;
    byteCount++;
    // if you reach max packet size, or get a newline,
    // send the packet:
    if (byteCount == packetSize || serialByte == '\n') {
      sendPacket();
    } 
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

