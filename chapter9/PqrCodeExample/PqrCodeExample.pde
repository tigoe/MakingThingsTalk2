import hypermedia.video.*;
//import processing.video.*;
import pqrcode.*;

/*
 QRcode reader
 Generate images from a QRcode generator such as
 http://qrcode.kaywa.com/ and put them in this sketch's
 data folder.
 Press spacebar to read from the camera, generate an image,
 and scan for barcodes.  Press f to read from a file and scan.
 Press s for camera settings.
 Created 9 June 2007
 by Tom Igoe / Daniel Shiffman
 */
 
 
OpenCV opencv;
PImage img;


//Capture video;                                 // instance of the video capture library
String statusMsg = "Waiting for an image";     // a string to return messages:

// Decoder object from prdecoder library
Decoder decoder;

void setup() {
  size(400, 320);
   // initialize opencv
  opencv = new OpenCV( this );
  opencv.capture( width, height );
  
 // video = new Capture(this, width, height-20, 30);
  // Create a decoder object
  decoder = new Decoder(this);

  // Create a font with the second font available to the system:
  PFont myFont = createFont(PFont.list()[2], 14);
  textFont(myFont);
}

// When the decoder object finishes
// this method will be invoked.
void decoderEvent(Decoder decoder) {
  statusMsg = decoder.getDecodedString(); 
}


void draw() {
  background(0);
  
    // read the myCamera and update the pixel array:
  opencv.read();
 // show the result
  image( opencv.image(), 0, 0 );
  
  // Display status
  text(statusMsg, 10, height-4);
  
  // If we are currently decoding
  if (decoder.decoding()) {
    // Display the image being decoded
    PImage show = decoder.getImage();
    image(show,0,0,show.width/4,show.height/4); 
    statusMsg = "Decoding image";
    for (int i = 0; i < (frameCount/2) % 10; i++) statusMsg += ".";
  }

}

void keyReleased() {
  String code = "";
  // Depending on which key is hit, do different things:
  switch (key) {
  case ' ':        // Spacebar takes a picture and tests it:
    // copy it to the PImage savedFrame:
    
      // read the myCamera and update the pixel array:
  opencv.read();
 // show the result
  image( opencv.image(), 0, 0 );
  
  
    // Decode savedFrame
    decoder.decodeImage(opencv.image());
    break;
  case 'f':    // f runs a test on a file
    PImage preservedFrame = loadImage("qrcode.png");
    // Decode file
    decoder.decodeImage(preservedFrame);
    break;
  }
}


