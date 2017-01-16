/*
Geolocation
Context: p5.js
*/
 var label = "Checking to see if your browser supports geolocation...";
 var options = {
   enableHighAccuracy: true,
   timeout: 10000,
   maximumAge: 0
 };

function setup() {
  // get the canvas width and height from the window:
  createCanvas(windowWidth, windowHeight);
  fill('#A3B5CF');       // pale slightly blue text
  textSize(36);          // text size
  textAlign(CENTER);     // text alignment
  // start the geolocation watch
  navigator.geolocation.watchPosition(success, failure, options);
}

function draw () {
  background('#0D1133');
  text(label, width/2, 100);
}

function success(position) {
  var coordinates = position.coords;
  var now = new Date(position.timestamp);
  label = 'Your position is:'
    + '\nLatitude : ' + coordinates.latitude.toFixed(5)
    + '\nLongitude: ' + coordinates.longitude.toFixed(5)
    + '\nWithin ' + coordinates.accuracy + ' meters, at'
    + '\n' + new Date(position.timestamp);
}

function failure(error) {
  label = 'Error code ' + error.code + ': \n' + error.message;
}
