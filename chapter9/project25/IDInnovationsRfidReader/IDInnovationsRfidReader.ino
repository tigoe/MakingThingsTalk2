/*
  ID Innovations RFID Reader
  Context: Processing

  Reads data serially from an ID Innovations ID12 RFID reader.
*/
// import the serial library:
import processing.serial.*;

Serial myPort;      // the serial port you're using
String tagID = "";  // the string for the tag ID

void setup() {
  size(150,150);
  // list all the serial ports:
  println(Serial.list());

  // change the number below to match your port:
  String portnum = Serial.list()[2];
  // initialize the serial port:
  myPort = new Serial(this, portnum, 9600);
  // incoming string will end with 0x03:
  myPort.bufferUntil(0x03);
}

void draw() {
  // clear the screen and choose 
  // pleasant colors inspired by a seascape:
  background(#022E61); 
  fill(#D9EADD);
  // print the string to the screen:
  text(tagID, width/4, height/2);
}

/*
 this method reads bytes from the serial port
 and puts them into the tag string
 */
 
void serialEvent(Serial myPort) {
  // get the serial input buffer in a string:
  String inputString = myPort.readString();
  
  // filter out the tag ID from the string:
  
  // first character of the input:
  char firstChar = inputString.charAt(0);  
  // last character of the input:
  char lastChar = inputString.charAt(inputString.length() -1);
  
  // if the first char is STX (0x02) and the last char
  // is ETX (0x03), then put the next ten bytes
  // into the tagID string:
  
  if ((firstChar == 0x02) && (lastChar == 0x03)) {
    tagID = inputString.substring(1, 11);
  }
}


