/*
  XBee Packet Reader and Graphing Program
 Context: Processing 
 Reads a packet from an XBee radio via UDP and parses it. 
 Graphs the results over time. The packet should be 22 bytes long, 
 made up of the following:
 byte 1:     0x7E, the start byte value
 byte 2-3:   packet size, a 2-byte value  (not used here)
 byte 4:     API identifier value, a code that says what this response is (not used here)
 byte 5-6:   Sender's address
 byte 7:     signalStrength, Received Signal Strength Indicator (not used here)
 byte 8:     Broadcast options (not used here)
 byte 9:     Number of samples to follow
 byte 10-11: Active channels indicator (not used here)
 byte 12-21: 5 10-bit values, each ADC samples from the sender 
 */

import hypermedia.net.*;
import processing.serial.*;

UDP udp;                      // define the UDP object
int queryPort = 43770;        // the port number for the device query
int hPos = 0;                 // horizontal position on the graph
int lineHeight = 14;          // a variable to set the line height


void setup() {
  // set the window size:
  size(400,300);

  // create a new connection to listen for 
  // UDP datagrams on query port:
  udp = new UDP(this, queryPort);

  // listen for incoming packets:
  udp.listen( true );

  // make the background black:
  background(0);
  // show the readings text:
  drawReadings(0,0);
}

void draw() {
  // nothing happens here.
}

/*
  listen for UDP responses
 */
void receive( byte[] data, String ip, int port ) {    
  int[] inString = int(data); // incoming data converted to string
  parseData(inString);
}

/* 
 Once you've got a packet, you need to extract the useful data. 
 This method gets the address of the sender and the 5 ADC readings.
 It then averages the ADC readings and gives you the result.
 */
void parseData(int[] thisPacket) {
  // make sure the packet is 22 bytes long first:
  if (thisPacket.length >= 22) {
    int adcStart = 11;                     // ADC reading starts at byte 12
    int numSamples = thisPacket[8];        // number of samples in packet
    int[] adcValues = new int[numSamples]; // array to hold the 5 readings
    int total = 0;                         // sum of all the ADC readings

    // read the address. It's a two-byte value, so you
    // add the two bytes as follows:
    int address = thisPacket[5] + thisPacket[4] * 256;

    // read the received signal strength:
    int signalStrength = thisPacket[6];

    // read <numSamples> 10-bit analog values, two at a time
    // because each reading is two bytes long:
    for (int i = 0; i < numSamples * 2;  i=i+2) {
      // 10-bit value = high byte * 256 + low byte:
      int thisSample = (thisPacket[i + adcStart] * 256) + 
        thisPacket[(i + 1) + adcStart];
      // put the result in one of 5 bytes:
      adcValues[i/2] = thisSample;
      // add the result to the total for averaging later:
      total = total + thisSample;
    }
    // average the result:
    int average = total / numSamples;
    // draw a line on the graph, and the readings:
    drawGraph(average);
    drawReadings(average, signalStrength);
  }
}
/*
  update the graph 
 */
void drawGraph(int thisValue) {
  // draw the line:
  stroke(#4F9FE1);
  // map the given value to the height of the window:
  float graphValue = map(thisValue, 0, 1023, 0, height);
  // detemine the line height for the graph:
  float graphLineHeight = height - (graphValue);
  // draw the line:
  line(hPos, height, hPos, graphLineHeight);
  // at the edge of the screen, go back to the beginning:
  if (hPos >= width) {
    hPos = 0;
    //wipe the screen:
    background(0);
  } 
  else {
    // increment the horizontal position to draw the next line:
    hPos++;
  }
}

/*
  draw the date and the time
 */
void drawReadings(int thisReading, int thisSignalStrength) {
  // set up an array to get the names of the months 
  // from their numeric values:
  String[] months = {
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
    "Sep", "Oct", "Nov", "Dec"
  };

  // format the date string:
  String date = day() + " " + months[month() -1] + " " + year() ;

  // format the time string
  // all digits are number-formatted as two digits:
  String time = nf(hour(), 2) + ":" + nf(minute(), 2)  + ":" + nf(second(), 2);

  // calculate the voltage from the reading:
  float voltage = thisReading * 3.3 / 1024;

  // choose a position for the text:
  int xPos = 20;
  int yPos = 20;

  // erase the previous readings:
  noStroke();
  fill(0);
  rect(xPos,yPos, 180, 80); 
  // change the fill color for the text:
  fill(#4F9FE1);
  // print the readings :
  text(date, xPos, yPos + lineHeight);
  text(time, xPos, yPos + (2 * lineHeight));
  text("Voltage: " + voltage + "V", xPos, yPos + (3 * lineHeight));
  text("Signal Strength: -" + thisSignalStrength + " dBm", xPos, yPos + (4 * lineHeight));
}

