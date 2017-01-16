/*
  Accelerometer Madgwick orientation
  context: Arduino

  Determines which roll, pitch, and yaw using an accelerometer.
  Can be used with any accelerometer, though Adafruit 9DOF is shown

*/
// includes & globals for LSM303:
#include <Wire.h>
#include <L3G.h>
#include <LSM303.h>
#include <MadgwickAHRS.h>

LSM303 accelerometer;
L3G gyro;
Madgwick filter;

long lastReading = 0;            // timestamp of last reading
long readingInterval = 40;       // 40 ms = 25 Hz sample rate

void setup() {
  Serial.begin(9600);            // begin serial communication
  Wire.begin();                  // initialize I2C
  accelerometer.init();          // initialize LSM303 accelerometer

  accelerometer.enableDefault(); // enable default range (+/- 2g):
  gyro.init();                   // initialize L3G gyro
  gyro.enableDefault();          // enable default range (+/- 250dps):
  filter.begin(25);
}

void loop() {
  float x, y, z, gx, gy, gz;
  // read sensors:
  accelerometer.read();
  gyro.read();
  // convert to g's and dps:
  x = readAcceleration(accelerometer.a.x);
  y = readAcceleration(accelerometer.a.y);
  z = readAcceleration(accelerometer.a.z);
  gx = readGyro(gyro.g.x);
  gy = readGyro(gyro.g.y);
  gz = readGyro(gyro.g.z);

  if (millis() - lastReading >= readingInterval) {
    // update the Madgwick filter:
    filter.updateIMU(gx, gy, gz, x, y, z);

    // print the heading, pitch and roll
    float roll = filter.getRoll();
    float pitch = filter.getPitch();
    float heading = filter.getYaw();
    Serial.print(heading);
    Serial.print(",");
    Serial.print(pitch);
    Serial.print(",");
    Serial.println(roll);
    lastReading = millis();
  }
}

float readAcceleration(int rawValue) {
  // LSM303 accelerometer has a +/- 2g range
  // and a 16-bit resolution:
  float result = (rawValue * 2.0) / 32768.0;
  return result;
}


float readGyro(int rawValue) {
  // L3G gyro has a +/- 250 dps range
  // a 16-bit resolution:
  float result = (rawValue * 250.0) / 32768.0;
  return result;
}
