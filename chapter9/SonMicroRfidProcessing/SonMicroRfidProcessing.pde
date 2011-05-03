
/*
 SonMicro RFID Reader simple example
 Language: Processing
 
 This sketch uses the SonMicroReader library to demonstrate how to read from
 Mifare RFID tags using the SonMicro reader.
 
 created 6 March 2009
 by Tom Igoe
 */


// import libraries:
import processing.serial.*;
import sonMicroReader.*;
Serial myPort;                // serial port instance
SonMicroReader myReader;      // sonMicroReader instance 

int fontHeight = 24;         // font height for the text onscreen
String lastTag;              // last tag read

void setup() {
  // set window size:
  size(400,300);
  // list all the serial ports:
  println(Serial.list());

  // based on the list of serial ports printed from the 
  // previous command, change the 0 to your port's number:
  String portnum = Serial.list()[2];
  // initialize the serial port. default data rate for
  // the SM130 reader is 19200:
  myPort = new Serial(this, portnum, 19200);
  // initialize the reader instance:
  myReader = new SonMicroReader(this,myPort);
  myReader.start();
  myReader.reset();
  // create a font with the second font available to the system:
  PFont myFont = createFont(PFont.list()[2], fontHeight);
  textFont(myFont);
}

void draw() {
  // draw to the screen:
  background(255);
  fill(0);
  textAlign(CENTER);

  if (lastTag != null) {
    text(lastTag, width/2, height/2);
  } 
  else {
    text("Hit any key to begin reading", width/2, height/2); 
  }
}

void keyReleased() {
  // for manually starting a seek:
  myReader.seekTag(); 
}

/*  
 This function is called automatically whenever there's 
 a valid packet of data from the reader
 */
void sonMicroEvent(SonMicroReader myReader) {
  // get all the relevant data from the last data packet:
  if (myReader.getTagString() != null) {
    lastTag = myReader.getTagString();
  }
  // get the error code and last command:
  int errorCode = myReader.getErrorCode();
  int lastCommand = myReader.getCommand();

  // a little debugging info:
  println("error code: " + hex(errorCode, 2));
  println("last command: " +  hex(lastCommand,2));
  println("last tag type: " + myReader.getTagType());
  println("last tag: " + lastTag); 
  println("-----");

  // if the last command was seekTag, then you're either waiting,
  // or ready to seek again:
  if (lastCommand == 0x82) {
    if (errorCode == 0x4C) {
      // you're waiting for a tag to appear
    }
    if (errorCode == 0) {
      // you got a successful read;
      // wat, then read again
      delay(300);
      myReader.seekTag();
    }  
  }
}










