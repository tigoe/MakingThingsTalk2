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
#include <TextFinder.h>
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

const int inputLength = 64;
char inputString[inputLength];  // for input from the browser    
int nextChar = 0;
char buffer[8];

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
  clearInput();
}

void loop() {
  // listen for incoming clients
  Client client = server.available();
  String fileName = "";
  if (client) {
    TextFinder  finder(client );  
    // an http request ends with a blank line
    //    boolean current_line_is_blank = true;
    while (client.connected()) {      
      if (client.available()) {          
        int type = 0;
        if(finder.getString("","/", buffer,8)){

          if(String(buffer) == "GET " ) type = 1;
          else if(String(buffer) == "POST ") type = 2;
          if (type > 0) {
            Serial.print("type: ");
            Serial.println(type);
          }
        }


        if(type==1) {
          char inChar = client.read();

          while (inChar != ' ') {
            inputString[nextChar] = inChar;
            nextChar++;
            Serial.write(inChar);
            inChar = client.read();
          }

          if (nextChar == 0) {
            sendHttpHeader(client);
            // send index file
          }

          if (SD.exists(inputString)) {
            sendHttpHeader(client);
            sendFile(client, inputString);
          } 
          else {
            send404(client); 
          }
          clearInput();
          Serial.println("Breaking");
          // give the web browser time to receive the data
          delay(1);
          // close the connection:
          client.stop();
        }

        if (type == 2) {
          finder.findUntil("temperature", "\n\r");
          int thisTemp = finder.getValue('=');
          Serial.println(thisTemp);
        }
      }
    }
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

void sendHttpHeader(Client thisClient) {
  thisClient.println("HTTP/1.1 200 OK");
  thisClient.println("Content-Type: text/html");
  thisClient.println();
}


void send404(Client thisClient) {
  thisClient.println("HTTP/1.1 404 Not Found");
  thisClient.println();
}

String readFile() {
  String result = "";

  // re-open the file for reading:
  File myFile = SD.open("index.htm");
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


void sendFile(Client thisClient, char thisFile[]) {
  String result = "";

  // re-open the file for reading:
  File myFile = SD.open(thisFile);
  if (myFile) {    
    Serial.println("opening file");
    // read from the file until there's nothing else in it:
    while (myFile.available()) {
      thisClient.write( myFile.read());
    }
    // close the file:
    myFile.close();
  } 
  else {
    // if the file didn't open, print an error:
    Serial.print("error opening ");
    Serial.print(thisFile);
  } 
}


void clearInput() {
  for (int c = 0; c < inputLength; c++) {
    inputString[c] = 0;
    nextChar = 0;
  } 
}













