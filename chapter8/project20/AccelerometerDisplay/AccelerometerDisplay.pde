/*
  Accelerometer Tilt
 Language: Processing
 
 Takes the values in serially from an accelerometer 
 attached to a microcontroller and uses them to set the 
 attitude of a disk on the screen.
 */
import processing.serial.*;      // import the serial lib

int graphPosition = 0;           // horizontal position of the graph

int[] sensorValue = new int[2]; // the accelerometer values
float pitch, roll;
float position;                  // position to translate to 

Serial myPort;                   // the serial port

void setup() {
  // draw the window:
  size(400, 400, P3D); 
  // calculate translate position for disc:
  position = width/2;
  
  // List all the available serial ports
  println(Serial.list());

  // Open whatever port is the one you're using.
  myPort = new Serial(this, Serial.list()[2], 9600);
  // only generate a serial event when you get a newline:
  myPort.bufferUntil('\n');
}

void draw () {
  // clear the screen:
  background(0);
   // set the fill color:
  fill(90, 250, 250);
  
  // draw the disc:
  tilt();
}


void tilt() {
  // translate from origin to center:
  translate(position, position, position);

  // X is front-to-back:
  rotateX(radians(roll + 90));
  // Y is left-to-right:
  rotateY(radians(pitch) );

  // set the fill color:
  fill(90, 250, 250);
  // draw the rect:  
  ellipse(0, 0, width/4, width/4);
  // change the fill color:
  fill(0);
  // Draw some text so you can tell front from back:
  text(pitch + "," + roll, -40, 10,1);
}

// serialEvent  method is run automatically by the Processing applet
// whenever the buffer reaches the  byte value set in the bufferUntil() 
// method in the setup():

void serialEvent(Serial myPort) { 
  // read the serial buffer:
  String myString = myPort.readStringUntil('\n');

  // if you got any bytes other than the linefeed:
  if (myString != null) {
    myString = trim(myString);
    // split the string at the commas
    String items[] = split(myString, ',');
    if (items.length > 1) {
      pitch = float(items[0]);
      roll = float(items[1]);
    }
  }
}

