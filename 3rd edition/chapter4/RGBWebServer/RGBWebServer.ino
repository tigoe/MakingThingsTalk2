/*
 RGB Web  Server
 Context: Arduino
 
 */

#include <SPI.h>
#include <WiFi101.h>
#include "config.h"

int status = WL_IDLE_STATUS;
WiFiServer server(80);

void setup() {
 // attempt to connect to Wifi network:
  while ( status != WL_CONNECTED) {
    Serial.print("Attempting to connect to Network named: ");
    Serial.println(ssid);                   // print the network name (SSID);

    // Connect to WPA/WPA2 network:
    status = WiFi.begin(ssid, pass);
    // wait 10 seconds for connection:
   // delay(10000);
  }
  server.begin();               // start the web server on port 80
  printWifiStatus();            // you're connected now, so print out the status
}

void loop()
{
  // listen for incoming clients
  WiFiClient client = server.available();
  if (client) {
    Serial.println("Got a client");
    int lineLength = 0;    // length of the incoming text line

    while (client.connected()) {
      if (client.available()) {
        // read in a byte and send it serially:
        char thisChar = client.read();
        Serial.write(thisChar);
        // if you get a linefeed and the request line is blank,
        // then the request is over:
        if (thisChar == '\n' && lineLength < 1) {
          // send a standard http response header
          makeResponse(client);
          break;
        }
        //if you get a newline or carriage return,
        // you're at the end of a line:
        if (thisChar == '\n' || thisChar == '\r') {
          lineLength = 0;
        } 
        else {
          // for any other character, increment the line length:
          lineLength++;
        }
      }    
    }
    Serial.println("Breaking");
    // give the web browser time to receive the data
    delay(1);
    // close the connection:
    client.stop();
  }
}


void makeResponse(WiFiClient thisClient) {
  thisClient.print("HTTP/1.1 200 OK\n");
  thisClient.print("Content-Type: text/html\n\n");
  thisClient.print("<html><head><meta http-equiv=\"refresh\" content=\"3\">");
  thisClient.print("<title>Hello from Arduino</title></head>");
  // set up the body background color tag:
  thisClient.print("<body bgcolor=#");
  // read and the three analog sensors:
  int red = analogRead(A0)/4;
  int green = analogRead(A1)/4;
  int blue = analogRead(A2)/4;
  // print them as one hexadecimal string:
  thisClient.print(red, HEX);
  thisClient.print(green, HEX);
  thisClient.print(blue, HEX);
  // close the tag:
  thisClient.print(">");
  // now print the color in the body of the HTML page:
  thisClient.print("The color of the light on the Arduino is #");
  thisClient.print(red, HEX);
  thisClient.print(green, HEX);
  thisClient.println(blue, HEX);
  // close the page:
  thisClient.println("</body></html>\n");
}


void printWifiStatus() {
  // print the SSID of the network you're attached to:
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  // print your WiFi shield's IP address:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  // print the received signal strength:
  long rssi = WiFi.RSSI();
  Serial.print("signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
  // print where to go in a browser:
  Serial.print("To see this page in action, open a browser to http://");
  Serial.println(ip);
}
