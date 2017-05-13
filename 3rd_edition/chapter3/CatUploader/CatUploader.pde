/*
  CatCam uploader
 context: Processing
 */

// import libraries
import processing.serial.*;
import processing.video.*;
import processing.net.*;

Serial myPort;            // The serial port
int threshold = 400;      // above this number, the cat is on the mat.
int lastSensorValue = 0;  // the previous sensor reading
boolean catOnMat = false; // whether the cat is on the mat
int currentTime = 0;      // the current time as a single number
int lastMailTime = 0;     // last time you sent a mail
int mailInterval = 60;    // minimum seconds between mails
int lastUploadTime = 0;   // last time you sent an upload
int uploadInterval = 120; // minimum seconds between uploads

String serverAddress = "localhost";  
int port = 8080;
String mailRoute = "/mail";

Client thisClient;              // network client
String uploadRoute = "/upload"; // server route for uploads
String boundary = "H4rkNrF";  // boundary string for POST request

Capture myCam;                     // the camera
String fileName = "catcam.jpg";    // local filename for the camera image



void setup() {
  size(400, 300);
  // take control of the camera
  // list all available capture devices to the console to find your camera.
  String[] devices = Capture.list();
  printArray(devices);
  // Change devices[0] to the proper number for your camera:
  myCam = new Capture(this, width, height, devices[15]);
  myCam.start();
  // initialize serial communications
  // change the port number to your microcontroller's serial port:
  String portName = Serial.list()[5];
  myPort = new Serial(this, portName, 9600);
  // don't generate a serialEvent() unless you get a newline character:
  myPort.bufferUntil('\n');
}

void draw() {
  // calculate the time as a single number:
  currentTime = hour() * 3600 + minute() * 60 + second();
  // draw the camera image to the window
  image(myCam, 0, 0);
  // format the time as HH:DD:MM DD-MM-YYYY:
  String timeStamp = nf(hour(), 2) + ":" + nf(minute(), 2) 
    + ":" + nf(second(), 2) + " " + nf(day(), 2) + "-" 
    + nf(month(), 2) + "-" +  nf(year(), 4);

  // draw a dropshadow for the time text 1 pixel offset from the time:
  fill(15);
  text(timeStamp, 11, height - 19);
  // draw the main time text:
  fill(255);
  text(timeStamp, 10, height - 20);

  // if there is any reply from the server on the POST request, 
  // print it:
  if (thisClient != null) {
    String result = "";
    while (thisClient.available() > 0) {
      result += char(thisClient.read());
    }
    if (result != "") println(result);
  }

  //if cat remains on mat, upload picture
  if (catOnMat == true) {
    //if cat remains on mat 
    uploadPicture();
  }
}

// this event occurs whenever the camera has a new frame of video ready:
void captureEvent(Capture MyCam) {
  myCam.read();
}

void serialEvent(Serial myPort) {
  //read serial data
  String inString = myPort.readStringUntil('\n');
  int sensorValue = 0;
  if (inString != null) {
    // trim off any whitespace:
    inString = trim(inString);
    // convert to an int:
    sensorValue = int(inString);
    println(sensorValue);
  }

  //if "cat on mat" event occurs:
  if (sensorValue > threshold ) {       // if current reading > threshold
    if (lastSensorValue <= threshold) { // and last reading < threshold
      catOnMat = true;                  // then the cat just got on the mat
      println("Cat just got on on mat");
      //  upload picture, then send mail:
      uploadPicture();
      sendMail();
    }
  } else {
    // if "cat off mat" occurs:
    if (lastSensorValue > threshold) {
      catOnMat = false;
      println("Cat just left mat");
    }
  } 
  // save the current reading for comparison to the next reading:
  lastSensorValue = sensorValue;
}

void sendMail() {
  // this function will make an HTTP GET request to send an email
  // calculate how long has passed since the last mail request:
  int timeDifference = currentTime - lastMailTime;   
  if ( timeDifference > mailInterval) {
    String mailUrl = "http://" + serverAddress + ":" + port + mailRoute;
    String[] response = loadStrings(mailUrl);
    println("results from server:");
    printArray(response);
    // save the time you mailed for comparison next time:
    lastMailTime = currentTime;
  }
}

void uploadPicture() {
  // this function will make an HTTP POST request to upload a picture
  // calculate how long has passed since the last upload request:
  int timeDifference = currentTime - lastUploadTime;
  if (timeDifference > uploadInterval) {
    PImage img = get();
    img.save(fileName);
    postFile();
    // save the time you uploaded for comparison next time:
    lastUploadTime = currentTime;
  }
}

void postFile() { 
  // load the saved image into an array of bytes:
  byte[] thisFile =loadBytes(fileName);
  // open a new connection to the server:
  thisClient = new Client(this, serverAddress, port);
  String request = "";
  // make a HTTP POST request:
  request += "POST " + uploadRoute + " HTTP/1.1\r\n"; 
  request += "Host: " + serverAddress + ":" + port + "\r\n";

  // form the beginning of the request:
  String boundaryHeader = "--" + boundary + "\r\n";
  boundaryHeader +="Content-Disposition: form-data; name=\"image\"; ";
  boundaryHeader += "filename=\"" + fileName + "\"\r\n";
  boundaryHeader +="Content-Type: image/jpeg\r\n\r\n";
  // form the end of the request:
  String boundaryTail ="\r\n--" + boundary + "--\r\n";

  // calculate and send the length of the total request,
  // including the head of the request, the file, and the boundaryTail:
  int contentLength = boundaryHeader.length() 
    + thisFile.length + boundaryTail.length();
  request += "Content-Length: " + contentLength + "\r\n";  
  // tell the server you're sending the POST in multiple parts,
  // and send a unique boundary string that will delineate the parts:
  request += "Content-Type: multipart/form-data; boundary=";
  request += boundary + "\r\n\r\n";

  // send the request, the boundaryHeader, the file, and the boundaryTail:
  print(request);
  print(boundaryHeader);
  print(thisFile);
  print(boundaryTail);

  thisClient.write(request);
  thisClient.write(boundaryHeader);
  thisClient.write(thisFile);
  thisClient.write(boundaryTail);
}