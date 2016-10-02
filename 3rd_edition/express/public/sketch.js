var localPos = {};
var remotePos = {};

function setup() {
  createCanvas(windowWidth, windowHeight);  // set the drawing canvas
  httpGet("/position", showResponse); // ask server for remote client's position
}

function draw() {
  background(255);    // set the colors
  fill(75,12,34);
  ellipse(remotePos.x, remotePos.y, 50, 50);  // remote client circle
  fill(0,12,87);                              // change circle color
  ellipse(localPos.x, localPos.y, 50, 50);    // local client circle
}

function showResponse(response) {
  remotePos = JSON.parse(response);    // parse server's response
  httpGet("/position", showResponse);  // ask for remote client position again
}

function mouseReleased() {      // when mouse clicks
  localPos.x = mouseX;          // set local circle's X pos
  localPos.y = mouseY;          // set local circle's Y position
  // send local position to server:
  httpGet("/update?x=" +localPos.x + "&y=" + localPos.y, showResponse);
}
