
/*
 SonMicro RFID Writer example
 Context: Processing
 */


// import libraries:
import processing.serial.*;
import sonMicroReader.*;

String tagID = "";           // the string for the tag ID
Serial myPort;               // serial port instance
SonMicroReader myReader;     // sonMicroReader instance

int  lastCommand = 0;        // last command sent
int lastTagType = 0;         // last tag type received
int lastPacketLength = 0;    // last packet length received
String lastTag = null;       // last tag ID received
int lastErrorCode = 0;       // last error code received
int[] lastResponse = null;   // last response from the reader (raw data)
int lastAntennaPower = 0;    // last antenna power received
int lastChecksum = 0;        // last checksum received

int fontHeight = 14;         // font height for the text onscreen
String message = null;       // message read from tag
String outputString = "Hello world!";    // string to write to tag

// Color theme: Ghostly Music
// by banshee prime, http://kuler.adobe.com
color currentcolor = #CBD0D4;    // current button color
color highlight = #745370;
color buttoncolor = #968195;
color userText = #444929;
color buttonText = #ACB0B9;

ArrayList buttons = new ArrayList();  // list of buttons
// the buttons themselves:
String[]  buttonNames = { 
  "antenna power", "select tag", "authenticate", "read block", "seek Tag", 
  "write block", "firmware version"
};
void setup() {
  // set window size:
  size(600, 400);
  // list all the serial ports:
  println(Serial.list());

  // based on the list of serial ports printed from the 
  // previous command, change the 0 to your port’s number:
  String portnum = Serial.list()[0];
  // initialize the serial port. default data rate for
  // the SM130 reader is 19200:
  myPort = new Serial(this, portnum, 19200);
  // initialize the reader instance:
  myReader = new SonMicroReader(this, myPort);
  myReader.start();

  // create a font with the second font available to the system:
  PFont myFont = createFont(PFont.list()[2], fontHeight);
  textFont(myFont);
  // create the command buttons:
  makeButtons();
}
void draw() {  
  background(currentcolor);
  // draw the command buttons:
  drawButtons(); 
  // draw the output fields:
  textAlign(LEFT);
  text("Command: " + hex(lastCommand, 2), 10, 30);
  text("Packet length: " +lastPacketLength, 10, 50);
  text("Antenna power: " + lastAntennaPower, 10, 70);
  text("Tag type: " + lastTagType, 10, 90);
  text("Tag string: " + lastTag, 10, 110);
  text("Error code: " + hex(lastErrorCode, 2), 10, 130);

  // print the hex values for all the bytes in the response:
  String responseString = "";
  if (lastResponse != null) {
    for (int b = 0; b < lastResponse.length; b++) {
      responseString += hex(lastResponse[b], 2);
      responseString += " ";
    }
    // wrap the full text so it doesn’t overflow the buttons
    // and make the screen all messy:
    text("Full response:\n" + responseString, 10, 150, 300, 200);
  }
  // print any error messages from the reader:
  text(myReader.getErrorMessage(), 10, 210);
  // print the last message read from the tag:
  text("last message read from tag:\n" + message, 10, 230);

  // print the output message:
  text("type your message to write to tag:\n", 10, 300); 
  fill(userText);
  text(outputString, 10, 320);

  // show the library version:
  fill(0);
  text("SonMicroReader version: " + myReader.version(), 
  width - 300, height - 30);
}
/*  
 This function is called automatically whenever there’s 
 a valid packet of data from the reader
 */
void sonMicroEvent(SonMicroReader myReader) {
  // get all the relevant data from the last data packet:
  lastCommand = myReader.getCommand();
  lastTagType = myReader.getTagType();
  lastPacketLength =  myReader.getPacketLength();
  lastTag = myReader.getTagString();
  lastErrorCode = myReader.getErrorCode();
  lastAntennaPower = myReader.getAntennaPower();
  lastResponse = myReader.getSonMicroReading(); 
  lastChecksum = myReader.getCheckSum();

  // if the last command sent was a read block command:
  if (lastCommand == 0x86) {
    int[] inputString = myReader.getPayload();
    message = "";
    for (int c = 0; c < inputString.length; c++) {
      message += char(inputString[c]);
    }
  }
}
/*
  If a key is typed, either add it to the output string
 or delete the string if it’s a backspace:
 */
