/*
Graphing sketch
context: P5.js
*/

var readings = [];     // array to hold raw sensor readings
var lastReading = 0.0; // last mapped sensor reading (for graphing)
var minValue = 0;      // minimum voltage
var maxValue = 1023;    // maximum voltage

function setup() {
  createCanvas(640, 480);              // set the canvas size
  httpGet('/json','json',getResponse); // get a reading from the server
  textSize(24);                        // set text size
}

// callback for the httpGet() function:
function getResponse(message) {
  readings.push(message);               // add the reading to the array
  httpGet('/json','json',getResponse);  // get another reading
}

function draw() {
  var thisReading; // current reading being plotted
  var xPos;        // current x position

  // clear the background:
  background(0);
  // iterate over the width of the canvas:
  for (xPos = 1; xPos < width; xPos++) {
    thisReading = readings[xPos];     // get the current reading
    lastReading = readings[xPos - 1]; // get the last reading
    if (thisReading) {                 // if there's a valid reading,
    stroke(0);       // Black out previous voltage text
    fill(0);
    text(lastReading.avgVoltage + " Volts", 30, 30);
    fill(0, 26, 255); // set fill for  current voltage text
    text(thisReading.avgVoltage + " Volts", 30, 30);
          // set stroke color for the graph lines:
        stroke(0, 127, 255);
        // calculate the current and previous Y positions:
        var yPos = map(thisReading.average, minValue, maxValue,
          0, height);
        var lastYPos = map(lastReading.average, minValue, maxValue,
          0, height);
        // draw a line from the last position to the current one:
        line(xPos - 1, yPos, xPos, lastYPos);
    }
    // if the array is the width of the canvas,
    // start deleting elements from the front of the array
    // to save memory:
    if (readings.length > width) {
      readings.shift(); // delete the first element in the array
    }
  }
}
