/*
 ColorTracking with openCV
 Context: Processing
 Based on an example by Daniel Shiffman
 */
// import the opencv library:
import hypermedia.video.*;

OpenCV opencv;              // opencv instance     
int[] pixelArray;           // array to copy the pixel array to
color trackColor;           // the color you're looking for


void setup() {
  // initialize the window:
  size( 640, 480 );

  // initialize opencv
  opencv = new OpenCV( this );
  opencv.capture( width, height );
  // Start off tracking for red
  trackColor = color(255, 0, 0);
  // draw smooth edges:
  smooth();
}

void draw() {
  float closestMatch = 500;   // value representing the closest color match 
  float colorThreshold = 10;  // the threshold of color similarity
  int closestX = 0;           // horizontal position of the closest color
  int closestY = 0;           // vertical position of the closest color

  // read the camera:
  opencv.read();
  // draw the camera image to the window:
  image(opencv.image(), 0, 0);
  // copy the camera pixel array:
  pixelArray = opencv.pixels();


  // Begin loop to walk through every pixel
  for (int x = 0; x < opencv.width; x++ ) {
    for (int y = 0; y < opencv.height; y++ ) {
      // calculate the pixel's position in the array
      // based on its width and height:
      int loc = x + y*opencv.width;
      // get the color of the current pixel:
      color currentColor = pixelArray[loc];
      float r1 = red(currentColor);
      float g1 = green(currentColor);
      float b1 = blue(currentColor);
      float r2 = red(trackColor);
      float g2 = green(trackColor);
      float b2 = blue(trackColor);

      // use the dist( ) function to figure the aggregate color
      // of the current pixel. This method treats the red, green, and blue
      // of current pixel's color  and of the target color
      // as coordinates in 3-D space and calculates the difference between them
      // as Euclidean distance. 
      // In this formula, closer distance = closer color similarity:
      float d = dist(r1, g1, b1, r2, g2, b2); 

      // If current color is more similar to tracked color than
      // closest color, save current location and current difference
      if (d < closestMatch) {
        closestMatch = d;
        closestX = x;
        closestY = y;
      }
    }
  }

  // Only consider the color found if its color distance is less than. 
  // the color threshold. For greater color accuracy, make this lower.
  // for more forgiving matching, make it higher:
  if (closestMatch < colorThreshold) { 
    // Draw a circle at the tracked pixel
    fill(trackColor);
    strokeWeight(2.0);
    stroke(0);
    ellipse(closestX, closestY, 16, 16);
  }
}

void mousePressed() {
  // Save color where the mouse is clicked in trackColor variable
  int loc = mouseX + mouseY*opencv.width;
  trackColor = pixelArray[loc];
}

