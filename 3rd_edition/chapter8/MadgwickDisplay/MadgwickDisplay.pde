/*
 Madgwick display
 Context: Processing
 
 Takes the values in serially from an accelerometer 
 attached to a microcontroller and uses them to set the 
 attitude of a disk on the screen.
 */
import processing.serial.*;      // import the serial lib

float heading, pitch, roll;      // pitch and roll
float position;                  // position to translate to 

Serial myPort;                   // the serial port

void setup() {
  // draw the window:
  size(400, 400, P3D); 
  // calculate translate position for disc:
  position = width/2;

  // List all the available serial ports
  printArray(Serial.list());

  // Open whatever port is the one you're using.
  myPort = new Serial(this, Serial.list()[5], 9600);
  // only generate a serial event when you get a newline:
  myPort.bufferUntil('\n');
  // set up text formatting:
  textSize(12);
  textAlign(CENTER, CENTER);
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
  rotateX(radians(roll+90));
  // Y is left-to-right:
  rotateY(radians(pitch) );
  // Z is heading:
  rotateZ(radians(heading) );
  // set the disc fill color:
  fill(#79BF3D);
  // draw the disc:  
  ellipse(0, 0, width/3, width/3);
  // set the text fill color:
  fill(#20542E);
  // Draw some text so you can tell front from back:
  text(heading + "," + pitch + "," + roll, 0, 0, 1);
}


void serialEvent(Serial myPort) { 
  // read the serial buffer:
  String myString = myPort.readStringUntil('\n');

  // if you got any bytes other than the linefeed:
  if (myString != null) {
    myString = trim(myString);
    // split the string at the commas
    String items[] = split(myString, ',');
    if (items.length > 2) {
      heading = float(items[0]);
      pitch = float(items[1]);
      roll = float(items[2]);
      println(heading, pitch, roll);
    }
  }
}