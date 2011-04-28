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
int[] maximum = new int[2];      // maximum value sensed
int[] minimum = new int[2];      // minimum value sensed
float[] attitude = new float[2]; // the tilt values
float position;                  // position to translate to 

Serial myPort;                   // the serial port

void setup() {
  // draw the window:
  size(400, 400, P3D); 
 
  // set the maximum and minimum values:
  maximum[0] = 1295;
  minimum[0] = -1289;

  maximum[1] = 1295;
  minimum[1] = -1322;

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

  // set the attitude:
  setAttitude();
  // draw the disc:
  tilt();
}

void setAttitude() {
  for (int thisAxis = 0; thisAxis < 2; thisAxis++) {
    // calculate the current attitude as a percentage of 2*PI, 
    // based on the current range:
    attitude[thisAxis] = map(sensorValue[thisAxis], minimum[thisAxis], 
      maximum[thisAxis], 0, 2*PI);
  }
}

void tilt() {
  // translate from origin to center:
  translate(position, position, position);

  // X is front-to-back:
  rotateX(-attitude[1]);
  // Y is left-to-right:
  rotateY(-attitude[0] - PI/2);
  // Z is the rotation of the disc:
  rotateZ(PI);
  
  // set the fill color:
  fill(90, 250, 250);
  // draw the rect:  
  ellipse(0, 0, width/4, width/4);
  // change the fill color:
  fill(0);
  // Draw some text so you can tell front from back:
  text(sensorValue[0] + "," + sensorValue[1], -30, 10, 1);
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
      sensorValue[0] = int(items[0]);  // X axis
      sensorValue[1] = int(items[1]);  // Y axis
    }
  }
}

