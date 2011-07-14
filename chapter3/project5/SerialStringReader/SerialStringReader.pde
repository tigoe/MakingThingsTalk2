/* 
 Serial String Reader
 Context: Processing
 
 Reads in a string of characters until it gets a linefeed (ASCII 10).
 Then converts the string into a number.
 */
import processing.serial.*;

Serial myPort;              // the serial port
float sensorValue = 0;      // the value from the sensor
float xPos = 0;             // horizontal position of the graph

void setup() {
  size(400,300);
  // list all the available serial ports
  println(Serial.list());

  // I know that the first port in the serial list on my Mac is always my
  // Arduino, so I open Serial.list()[0]. Open whatever port you’re using
  // (the output of Serial.list() can help; the are listed in order
  // starting with the one that corresponds to [0]).
  myPort = new Serial(this, Serial.list()[0], 9600);

  // read bytes into a buffer until you get a newline (ASCII 10):
  myPort.bufferUntil(‘\n’);

  // set inital background and smooth drawing:
  background(#543174);
  smooth();
}

void draw () {
  // nothing happens here
}

void serialEvent (Serial myPort) {
  // get the ASCII string:
  String inString = myPort.readStringUntil(‘\n’);

  if (inString != null) {
    // trim off any whitespace:
    inString = trim(inString);
    // convert to an int and map to the screen height:
    sensorValue = float(inString); 
    sensorValue = map(sensorValue, 0, 1023, 0, height);
    println(sensorValue);
  }
 } 
