/*
  AirNow Web Client
  Context: Arduino
*/

// include required libraries and config files
// declare I/O pin numbers and global variables

void setup() {
  // initialize serial communications
  // initialize output pins
  // while you're not connected to a WiFi AP,
  //   try to connect
  //   blink the network LED
  // When you're connected, print out the device's network status
}

void loop() {
  // make an HTTP request once every two minutes
  // set the status LEDs
}

void connectToServer() {
  // make HTTP call
  // while connected to the server,
   //  if there is a response from the server,
  //   search through for "PM2.5"
  //   read the PM2.5 value from the response
  //   throw out the rest of the response
  // If you got an AQI value, 
  //  set the meter
  //  close the request
  // save the time of this HTTP call
}

void setMeter() {
  // map the PM2.5 level to a range the meter can use
  // set the meter
}

void setLeds() {
  // if the network is connected, turn on network LED
  // if the TCP socket is connected, turn on connected LED
}

void blink() {
  // Blink the LED:
}
