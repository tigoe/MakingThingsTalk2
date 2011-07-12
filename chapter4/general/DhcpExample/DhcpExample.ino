/* DHCP
 Context: Arduino
 */
#include <SPI.h>
#include <Ethernet.h>

byte mac[] = { 
  0x00, 0xAA, 0xBB, 0xCC, 0xDE, 0x01};
IPAddress ip(192,168,1,20);            // an address to use if DHCP fails

void setup() {
  // start the serial library:
  Serial.begin(9600);
  // start the Ethernet connection:
  Serial.println("Asking for an IP address using DHCP...");
  if (!Ethernet.begin(mac)) {
    // if DHCP fails, set your own address:
    Ethernet.begin(mac, ip);
  } 
  // print the bytes of the IP address, separated by dots:
  IPAddress myIp = Ethernet.localIP();
  Serial.print("I got an IP address. It's ");
  Serial.print(myIp[0], DEC); 
  Serial.print(".");
  Serial.print(myIp[1], DEC); 
  Serial.print(".");
  Serial.print(myIp[2], DEC); 
  Serial.print(".");
  Serial.println(myIp[3], DEC); 
}

void loop() {
}



