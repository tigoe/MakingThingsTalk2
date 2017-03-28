var bluetoothDevice;				// the device to which you are connected
var serviceValue = 0xFF10;	// short value of the service
var charValue = 0xFF11;			// short value of the Characteristic
var ledCharacteristic;			// the ledCharacteristic needs to be global
var ledStatus = 0;				  // led status
var scanButton;						  // UI elements
var ledButton;
var messageSpan;

function setup() {
	messageSpan = createSpan('checking for bluetooth');	// create message span
	messageSpan.position(10, 10);

	if (navigator.bluetooth) {											// if bluetooth is enabled
		messageSpan.html('bluetooth enabled');				// update message span
		scanButton = createButton('scan');	          // create other elements
		scanButton.position(10, 40);
		scanButton.touchEnded(scan);
		ledButton = createButton('off');
		ledButton.position(120, 40);
		ledButton.touchEnded(changeLed);
		ledButton.hide();
	} else {																				// if no bluetooth
		messageSpan.html('no bluetooth');							// update message span
	}

}

function draw() {
	if (!ledStatus) {
		ledButton.html('turn LED on');	// change LED button accordingly
	} else {
		ledButton.html('turn LED off');
	}
}

// this function makes the scan start (and pops up the scan options):
function scan() {
	// get full values for serviceUuid and  characteristicUuid:
	var serviceUuid = BluetoothUUID.getCharacteristic(serviceValue);
	var characteristicUuid = BluetoothUUID.getCharacteristic(charValue);

	// functions for the scan, which is below:
	function gatConnect(device) {
		bluetoothDevice = device;
		scanButton.html('disconnect');
		scanButton.touchEnded(disconnect);
		ledButton.hide();
		messageSpan.html('Connecting to GATT Server...');
		return device.gatt.connect();
	}

	function getSvc(server) {
		messageSpan.html('Getting Service...');
		return server.getPrimaryService(serviceUuid);
	}

	function getChar(service) {
		messageSpan.html('Getting Characteristic...');
		return service.getCharacteristics();
	}

	function listChar(characteristics) {
		// iterate over all characteristics to find the LED characteristic:
		for (c in characteristics) {
			if (characteristics[c].uuid === characteristicUuid) {
				messageSpan.html('LED Characteristic Found.'); // update messageSpan
				ledCharacteristic = characteristics[c];				 // save in a global var
				ledCharacteristic.readValue()						       // read the value,
				.then(getLed);																 // and show  led button
			}
		}
	}
	// error message handler:
	function showError() {
		messageSpan.html('Argh! ' + error);
	}

	// update messageSpan, then do all the steps of the scan:
	messageSpan.html('Requesting Bluetooth Device...');
	navigator.bluetooth.requestDevice({filters: [{services: [serviceUuid]}]})
	.then(gatConnect)
	.then(getSvc)
	.then(getChar)
	.then(listChar)
	.catch(showError);
}

// get the LED value from the readValue() function:
function getLed(value) {
	ledStatus = value.getUint8(0);	// value is a DataView, so parse the first element
	ledButton.show();								// show the led button
}

// change the LED value using the characteristic returned from the scan:
function changeLed() {
	ledStatus = !ledStatus;
	ledCharacteristic.writeValue(new Uint8Array([ledStatus]));
}

function disconnect() {
  if (bluetoothDevice && bluetoothDevice.gatt) {
    bluetoothDevice.gatt.disconnect();
  }
  scanButton.html('scan');
	scanButton.touchEnded(scan);
}
