/*
  Galvanic Skin Response reader
  Context:  Arduino, for nRF51822 or nRF8001
*/

#include <SPI.h>
#include <BLEPeripheral.h>

// define pins (varies per shield/board)
#define BLE_REQ   10
#define BLE_RDY   2
#define BLE_RST   9

int lastInput = 0;    // previous input from the sensor
int threshold = 10;   // sensor difference threshold

BLEPeripheral blePeripheral = BLEPeripheral(BLE_REQ, BLE_RDY, BLE_RST);
// create service
BLEService sensorService( \
                          "0927AA6A-3588-11E7-A919-92EBCB67FE33");

// create LED characteristic and threshold:
BLEIntCharacteristic sensorCharacteristic( \
    "0927ADA8-3588-11E7-A919-92EBCB67FE33", BLERead | BLENotify);
BLEIntCharacteristic thresholdCharacteristic( \
    "0927AF9C-3588-11E7-A919-92EBCB67FE33", BLERead | BLEWrite);
void setup() {
  Serial.begin(9600);           // initialize serial
  // set advertised local name and service UUID:
  blePeripheral.setLocalName("BleNano");
  blePeripheral.setAdvertisedServiceUuid(sensorService.uuid());

  // add service and characteristics to device
  blePeripheral.addAttribute(sensorService);
  blePeripheral.addAttribute(sensorCharacteristic);
  blePeripheral.addAttribute(thresholdCharacteristic);

  // set initial value for threshold, and begin:
  thresholdCharacteristic.setValue(threshold);
  blePeripheral.begin();
  Serial.println("BLE LED Peripheral active");
}

void loop() {
  BLECentral central = blePeripheral.central();  // listen for connections
  // if you get a connection:
  if (central) {
    Serial.print("Connected to central: "); // print central's address
    Serial.println(central.address());
    //  while central is connected:
    while (central.connected()) {
      if (thresholdCharacteristic.written()) {
        threshold = thresholdCharacteristic.value();
      }
      int input = analogRead(A4);
      if (abs(input - lastInput) > threshold) {
        sensorCharacteristic.setValue(input);
        Serial.print(threshold);
        Serial.print(",");
        Serial.println(input);
      }
      lastInput = input;
    }

    // central disconnected
    Serial.print("Disconnected from central: ");
    Serial.println(central.address());
  }
}
