/*
 Datalogger
 Receives data via Bluetooth every ten seconds
 Uploads data via HTTP every two minutes
 Language: Processing
 */

import cc.arduino.btserial.*;

// instance of the library:
BtSerial bt;
String connectionState = "not connected";

int lastRead = second();    // the seconds last time you read
int lastSend = minute();    // the minute last time you read

int readInterval = 10;      // in seconds
int sendInterval = 2;       // in minutes

// URL of your PHP Script:
String url = "http://tigoe.net/mtt2/logger.php?data=";
String currentReadings = "";      // group of readings, with datestamps
String thisReading;               // single most recent reading
String lastSendTime;              // Date of last time you sent to the server

Button readButton;
Button sendButton;
boolean updateNow = false;
boolean sendNow = false;

color bgColor = #2B0D15 ;
color textColor = #FFEB97 ; //45304C
color buttonColor = #565F63 ;
color buttonHighlightColor = #ACBD9B ;
void setup() {
  // set color scheme:
  background(bgColor);
  fill(textColor);

  // Setup Fonts:
  String[] fontList = PFont.list();
  PFont androidFont = createFont(fontList[0], 24, true);
  textFont(androidFont, 24);
  textAlign(LEFT);

  // instantiate the library:
  bt = new BtSerial( this );
  // try to connect to Bluetooth:
  connect();
  readButton = new Button(screenWidth/2 - 100, 2*screenHeight/3, 200, 60, buttonColor, buttonHighlightColor, "Get Reading");
  sendButton = new Button(screenWidth/2 - 100, 2*screenHeight/3 + 80, 200, 60, buttonColor, buttonHighlightColor, "Send Reading");
}

void draw() {
  boolean updateNow = false;
  background(bgColor);
  fill(textColor);

  // display data onscreen:
  textAlign(LEFT);
  text(connectionState, 10, screenHeight/3);
  text(getTime(), 10, screenHeight/2);
  text("latest reading (volts): " + thisReading, 10, screenHeight/2 + 30);
  text("Server updated at:\n" + lastSendTime, 10, screenHeight/2 + 90);

  // draw the button:
  readButton.display();
  sendButton.display();
 
  if (sendNow) {
    text("sending, please wait...", 10, screenHeight/4 + 20);
  }

  // getData() depends on being connected:
  if (abs(second() - lastRead) >= readInterval || updateNow) {
    thisReading = getData();

    // if you got a valid reading, add a timestamp:
    if (thisReading != null) {      
      currentReadings += getTime() +"," + thisReading;
      lastRead = second();
      updateNow = false;
    }
  }

  // once every 2 minutes, upload the data
  if (abs(minute() - lastSend) >= sendInterval || sendNow ) {

    sendData(currentReadings);
    // get the time two ways:
    lastSendTime = getTime();    // a String to print on the screen
    lastSend = minute();         // an int for further comparison
    sendNow = false;
  }

  if (readButton.isPressed() && !readButton.getLastState()) {
    updateNow = true;
    println("readButton");
  }
  readButton.setLastState(readButton.isPressed());


  if (sendButton.isPressed() && !sendButton.getLastState()) {
    sendNow = true;
    println("sendButton");
  }
  sendButton.setLastState(sendButton.isPressed());
}

void pause() {
  // if you have any readings, send them:
  if (!currentReadings.equals("")) {
    sendData(currentReadings);
  }
  // stop the Bluetooth connection so you can start it again:
  if (bt != null && bt.isConnected()) {
    bt.disconnect();
  }
}

void resume() {
}

void connect() {
  // if you are connnected, get data:
  if ( !bt.isConnected() ) {  
    // get the list of paired devices:
    String[] pairedDevices = bt.list();

    if (pairedDevices.length > 0) {
      println(pairedDevices);
      // open a connection to the first one:
      bt.connect( pairedDevices[0] );
      if (bt.isConnected()) {
        connectionState = "connected to\n" + bt.getName();
      } 
      else {
        connectionState = "Trying to connect to\n" + bt.getName();
      }
    } 
    else {
      connectionState = "Couldn't get any paired devices";
    }
  }
}

String getData() {
  String result = ""; 

  if (bt != null) {
    // if you are connnected, get data:
    if ( bt.isConnected() ) {    
      // send data to get new data:
      bt.write("A");
      // wait for incoming data:
      while (bt.available () == 0);
      // if there are incoming bytes available, read them:
      while (bt.available () > 0) {
        // add the incoming bytes to the result string:
        result += char(bt.read());
      }
      // get the last character of the result string:
      char lastChar = result.charAt(result.length() - 1);
      // make sure it's a newline, or you don't have valid data:
      if (lastChar != '\n') {
        result = null;
      }
    }
    // if you're not connected, try to pair:
    else {
      connect();
    }
  }
  return result;
}

String formatData(String thisString) {
  // convert newlines, carriage returns, and 
  // spaces to HTML-safe equivalent:
  String result = thisString.replaceAll(" ", "%20");
  result = result.replaceAll("\n", "%0A");
  result = result.replaceAll("\r", "%0D");
  return result;
}

void sendData(String thisData) {
  // if there's data to send
  if (thisData != null) {
    text("Saving data to server", 10, 50);
    // URL-encode the data and URL:
    String sendString = formatData(url + thisData);
    //send the data via HTTP GET:
    String[] result = loadStrings(sendString);
    // clear currentReadings to get more:
    String currentReadings = "";
  }
}

// get the date and time as a String:
String getTime() {
  Date currentDate = new Date();
  return currentDate.toString();
}

class Button {
  int x, y, w, h;                    // positions of the buttons
  color basecolor, highlightcolor;   // color and highlight color
  color currentcolor;                // current color of the button
  String name;
  boolean pressedLastTime;

  // Constructor: sets all the initial values for each instance of the Button class
  Button(int thisX, int thisY, int thisW, int thisH, 
  color thisColor, color thisHighlight, String thisName) {
    x = thisX;
    y = thisY;
    h = thisH;
    w = thisW;
    basecolor = thisColor;
    highlightcolor = thisHighlight;
    currentcolor = basecolor;
    name = thisName;
    pressedLastTime = false;
  }

  // draw the button and its text:
  void display() {
    if (isPressed()) {
      currentcolor = highlightcolor;
    } 
    else {    
      currentcolor = basecolor;
    }

    fill(currentcolor);
    rect(x, y, w, h);
    //put the name in the middle of the button:
    fill(textColor);
    textAlign(CENTER);
    text(name, x+w/2, y+h/2);
  }

  // check to see if the mouse position is inside
  // the bounds of the rectangle:
  boolean isPressed() {
    if (mouseX >= x && mouseX <= x+w && 
      mouseY >= y && mouseY <= y+h && mousePressed) {
      return true;
    } 
    else {
      return false;
    }
  }

  void setLastState(boolean state) {
    pressedLastTime = state;
  }
  boolean getLastState() {
    return pressedLastTime;
  }
}

