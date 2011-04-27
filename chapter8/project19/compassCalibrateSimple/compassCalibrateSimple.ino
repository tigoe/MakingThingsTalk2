#include <Wire.h>
#include <LSM303DLH.h>

LSM303DLH compass;

int accMax[3];
int accMin[3];

void setup() {
  Serial.begin(9600);
  Wire.begin();
  compass.enable();

  // calibrate for the first ten seconds after startup:
  while (millis() < 5000) {
    compass.calibrate(); 
  }

}

void loop() {
  compass.read();
  Serial.println(String(compass.pitch()) + "," + String(compass.roll()));
  delay(100); 
}




