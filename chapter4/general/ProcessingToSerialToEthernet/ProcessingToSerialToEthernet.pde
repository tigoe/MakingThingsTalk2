/*
 Serial-to-ethernet HTTP request tester
 Context: Processing
 
 */
// include the serial library
import processing.serial.*;

Serial myPort;       // Serial object
int step = 0;        // which step in the process you're on
char linefeed = 10;  // ASCII linefeed character
void setup()
{
  // get the list of serial ports:
  println(Serial.list());
  // open the serial port appropriate to your computer:
  myPort = new Serial(this, Serial.list()[0], 9600);
  // configure the serial object to buffer text until it receives a 
  // linefeed character:
  myPort.bufferUntil(linefeed);
}

void draw()
{
  //no action in the draw loop
}

void serialEvent(Serial myPort) {
  // print any string that comes in serially to the monitor pane
  print(myPort.readString());
}

void keyReleased() {
  // if any key is pressed, take the next step:
  switch (step) {
  case 0:
    // open a connection to the server in question:
    myPort.write("C");
    // add one to step so that the next keystroke causes the next step:
    step++;
    break;
  case 1:
    // send a HTTP GET request
    myPort.write("GET /~myaccount/index.html HTTP/1.1\n");
    myPort.write("HOST:myserver.com\n\n");
    step++;
    break;
  }
}

