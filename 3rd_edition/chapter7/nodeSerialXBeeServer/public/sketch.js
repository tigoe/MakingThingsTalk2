/*
Sensor warning sketch
context: P5.js
*/

var sensorState = 'UNKOWN';                // state of the sensor
var bgColor = 0;                           // background color

function setup() {
  createCanvas(windowWidth, windowHeight); // set the canvas size
  textSize(24);                            // set text size
  fill(255);                               // set the text fill color
  httpGet('/json','json',getResponse);     // get a reading from the server
}

// callback for the httpGet() function:
function getResponse(message) {
  // extract pin state 0:
  if (message.pinStates[0] === 1){         // if it's high
    sensorState = 'HIGH';                  // change the text
    bgColor = '#FF0000';                   // change the fill color
  } else {                                 // if it's low
    sensorState = 'low';                   // change the text
    bgColor = 0;                           // change the fill color
  }
  httpGet('/json','json',getResponse);  // get another reading
}

function draw() {
  // clear the background, and set its color:
  background(bgColor);
  // set the text:
  text('The gas sensor reading is ' + sensorState, 30, 30);
}