void keyTyped() {
  switch (key) {
  case BACKSPACE:  // delete
    outputString = "\0";
    break;
  default:

    if (outputString.length() < 16) {
      outputString += key;
    } 
    else {
      outputString = "output string can’t be more than 16 characters";
    }
  }
}
/*
 initialize all the buttons
 */
void makeButtons() {
  // Define and create rectangle button
  for (int b = 0; b < buttonNames.length; b++) {
    // create a new button with the next name in the list: 
    Button thisButton = new Button(400, 30 +b*30, 150, 20, buttoncolor, highlight, buttonNames[b]);
    buttons.add(thisButton);
  }
}
/*
  draw all the buttons
 */
void drawButtons() {
  for (int b = 0; b < buttons.size(); b++) {
    // get this button from the Arraylist:
    Button thisButton = (Button)buttons.get(b);
    // update its pressed status:
    thisButton.update();
    // draw the button:
    thisButton.display();
  }
}
void mousePressed() {
  // iterate over the buttons, activate the one pressed
  for (int b = 0; b < buttons.size(); b++) {
    Button thisButton = (Button)buttons.get(b);
    if (thisButton.containsMouse()) {
      doButtonAction(thisButton);
    }
  }
}

/*
  if one of the command buttons is pressed, figure out which one
 and take the appropriate action.
 */
void doButtonAction(Button thisButton) {
  // figure out which button this is in the ArrayList:
  int buttonNumber = buttons.indexOf(thisButton);

  // do the right thing:
  switch (buttonNumber) {
  case 0: //  set antenna power
    if (myReader.getAntennaPower() < 1) {
      myReader.setAntennaPower(0x01);
    } 
    else {
      myReader.setAntennaPower(0x00);
    }
    break;
  case 1: // select tag
    myReader.selectTag();
    break;
  case 2:  // authenticate
    myReader.authenticate(0x04, 0xFF);
    break; 
  case 3:   // readblock
    myReader.readBlock(0x04);
    break;
  case 4:  // seek tag
    myReader.seekTag();
    break;
  case 5:  // write tag - must be 16 bytes or less
    myReader.writeBlock(0x04, outputString);
    outputString = "";
    break;
  case 6:  // get reader firmware version
    myReader.getFirmwareVersion();
    break;
  }
}
class Button {
  int x, y, w, h;                    // positions of the buttons
  color basecolor, highlightcolor;   // color and highlight color
  color currentcolor;                // current color of the button
  String name;

  // Constructor: sets all the initial values for each instance of the Button class
  Button(int thisX, int thisY, int thisW, int thisH, 
  color thisColor, color thisHighlight, String thisName) {
    x = thisX;
    y = thisY;
    h = thisH;
    w = thisW;
    basecolor = thisColor;
    highlightcolor = thisHighlight;
    currentcolor = basecolor;
    name = thisName;
  }

  // if the mouse is over the button, change the button’s color:
  void update() {
    if (containsMouse()) {
      currentcolor = highlightcolor;
    } 
    else {    
      currentcolor = basecolor;
    }
  }

  // draw the button and its text:
  void display() {
    fill(currentcolor);
    rect(x, y, w, h);
    //put the name in the middle of the button:
    fill(0);
    textAlign(CENTER, CENTER);
    text(name, x+w/2, y+h/2);
  }

  // check to see if the mouse position is inside
  // the bounds of the rectangle:
  boolean containsMouse() {
    if (mouseX >= x && mouseX <= x+w && 
      mouseY >= y && mouseY <= y+h) {
      return true;
    } 
    else {
      return false;
    }
  }
}

