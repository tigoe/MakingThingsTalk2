import hypermedia.video.*;


OpenCV opencv;
PImage img;

color targetColor = color(255,0,0);    // the color you're looking for
int[] matchingPixel = new int[2];


void setup() {

  size( 640, 480 );

  // initialize opencv
  opencv = new OpenCV( this );
  opencv.capture( width, height );
}


void draw() {
   // read the myCamera and update the pixel array:
  opencv.read();
 // show the result
  image( opencv.image(), 0, 0 );
  edward(opencv.pixels());
    // draw a dot at the matchingPixel:
  fill(targetColor);
  ellipse(matchingPixel[0], matchingPixel[1], 10, 10);    
}

/* when the mouse is clicked, capture the 
 color of the pixel at the mouse location
 to use as the tracking color
 */
void mouseReleased() {
  // get the color of the mouse position's pixel:
  targetColor = opencv.pixels()[mouseY*width+mouseX];
  matchingPixel[0] = mouseX;
  matchingPixel[1] = mouseY;
}

/*
  Take the target color  and look for a pixel matching the color 
 in the camera image:
 */
void edward(int pixelArray[]) {
 
  // intialize the smallest acceptable color difference:
  float smallestDifference = 500.0;     
 
  // scan over the pixels  to look for a pixel
  // that matches the target color:
  for(int row=0; row<height; row++) { 
    for(int column=0; column<width; column++) { //for each column
      //get the color of this pixel
      //find pixel in linear array using formula: pos = row*rowWidth+column
      color pixelColor = pixelArray[row*width+column];

      // determine the difference between this pixel's color
      // and the target color:
      float diff = abs(red(targetColor) - red(pixelColor)) + abs(green(targetColor) - green(pixelColor)) 
      + abs(blue(targetColor) - blue(pixelColor))/3;

      // if this is closest to our target color, take note of it:
      if (diff<= smallestDifference){ 
        smallestDifference = diff;
        // save the position:
        matchingPixel[0] = row; 
        matchingPixel[1] = column;
      } 
    }
  }  
}

