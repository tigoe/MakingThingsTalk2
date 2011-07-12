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
float prevSensorValue = 0;  // previous value from the sensor
float lastXPos = 0;         // previous horizontal position


void setup() {
  size(400,300);
  // list all the available serial ports
  println(Serial.list());

  // I know that the first port in the serial list on my Mac is always my
  // Arduino, so I open Serial.list()[0]. Open whatever port you're using
  // (the output of Serial.list() can help; the are listed in order
  // starting with the one that corresponds to [0]).
  myPort = new Serial(this, Serial.list()[0], 9600);

  // read bytes into a buffer until you get a newline (ASCII 10):
  myPort.bufferUntil('\n');
  // rest of the setp method goes here 

  // set inital background and smooth drawing:
  background(#543174);
  smooth();
}

void draw () {
}

// serialEvent method is run automatically by the Processing applet
// whenever the buffer reaches the byte value set in the bufferUntil() 
// method in the setup():
void serialEvent (Serial myPort) {
  // get the ASCII string:
  String inString = myPort.readStringUntil('\n');

  if (inString != null) {
    // trim off any whitespace:
    inString = trim(inString);
    // convert to an int and map to the screen height:
    sensorValue = float(inString); 
    sensorValue = map(sensorValue, 0, 1023, 0, height);
    //println(sensorValue);
    drawGraph(prevSensorValue, sensorValue);

    // save the current value for the next time:
    prevSensorValue = sensorValue;
  }
} 

void drawGraph(float prevValue, float currentValue) {
  // subtract the values from the window height
  // so that higher numbers get drawn higher
  // on the screen:
  float yPos = height - currentValue;
  float lastYPos = height - prevValue;

  // draw the line in a pretty color:
  stroke(#C7AFDE);
  line(lastXPos, lastYPos, xPos, yPos);

  // at the edge of the screen, go back to the beginning:
  if (xPos >= width) {
    xPos = 0;
    lastXPos = 0;
    background(#543174);
  } 
  else {
    // increment the horizontal position:
    xPos++;
    // save the current graph position
    // for next time:
    lastXPos = xPos;
  }
}


