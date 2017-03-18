/*
  DHT11 temperature sensor reader
  context: Arduino
 */
#include <DHT.h>
DHT dht(4, DHT11);    // sensor is on pin 4

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  int temperature = dht.readTemperature();
  int humidity = dht.readHumidity();
  Serial.print(temperature);
  Serial.print("°C ,");
  Serial.print(humidity);
  Serial.println("% rH");
}
