import processing.core.*; 
import processing.xml.*; 

import hypermedia.video.*; 
import java.awt.Rectangle; 

import java.applet.*; 
import java.awt.Dimension; 
import java.awt.Frame; 
import java.awt.event.MouseEvent; 
import java.awt.event.KeyEvent; 
import java.awt.event.FocusEvent; 
import java.awt.Image; 
import java.io.*; 
import java.net.*; 
import java.text.*; 
import java.util.*; 
import java.util.zip.*; 
import java.util.regex.*; 

public class FaceDetection extends PApplet {

/*
  Face detection using openCV
  Language: Processing
*/
// import the opencv and Rectangle libraries:



OpenCV opencv;       // new instance of the openCV library

public void setup() {
  // initialize the window:
  size( 320,240 );
  // initialize  opencv:
  opencv = new OpenCV( this );
  opencv.capture( width, height );   
  // choose a detection description to use:
  opencv.cascade( OpenCV.CASCADE_FRONTALFACE_DEFAULT ); 
 // draw smooth edges: 
  smooth();
  // set ellipses to draw from the upper left corner:
  ellipseMode(CORNER);
}


public void draw() {
  // grab a new frame:
  opencv.read();

  // Look for faces:
  Rectangle[] faces = opencv.detect();

  // display the image:
  image( opencv.image(), 0, 0 );

  // draw circles around the faces:
  fill(0xFF, 0x00, 0x84, 0x3F);   // a nice shade of fuchsia
  noStroke();                     // no border 

  for ( int thisFace=0; thisFace<faces.length; thisFace++ ) {
    ellipse( faces[thisFace].x, faces[thisFace].y, faces[thisFace].width, faces[thisFace].height );
  }
}

  static public void main(String args[]) {
    PApplet.main(new String[] { "--bgcolor=#FFFFFF", "FaceDetection" });
  }
}
