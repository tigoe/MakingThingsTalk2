/**
 Image capture and upload
 Context: Processing
 */
import processing.video.*;    // import the video library
Capture myCam;                // the camera
String fileName = "catcam.jpg";

void setup() {
  size(640, 480);  // set the size of the window

  // list all available capture devices to find your camera.
  String[] devices = Capture.list();
  println(devices);

  // Change devices[0] to the proper index for your camera.
  myCam = new Capture(this, width, height, devices[2]);
}

void draw() {
  // if there's data from the camera:
  if (myCam.available()) {
    myCam.read();      // read the camera image
    set(0, 0, myCam);  // draw the camera image to the screen

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

void keyReleased() {
  PImage img = get();
  img.save(fileName);
}


