/*
  Serial to UDP
 Language: Arduino
 
 */

#include <SPI.h>
#include <Ethernet.h>
#include <Udp.h>      

const int packetSize = 24;
const int receiveLED = 9;
// Enter a MAC address and IP address for your controller below.
// The IP address will be dependent on your local network:
byte mac[] = { 
  0x00, 0xAA, 0xBB, 0xCC, 0xDE, 0x01 };
IPAddress yourIp;
unsigned int myPort = 10002;      // local port to listen on
unsigned int yourPort = 0;  
unsigned int broadcastPort = 9999;

// A UDP instance to send and receive packets over UDP
UDP udp;
UDP broadcastReceiver;
int byteCount = 0;
byte outPacket[packetSize];

void setup() {
  // start the serial library:
  Serial.begin(9600);

  // start the Ethernet connection:
  if (!Ethernet.begin(mac)) {
    while(true);
  }
  for (int b = 0; b < 4; b++) {
    Serial.print(Ethernet.localIP()[b], DEC);
    Serial.print("."); 
  }
  Serial.println();

  udp.begin(myPort);
  broadcastReceiver.begin(broadcastPort);
  pinMode(receiveLED, OUTPUT);
  digitalWrite(receiveLED, LOW);
  // give the Ethernet shield a second to initialize:
  delay(1000);
}

void loop()
{
  listen(udp, myPort);
  listen(broadcastReceiver, broadcastPort);
}

void listen(UDP thisUDP, unsigned int thisPort) {
  // check to see if there's an incoming packet, and
  // parse out the header:
  int messageSize = thisUDP.parsePacket();
  // if there's a payload, parse it all out:
  if (messageSize > 0) {    
    Serial.print("message received from: ");
    // get remote address and port:
    yourIp = thisUDP.remoteIP();
    yourPort = thisUDP.remotePort();
    for (int thisByte = 0; thisByte < 4; thisByte++) {
      Serial.print(yourIp[thisByte], DEC);
      Serial.print(".");
    }
    Serial.println(" on port: " + String(thisPort));
    // send the payload out the serial port:
    while (thisUDP.available() > 0) {
      digitalWrite(receiveLED, HIGH);
      // read the packet into packetBufffer
      int udpByte = thisUDP.read();
      Serial.write(udpByte);
    }
     digitalWrite(receiveLED, LOW);
    packAddress();
    sendPacket(); 
  }
}


void packAddress() {
  for (int thisByte = 0; thisByte < packetSize; thisByte++) {
    if (thisByte < 4) {
      outPacket[thisByte] = Ethernet.localIP()[thisByte];
    } 
    else {
      outPacket[thisByte] = 0;  
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





