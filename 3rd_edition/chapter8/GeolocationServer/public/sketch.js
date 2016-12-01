/*
Geolocation
Context: p5.js
*/
 var label = "Checking to see if your browser supports geolocation..."
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
  getLocation();         // start the geolocation watch
}

function draw () {
  background('#0D1133');
  text(label, width/2, 100);
}

function getLocation() {
    if (navigator.geolocation) {
      label = "Your brower supports geolocation! \nLooking for position...";
        navigator.geolocation.watchPosition(success, failure, options);
    } else {
        label = "Your brower doesn't geolocation.\n Tough luck, Skippy!";
    }
}

function success(position) {
  var coordinates = position.coords;
  var now = new Date(position.timestamp);
  label = 'Your position is:'
    + '\nLatitude : ' + decimalToDMS(coordinates.latitude)
    + '\nLongitude: ' + decimalToDMS(coordinates.longitude)
    + '\nWithin ' + coordinates.accuracy + ' meters, at'
    + '\n' + new Date(position.timestamp);
};

function failure(error) {
  label = 'Error code ' + error.code + ': \n' + error.message;
};

function decimalToDMS(value) {
  var mins = (value - Math.floor(value)) * 60;
  var secs = ((mins - Math.floor(mins)) * 60).toFixed(2);
  var result = Math.floor(value) + "°"+ Math.floor(mins) + "\'" + secs + "\"";
  return result;
}
