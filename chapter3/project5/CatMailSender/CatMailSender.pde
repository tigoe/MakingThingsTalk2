/* 
 Serial String Reader
 Context: Processing
 
 Reads in a string of characters until it gets a linefeed (ASCII 10).
 Then converts the string into a number.
 */
import processing.serial.*;

Serial myPort;              // the serial port
float sensorValue = 0;      // the value from the sensor
float xPos = 0;             // horizontal position of the graph
float prevSensorValue = 0;  // previous value from the sensor
float lastXPos = 0;         // previous horizontal position
int threshold = 250;        // above this number, the cat is on the mat.

int lastTimeSent = 0;     // last minute you sent a mail
int timeThreshold = 1;           // minimum minutes between mails
String mailUrl = "http://www.example.com/cat-script.php";


void setup() {
  size(400,300);
  // list all the available serial ports
  println(Serial.list());

  // I know that the first port in the serial list on my Mac is always my
  // Arduino, so I open Serial.list()[0]. Open whatever port you're using
  // (the output of Serial.list() can help; the are listed in order
  // starting with the one that corresponds to [0]).
  myPort = new Serial(this, Serial.list()[0], 9600);

  // read bytes into a buffer until you get a newline (ASCII 10):
  myPort.bufferUntil('\n');
  // rest of the setp method goes here 

  // set inital background and smooth drawing:
  background(#543174);
  smooth();
}

void draw () {
}

// serialEvent method is run automatically by the Processing applet
// whenever the buffer reaches the byte value set in the bufferUntil() 
// method in the setup():
void serialEvent (Serial myPort) {
  // get the ASCII string:
  String inString = myPort.readStringUntil('\n');

  if (inString != null) {
    // trim off any whitespace:
    inString = trim(inString);
    // convert to an int and map to the screen height:
    sensorValue = float(inString); 
    sensorValue = map(sensorValue, 0, 1023, 0, height);
    //println(sensorValue);
    drawGraph(prevSensorValue, sensorValue);

    if (sensorValue > threshold ) {
      // if the last reading was less than the threshold,
      // then the cat just got on the mat.
      if (prevSensorValue <= threshold) {
        println("cat on mat");
        sendMail();
      }
    } 
    else {
      // if the sensor value is less than the threshold,
      // and the previous value was greater, then the cat
      // just left the mat
      if (prevSensorValue > threshold) {
        println("cat not on mat");
      }
    }
    // save the current value for the next time:
    prevSensorValue = sensorValue;
  }
} 

void drawGraph(float prevValue, float currentValue) {
  // subtract the values from the window height
  // so that higher numbers get drawn higher
  // on the screen:
  float yPos = height - currentValue;
  float lastYPos = height - prevValue;

  // draw the line in a pretty color:
  stroke(#C7AFDE);
  line(lastXPos, lastYPos, xPos, yPos);

  // at the edge of the screen, go back to the beginning:
  if (xPos >= width) {
    xPos = 0;
    lastXPos = 0;
    background(#543174);
  } 
  else {
    // increment the horizontal position:
    xPos++;
    // save the current graph position
    // for next time:
    lastXPos = xPos;
  }
}

void sendMail() {
  // how long has passed since the last mail:
  int timeDifference = 0;   
  // get the current time:
  int thisMinute = minute();

  // if the current minute is less than the last, then
  // they  happened different hours:
  if (thisMinute < lastTimeSent) {
    timeDifference = (60 - lastTimeSent) + thisMinute;
  } 
  // if the current minute is greater than the last, then
  // they occurred in the same hour:
  else {
    timeDifference = thisMinute -  lastTimeSent;
  }

  if ( timeDifference > timeThreshold) {
    String[] mailScript = loadStrings(mailUrl);
    println("results from mail script:");
    println(mailScript);
    
  // save the current minute for next time:
  lastTimeSent = thisMinute;
  }
}

