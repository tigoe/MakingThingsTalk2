/*
  SonMicro Firmware version reader
 Context: Processing
 */
import processing.serial.*;
Serial myPort;           // The serial port
String binaryString = "";
String asciiString = "";

void setup() {
  size(500, 200);        // window size
  // List all the available serial ports
  println(Serial.list());
  // Open whatever port is the one you're using.
  myPort = new Serial(this, Serial.list()[2], 19200);
}

void draw() {
  // Dystopian waterscape color scheme, 
  // by arem114, http://kuler.adobe.com/
  background(#7B9B9D);
  fill(#59462E);
  // write the response, in hex and ASCII:
  text(binaryString, 10, height/3);
  text(asciiString, 10, 2*height/3);
}

void keyReleased() {
  int command = 0x81;    // read firmware command is the default
  int dataLength = 1;    // data length for both commands here is 1
  if (key == 's') {      //  "select tag" command
    command = 0x83;
  }
  // send command:
  myPort.write(0xFF);
  myPort.write(0x00);
  myPort.write(dataLength);
  myPort.write(command);
  myPort.write(command + dataLength);
  // reset the response strings:
  binaryString = "";
  asciiString = "";
}

void serialEvent(Serial myPort) {
  // get the next incoming byte:
  char thisChar = (char)myPort.read();
  // add the byte to the response strings:
  binaryString += hex(thisChar, 2) + " ";
  asciiString += thisChar;
}

