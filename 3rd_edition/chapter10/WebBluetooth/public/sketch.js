var bluetoothDevice;				// the device to which you are connected
var serviceValue = 0xFF10;	// short value of the service
var charValue = 0xFF11;			// short value of the Characteristic
var ledCharacteristic;			// the ledCharacteristic needs to be global
var ledStatus = 0;				  // led status
var scanButton;						  // UI elements
var disconnectButton;
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
		disconnectButton = createButton('disconnect');	          // create other elements
		disconnectButton.position(10, 40);
		disconnectButton.touchEnded(disconnect);
		disconnectButton.hide();
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
	function connectToDevice(device) {
		bluetoothDevice = device;
		device.addEventListener('gattserverdisconnected', onDisconnected);
		scanButton.hide();
		disconnectButton.show();
		messageSpan.html('Connecting to GATT Server...');
		return device.gatt.connect();
	}

	function getSvcs(services) {
		messageSpan.html('Getting Service...');
		return services.getPrimaryService(serviceUuid);
	}

	function getChars(service) {
		messageSpan.html('Getting Characteristic...');
		return service.getCharacteristics();
	}

	function findChar(characteristics) {
		// iterate over all characteristics to find the LED characteristic:
		for (c in characteristics) {
			if (characteristics[c].uuid === characteristicUuid) {
				var message = 'connected to ' + bluetoothDevice.name
					+ ' LED Characteristic.'
				messageSpan.html(message); // update messageSpan
				ledCharacteristic = characteristics[c];				 // save in a global var
				ledCharacteristic.readValue()						       // read the value,
				.then(getLed);																 // and show  led button
			}
		}
	}
	// error message handler:
	function showError(error) {
		messageSpan.html('Error: ' + error);
	}

	// update messageSpan, then do all the steps of the scan:
	messageSpan.html('Requesting Bluetooth Device...');
	navigator.bluetooth.requestDevice({filters: [{services: [serviceUuid]}]})
	.then(connectToDevice)
	.then(getSvcs)
	.then(getChars)
	.then(findChar)
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
	if (!bluetoothDevice) {
		return;
	}
	messageSpan.html('Disconnecting from ' + bluetoothDevice.name);
	if (bluetoothDevice.gatt.connected) {
		bluetoothDevice.gatt.disconnect();
	} else {
		messageSpan.html(bluetoothDevice.name + ' is already disconnected');
	}
}

function onDisconnected()  {
	disconnectButton.hide();
	ledButton.hide();
	scanButton.show()
}
