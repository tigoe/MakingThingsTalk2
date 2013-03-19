/*
  Web  Server
  Context: Arduino
 
 */

#include <SPI.h>
#include <Ethernet.h>

EthernetServer server(80);

byte mac[] = {  0x00, 0xAA, 0xBB, 0xCC, 0xDE, 0x01 };
IPAddress gateway(192,168,1,1);
IPAddress subnet(255,255,255,0);
IPAddress ip(192,168,1,20);

void setup()
{
  // start the Ethernet connection and the server:
  Ethernet.begin(mac, ip, gateway, subnet);
  server.begin();
  Serial.begin(9600);
}

void loop()
{
  // listen for incoming clients
  EthernetClient client = server.available();
  if (client) {
    while (client.connected()) {
      if (client.available()) {
        char thisChar = client.read();
        Serial.write(thisChar);
      }    
    }
    // close the connection:
    client.stop();
  }
}

