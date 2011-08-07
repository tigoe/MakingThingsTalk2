/**
 Image capture and upload
 Context: Processing
 
 created 2 Oct 2010
 modified: 9 Oct 2010
 by Tom Igoe
 */
import processing.video.*;
import processing.net.*;


import processing.serial.*;

Serial myPort;        // The serial port
float xPos = 0;       // horizontal position of the graph
float yPos = 0;       // vertical position of the graph
float lastXPos = 0;   // previous X position
float lastYPos = 0;   // previous Y position

int prevSensorValue = 0;    // the previous sensor reading
boolean catOnMat = false;   // whether the cat's on the mat;
int threshold = 200;        // above this number, the cat is on the mat.

int lineColor = #C7AFDE;

float sensorValue = 0;
float lastSensorValue = 0;

Capture myCam;
String fileName = "catcam.jpg";

String baseUrl = "/mtt2/save2web.php";
String boundary = "----H4rkNrF";
Client thisClient;

void setup() {
  size(640, 480);

  // To use another device (i.e. if the default device causes an error),  
  // list all available capture devices to the console to find your camera.
  String[] devices = Capture.list();
  println(devices);

  // Change devices[0] to the proper index for your camera.
  myCam = new Capture(this, width, height, devices[2]);

  myPort = new Serial(this, Serial.list()[0], 9600);
  // don't generate a serialEvent() unless you get a newline character:
  myPort.bufferUntil('\n');
}


void draw() {
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
void clientEvent (Client thisClient) {
  // If there's incoming data from the client
  // then grab it and print it
  while (thisClient.available() > 0) { 
    String data = thisClient.readString(); 
    println(data);
  }
}

void keyReleased() {
  takePicture();
  postPicture();
}


void takePicture() {
  PImage img = get();
  img.save(fileName);
  // loadStrings("http://www.www.example.com/mailer.php");
}


void postPicture() {
  // load the saved image into an array of bytes:
  byte[] thisFile =loadBytes(fileName);

  // open a new connection to the server:
  thisClient = new Client(this, "www.tigoe.net", 80);
  // make a HTTP POST request:
  thisClient.write("POST " + baseUrl + " HTTP/1.1\n"); 
  thisClient.write("Host: www.tigoe.net\n");
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
  String tail ="\n--" + boundary + "--\n\n";

  // calculate and send the length of the total request,
  // including the head of the request, the file, and the tail:
  int contentLength = requestHead.length() + thisFile.length + tail.length();
  thisClient.write("Content-Length: " + contentLength + "\n");  

  // send the header of the request, the file, and the tail:
  thisClient.write(requestHead);
  thisClient.write(thisFile);
  thisClient.write(tail);

  // close the client:
 // thisClient.stop();
}


void serialEvent (Serial myPort) {
  // get the ASCII string:
  String inString = myPort.readStringUntil('\n');

  if (inString != null) {
    // trim off any whitespace:
    inString = trim(inString);
    // convert to an int and map to the screen height:
    sensorValue = float(inString); 
    //println(sensorValue);
    sensorValue = map(sensorValue, 0, 1023, 0, height);
    //  yPos = height - sensorValue;
  }

  if (sensorValue > threshold ) {

    // if the last reading was less than the threshold,
    // then the cat just got on the mat.
    if (lastSensorValue <= threshold) {
      catOnMat = true;
      //sendMail();

      //   lineColor =  #F9FA38;
      println("crossed threshold");
      takePicture();
      postPicture();
    }
  } 
  else {
    // if the sensor value is less than the threshold,
    // and the previous value was greater, then the cat
    // just left the mat
    if (lastSensorValue > threshold) {
      catOnMat = false;
      //  lineColor = #C7AFDE;  
      println("crossed back");
    }
  }
  lastSensorValue = sensorValue;
}

