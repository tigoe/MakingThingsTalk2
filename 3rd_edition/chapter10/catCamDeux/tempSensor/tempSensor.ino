/*
  mqtt client to control air conditioner
  context: Arduino
 */
#include <DHT.h>           // include DHT library
const int sensorPin = 4;   // pin number for the sensor
DHT dht(sensorPin, DHT11); // make an instance of the library

void setup() {
  Serial.begin(9600);      // start serial communications
  dht.begin();             // start the sensor
}

void loop() {
  float temperature = dht.readTemperature();  // read temperature
  float humidity = dht.readHumidity();        // read humidity
  Serial.print(temperature);                // print them
  Serial.print("°C ,");
  Serial.print(humidity);
  Serial.println("% rH");
}
