/*
  Accelerometer Tilt
 Context: Processing
 
 Takes the values in serially from an accelerometer 
 attached to a microcontroller and uses them to set the 
 attitude of a disk on the screen.
 */
import processing.serial.*;      // import the serial lib

float pitch, roll;               // pitch and roll
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
  // enable smoothing for 3D:
  hint(ENABLE_OPENGL_4X_SMOOTH);
}

void draw () {
  // colors inspired by the Amazon rainforest:
  background(#20542E);
  fill(#79BF3D);
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

  // set the disc fill color:
  fill(#79BF3D);
  // draw the disc:  
  ellipse(0, 0, width/4, width/4);
  // set the text fill color:
  fill(#20542E);
  // Draw some text so you can tell front from back:
  text(pitch + "," + roll, -40, 10, 1);
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

