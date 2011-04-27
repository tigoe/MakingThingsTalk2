#include <Wire.h>
#include <LSM303DLH.h>
#include <Button.h>

LSM303DLH compass;
Button button = Button(2,PULLDOWN);
boolean calibrating = false;
void setup() {
  Serial.begin(9600);
  pinMode(3,OUTPUT); //debug to led 3
  Wire.begin();
  compass.enable();

  /*
  // Calibration values. Use the serial example program to get the values for
   // your compass.
   compass.m_max.x = +540; 
   compass.m_max.y = +500; 
   compass.m_max.z = 180;
   compass.m_min.x = -520; 
   compass.m_min.y = -570; 
   compass.m_min.z = -770;
   */
}

void loop() {
  if(button.uniquePress()){
    calibrating = !calibrating;
    digitalWrite(3, calibrating);
  }
  if (calibrating) {
    compass.calibrate();
  } 
  
  else {
    compass.read();
    int heading = compass.heading();
    Serial.println(heading);
  }
  delay(100);
}




