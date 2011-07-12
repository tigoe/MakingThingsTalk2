/*
  Processing for Android test
 Context: Processing
 */
float ballX, ballY;        // position of the ball
// file to save data for pause and resume:
String datafile = "sketchFile.dat";   

void setup() {  
  // create a font for the screen:
  String[]fontList = PFont.list();
  PFont androidFont = createFont(fontList[0], 24, true);
  textFont(androidFont, 24);
}

void draw() {

  // color theme: Sandy stone beach ocean diver by ps
  // http://kuler.adobe.com:
  background(#002F2F); 
  fill(#EFECCA);
  // show the mouse X and Y and finger pressure:
  text("mouseX:" + mouseX, 10, 50);
  text("mouseY:" + mouseY, 10, 80);
  text("motionPressure:" + motionPressure, 10, 170);
  // move the ball if the person is pressing:
  if (mousePressed) {
    ballX = mouseX;
    ballY = mouseY;
  }
  // draw a nice blue ball where you touch:
  fill(#046380);
  ellipse(ballX, ballY, 50, 50);
}

void pause() {
  // make a string of the ball position:
  String ballPos = ballX+ "\n" + ballY;
  /// put the string in an array and save to a file:
  String[] data = { 
    ballPos
  };
  saveStrings(datafile, data);
}

void resume() {
  //load the data file:
  String[] data = loadStrings(datafile);
  // if there's a file there:
  if (data != null) {
    // and there are two strings, get them for X and Y:
    if (data.length > 1) {
      ballX = float(data[0]);
      ballY = float(data[1]);
    }
  }
}

