/*
  p5.js IR Camera Control page
  context: p5.js
*/
var messageBox; // the input text field
var addressBox; // the input text field
var messageDiv; // text div for responses from the server
var sendButton; // the input text field

function setup() {
  var addressLabel = createDiv('Destination address:');
  addressLabel.position(20, 20);
  addressBox = createInput('');
  addressBox.position(180, 20);

  var messageLabel = createDiv('Message:');
  messageLabel.position(20, 50);
  messageBox = createInput('');
  messageBox.position(180, 50);

  var sendButton = createButton('send');
  sendButton.position(20, 80);
  sendButton.mousePressed(sendMessage);

  // create the message div and position it:
  messageDiv = createDiv("waiting for messages");
  messageDiv.position(20, 110);
}

// callback function for the shutter button:
function sendMessage() {
  var data = messageBox.value();
  var destination = addressBox.value();
  var outGoing = encodeURI(data);
  httpGet('/destination/' + destination + '/msg/' + outGoing, 'text', requestDone);
}

// callback function for httpGet() request:
function requestDone(data) {
  messageDiv.html("server response: " + data);
}