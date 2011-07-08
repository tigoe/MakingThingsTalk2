/*
 Datalogger
 Receives data via Bluetooth every ten seconds
 Uploads data via HTTP every two minutes
 Language: Processing
 */

import cc.arduino.btserial.*;
// instance of the library:
BtSerial bt;

int lastRead = second();    // the seconds last time you read
int lastSend = minute();    // the minute last time you read

int readInterval = 10;      // in seconds
int sendInterval = 2;       // in minutes

// URL of your PHP Script:
<<<<<<< HEAD
String url = "http://tigoe.net/mtt2/logger2.php?data=";
String currentReadings = "";      // group of readings, with datestamps
String thisReading;               // single most recent reading
String lastSendTime;              // Date of last time you sent to the server

=======
String url = "http://tigoe.net/mtt2/logger.php?data=";
String currentReadings = ""; // group of readings, with datestamps
String thisReading;          // single most recent reading
String lastSendTime;         // Date of last time you sent to the server

Button readButton;           // Button for prompting immediate read
Button sendButton;           // Button for prompting immediate send
boolean updateNow = false;   // flag to force an update
boolean sendNow = false;     // flag to force a send

// color scheme from http://kuler.adobe.com
// deep optimism by nicanore:
color bgColor = #2B0D15 ;
color textColor = #FFEB97 ;
color buttonColor = #565F63 ;
color buttonHighlightColor = #ACBD9B ;

>>>>>>> correct and latest version of P4Adatalogger
void setup() {
  // set color scheme:
  background(#363942);
  fill(#D8CAA8);

  // Setup Fonts:
  String[] fontList = PFont.list();
  PFont androidFont = createFont(fontList[0], 24, true);
  textFont(androidFont, 24);

  // instantiate the library:
  bt = new BtSerial( this );
  // try to connect to Bluetooth:
  connect();
<<<<<<< HEAD
}

void draw() {
  background(#363942);
  fill(#D8CAA8);

  // display data onscreen:
  text(getTime(), 10, screenHeight/2);
  text("latest reading (volts): " + thisReading, 10, screenHeight/2 + 30);
  text("Server updated at:\n" + lastSendTime, 10, screenHeight/2 + 90);

  if (bt != null) {
    // try to connect:
    if (!bt.isConnected()) {
      text("Trying to pair with \n" + bt.getName(), 10, screenHeight/3);
      connect();
    } 
    else {
      // put the connected device's name on the screen:
      text("connected to \n" + bt.getName(), 10, screenHeight/3);
      // getData() depends on being connected:
      if (abs(second() - lastRead) >= readInterval) {
        thisReading = getData();

        // if you got a valid reading, add a timestamp:
        if (thisReading != null) {      
          currentReadings += getTime() +"," + thisReading;
        }
        lastRead = second();
      }
    }
  }

  // once every 2 minutes, upload the data
  if (abs(minute() - lastSend) >= sendInterval) {
=======
  // set up buttons:
  readButton = new Button(screenWidth/2 - 100, 2*screenHeight/3, 200, 60, buttonColor, buttonHighlightColor, "Get Reading");
  sendButton = new Button(screenWidth/2 - 100, 2*screenHeight/3 + 80, 200, 60, buttonColor, buttonHighlightColor, "Send Reading");
}

void draw() {
  // display data onscreen:
  background(bgColor);
  fill(textColor);
  textAlign(LEFT);
  text(connectionState, 10, screenHeight/4);
  text(getTime(), 10, screenHeight/4 + 60);
  text("latest reading (volts): " + thisReading, 10, screenHeight/4 + 90);
  text("Server updated at:\n" + lastSendTime, 10, screenHeight/4 + 120);

  // draw the buttons:
  readButton.display();
  sendButton.display();

  if (sendNow) {
    text("sending, please wait...", 10, screenHeight/4 - 60);
  }

  // if the update interval has passed, 
  // or updateNow is true, update automatically:
  if (abs(second() - lastRead) >= readInterval || updateNow) {
    thisReading = getData();

    // if you got a valid reading, add a timestamp:
    if (thisReading != null) {      
      currentReadings += getTime() +"," + thisReading;
      // take note of when you last updated:
      lastRead = second();
      // you've updated, no need to do it again until prompted:
      updateNow = false;
    }
  }

  // if the send interval has passed, 
  // or sendNow is true, update automatically:
  if (abs(minute() - lastSend) >= sendInterval || sendNow ) {
>>>>>>> correct and latest version of P4Adatalogger
    sendData(currentReadings);
    // get the time two ways:
    lastSendTime = getTime();    // a String to print on the screen
    lastSend = minute();         // an int for further comparison
  }
<<<<<<< HEAD
=======

  // if the read button changed from not pressed to pressed,
  // set updateNow, to force an update next time through the
  // loop. Do the same for the send butto and sendNow, right below:
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
>>>>>>> correct and latest version of P4Adatalogger
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

void connect() {
  // if you are connnected, get data:
  if ( !bt.isConnected() ) {  
    // get the list of paired devices:
    String[] pairedDevices = bt.list();

    if (pairedDevices.length > 0) {
      println(pairedDevices);
      // open a connection to the first one:
      bt.connect( pairedDevices[0] );
    } 
    else {
      text("Couldn't get any paired devices", 10, height/2);
    }
  }
}

String getData() {
  String result = ""; 

  if (bt != null) {
    // if you are connnected, get data:
    //if ( bt.isConnected() ) {    
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
    //   }
    // if you're not connected, try to pair:
    //   else {
    //     connect();
    //   }
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
<<<<<<< HEAD
=======

class Button {
  int x, y, w, h;                    // positions of the buttons
  color basecolor, highlightcolor;   // color and highlight color
  color currentcolor;                // current color of the button
  String name;                       // name on the button
  boolean pressedLastTime;           // if it was pressed last time you checked

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
    // if pressed, change the color:
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
  // the bounds of the rectangle and sets its current state:
  boolean isPressed() {
    if (mouseX >= x && mouseX <= x+w && 
      mouseY >= y && mouseY <= y+h && mousePressed) {
      return true;
    } 
    else {
      return false;
    }
  }

//this method is for setting the state of the button
// last time it was checked, as opposed to its
// current state:
  void setLastState(boolean state) {
    pressedLastTime = state;
  }
  boolean getLastState() {
    return pressedLastTime;
  }
}

>>>>>>> correct and latest version of P4Adatalogger
