/*
  GPS parser
 Context: Processing
 
 This program takes in NMEA 0183 serial data and parses 
 out the date, time, latitude, and longitude using the GPRMC sentence.
 */
// import the serial library:
import processing.serial.*;

Serial myPort;           // The serial port
float latitude = 0.0;    // the latitude reading in degrees
String northSouth = "N"; // north or south?
float longitude = 0.0;   // the longitude reading in degrees
String eastWest = "W";   // east or west?
float heading = 0.0;     // the heading in degrees

int hrs, mins, secs;      // time units
int currentDay, currentMonth, currentYear;

int satellitesInView = 0;  // satellites in view
int satellitesToFix = 0;   // satellites used to calculate fix

float textX = 50;          // position of the text on the screen
float textY = 30;

void setup() {
  size(400, 400);        // window size

  // settings for drawing:
  noStroke();
  smooth();

  // List all the available serial ports
  println(Serial.list());

  // Open whatever port is the one you're using.
  // for a Bluetooth device, this may be further down your
  // serial port list:
  String portName = Serial.list()[0];
  myPort = new Serial(this, portName, 4800);

  // read bytes into a buffer until you get a carriage 
  // return (ASCII 13):
  myPort.bufferUntil('\r');
}

void draw() {
  // deep blue background:
  background(#0D1133);

  // pale slightly blue text:
  fill(#A3B5CF);

  // put all the text together in one big string:

  // display the date and time from the GPS sentence
  // as MM/DD/YYYY, HH:MM:SS GMT
  // all numbers are formatted using nf() to make them 2- or 4-digit:
  String displayString = nf(currentMonth, 2)+ "/"+ nf(currentDay, 2)
    + "/"+ nf(currentYear, 4) + ", " + nf(hrs, 2)+ ":"
    + nf(mins, 2)+ ":"+ nf(secs, 2) + " GMT\n";


  // display the position from the GPS sentence:
  displayString = displayString + latitude + " " + northSouth + ", " 
    + longitude + " " + eastWest + "\n";

  // display the heading:
  displayString = displayString + "heading " + heading + " degrees\n";

  // show some info about the satellites used:
  displayString = displayString + "satellites in view: " 
    + satellitesInView + "\n";
  displayString = displayString + "satellites used to calculate position: " 
    + satellitesToFix;
  text(displayString, textX, textY);

  // draw an arrow using the heading:
  drawArrow(heading);
}


void serialEvent(Serial myPort) { 
  // read the serial buffer:
  String myString = myPort.readStringUntil('\n');

  // if you got any bytes other than the linefeed, parse it:
  if (myString != null) {
    print(myString);
    parseString(myString);
  }
} 

void parseString (String serialString) {
  // split the string at the commas:
  String items[] = (split(serialString, ','));

  // if the first item in the sentence is the identifier, parse the rest
  if (items[0].equals("$GPRMC")) {
    // $GPRMC gives time, date, position, course, and speed
    getRMC(items);
  }

  if (items[0].equals("$GPGGA")) {
    // $GPGGA gives time, date, position, satellites used
    getGGA(items);
  }

  if (items[0].equals("$GPGSV")) {
    // $GPGSV gives satellites in view
    satellitesInView = getGSV(items);
  }
}


void getRMC(String[] data) {
  // move the items from the string into the variables:
  int time = int(data[1]);
  // first two digits of the time are hours:
  hrs = time/10000;
  // second two digits of the time are minutes:
  mins = (time % 10000)/100;
  // last two digits of the time are seconds:
  secs = (time%100);

  // if you have a valid reading, parse the rest of it:
  if (data[2].equals("A")) {
    latitude = minutesToDegrees(float(data[3]));

    northSouth = data[4];
    longitude = minutesToDegrees(float(data[5]));
    eastWest = data[6];
    heading = float(data[8]);
    int date = int(data[9]);
    // last two digits of the date are year.  Add the century too:
    currentYear = date % 100 + 2000;
    // second two digits of the date are month:
    currentMonth =  (date % 10000)/100;
    // first two digits of the date are day:
    currentDay = date/10000;
  }
}

void getGGA(String[] data) {
  // move the items from the string into the variables:
  int time = int(data[1]);
  // first two digits of the time are hours:
  hrs = time/10000;
  // second two digits of the time are minutes:
  mins = (time % 10000)/100;
  // last two digits of the time are seconds:
  secs = (time % 100);

  // if you have a valid reading, parse the rest of it:
  if (data[6].equals("1")) {
    latitude = minutesToDegrees(float(data[2]));
    northSouth = data[3];
    longitude = minutesToDegrees(float(data[4]));
    eastWest = data[5];
    satellitesToFix = int(data[7]);
  }
}

int getGSV(String[] data) {
  int satellites = int(data[3]);
  return satellites;
}


float minutesToDegrees(float thisValue) {
  // get the integer portion of the degree measurement:
  int wholeNumber = (int)(thisValue / 100);
  // get the fraction portion, and convert from minutes to a decimal fraction:
  float fraction = (thisValue - ( wholeNumber ) * 100) / 60;
  // combine the two and return it:
  float result = wholeNumber + fraction;
  return result;
}


void drawArrow(float angle) {
  // move whatever you draw next so that (0,0) is centered on the screen:
  translate(width/2, height/2);

  // draw a circle in light blue:
  fill(#457DC0);
  ellipse(0, 0, 100, 100);

  // make the arrow the same as the background::
  fill(#0D1133);
  // rotate using the heading:
  rotate(radians(angle));

  // draw the arrow.  center of the arrow is at (0,0):
  triangle(-20, 0, 0, -40, 20, 0);
  rect(-4, 0, 8, 40);
}

