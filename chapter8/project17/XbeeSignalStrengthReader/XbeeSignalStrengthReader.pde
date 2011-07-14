/*
   XBee Signal Strength Reader
 Context: Processing
 
 Reads a packet from an XBee radio and parses it.  The packet 
 should be 22 bytes long. It should be made up of the following:
 byte 1:     0x7E, the start byte value
 byte 2-3:   packet size, a 2-byte value  (not used here)
 byte 4:     API identifier value, a code that says what this response is (not used here)
 byte 5-6:   Sender's address
 byte 7:     RSSI, Received Signal Strength Indicator (not used here)
 byte 8:     Broadcast options (not used here)
 byte 9:     Number of samples to follow
 byte 10-11: Active channels indicator (not used here)
 byte 12-21: 5 10-bit values, each ADC samples from the sender 
 */
import processing.serial.*;
Serial XBee ;                   // input serial port from the XBee Radio
int[] packet = new int[22];     // with 5 samples, the XBee packet is 
// 22 bytes long
int byteCounter;                // keeps track of where you are in 
// the packet
int rssi = 0;                   // received signal strength
int address = 0;                // the sending XBee 's address
int lastReading = 0;            // value of the previous incoming byte

void setup () {
  size(320, 480);        // window size

  // get a list of the serial ports:
  println(Serial.list());   
  // open the serial port attached to your XBee radio:
  XBee = new Serial(this, Serial.list()[0], 9600);
}

void draw() {
  // if you have new data and it's valid (>0), graph it:
  if ((rssi > 0 ) && (rssi != lastReading)) {
    // set the background:
    background(0);
    // set the bar height and width:
    int rectHeight = rssi;
    int rectWidth = 50;
    // draw the rect:
    stroke(23, 127, 255);
    fill (23, 127, 255);
    rect(width/2 - rectWidth, height-rectHeight, rectWidth, height);
    // write the number:
    text("XBee Radio Signal Strength test", 10, 20);
    text("Received from XBee with address: " + hex(address), 10, 40);

    text ("Received signal strength: -" + rssi + " dBm", 10, 60);
    // save the current byte for next read:
    lastReading = rssi;
  }
}

void serialEvent(Serial XBee ) {
  // read a byte from the port:
  int thisByte = XBee.read();
  // if the byte = 0x7E, the value of a start byte, you have 
  // a new packet:
  if (thisByte == 0x7E) {   // start byte
    // parse the previous packet if there's data:
    if (packet[2] > 0) {
      rssi = parseData(packet);
    }
    // reset the byte counter:
    byteCounter = 0;
  }
  // put the current byte into the packet at the current position:
  packet[byteCounter] = thisByte;
  //  increment the byte counter:
  byteCounter++;
}

/* 
 Once you've got a packet, you need to extract the useful data. 
 This method gets the address of the sender and RSSI.
 */
int parseData(int[] thisPacket) {
  int result = -1;    // if you get no result, -1 will indicate that.
  
  // make sure you've got enough of a packet to read the data:
  if (thisPacket.length > 6) {
    // read the address. It's a two-byte value, so you
    // add the two bytes as follows:
    address = thisPacket[5] + thisPacket[4] * 256;
    // get RSSI:
    result = thisPacket[6];
  }
  return result;
}

