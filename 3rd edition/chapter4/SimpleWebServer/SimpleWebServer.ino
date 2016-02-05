/*
  Web  Server
  Context: Arduino

*/
#include <SPI.h>
#include <WiFi101.h>
#include "config.h"

int status = WL_IDLE_STATUS;
WiFiServer server(80);


void setup()
{
  // attempt to connect to Wifi network:
  while ( status != WL_CONNECTED) {
    Serial.print("Attempting to connect to Network named: ");
    Serial.println(ssid);                   // print the network name (SSID);

    // Connect to WPA/WPA2 network:
    status = WiFi.begin(ssid, pass);
  }
  server.begin();               // start the web server on port 80
  printWifiStatus();            // you're connected now, so print out the status
}

void loop()
{
  // listen for incoming clients
  WiFiClient client = server.available();
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

