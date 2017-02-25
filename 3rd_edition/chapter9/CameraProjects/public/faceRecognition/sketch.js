/*
  Face detection using tracking.js
  Context: P5.js
*/
var tracker;    // instance of the tracker library

function setup() {
  // setup camera capture
  var video = createCapture(VIDEO); // take control of the camera
  video.size(400, 300);             // set the capture resolution
  video.position(0, 0);             // set the position of the camera image
  var canvas = createCanvas(400, 300);  // draw the canvas over the image
  canvas.position(0,0);             // set the canvas position
  // set up the tracker:
  tracker = new tracking.ObjectTracker('face');
  tracker.setInitialScale(4);     // set the tracking parameters
  tracker.setStepSize(2);
  tracker.setEdgesDensity(0.1);
  tracking.track(video.elt, tracker); // track on the video image
  tracker.on('track', showTracks);    // callback for the tracker
  ellipseMode(CORNER);                // draw circles from the corner
}

function draw() {
  // nothing to do here.
}  // end of draw() function

function showTracks(event) {
    clear();
    var faces = event.data;
    for (f in faces) {
      fill(0xFF, 0x00, 0x84, 0x3F);   // a nice shade of fuchsia
      noStroke();                     // no border
      ellipse(faces[f].x, faces[f].y, faces[f].width, faces[f].height);
    }
}
