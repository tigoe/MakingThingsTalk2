/*
  web server with HTML from an SD card
  This sketch takes HTTP requests from the Ethernet shield,
  opens an HTML file from an SD card, replaces the <body> tag with 
  <body bgcolor= followed by the values of three analog sensors in hex,
  and serves them out.
  
 
 This example uses the String library, which is part of the Arduino core from
 version 0019.  
 
 Circuit:
 * Analog sensor attached to analog in 0
 * Ethernet shield attached to pins 10, 11, 12, 13
 * SD card SS attached to pins 4
 
 created 23 Dec 2010
 by Tom Igoe
 
 This code is in the public domain.
 
 */

#include <SPI.h>
#include <Ethernet.h>
#include <SD.h>



byte mac[] = {  
  0x00, 0xAA, 0xBB, 0xCC, 0xDE, 0x01 };
IPAddress gateway(192,168,1,1);
IPAddress subnet(255,255,0,0);
IPAddress ip(192,168,1,20);



// Initialize the Ethernet server library
// with the IP address and port you want to use 
// (port 80 is default for HTTP):
Server server(80);

File myFile;


void setup()
{
   Serial.begin(9600);
   delay(1000);
   Serial.println("attempting to get address");
  // start the Ethernet connection and the server:
 if (!Ethernet.begin(mac)) {
  Ethernet.begin(mac, ip, gateway, subnet);
 }
 Serial.print(Ethernet.localIP()[0]);
  Serial.print(".");
  Serial.print(Ethernet.localIP()[1]);
  Serial.print(".");
  Serial.print(Ethernet.localIP()[2]);
  Serial.print(".");
  Serial.println(Ethernet.localIP()[3]);
  server.begin();
 

  Serial.print("Initializing SD card...");

  if (!SD.begin(4)) {
    Serial.println("initialization failed!");
    return;
  }
  Serial.println("initialization done.");

}

void loop()
{
  // listen for incoming clients
  Client client = server.available();
  if (client) {
    Serial.println("Got a client");
    String requestLine = "";

    while (client.connected()) {
      if (client.available()) {
        char thisChar = client.read();

        // if you get a newline and the request line is blank,
        // then the request is over:
        if (thisChar == '\n' && requestLine.length() < 1) {
          // send a standard http response header
          String header = makeHttpHeader();
          client.println(header);

          sendFileTo(client);

          break;
        }

        //if you get a newline or carriage return,
        // you're at the end of a line:
        if (thisChar == '\n') {
          Serial.println(requestLine);
          requestLine = "";
        } 
        else if (thisChar != '\r') {
          // add any other character to the end
          // of the request line:
          requestLine += thisChar;
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



float readSensor() {
  // read the value from the sensor:
  int sensorValue = analogRead(A0);
  // convert the reading to millivolts:
  float voltage = sensorValue *  (5000/ 1024); 
  // convert the millivolts to temperature celsius:
  float temperature = (voltage - 500)/10;
  // print the temperature:
  return temperature; 
}

String makeHttpHeader() {
  String result = "HTTP/1.1 200 OK\n";
  result += "Content-Type: text/html\n\n";
  return result;
}

String readFile() {
  String result = "";

  // re-open the file for reading:
  myFile = SD.open("index.htm");
  if (myFile) {    
    Serial.println("opening file");
    // read from the file until there's nothing else in it:
    while (myFile.available()) {
      char thisChar = (char) myFile.read();
      result += thisChar;
    }
    // close the file:
    myFile.close();
  } 
  else {
    // if the file didn't open, print an error:
    // result = "error opening index.html";
  } 
  return result;
}


void sendFileTo(Client thisClient) {
  String result = "";

  // re-open the file for reading:
  myFile = SD.open("index.htm");
  if (myFile) {    
    Serial.println("opening file");
    // read from the file until there's nothing else in it:
    while (myFile.available()) {
      char thisChar = (char) myFile.read();

      if (result.endsWith("<div name=\"temp\">")) {
        Serial.println("replacing");
        //result = result.replace("<body", bodyTag);
      }

      switch (thisChar) {
      case '\r':
        break;
      case '\n': 
        // return the line 
        thisClient.println(result);
        result = "";
        break;
      default: 
        result += thisChar;
      }

    }
    // close the file:
    myFile.close();
  } 
  else {
    // if the file didn't open, print an error:
    Serial.println("error opening index.htm");
  } 
}









