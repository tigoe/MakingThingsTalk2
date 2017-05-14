/*
  Web  Server
  Context: Arduino, with WINC1500 module
  This sketch is not identical with the ESP8266WiFi library. 
  It uses three analog channels, which the ESP8266 does not have.
*/

#include <SPI.h>
#include <WiFi101.h>
//#include <ESP8266WiFi.h>    // use this instead of WiFi101 for ESP8266 modules
#include "config.h"

WiFiServer server(80);        // make an instance of the server class

void setup() {
  Serial.begin(9600);// initialize serial communications
  // while you're not connected to a WiFi AP:
  while ( WiFi.status() != WL_CONNECTED) {
    Serial.print("Attempting to connect to Network named: ");
    Serial.println(ssid);
    WiFi.begin(ssid, password); //   try to connect
    delay(2000);       // wait 2 seconds before trying again
  }

  server.begin();      // When you're connected, start the server

  // print out the device's network address
  Serial.print("To see this device's web interface, go to http://");
  IPAddress ip = WiFi.localIP();
  Serial.println(ip);
}

void loop() {
  // listen for incoming clients
  WiFiClient client = server.available();
  while (client.connected()) {    // while the client is connected,
    if (client.available()) {     // and there are incoming bytes to read,
      // read the incoming line by line:
      String request  = client.readStringUntil('\n');
      Serial.println(request);            // print the line
      // if the request is a blank line (\n or \r\n):
      if (request.length() <= 2) {
        //client.println("HTTP 200 OK\n"); // send an HTTP response
        String response = makeResponse();
        client.println(response);
        delay(10);                       // give the client time to get the data
        if (client.connected()) {        // if the client's still connected
          client.stop();                 // disconnect the client
        }
      }
    }
  }
}

String makeResponse() {
  String result = "HTTP/1.1 200 OK\n";      // HTTP header
  result += "Content-Type: text/html\n\n";  // content type and end of header
  result += "<!doctype html>\n";            // HTML document type
  result += "<html><head><title>";          // HTML, head, title tags
  result += "Hello from Arduino</title></head>"; // end of HTML head
  result += "<meta http-equiv=\"refresh\" content=\"3\">";
  result += "\n<body>\n";                   // beginning of body

  // output the value of each analog input pin
  //  for (int analogChannel = 0; analogChannel < 6; analogChannel++) {
  //    result += "analog input ";
  //    result += analogChannel;
  //    result += " is ";
  //    result += analogRead(analogChannel);
  //    result += "<br />\n";
  //  }

  // set up the body background color tag:
  result += "<body bgcolor=#";
  // read the three analog sensors:
  int red = analogRead(A0) / 4;
  int green = analogRead(A1) / 4;
  int blue = analogRead(A2) / 4;
  // print them as one hexadecimal string:
  result += String(red, HEX);
  result += String(green, HEX);
  result += String(blue, HEX);
  // close the tag:
  result += ">";
  // now print the color in the body of the HTML page:
  result += "The color of the light on the Arduino is #";
  result += String(red, HEX);
  result += String(green, HEX);
  result += String( blue, HEX);

  result += "</body></html>\n\n";           // end of body and blank line
  return result;
}

