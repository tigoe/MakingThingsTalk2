/*
  Gas sensor web server
  Context: Arduino
*/

// include SPI and Ethernet libraries:
#include <SPI.h>
#include <Ethernet.h>

// initialize a server instance:
Server server(80);

// Ethernet MAC address and IP address for server:
byte mac[] = {  
  0x00, 0xAA, 0xBB, 0xCC, 0xDE, 0x01 };
IPAddress ip(192,168,1,20);

String requestLine = "";        // incoming HTTP request from client

const int packetLength = 22;    // XBee data messages will be 22 bytes long
int dataPacket[packetLength];   // array to hold the XBee data 
int byteCounter = 0;            // counter for the bytes received from the XBee

// variables for calculating a sensor average:
const int averageInterval = 10 * 1000;  // time between averages, in seconds
long sensorTotal = 0;                   // used for averaging sensor values
float averageVoltage = 0.0;             // the average value, in volts
long lastAverageTime = 0;               // when you last took an average
int readingCount = 0;                   // how many readings since the last average

void setup() {
  // start the Ethernet connection and the server:
  Ethernet.begin(mac, ip);
  server.begin();

  // start serial communications:
  Serial.begin(9600);
}

void loop() {
 
  // listen for incoming serial data:
  if (Serial.available() > 0) {
    listenToSerial();
  }

 // listen for incoming clients:
  Client client = server.available();
  if (client) {
    listenToClient(client);
  }

  // cacluate an average of readings after <averageInterval> seconds
  long now = millis();
  if (now - lastAverageTime > averageInterval) {
    averageVoltage = getAverageReading();
    Serial.println(averageVoltage);
  }
}


// this method receives serial data and stores it
// in an array:
void listenToSerial() {
  // read incoming byte:
  int inByte = Serial.read();
  // beginning of a new packet is 0x7E:
  if (inByte == 0x7E ) {
    // parse the last packet and get a reading:
    int thisReading = parseData();
    // add this reading total to the total for averaging:
    sensorTotal = sensorTotal + thisReading;
    // increment the reading count:
    readingCount++;
    // empty the data array:
    for (int thisByte = 0; thisByte < packetLength; thisByte++) {
      dataPacket[thisByte] = 0;
    }
    // reset the incoming byte counter:
    byteCounter = 0; 
  } 
  // if the byte counter is less than the data packet length,
  // add this byte to the data array:
  if (byteCounter < packetLength) {
    dataPacket[byteCounter] = inByte;
    // increment the byte counter:
    byteCounter++;
  }  
}

// This method parses the XBee data format
// and returns an average sensor value for the packet
int parseData() {
  int adcStart = 11;                     // ADC reading starts at byte 12
  int numSamples = dataPacket[8];        // number of samples in packet
  int total = 0;                         // sum of all the ADC readings

  // read the address. It's a two-byte value, so you
  // add the two bytes as follows:
  int address = dataPacket[5] + dataPacket[4] * 256;

  // read <numSamples> 10-bit analog values, two at a time
  // because each reading is two bytes long:
  for (int thisByte = 0; thisByte < numSamples * 2;  thisByte=thisByte+2) {
    // 10-bit value = high byte * 256 + low byte:
    int thisSample = (dataPacket[thisByte + adcStart] * 256) + 
      dataPacket[(thisByte + 1) + adcStart];
    // add the result to the total for averaging later:
    total = total + thisSample;
  }
  // average the result:
  int average = total / numSamples;
  return average;
}


// this method litens to requests from a HTTP client:
void listenToClient( Client thisClient) {
  while (thisClient.connected()) {
    if (thisClient.available()) {
      // read in a byte:
      char thisChar = thisClient.read();
      // for any other character, increment the line length:
      requestLine = requestLine + thisChar;
      // if you get a linefeed and the request line
      // has only a newline in it, then the request is over:
      if (thisChar == '\n' && requestLine.length() < 2) {
        // send a http response:
        makeResponse(thisClient);
        break;
      }
      //if you get a newline or carriage return,
      // you're at the end of a line:
      if (thisChar == '\n' || thisChar == '\r') {
        // clear the last line:
        requestLine = "";
      } 
    }    
  }
  // give the web browser time to receive the data
  delay(1);
  // close the connection:
  thisClient.stop(); 
}

// this method sents a response to the client:
void makeResponse(Client thisClient) {
  // read the current average voltage:
  float thisVoltage = getAverageReading();

  // print the HTTP header:
  thisClient.print("HTTP/1.1 200 OK\n");
  thisClient.print("Content-Type: text/html\n\n");
  // print the HTML document:
  thisClient.print("<html><head><meta http-equiv=\"refresh\" content=\"3\">");
  thisClient.println("</head>");
  // if the reading is good, print it:
  if (thisVoltage > 0.0) {
    thisClient.print("<h1>reading = ");
    thisClient.print(thisVoltage);
    thisClient.print(" volts</h1>");
  }  // if the reading is not good, print that:
  else {
    thisClient.print("<h1>No reading</h1>");
  }
  thisClient.println("</html>\n\n");
}

// this method takes an average of the readings:
float getAverageReading() {
  int thisAverage = sensorTotal / readingCount;
  // convert to a voltage:
  float voltage = 3.3 * (thisAverage / 1024.0);
  // reseet the reading count and totals for next time:
  readingCount = 0; 
  sensorTotal = 0;
  // save the time you took this average:
  lastAverageTime = millis();
  // return the result:
  return voltage;
}
