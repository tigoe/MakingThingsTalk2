/*
   graphing sketch
	 context: p5.js
*/

var readings = [];                    // array to hold raw sensor readings
var lastReading = 0.0;                // last mapped sensor reading (for graphing)
var minValue = 0;                     // minimum sensor value. Adjust to fit your needs
var maxValue = 1023;                  // maximum sensor value. Adjust to fit your needs

function setup() {
  createCanvas(800, 600);             // set the canvas size
		loadStrings(url, getReadings);
}

function draw() {
  var thisReading; // current reading being plotted
  var xPos;        // current x position

  // clear the background:
  background(0);
  for (xPos = 1; xPos < width; xPos++) {
    thisReading = readings[xPos];     // get the current reading
    lastReading = readings[xPos - 1]; // get the last reading
    if (thisReading) {                 // if there's a valid reading,
    stroke(0);       // Black out previous reading text
    fill(0);
    text(lastReading, 30, 30);
    fill(170, 89, 255); // set fill for  current reading text
    text(thisReading, 30, 30);
          // set stroke color for the graph lines:
        stroke(170, 89, 255);
        // calculate the current and previous Y positions:
        var yPos = map(thisReading, minValue, maxValue,
          height, 0);
        var lastYPos = map(lastReading, minValue, maxValue,
          height, 0);
        // draw a line from the last position to the current one:
        line(xPos - 1, yPos, xPos,lastYPos);
    }
    // if the array is the width of the canvas,
    // start deleting elements from the front of the array
    // to save memory:
    if (readings.length > width) {
      readings.shift(); // delete the first element in the array
    }
  }
}


function getReadings(data) {
for (reading in data) {
	var parts = split(reading, ',');
	var timestamp = parts[0];
	var reading = parts[1];
	// should add date somehow
	readings.push(parts[1]);
}
}
