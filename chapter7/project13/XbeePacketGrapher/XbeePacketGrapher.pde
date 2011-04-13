/*
  XBee Packet Reader and Graphing Program
 Language: Processing 
 Reads a packet from an XBee radio via UDP and parses it. 
 Graphs the results over time. The packet should be 22 bytes long, 
 made up of the following:
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

  // show the initial time and date:
  background(0);
  eraseTime(hPos, 0); 
  drawTime(hPos, 0);
}

void draw() {
  // nothing happens here.  It's all event-driven 
  // by the receive() method.
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
  int adcStart = 11;                     // ADC reading starts at byte 12
  int numSamples = thisPacket[8];        // number of samples in packet
  int[] adcValues = new int[numSamples]; // array to hold the 5 readings
  int total = 0;                         // sum of all the ADC readings
  int rssi = 0;                          // the received signal strength

  // read the address. It's a two-byte value, so you
  // add the two bytes as follows:
  int address = thisPacket[5] + thisPacket[4] * 256;

  // read the received signal strength:
  rssi = thisPacket[6];

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
  // draw a line on the graph:
  drawGraph(average/4);
  eraseTime (hPos - 1, lineHeight * 2);
  drawTime(hPos, lineHeight * 2);
}
/*
  update the graph 
 */
void drawGraph(int graphValue) {
  // draw the line:
  stroke(0,255,0);
  line(hPos, height, hPos, height - graphValue);
  // at the edge of the screen, go back to the beginning:
  if (hPos >= width) {
    hPos = 0;
    //wipe the screen:
    background(0);
    // wipe the old date and time, and draw the new:
    eraseTime(hPos, 0); 
    drawTime(hPos, 0);
  } 
  else {
    // increment the horizontal position to draw the next line:
    hPos++;
  }
}
/*
  Draw a black block over the previous date and time strings
 */

void eraseTime(int xPos, int yPos) {
  // use a rect to block out the previous time, rather than 
  // redrawing the whole screen, which would mess up the graph:
  noStroke();
  fill(0);
  rect(xPos,yPos, 120, 80);
  // change the fill color for the text:
  fill(#4F9FE1);
}

/*
  print the date and the time
 */
void drawTime(int xPos, int yPos) {
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
  
  // print both strings:
  text(date, xPos, yPos + lineHeight);
  text(time, xPos, yPos + (2 * lineHeight));
}

