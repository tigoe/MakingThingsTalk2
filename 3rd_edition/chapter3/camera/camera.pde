/**
 Image capture
 Context: Processing
 */
import processing.video.*;    // import the video library
Capture myCam;                // the camera

void setup() {
  size(400, 300);  // set the size of the window
  // Get a list of cameras attached to your computer
  String[] devices = Capture.list();
  printArray(Capture.list());

  // use the first camera  in the list for capture:
  myCam = new Capture(this, width, height, devices[0]);
  myCam.start();
}

void draw() {
// draw the latest frame captured to the window:
   image(myCam, 0, 0);
}

// this event occurs whenever the camera has a new frame of video ready:
void captureEvent(Capture MyCam) {
  myCam.read(); 
}