/*
Bluetooth Central for PhoneGap
context: p5.js in PhoneGap
uses Don Coleman's cordova-plugin=ble-central in PhoneGap/cordova
*/
// UI elements:
var deviceList, responseDiv, dataDiv, autoUpload;
var scanButton, connectButton, disconnectButton, uploadButton;
var autoUploadTimer;
var connectState = false;		// whether connected to the peripheral
var dataServer = 'http://192.168.0.10:8080';
var readings = new Array();
// parameters of the BLE peripheral you're looking for:
var myDevice = {
	serviceUUID: "FE10",
	sensorCharacteristic: "FE11",
	id:''
};

function setup() {
	console.log('starting up');
	// create scan button connect button, disconnect button:
	scanButton = createButton('Refresh list');
	scanButton.touchEnded(scanForDevices);
	scanButton.position(10, 10);
	scanButton.size(80,40);

	connectButton = createButton('connect');
	connectButton.touchEnded(connectToDevice);
	connectButton.position(100, 10);
	connectButton.size(80,40);

	disconnectButton = createButton('disconnect');
	disconnectButton.touchEnded(disconnectFromDevice);
	disconnectButton.position(190, 10);
	disconnectButton.size(80,40);

	uploadButton = createButton('Send to Server');
	uploadButton.touchEnded(sendToServer);
	uploadButton.position(220, 150);
	uploadButton.size(80,40);

	autoUpload = createCheckbox('Upload every minute', false);
	autoUpload.position(220, 200);
	autoUpload.changed(setAutoUpload);

	// create response div:
	responseDiv = createDiv('tap the scan button to begin');
	responseDiv.position(10, 100);
	responseDiv.style("font-size", "18px");

	dataDiv = createDiv('');
	dataDiv.position(10, 150);
	dataDiv.size(200, 300);
	dataDiv.style("font-size", "14px");
	dataDiv.style("overflow", "scroll");
}

// initiates BLE scan for devices:
function scanForDevices() {
	responseDiv.html('scanning for devices.');
	// if device list is already populated, remove it to refresh:
	if (deviceList) deviceList.remove();

	deviceList = createSelect(); 						// create a new select element
	deviceList.position(10, 60);
	deviceList.size(150, 30)
	deviceList.option('Pick a device', '');	// set default so user has to change
	deviceList.changed(selectDevice);

	//scan for the serviceUUID for 5 seconds:
	ble.scan([myDevice.serviceUUID], 5, discoverDevice, bleError);
	// set a timeout to announce the end of the scan:
	setTimeout(ble.stopScan, 5000, scanFinished, bleError);
}

// runs when a new device is discovered:
function discoverDevice(device) {
	var result = device.name + ' ' +		// make a string with the new device
	'RSSI: ' + device.rssi;
	deviceList.option(result, device.id);	// add it to the select element
}

function scanFinished() {
	responseDiv.html('scan complete. Pick a device.');
}

// callback for when the user chooses from the select element:
function selectDevice() {
	console.log('touchEnded');
	myDevice.id = deviceList.value();
	responseDiv.html('Selected: ' + deviceList.value());
}

// callback for connect button:
function connectToDevice() {
	if (deviceList.value() != '') {
		myDevice.id = deviceList.value();
	}

	function onConnect() {
		// subscribe for incoming data
		ble.startNotification(myDevice.id, myDevice.serviceUUID, \
			myDevice.sensorCharacteristic, onData, bleError);
		responseDiv.html('Waiting for data from ' + myDevice.id);
	};

	if (!connectState) {
		responseDiv.html('connecting to ' + myDevice.id);
		ble.connect(myDevice.id, onConnect, bleError);
		connectState = true;
	}
}

function onData (data) { // data received from Arduino
	var input = new Uint16Array(data);
	var dataString = new Date().toISOString() + ',' + input[0] + ';';
	dataDiv.html(dataString, true);
}

function sendToServer() {
	responseDiv.html('uploading data...');
	if (dataDiv.html() !== '') {
		httpGet(dataServer + '/data/?readings=' + dataDiv.html(), serverReply);
	}
}

function setAutoUpload() {
	if (!autoUpload.checked()) {
		console.log('clearing timer');
		clearInterval(autoUploadTimer);
	} else {
		console.log('setting timer');
		autoUploadTimer = setInterval(sendToServer, 15000);
	}
}

function serverReply(data) {
	dataDiv.html('');
	responseDiv.html('Server said: ' + data);
}

function disconnectFromDevice() {
	function onDisconnect() {
		responseDiv.html('disconnected from ' + myDevice.id);
	}
	if (connectState) {
		ble.disconnect(myDevice.id, onDisconnect, bleError);
		connectState = false;
	}
}

function bleError(error) {
	responseDiv.html(' there was a BLE error' + JSON.stringify(error));
}
