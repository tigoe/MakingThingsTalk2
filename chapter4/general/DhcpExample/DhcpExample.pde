/* DHCP
   Language: Arduino
*/
#include <SPI.h>
#include <Ethernet.h>

byte mac[] = { 0x00, 0xAA, 0xBB, 0xCC, 0xDE, 0x01};

void setup() {
  // start the serial library:
  Serial.begin(9600);
  // start the Ethernet connection:
  Serial.println("Asking for an IP address using DHCP...");
  if (!Ethernet.begin(mac)) {
    Serial.println("Failed to configure Ethernet using DHCP");
    //You didn't get an address, so stop here:
    while(true);
  } 
  else {
    // print the bytes of the IP address, separated by dots:
    Serial.print("I got an IP address. It's ");
    Serial.print(Ethernet.localIP()[0], DEC); 
    Serial.print(".");
    Serial.print(Ethernet.localIP()[1], DEC); 
    Serial.print(".");
    Serial.print(Ethernet.localIP()[2], DEC); 
    Serial.print(".");
    Serial.println(Ethernet.localIP()[3], DEC); 
  }
}

void loop() {
}

