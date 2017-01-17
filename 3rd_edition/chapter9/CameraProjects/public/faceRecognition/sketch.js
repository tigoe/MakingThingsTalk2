// For more: https://github.com/auduno/clmtrackr

var faceTracker;
var canvas;
var probabilityThreshold = 0.3;
var pSlider;

function setup() {
  // setup camera capture
  var video = createCapture(VIDEO);    // take control of the camera
  video.size(400, 300);             // set the capture resolution
  video.position(0, 0);            // set the position of the camera image
  canvas = createCanvas(400, 300); // draw the canvas over the image
  canvas.position(0,0);            // set the canvas position

  faceTracker = new clm.tracker();  // initialize the face tracker
  faceTracker.init(pModel);         // give it a model to start with
  faceTracker.start(video.elt);  // give it a camera to read from
  pSlider = createSlider(0, 1, 0.3, 0.01);
  pSlider.position(10, height-30);
  pSlider.mouseReleased(setProbability);
}

function draw() {
  clear();
  // get array of face marker positions [x, y] format
  var positions = faceTracker.getCurrentPosition();
  var probability = faceTracker.getScore();
  if (probability > probabilityThreshold) {
    faceTracker.draw(canvas.elt );
  }
  // put some text at the bottom of the screen:
  fill(255);
  noStroke();
  text("probability: " + probability, 10, height-60);
  text("threshold: " + probabilityThreshold, 10, height-40);
}  // end of draw() function

function setProbability() {
  probabilityThreshold = pSlider.value();
}
