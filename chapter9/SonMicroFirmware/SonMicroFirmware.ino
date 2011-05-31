#include <Wire.h>



void setup() {
 Serial.begin(9600);
 Wire.begin();
 delay(2000);
 Serial.println("Resetting");
 Wire.beginTransmission(0x42);
 Wire.write(0x01);
 Wire.write(0x80);
 Wire.write(0x81);
 Wire.endTransmission();
 delay(3000);

 Serial.println("asking for firmware");
 Wire.beginTransmission(0x42);
 Wire.write(0x01);
 Wire.write(0x81);
 Wire.write(0x82);
 Wire.endTransmission();
 delay(50);
 Serial.print("getting reply: ");
 Wire.requestFrom(0x42,10);
 while(!Wire.available()) {
   delay(50);
 }
 while(Wire.available()) {
   Serial.write(Wire.read());
  
 }
 Serial.println();
}

void loop()
{

}

