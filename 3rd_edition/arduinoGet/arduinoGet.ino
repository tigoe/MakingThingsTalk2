/*
  Simple GET client for ArduinoHttpClient library
*/
#include <WiFi101.h>
#include <ArduinoHttpClient.h>
#include "config.h"

char serverAddress[] = "192.168.43.197";  // server address
int port = 8080;                        // server port number

WiFiClient wifi;             // instance of wifi library
int status = WL_IDLE_STATUS; // wifi radio status
int lastX = 0;               // last joystick X position
int lastY = 0;               // last joystick Y position
int threshold = 10;          // difference threshold

void setup() {
  Serial.begin(9600);
  pinMode(LED_BUILTIN, OUTPUT);       // use builtin LED for status
  while ( WiFi.status() != WL_CONNECTED) {
    Serial.print("Attempting to connect to Network named: ");
    Serial.println(ssid);            // print network name (SSID)
    WiFi.begin(ssid, pass); // Connect to WPA/WPA2 network
    delay(2000);
  }

  // print the SSID of the network you're attached to:
  Serial.print("Connected. SSID: ");
  Serial.println(WiFi.SSID());

  // print your WiFi shield's IP address:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);
  delay(2000);
}


void loop() {
  int x = analogRead(A0) / 4;   // get x, 0-255
  delay(1);                     // let ADC settle
  int y = analogRead(A1) / 4;   // get y, 0-255
  
  if ((abs(x - lastX) >  threshold)       // if x has changed enough
      || (abs(y - lastY) >  threshold)) { // or y has changed enough
    makeRequest(x, y);                    // make a HTTP request
  }
  lastX = x;     // save x for next loop
  lastY = y;     // save y for next loop
}


void makeRequest(int xPos, int yPos) {
  digitalWrite(LED_BUILTIN, HIGH);
  HttpClient client = HttpClient(wifi, serverAddress, port);
  Serial.println("making GET request");
  String query = "/update?x=";  // start query string
  query += xPos;                // add x
  query += "&y=";               // add y label
  query += yPos;                // add y
  Serial.println(query);
  client.get(query);            // make HTTP GET request

  // wait until connected to server:
  while (!client.connected());

  // if there is a response from the server:
  while (client.connected()) {       // while connected to the server,
    if (client.available()) {        // if there is a response from the server,
      // read the status code and body of the response
      int statusCode = client.responseStatusCode();
      String response = client.responseBody();

      // print them out:
      Serial.print("Status code: ");
      Serial.println(statusCode);
      Serial.print("Response: ");
      Serial.println(response);
    }
  }
  digitalWrite(LED_BUILTIN, LOW);
}

