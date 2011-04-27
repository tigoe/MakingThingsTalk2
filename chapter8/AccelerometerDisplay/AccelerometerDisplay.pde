/*
  Accelerometer Tilt
 Language: Processing
 
 Takes the values in serially from an accelerometer 
 attached to a microcontroller and uses them to set the 
 attitude of a disk on the screen.
 */
import processing.serial.*;      // import the serial lib

int graphPosition = 0;           // horizontal position of the graph
int pitch = 0;
int roll = 0;
int pitchMax = 0;
int pitchMin = 0;
int rollMax = 0;
int rollMin = 0;

int[] maximum = new int[2];      // maximum value sensed
int[] minimum = new int[2];      // minimum value sensed
int[] range = new int[2];        // total range sensed
float[] attitude = new float[2]; // the tilt values
float position;                  // position to translate to 

Serial myPort;                   // the serial port
boolean madeContact = false;     // whether there's been serial data in

void setup () {
  // draw the window:
  size(400, 400, P3D); 

  // set the background color:
  background(0);
  // set the maximum and minimum values:
  maximum[0] = 1295;
  minimum[0] = -1289;

  maximum[1] = 1295;
  minimum[1] = -1322;

  // calculate position:
  position = width/2;

  // create a font with the second font available to the system:

  // List all the available serial ports
  println(Serial.list());

  // Open whatever port is the one you're using.
  myPort = new Serial(this, Serial.list()[2], 9600);
  // only generate a serial event when you get a return char:
  myPort.bufferUntil('\r');

  // set the fill color:
  fill(90, 250, 250);
}

void draw () {
  // clear the screen:
  background(0);

  // print the values:
  text(pitch + " " + roll, -30, 10);

  // set the attitude:
  setAttitude();
  // draw the plane:
  tilt();
}
void setAttitude() {
  for (int i = 0; i < 2; i++) {
    // calculate the current attitude as a percentage of 2*PI, 
    // based on the current range:
   
    attitude[i] = map(vals[i], minimum[i], maximum[i], 0, 2*PI);
  }
}

void tilt() {
  // translate from origin to center:
  translate(position, position, position);

  // X is front-to-back:
  rotateX(-attitude[1]);
  // Y is left-to-right:
  rotateY(-attitude[0] - PI/2);

  // set the fill color:
  fill(90, 250, 250);
  // draw the rect:  
  ellipse(0, 0, width/4, width/4);
  // change the fill color:
  fill(0);
  // Draw some text so you can tell front from back:
  // print the values:
  text(pitch + " " + roll, -30, 10, 1);
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
    if (items[0].equals("PitchRange") {
       if (items.length >= 3) {
        pitchMin = items[1];
        pitchMax = items[2];
      }
    }

    if (items[0].equals("RollRange") {
        if (items.length >= 3) {
        rollMin = items[1];
        rollMax = items[2];
      }
    }

    if (items[0].equals("Reading") {
      // convert the sections into integers:
      // if you received all the sensor strings, use them:
      if (items.length >= 3) {
        pitch = items[1];
        roll = items[2];
      }
    }
  }
}

