/*
  p5.js IR Camera Control page
  context: p5.js
*/
var shutterButton; // the shutter button
var messageDiv;    // text div for responses from the server

function setup() {
  // create the shutter button, position it, and give it a callback:
  shutterButton = createButton('shutter');
  shutterButton.position(windowWidth/2, 20);
  shutterButton.touchEnded(getShutter);
  // create the message div and position it:
  messageDiv = createDiv("waiting for messages");
  messageDiv.position(20, 50);
}

// callback function for the shutter button:
function getShutter() {
  httpGet('/click', 'text', clickDone);
}

// callback function for httpGet() request:
function clickDone(data) {
  messageDiv.html("server response: " + data);
}
