// include libraries
#include <multiCameraIrControl.h>
#include <CurieBLE.h>

// initialize the camera service and its UUID:
BLEService cameraService("F01A");
// initialize the shutter characteristic, its UUID and its properties:
BLEIntCharacteristic shutter("F01B", BLERead | BLEWrite);
// initialize the IR camera control:
Nikon camera(3);

void setup() {
  Serial.begin(9600);
  BLE.begin();
  // set  local name for the peripheral and advertise the camera service:
  BLE.setLocalName("irRemote");
  BLE.setAdvertisedServiceUuid(cameraService.uuid());

  // add the service and characteristic as attributes of the peripheral:
  BLE.addService(cameraService);
  cameraService.addCharacteristic(shutter);

  BLE.advertise();            // begin advertising camera service
  shutter.setValue(0);        // set initial value for shutter
  Serial.println("Starting");
}

void loop() {
  // poll for BLE activity:
  BLE.poll();
  // if a central wrote to the shutter characteristic:
  if (shutter.written()) {
    // and the characteristic's value is 1:
    if (shutter.value() == 1) {
      camera.shutterNow();        // send the IR signal
      Serial.println("click");
      shutter.setValue(0);        // reset the value to 0
    }
  }
}
