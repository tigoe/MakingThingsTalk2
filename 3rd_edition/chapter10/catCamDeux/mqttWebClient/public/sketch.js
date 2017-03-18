/*
  mqtt air conditioner controller web interface
  context: p5.js
*/
var clientOptions = {     // mqtt client options
  port: 8080,
  host: 'localhost',
  keepalive: 10000
};

var device = {            // device properties
  on: false,
  temperature: 24,
  setPoint: 18,
  mode: 1,
  connected: false
};
var deviceName = 'airConditioner';  // name of the device
var client;                         // mqtt client

var connected = false;					// client connected
var deviceLabel, deviceDiv;			// display objects on page
var connectButton, modeControl;	// input objects on page

function setup() {
	noCanvas();																		// no canvas needed
	deviceLabel = createSpan(deviceName);					// device info label
	deviceLabel.position(10, 10);
	deviceDiv = createDiv(JSON.stringify(device));// device JSON div
	deviceDiv.position(10, 130);
	connectButton = createButton('Connect');			// connect button
	connectButton.position(10, 100);
	connectButton.touchEnded(connectMe);
	setPointSlider = createSlider(10, 40, 21, 1);	// setPoint slider
	setPointSlider.position(100, 100);
	setPointSlider.touchEnded(changeSetpoint);
	modeControl = createRadio();									// on/off mode controller
  modeControl.option('off', 1);
  modeControl.option('on', 2);
  modeControl.option('auto', 3);
  modeControl.style('width', '50px');
	modeControl.value(device.mode);
	modeControl.position(350, 10);
	modeControl.changed(changeMode);
}

// event handler for setPoint slider:
function changeSetpoint() {
	update('setPoint', setPointSlider.value());		// publish new value
}

// event handler for mode control radio buttons:
function changeMode() {
	update('mode', modeControl.value());					// publish new value
}

// connect button event handler:
function connectMe() {
  if (!connected) {                // if not connected
    client = mqtt.connect(clientOptions); // connect
    client.on('connect', announce);       // listener for connection
    client.on('message', readMessages);   // listener for incoming messages
  } else {
    client.end(quit);                     // disconnect from server
  }
}

// on connect, announce your properties:
function announce() {
	connectButton.html('Disconnect');	// update connect button
  connected = client.connected;    	// update connected status
  // loop over all properties in device:
  for (property in device) {
    client.subscribe(deviceName + '/' + property);  // subscribe to them
  }
	updateInterface();		// update user interface
}

// on disconnect, update connected status
function quit() {
	connectButton.html('Connect');	// update connect button
  connected = client.connected;
}

// Read incoming MQTT or serial messages:
function readMessages(topic, message) {
  topic = topic.toString();               // convert topic to String
  var strings = topic.split('/');         // split at the slash
  var origin = strings[0];                // origin comes before the slash
  var property = strings[1];              // property comes after the slash
  if (property === 'temperature' ||       // these properties need to
    property ==='mode' ||                 // be converted to numbers
    property === 'setPoint') {
    device[property] = Number(message);
  } else {                                // the other properties are Boolean
    // tricky way of getting the boolean value:
    device[property] = (String(message) == '1');
  }
	updateInterface();		// update user interface
}

// event handler for incoming messages from server
function update(property, value) {
  device[property] = value;       // update the property
  var topic = String(property);   // convert both  to strings for .publish()
  var message = String(value);
  if (connected) {         // if connected, publish
    client.publish(deviceName + '/' + topic, message);
  }
}

// UI update function:
function updateInterface() {
	var onState;			// whether AC motor is off or on
	if (device.on) {	// if on === true
		onState = 'on'; // convert true to 'on'
	} else {
		onState = 'off';// conver false to 'off'
	}
	// update device label with name, on/off, and temperature
	deviceLabel.html(deviceName
		+ '<br>' + onState
		+ '<br>temperature: ' + device.temperature);

	setPointSlider.value(device.setPoint);		// update setPoint slider
	modeControl.value(device.mode);						// update mode radio buttons
	// put device JSON in div:
	deviceDiv.html("Device: " + JSON.stringify(device));
}
