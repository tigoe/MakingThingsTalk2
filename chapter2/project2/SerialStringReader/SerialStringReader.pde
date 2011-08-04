/* 
 Serial String Reader
 Context: Processing
 
 reads in a string of characters from a serial port
 until it gets a linefeed (ASCII 10).
 Then splits the string into sections separated by commas.
 Then converts the sections to ints, and prints them out.
 
 created 19 July 2010
 by Tom Igoe
 */

import processing.serial.*;     // import the Processing serial library

Serial myPort;                 // The serial port
String resultString;           // string for the results

void setup() {
  size(480, 130);             // set the size of the applet window
  println(Serial.list());     // List all the available serial ports

  // get the name of your port from the serial list.
  // The first port in the serial list on my computer 
  // is generally my Arduino module, so I open Serial.list()[0].
  // Change the 0 to the number of the serial port 
  // to which your microcontroller is attached:
  String portName = Serial.list()[0];
  // open the serial port:
  myPort = new Serial(this, portName, 9600);

  // read bytes into a buffer until you get a linefeed (ASCII 10):
  myPort.bufferUntil('\n');
}

void draw() {
  // set the background and fill color for the applet window:
  background(#044f6f);
  fill(#ffffff);
  // show a string in the window:
  if (resultString != null) {
    text(resultString, 10, height/2);
  }
}

// serialEvent  method is run automatically by the Processing sketch
// whenever the buffer reaches the byte value set in the bufferUntil() 
// method in the setup():

void serialEvent(Serial myPort) { 
  // read the serial buffer:
  String inputString = myPort.readStringUntil('\n');

  // trim the carrige return and linefeed from the inout string:
  inputString = trim(inputString);
  // clear the resultString:
  resultString = "";

  // split the input string at the commas
  // and convert the sections into integers:
  int sensors[] = int(split(inputString, ','));

  // add the values to the result string:
  for (int sensorNum = 0; sensorNum < sensors.length; sensorNum++) {
    resultString += "Sensor " + sensorNum + ": ";
    resultString += sensors[sensorNum] + "\t";
  }
  // print the results to the console:
  println(resultString);
}

