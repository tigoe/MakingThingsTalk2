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
String url = "http://tigoe.net/mtt2/logger2.php?data=";
String currentReadings = "";      // group of readings, with datestamps
String thisReading;               // single most recent reading
String lastSendTime;              // Date of last time you sent to the server

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
    sendData(currentReadings);
    // get the time two ways:
    lastSendTime = getTime();    // a String to print on the screen
    lastSend = minute();         // an int for further comparison
  }
}

void pause() {
  // stop the Bluetooth connection so you can start it again:
  if (bt != null && bt.isConnected()) {
    bt.disconnect();
  }
}

void resume() {
  // if you have any readings, send them:
  if (!currentReadings.equals("")) {
    sendData(currentReadings);
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

