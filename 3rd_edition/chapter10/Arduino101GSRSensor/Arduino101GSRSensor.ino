/*
 Galvanic Skin Response reader
 Context:  Arduino, for Arduino 101
 */#include <CurieBLE.h>

int lastInput = 0;    // previous input from the sensor
int threshold = 10;   // sensor difference threshold
BLEService sensorService("FE10");  // create service

// create LED characteristic and set descriptor:
BLEIntCharacteristic sensorCharacteristic("FE11", BLERead | BLENotify);
BLEIntCharacteristic thresholdCharacteristic("FE12", BLERead | BLEWrite);

void setup() {
  Serial.begin(9600);           // initialize serial
  BLE.begin();        // initialize BLE

  // set advertised local name and service UUID:
  BLE.setLocalName("Arduino101");
  BLE.setAdvertisedService(sensorService);

  // add service and characteristics to device
  sensorService.addCharacteristic(sensorCharacteristic);
  sensorService.addCharacteristic(thresholdCharacteristic);

  // set initial value for threshold, and begin:
  thresholdCharacteristic.setValue(threshold);

  BLE.addService(sensorService);   // add service to device
  BLE.advertise();              // start advertising
  Serial.println("BLE LED Peripheral active");
}

void loop() {
  BLEDevice central = BLE.central();  // listen for connections
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
