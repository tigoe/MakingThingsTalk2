#include <CurieBLE.h>
#include <multiCameraIrControl.h>


BLEPeripheral blePeripheral;  // BLE Peripheral Device (the board you're programming)
BLEService cameraService("19B10010-E8F2-537E-4F6C-D104768A1214"); // BLE LED Service

// BLE accelerometer Characteristic - custom 128-bit UUID, read by central
BLECharCharacteristic shutter("19B10011-E8F2-537E-4F6C-D104768A1214", BLERead | BLEWrite);

Nikon camera(7);

void setup() {
  Serial.begin(9600);

  // set advertised local name and service UUID:
  blePeripheral.setLocalName("irRemote");
  blePeripheral.setAdvertisedServiceUuid(cameraService.uuid());

  // add service and characteristic:
  blePeripheral.addAttribute(cameraService);
  blePeripheral.addAttribute(shutter);

  // set the initial value for the characeristic:
  shutter.setValue(0);

  // begin advertising BLE service:
  blePeripheral.begin();
  pinMode(13, OUTPUT);
  Serial.println("Starting");
}

void loop() {
  // poll peripheral
  blePeripheral.poll();

  if (shutter.written()) {
    if (shutter.value() == 1) {
      camera.shutterNow();
      Serial.println("click");
      shutter.setValue(0);
    }
  }
}
