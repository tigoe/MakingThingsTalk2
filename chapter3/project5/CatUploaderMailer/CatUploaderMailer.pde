/* 
 Cat webcam uploader/emailer
 Context: Processing
 
 takes a webcam image continually, uploads it, and 
 mails you when it receives a serial string above a given value
 */

// import the libraries you need:  Network, serial, video:
import processing.serial.*;
import processing.video.*;
import processing.net.*;

Serial myPort;              // the serial port
float sensorValue = 0;      // the value from the sensor
//float xPos = 0;             // horizontal position of the graph
float prevSensorValue = 0;  // previous value from the sensor
//float lastXPos = 0;         // previous horizontal position
int threshold = 250;        // above this number, the cat is on the mat.

int currentTime = 0;        // the current time as a single number
int lastMailTime = 0;       // last minute you sent a mail
int mailInterval = 60;      // minimum seconds between mails
String mailUrl = "http://www.example.com/cat-script.php";
int lastPictureTime = 0;    // last minute you sent a picture
int pictureInterval = 10;   // minimum seconds between pictures

Capture myCam;                  // camera capture library instance
String fileName = "catcam.jpg"; // file name for the picture

// location on your server for the picture script:
String pictureScriptUrl = "/mtt2/save2web.php";  
String boundary = "----H4rkNrF"; // string boundary for the POST request

Client thisClient;          // instance of the net library


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

  // For a a list of cameras on your computer, use this line:
  println(Capture.list());

  // use the default camera for capture at 30 fps:
  myCam = new Capture(this, width, height, 30);
}

void draw () {
  // make a single number from the current hour, minute, and second:
  currentTime = hour() * 3600 + minute() * 60 + second();

  if (myCam.available() == true) {
    // draw the camera image to the screen:
    myCam.read();
    set(0, 0, myCam);

    // get the time as a string:
    String timeStamp = nf(hour(), 2) + ":" + nf(minute(), 2) 
      + ":" + nf(second(), 2) + " " + nf(day(), 2) + "-" 
        + nf(month(), 2) + "-" +  nf(year(), 4);

    // draw a dropshadow for the time text:
    fill(15);
    text(timeStamp, 11, height - 19);
    // draw the main time text:
    fill(255);
    text(timeStamp, 10, height - 20);
  }
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

    if (sensorValue > threshold ) {
      if (currentTime - lastPictureTime > pictureInterval) {
        PImage thisFrame = get();
        thisFrame.save(fileName);
        postPicture();
        lastPictureTime = currentTime;
      }
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


void sendMail() {
  // how long has passed since the last mail:
  int timeDifference = currentTime - lastMailTime;   

  if ( timeDifference > mailInterval) {
    String[] mailScript = loadStrings(mailUrl);
    println("results from mail script:");
    println(mailScript);

    // save the current minute for next time:
    lastMailTime = currentTime;
  }
}

void postPicture() {
  // load the saved image into an array of bytes:
  byte[] thisFile =loadBytes(fileName);

  // open a new connection to the server:
  thisClient = new Client(this, "www.tigoe.net", 80);
  // make a HTTP POST request:
  thisClient.write("POST " + pictureScriptUrl + " HTTP/1.1\n"); 
  thisClient.write("Host: tigoe.net\n");
  // tell the server you're sending the POST in multiple parts,
  // and send a unique string that will delineate the parts:
  thisClient.write("Content-Type: multipart/form-data; boundary=");
  thisClient.write(boundary + "\n");

  // form the beginning of the request:
  String requestHead ="\n--" + boundary + "\n";
  requestHead +="Content-Disposition: form-data; name=\"file\"; ";
  requestHead += "filename=\"" + fileName + "\"\n";
  requestHead +="Content-Type: image/jpeg\n\n";

  // form the end of the request:
  String tail ="\n\n--" + boundary + "--\n\n";

  // calculate and send the length of the total request,
  // including the head of the request, the file, and the tail:
  int contentLength = requestHead.length() + thisFile.length + tail.length();
  thisClient.write("Content-Length: " + contentLength + "\n\n");  

  // send the header of the request, the file, and the tail:
  thisClient.write(requestHead);
  thisClient.write(thisFile);
  thisClient.write(tail);
}

