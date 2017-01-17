/*
 ColorTracking with HTML5 video
 Context: p5.js
 Based on an example by Daniel Shiffman
 */
 var video;                             // the video capture object
 var trackColor = [255,0,0];            // the color you’re searching for
 var differenceThreshold = 10;          // the threshold of color difference
 var dSlider;                           // slider for the threshold

 function setup() {
   video = createCapture(VIDEO);        // take control of the camera
   video.size(400, 300);                // set the capture resolution
   video.position(0, 0);                // set the position of the camera image
   var canvas = createCanvas(400, 300); // draw the canvas over the image
   canvas.position(0,0);                // set the canvas position
   dSlider = createSlider(0, 100, 10, 1); // initialize the slider
   dSlider.position(10, height-30);     // position the slider
   dSlider.mouseReleased(setDifference);// set a mouseReleased callback
 }

function draw() {
  image(video,0,0);   // draw the video
  video.loadPixels(); // get the video pixels in an array

// Loop through every pixel:
  for (var x = 0; x < video.width; x++ ) {      // rows
    for (var y = 0; y < video.height; y++ ) {   // columns
      // calculate the pixel’s position in the array
      // based on its width and height:
      var loc = (x + y * video.width) * 4;
      // get the values of the current pixel:
      var r1 = video.pixels[loc];               // red value of the pixel
      var g1 = video.pixels[loc + 1];           // green value
      var b1 = video.pixels[loc + 2];           // blue value
      // get the values of the tracked color:
      var r2 = trackColor[0];                   // red value
      var g2 = trackColor[1];                   // green value
      var b2 = trackColor[2];                   // blue value

      // use the dist() function to get the difference between the colors:
      var difference = dist(r1, g1, b1, r2, g2, b2);

      // If current pixel’s color is within the difference threshold:
      if (difference < differenceThreshold) {
        stroke(0);        // set stroke (and point) color to black
        point(x, y);      // draw a point at the current pixel position
      }
    }
  }

  // put some text at the bottom of the screen:
  fill(255);
  text("search color: " + trackColor, 10, height-60);
  text("difference threshold: " + differenceThreshold, 10, height-40);
}  // end of draw() function


// Save color where the mouse is clicked in trackColor variable:
function mousePressed() {
  if (mouseY < dSlider.y) {           // if you clicked above the slider,
    trackColor = video.get(mouseX,mouseY);  // get the color you clicked
  }
}

// if the slider moves, change the differenceThreshold:
function setDifference() {
    differenceThreshold = dSlider.value();
}
