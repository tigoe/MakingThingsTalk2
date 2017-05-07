#include <SPI.h>
#include <BLEPeripheral.h>

// define pins (varies per shield/board)
const int BLE_REQ = 10;
const int BLE_RDY = 2;
const int BLE_RST = 9;

// create peripheral instance, see pinouts above
BLEPeripheral blePeripheral = BLEPeripheral(BLE_REQ, BLE_RDY, BLE_RST);
// initialize the camera service and its UUID:
BLEService cameraService("F01A");
// initialize the shutter characteristic, its UUID and its properties:
BLEIntCharacteristic shutter("F01B", BLERead | BLEWrite);
// initialize the IR camera control:

const int IRPin = 7;              // IR LED I/O pin
const int CAM_NIKON = 1;          // DSLR camera types
const int CAM_CANON = 2;
int buttonState = 0;              // current button state
int lastButtonState = 0;          // previous button state

void setup() {
  Serial.begin(9600);
  // set  local name for the peripheral and advertise the camera service:
  blePeripheral.setLocalName("irRemote");
  blePeripheral.setAdvertisedServiceUuid(cameraService.uuid());

  // add the service and characteristic as attributes of the peripheral:
  blePeripheral.addAttribute(cameraService);
  blePeripheral.addAttribute(shutter);

  blePeripheral.begin();      // begin advertising camera service
  shutter.setValue(0);        // set initial value for shutter
  Serial.println("Starting");
}

void loop() {
  // poll for BLE activity:
  blePeripheral.poll();
  // if a central wrote to the shutter characteristic:
  if (shutter.written()) {
    // and the characteristic's value is 1:
    if (shutter.value() == 1) {
      shutterClick(CAM_CANON);    // send IR shutter signal
      Serial.println("click");
      shutter.setValue(0);        // reset the value to 0
    }
  }
}


void shutterClick(int cameraType) {
  if (cameraType == CAM_NIKON) {       // if it's a Nikon
    unsigned long irFrequency = 38000; // IR freq. = 38K
    for (int i = 0; i < 2; i++) {      // send message twice
      IRPulse(2000, irFrequency);      // 2ms on
      delay(27);                       // 27 ms off
      IRPulse(400, irFrequency);       // 0.4ms on
      delayMicroseconds(1500);         // 1.5ms off
      IRPulse(500, irFrequency);       // 0.5ms on
      delayMicroseconds(3500);         // 3.44ms off
      IRPulse(500, irFrequency);       // 0.5ms on
      delay(65);                       // 65ms delay before repeat
    }
  }
  if (cameraType == CAM_CANON) {       // If it's a Canon
    unsigned long irFrequency = 32700; // IR freq. = 32.7K
    for (int i = 0; i < 2; i++) {      // send message twice
      IRPulse(489, irFrequency);       // 16 pulses @ IR freq.
      delayMicroseconds(7330);
      IRPulse(489, irFrequency);       // 16 pulses @ IR freq.
      delay(100);
    }
  }
}
// send an IR pulse at a frequency for a time:
void IRPulse(unsigned long interval,  unsigned long frequency) {
  unsigned long now = micros();     // get current time in micros
  tone(IRPin, frequency);           // pulse IRPin at frequency
  while (micros() - now < interval);// do nothing until interval passes
  noTone(IRPin);                    // turn off pulse
}
