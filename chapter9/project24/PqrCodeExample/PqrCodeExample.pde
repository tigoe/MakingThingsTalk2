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
import hypermedia.video.*;
import pqrcode.*;

OpenCV opencv;      // instance of the opencv library
Decoder decoder;    // instance of the pqrcode library

// a string to return messages:
String statusMsg = "Waiting for an image";  

void setup() {
  // initialize the window:
  size(400, 320);

  // initialize opencv:
  opencv = new OpenCV( this );
  opencv.capture( width, height );

  // initialize the decoder:
  decoder = new Decoder(this);
}


void draw() {
  // read the camera:
  opencv.read();
  // show the camera image:
  image( opencv.image(), 0, 0 );

  // Display status message:
  text(statusMsg, 10, height-4);

  // If you're currently decoding:
  if (decoder.decoding()) {
    // Display the image being decoded:
    PImage show = decoder.getImage();
    image(show, 0, 0, show.width/4, show.height/4); 
    // update the status message:
    statusMsg = "Decoding image";
    // add a dot after every tenth frame:
    for (int dotCount = 0; dotCount < (frameCount) % 10; dotCount++) {
      statusMsg += ".";
    }
  }
}

void keyReleased() {
  String code = "";
  // Depending on which key is hit, do different things:
  switch (key) {
  case ' ':        // Spacebar takes a picture and tests it:
    // Decode the image:
    decoder.decodeImage(opencv.image());
    break;
  case 'f':    // f runs a test on a file
    PImage preservedFrame = loadImage("qrcode.png");
    // Decode the file
    decoder.decodeImage(preservedFrame);
    break;
  }
}

// When the decoder object finishes
// this method will be invoked.
void decoderEvent(Decoder decoder) {
  statusMsg = decoder.getDecodedString();
}

