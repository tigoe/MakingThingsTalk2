/*
  XBee to UDP
 Context: Arduino
 */

#include <SPI.h>
#include <Ethernet.h>
#include <Udp.h>      

// Enter a MAC address and IP address for your controller below.
// The IP address will be dependent on your local network:
byte mac[] = { 
  0x00, 0xAA, 0xBB, 0xCC, 0xDE, 0x02 };
IPAddress myIp(192,168,1,20);
IPAddress yourIp(192,168,1,21);

unsigned int myPort = 43770;      // local port to listen on
unsigned int yourPort = 43770;    // remote port to send to

// A UDP instance to send and receive packets over UDP
UDP udp;

void setup() {
  // start the serial library:
  Serial.begin(9600);
  // start the Ethernet connection:
  Ethernet.begin(mac, myIp);
  // start UDP:
  udp.begin(myPort);
  // give the Ethernet shield a second to initialize:
  delay(1000);
  // set up a packet to send:
  udp.beginPacket(yourIp, yourPort);
}

void loop() {
  if (Serial.available()) {
    int serialByte = Serial.read();
    // if you get a 0x7E,
    // send the packet and begin a new one:
    if (serialByte == 0x7E) {
      udp.endPacket();
      // set up a packet to send:
      udp.beginPacket(yourIp, yourPort);
    } 
    // send the byte:
    udp.write(serialByte);
  }
}
