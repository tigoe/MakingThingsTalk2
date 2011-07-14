/*
 UDP Query Responder
 Context: Arduino
 
 */

#include <SPI.h>
#include <Ethernet.h>
#include <Udp.h>      

// Enter a MAC address and IP address for your controller below.
// The IP address will be dependent on your local network:
byte mac[] = { 
  0x00, 0xAA, 0xBB, 0xCC, 0xDE, 0x01 };
IPAddress myIp(192,168,1,20);
unsigned int myPort = 43770;      // local port to listen on

// A UDP instance to send and receive packets over UDP
UDP query;

void setup() {
  // start the serial library:
  Serial.begin(9600);

  // start the Ethernet connection:
  // if (!Ethernet.begin(mac)) {
  Ethernet.begin(mac, myIp);
  // }
  // print your address:
  for (int thisByte = 0; thisByte < 4; thisByte++) {
    Serial.print(Ethernet.localIP()[thisByte], DEC);
    Serial.print("."); 
  }
  Serial.println();

  query.begin(myPort);
  // give the Ethernet shield a second to initialize:
  delay(1000);
}

void loop()
{
  listen(query, myPort);
}

void listen(UDP thisUDP, unsigned int thisPort) {
  // check to see if there's an incoming packet, and
  // parse out the header:
  int messageSize = thisUDP.parsePacket();
  // if there's a payload, parse it all out:
  if (messageSize > 0) {    
    Serial.print("message received from: ");
    // get remote address and port:
    IPAddress yourIp = thisUDP.remoteIP();
    unsigned int yourPort = thisUDP.remotePort();
    for (int thisByte = 0; thisByte < 4; thisByte++) {
      Serial.print(yourIp[thisByte], DEC);
      Serial.print(".");
    }
    Serial.println(" on port: " + String(thisPort));
    // send the payload out the serial port:
    while (thisUDP.available() > 0) {
      // read the packet into packetBufffer
      int udpByte = thisUDP.read();
      Serial.write(udpByte);
    }    
    sendPacket(thisUDP, Ethernet.localIP(), yourIp, yourPort); 
  }
}


void sendPacket(UDP thisUDP, IPAddress thisAddress, 
IPAddress destAddress, unsigned int destPort) {
  // set up a packet to send:
  thisUDP.beginPacket(destAddress, destPort);
  for (int thisByte = 0; thisByte < 4; thisByte++) {
    // send the byte:
    thisUDP.print(thisAddress[thisByte], DEC);
    thisUDP.print(".");
  }
  thisUDP.println("Hi there!");
  thisUDP.endPacket();
}



