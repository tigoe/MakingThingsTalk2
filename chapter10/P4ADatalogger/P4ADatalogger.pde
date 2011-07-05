/*
    Don't do a server call when you start up because you don't have any data!
*/

import cc.arduino.btserial.*;

// instance of the library:
BtSerial bt;

int lastRead = 0;
int lastSave = 0;
int lastSend = 0;
int readInterval = 10;    // in seconds
int sendInterval = 1;    // in minutes

String url = "http://tigoe.net/mtt2/logger2.php?data=";
String currentReadings = "";
String thisReading;
String lastSendTime;
boolean completeReading;

void setup() {
  // Setup Fonts:
  String[] fontList = PFont.list();
  PFont androidFont = createFont(fontList[0], 24, true);
  textFont(androidFont, 24);

  // instantiate the library:
  bt = new BtSerial( this );
  connect();
}

void draw() {
  background(#363942);
  fill(#D8CAA8);

  text(getTime(), 10, screenHeight/2);
  text("latest reading: " + getReading(thisReading) + "V", 10, screenHeight/2 + 30);
  text("Server updated at:\n" + lastSendTime, 10, screenHeight/2 + 90);


  if (bt != null) {
    if (!bt.isConnected()) {
      text("pairing with \n" + bt.getName(), 10, screenHeight/3);
      connect();
    } 
    else {
      // put the connected device's name on the screen:
      text("connected to \n" + bt.getName(), 10, screenHeight/3);

      // getData depends on being connected:
      if (abs(second() - lastRead) >= readInterval) {
        thisReading = getData();
        if (thisReading != null) {
          completeReading = false;
          currentReadings += getTime() +"," + thisReading;
          completeReading = true;
          lastRead = second();
        }
      }
    }
  }

  if (abs(minute() - lastSend) >= sendInterval) {
    // once every 2 minutes, upload the data
    if (completeReading) {
      sendData(currentReadings);
      lastSendTime = getTime();
      lastSend = minute();
    }
  }
}

void pause() {
  if (!currentReadings.equals("")) {
    sendData(currentReadings);
  }

  if (bt != null && bt.isConnected()) {
    bt.disconnect();
  }
}

void connect() {
  // if you are connnected, get data:
  if ( !bt.isConnected() ) {  
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
  String result = null;
  // connect to Arduino
  // get a list of paired devices:
  if (bt != null) {
    // if you are connnected, get data:
    if ( bt.isConnected() ) {    
      // clear the buffers:
      bt.clear();
      // send data to get new data:
      bt.write("A");
      // wait for incoming data:
      while (bt.available () == 0);
      // if there are incoming bytes available, read them:
      while (bt.available () > 0) {
        result = bt.readString();
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
  // convert newlines to HTML-safe equivalent:
  String result = thisString.replaceAll(" ", "%20");
  result = result.replaceAll("\n", "%0A");
  result = result.replaceAll("\r", "%0D");
  return result;
}

float getReading(String thisString) {
  float result = 0.0;
  if (thisString != null) {
    float[] elements = float(split(thisString, ','));
    if (elements != null) {
      result = elements[0];
    }
  }
  return result;
}

void sendData(String thisData) {
  // if there's a file there:
  if (thisData != null) {
    text("Saving data to server", 10, 50);

    // URL encode the merged data:
    String sendString = formatData(url + thisData);
    //send the data via HTTP GET:
    String[] result = loadStrings(sendString);
    String currentReadings = "";
    completeReading = false;
  }
}

String getTime() {
  Date currentDate = new Date();
  return currentDate.toString();
}

