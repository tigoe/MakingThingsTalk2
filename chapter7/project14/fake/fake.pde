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
IPAddress yourIp(192,168,1,1);

unsigned int myPort = 43770;      // local port to listen on
unsigned int yourPort = 43770;    // remote port to send to

byte packet[] = {
  126,0,18,131,0,1,43,0,5,2,0,1,197,1,193,1,193,1,192,1,192,125 };
// A UDP instance to send and receive packets over UDP
UDP udp;
int thisByte = 0;

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
  udp.write("Hello");
}

void loop() {
  randomize();
  byte serialByte = packet[thisByte];
  // if you reach max packet size, or get a 0x7E,
  // send the packet and begin a new one:
  if (serialByte == 0x7E) {
    udp.endPacket();
    thisByte = 0;
    // set up a packet to send:
    udp.beginPacket(yourIp, yourPort);
  } 
  // send the byte:
  udp.write(serialByte);
  thisByte++;
}


void randomize() {

  /*
byte 1:     0x7E, the start byte value
   byte 2-3:   packet size, a 2-byte value  (not used here)
   byte 4:     API identifier value, a code that says what this response is (not used here)
   byte 5-6:   Sender's address
   byte 7:     signalStrength, Received Signal Strength Indicator (not used here)
   byte 8:     Broadcast options (not used here)
   byte 9:     Number of samples to follow
   byte 10-11: Active channels indicator (not used here)
   byte 12-21: 5 10-bit values, each ADC samples from the sender 
   
   */
  for (int i = 0; i < 5; i++) {
    unsigned int sensor = random(20) + 490;
    packet[11 + (2*i)] = highByte(sensor);
    packet[12+ (2*i)] = lowByte(sensor);
  }
  
   byte str = random (10) + 40;
  packet[6] = str;
}

