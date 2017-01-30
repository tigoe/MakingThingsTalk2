/*
QR Code reading with HTML5 video
Context: p5.js
Uses the following QR Code reader library: https://github.com/IagoLast/qrcodejs
*/
var video;                             // the video capture object
var message;                           // the QR code message
var qrReader;                          // the QR code reader instance
var config = {                         // configuration for the QR code reader
  sucessCallback: getMessage,          // callback for when a code is read
  errorCallback: onError,              // callback for errors
  videoSelector: 'video',              // name of the canvas
  stopOnRead: false                    // don't stop when you get a code
}

function setup() {
  video = createCapture(VIDEO);        // take control of the camera
  video.size(400, 300);                // set the capture resolution
  video.position(0, 0);                // set the position of the camera image
  var canvas = createCanvas(400, 300); // draw the canvas over the image
  canvas.position(0,0);                // set the canvas position
  canvas.elt.id = "video";             // name the canvas element
  qrReader = new QrReader(config);     // make a new instance of QrReader
}

function draw() {
  image(video,0,0);   // draw the video
  video.loadPixels(); // get the video pixels in an array
  fill(255);
  text("read: " + message, 10, height - 20);
}  // end of draw() function

function getMessage(result) {   // if the reader reads a QR code,
  message = result;             // put it in the message variable
}

function onError(err) {         // if there's a reader error,
  console.error(err);         // print it to the console
}
