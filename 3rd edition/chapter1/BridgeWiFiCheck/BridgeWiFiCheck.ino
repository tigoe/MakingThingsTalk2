/*
  WiFi status check
  context: Arduino
  Example of how to run a shell command using Bridge
*/
#include <Process.h>   // include the Bridge Process library

void setup() {
  Serial.begin(9600);  // initialize serial communication
  Bridge.begin();      // open a connection to the linux processor
  Serial.println("Bridge started.");
}

void loop() {
  Process wifiStatus;                   // initialize a new process
  wifiStatus.runShellCommand("iwconfig wlan0");  // run the process

  // when the process sends a response, print it:
  while (wifiStatus.available() > 0) {
    char c = wifiStatus.read();
    Serial.print(c);
  }
  delay(5000);
}

