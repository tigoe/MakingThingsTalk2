

/*
  Toxic Gas Web  Server
 Context: Arduino
 
 */

#include <SPI.h>
#include <Ethernet.h>
#include <SD.h>
#include <Wire.h>

#include <RTClib.h>


const int sdLED = 3;

Server server(80);

byte mac[] = {  
  0x00, 0xAA, 0xBB, 0xCC, 0xDE, 0x01 };
IPAddress gateway(192,168,1,1);
IPAddress subnet(255,255,255,0);
IPAddress ip(192,168,1,20);


// Initialize the Ethernet server library
// with the IP address and port you want to use 
// (port 80 is default for HTTP):

int lineLength = 0;    // length of the incoming HTTP request line
const int packetLength = 22;
byte dataPacket[packetLength];
int byteCounter = 0;

File dataFile;
const int chipSelect = 4;

long sensorTotal = 0;
long readingCount = 0;
long lastLogEntryTime = 0;
long logEntryInterval = 60 * 1000;


RTC_DS1307 RTC;    // instance of the RTC library

void setup()
{
  // start the Ethernet connection and the server:
  Ethernet.begin(mac, ip, gateway, subnet);
  server.begin();
  // open the serial port:
  Serial.begin(9600);
  
  // make sure that the default chip select pin is set to
  // output, even if you don't use it:
  pinMode(10, OUTPUT);

// initialize the SD LED:
pinMode (sdLED, OUTPUT);

  // see if the card is present and can be initialized:
  if (!SD.begin(chipSelect)) {
    digitalWrite(sdLED, HIGH);
    // stop there, you can't go on:
    while (true);
  }
}

void loop()
{
  // listen for incoming clients
  Client client = server.available();
  if (client) { 
    while (client.connected()) {
        if (client.available()) {
        // read in a byte and send it serially:
        char thisChar = client.read();
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
    // give the web browser time to receive the data
    delay(1);
    // close the connection:
    client.stop();
  }
  
    if (Serial.available() > 0) {
    byte inByte = Serial.read();
    if (inByte == 0x7E || byteCounter == packetLength) {
      int thisReading = parseData();
      sensorTotal = sensorTotal + thisReading;
      if (millis() - lastLogEntryTime > logEntryInterval) {
        int sensorAverage = sensorTotal / readingCount;
        readingCount = 0;
        saveData(sensorAverage);
        lastLogEntryTime = millis();  
      }

      for (int thisByte = 0; thisByte < packetLength; thisByte++) {
        dataPacket[thisByte] = 0;
      }
      byteCounter = 0; 
    } 
    else {
      dataPacket[byteCounter] = inByte;
      byteCounter++;
    }
  }
}

void makeResponse(Client thisClient) {
  thisClient.print("HTTP/1.1 200 OK\n");
  thisClient.print("Content-Type: text/html\n\n");
  thisClient.print("<html><head>");
  thisClient.print("<title>Gas sensor</title></head>");
  // set up the body background color tag:
  thisClient.print("<body>");
  sendFileTo(thisClient);
  // close the page:
  thisClient.println("</body></html>\n");
}

void sendFileTo(Client thisClient) {
  // re-open the file for reading:
  File myFile = SD.open("datalog.txt", FILE_READ);
  if (myFile) {    
    // read from the file until there's nothing else in it:
    while (myFile.available()) {
      byte thisChar = myFile.read();
      thisClient.write(thisChar);
    }
    // close the file:
    myFile.close();
  } 
  else {
    // if the file didn't open, print an error:
   digitalWrite(sdLED, HIGH);
  } 
}

boolean saveData(int sensorValue) {
  File dataFile = SD.open("datalog.txt", FILE_WRITE);

  // print it to the dataFile:
  // if the file is available, write to it:
  if (dataFile) {
    // get the date and time from the clock:     
    DateTime now = RTC.now();
    if (now.month() < 10) {      // print leading zero
      dataFile.print("0"); 
    }
    dataFile.print(now.month() + "/");

    if (now.day() < 10) {      // print leading zero
      dataFile.print("0"); 
    }
    dataFile.print(now.day() + "/");
    dataFile.print(now.year() + "");
    if (now.hour() < 10) {      // print leading zero
      dataFile.print("0"); 
    }
    dataFile.print(now.hour() + ":" );
    if (now.minute() < 10) {      // print leading zero
      dataFile.print("0"); 
    }
    dataFile.print(now.minute() + ":");
    if (now.second() < 10) {      // print leading zero
      dataFile.print("0"); 
    }
    dataFile.print(now.second() + ",");
    // print the sensor value:
    dataFile.println(sensorValue + "<br>");
    dataFile.close();
  }  
  // if the file isn't open, pop up an error:
  else {
    digitalWrite(sdLED, HIGH);
  }  
}

int parseData() {
  int adcStart = 11;                     // ADC reading starts at byte 12
  int numSamples = dataPacket[8];        // number of samples in packet
  int adcValues[numSamples];             // array to hold the 5 readings
  int total = 0;                         // sum of all the ADC readings

  // read the address. It's a two-byte value, so you
  // add the two bytes as follows:
  int address = dataPacket[5] + dataPacket[4] * 256;

  // read <numSamples> 10-bit analog values, two at a time
  // because each reading is two bytes long:
  for (int i = 0; i < numSamples * 2;  i=i+2) {
    // 10-bit value = high byte * 256 + low byte:
    int thisSample = (dataPacket[i + adcStart] * 256) + 
      dataPacket[(i + 1) + adcStart];
    // put the result in one of 5 bytes:
    adcValues[i/2] = thisSample;
    // add the result to the total for averaging later:
    total = total + thisSample;
  }
  // average the result:
  int average = total / numSamples;
  return average;
}
