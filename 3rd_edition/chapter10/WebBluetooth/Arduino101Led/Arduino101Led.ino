#include <CurieBLE.h>

BLEService ledService("FF10");  // create service

// create LED characteristic and set descriptor:
BLECharCharacteristic ledCharacteristic("FF11", BLERead | BLEWrite);
BLEDescriptor ledDescriptor("2901", "LEDStatus");

void setup() {
  Serial.begin(9600);           // initialize serial
  pinMode(LED_BUILTIN, OUTPUT); // set LED pin mode
  BLE.begin();                  // initialize BLE
  Serial.println(BLE.address());

  // set advertised local name and service UUID:
  BLE.setLocalName("Arduino101");
  BLE.setAdvertisedServiceUuid(ledService.uuid());
  // add descriptor and characteristic:
  ledCharacteristic.addDescriptor(ledDescriptor);
  ledService.addCharacteristic(ledCharacteristic);
  ledCharacteristic.setValue(0);

  BLE.addService(ledService);   // add service to device
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
      // if the cental writes to the characteristic"
      if (ledCharacteristic.written()) {
        // change the LED:
        digitalWrite(LED_BUILTIN, ledCharacteristic.value());
      }
    }

    // central disconnected
    Serial.print("Disconnected from central: ");
    Serial.println(central.address());
  }
}
