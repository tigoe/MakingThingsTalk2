/*
Bluetooth Central for PhoneGap
context: p5.js in PhoneGap
uses Don Coleman's cordova-plugin-ble-central in PhoneGap/cordova
*/
// UI elements:
var deviceList, responseDiv, dataDiv, autoUpload;
var scanButton, connectButton, disconnectButton, uploadButton;

var autoUploadTimer;         // timer for auto-upload
var connectState = false;    // whether connected to the peripheral
var dataServer = 'http://192.168.0.10:8080';
var readings = new Array();  // readings not yet uploaded

// parameters of the BLE peripheral you're looking for:
var myDevice = {
  serviceUUID: '0927AA6A-3588-11E7-A919-92EBCB67FE33',
  sensorCharacteristic: '0927ADA8-3588-11E7-A919-92EBCB67FE33',
  id:''
};

function setup() {
  // create scan, connect, disconnect, and upload buttons:
  scanButton = createButton('Scan for devices');
  scanButton.touchEnded(scanForDevices);
  scanButton.position(10, 60);
  scanButton.size(80,40);

  connectButton = createButton('connect');
  connectButton.touchEnded(connectToDevice);
  connectButton.position(100, 60);
  connectButton.size(80,40);

  disconnectButton = createButton('disconnect');
  disconnectButton.touchEnded(disconnectFromDevice);
  disconnectButton.position(190, 60);
  disconnectButton.size(80,40);

  uploadButton = createButton('Send to Server');
  uploadButton.touchEnded(sendToServer);
  uploadButton.position(10, 250);
  uploadButton.size(80,40);

  // create auto-upload checkbox:
  autoUpload = createCheckbox('Upload every two minutes', false);
  autoUpload.position(100, 250);
  autoUpload.changed(setAutoUpload);

  // create response and data divs:
  responseDiv = createDiv('tap the scan button to begin');
  responseDiv.position(10, 150);
  responseDiv.style("font-size", "14px");

  dataDiv = createDiv('');
  dataDiv.position(10, 200);
  dataDiv.style("font-size", "14px");

  // check if BLE is enabled:
  ble.isEnabled(scanForDevices, bleError);
}

// initiates BLE scan for devices:
function scanForDevices() {
  responseDiv.html('scanning for devices.');
  // if device list is already populated, remove it to refresh:
  if (deviceList) deviceList.remove();

  deviceList = createSelect();             // create a new select element
  deviceList.position(10, 110);
  deviceList.size(150, 30)
  deviceList.option('Pick a device', '');  // set default option
  deviceList.changed(selectDevice);

  //scan for the serviceUUID for 5 seconds:
  ble.scan([myDevice.serviceUUID], 5, discoverDevice, bleError);
  // set a timeout to announce the end of the scan:
  setTimeout(ble.stopScan, 5000, scanFinished, bleError);
}

// runs when a new device is discovered:
function discoverDevice(device) {
  var result = device.name + ' ' +    // make a string with the new device
  'RSSI: ' + device.rssi;
  deviceList.option(result, device.id);  // add it to the select element
}

function scanFinished() {
  responseDiv.html('scan complete. Pick a device.');
}

// callback for when the user chooses from the select element:
function selectDevice() {
  myDevice.id = deviceList.value();
  responseDiv.html('Selected: ' + deviceList.value());
}

// callback for connect button:
function connectToDevice() {
  if (!connectState) {
    responseDiv.html('connecting to ' + myDevice.id);
    ble.connect(myDevice.id, onConnect, bleError);
    connectState = true;
  }
}

function onConnect() {
  // subscribe to incoming data
  ble.startNotification(myDevice.id, myDevice.serviceUUID,
    myDevice.sensorCharacteristic, onData, bleError);
  responseDiv.html('Waiting for data from ' + myDevice.id);
}

function onData (data) {
  var input = new Uint16Array(data);    // get the reading from the ArrayBuffer
  var reading = {                       // make a JSON object
    timestamp: new Date(),              // add timestamp
    value: input[0]                     // add reading value
  }
  readings.push(reading);               // add reading to readings array
  dataDiv.html('latest: ' + JSON.stringify(reading));
}

function sendToServer() {
  responseDiv.html('uploading data...');
  while(readings.length > 0) {      // as long as there are unsent readings,
    var reading = readings.pop();   // pop the last off the readings array
    // format it for sending as a GET request:
    var path = '/data/' + reading.timestamp + '/' + reading.value;
    // send it
    httpGet(dataServer + path, serverReply);
  }
}

function setAutoUpload() {
  if (!autoUpload.checked()) {
    responseDiv.html('Auto-upload off');
    // cancel the timer
    clearInterval(autoUploadTimer);
  } else {
    responseDiv.html('Auto-upload on');
    // set timer to upload every 2 minutes
    autoUploadTimer = setInterval(sendToServer, 2*60000);
  }
}

function serverReply(data) {
  dataDiv.html('');
  responseDiv.html('Server said: ' + data);
}

function disconnectFromDevice() {
  if (connectState) {
    ble.disconnect(myDevice.id, onDisconnect, bleError);
    connectState = false;
  }
}

function onDisconnect() {
  responseDiv.html('disconnected from ' + myDevice.id);
}

function bleError(error) {
  responseDiv.html(' there was a BLE error' + JSON.stringify(error));
}
