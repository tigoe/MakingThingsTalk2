/*
  mqtt client to control air conditioner
  context: Arduino
 */
#include <SPI.h>
#include <WiFi101.h>
//#include <ESP8266WiFi.h>    // use this instead of WiFi101 for ESP8266 modules
#include <MQTTClient.h>
#include <DHT.h>
#include "config.h"

WiFiClient netSocket;
MQTTClient client;
//char serverAddress[] = "192.168.0.13";
char serverAddress[] = "104.236.102.241";
boolean deviceIsOn = false;
int temperature = 0;
int lastTemperature = 0;
int setPoint = 18;
int mode = 1;
boolean deviceConnected = false;

const int relayPin = LED_BUILTIN;
DHT dht(4, DHT11);

void setup() {
  // connect to WiFi
  Serial.begin(9600);               // initialize serial communication
  // while you're not connected to a WiFi AP,
  while ( WiFi.status() != WL_CONNECTED) {
    Serial.print("Attempting to connect to Network named: ");
    Serial.println(ssid);           // print the network name (SSID)
    WiFi.begin(ssid, pass);         // try to connect
    delay(2000);
  }
  // When you're connected, print out the device's network status:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  // start the temperature sensor and get an initial reading:
  dht.begin();
  temperature = dht.readTemperature();

  pinMode(relayPin, OUTPUT);    // make the relay pin an output

  // start the mqtt client and try to connect:
  client.begin(serverAddress, netSocket);
  mqttConnect();
}

void loop() {
  client.loop();              // check for new messages
  if (!client.connected()) {  // if the client disconnects,
    Serial.println("disconnected from server");
    deviceConnected = false;
    mqttConnect();            // reconnect
  }

  temperature = dht.readTemperature();          // read the temperature
  if (abs(temperature - lastTemperature) > 0) { // if it's changed, publish it
    client.publish("airConditioner/temperature", String(temperature));
  }
  lastTemperature = temperature;         //save for comparison next time
  
  if (mode == 3) {    // auto
    checkThermostat();
  }
  
  digitalWrite(relayPin, deviceIsOn);    // turn on or off the relay pin
}


void mqttConnect() {
  while (!client.connect("airConditioner")) {
    delay(500);
  }
  Serial.println("connected to server");
  deviceConnected = true;
  client.subscribe("airConditioner/on");
  client.subscribe("airConditioner/setPoint");
  client.subscribe("airConditioner/mode");
  client.subscribe("airConditioner/update");
  publishAll();
}

void publishAll() {
  client.publish("airConditioner/on", String(deviceIsOn));
  client.publish("airConditioner/temperature", String(temperature));
  client.publish("airConditioner/setPoint", String(setPoint));
  client.publish("airConditioner/mode", String(mode));
  client.publish("airConditioner/connected", String(deviceConnected));

}

void messageReceived(String topic, String payload, char bytes[], unsigned int length) {
  // parse the topic
  int divider = topic.indexOf('/');
  String deviceName = topic.substring(0, divider);
  String property = topic.substring(divider + 1);

  // if there's a request for all data, publish all:
  if (property == "update" && payload == "all") {
    publishAll();
  }
  if (property == "on") {
    deviceIsOn = payload.toInt();
  }

  // if there's a setPoint, set it
  if (property == "setPoint") {
    setPoint = payload.toInt();
  }

  // if there's an on/off, act on it
  // if there's a mode switch, change the mode (auto/on/off)

  if (property == "mode") {
    mode = payload.toInt();
    switch (mode) {    // check mode
      case 1:   // off
        digitalWrite(relayPin, LOW);  // turn off AC
        deviceIsOn = false;
        client.publish("airConditioner/on", String(deviceIsOn));
        break;
      case 2:   // on
        digitalWrite(relayPin, HIGH); // turn on AC
        deviceIsOn = true;
        client.publish("airConditioner/on", String(deviceIsOn));
        break;
      case 3:   //auto
        checkThermostat();                 // check thermostat
        break;
    }
  }
}

void checkThermostat() {
  if (temperature > setPoint) {
    if (!deviceIsOn) {
      // turn on
      deviceIsOn = true;
      client.publish("airConditioner/on", String(deviceIsOn));
    }
  }
  if (setPoint > temperature) {
    if (deviceIsOn) {
      // turn off
      deviceIsOn = false;
      client.publish("airConditioner/on", String(deviceIsOn));
    }
  }
}

