/*
  XBee message reader
 Context: Arduino
 */


const int packetLength = 22;    // XBee data messages will be 22 bytes long
int dataPacket[packetLength];   // array to hold the XBee data 
int byteCounter = 0;            // counter for the bytes received from the XBee

void setup() {
  // start serial communications:
  Serial.begin(9600);
}

void loop() {
  // listen for incoming serial data:
  if (Serial.available() > 0) {
    listenToSerial();
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
    // print the reading:
    Serial.println(thisReading);
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


