/*
  Sneaky button
  context: p5.js
  Moves a button when you click it.
*/
var myButton, responseDiv;    // DOM elements

function setup() {
  createCanvas(windowWidth, windowHeight);  // create the canvas
  myButton = createButton('click me');      // create the button
  myButton.touchEnded(changeButton);        // set button's listener function
  myButton.position(10, 10);                // position the button
  responseDiv = createDiv('catch me');      // create a text div
  responseDiv.position(10, 40);             // position it
}

// runs when you release the mouse or stop touching the screen:
function changeButton() {
  var x = random(windowWidth) - myButton.width;   // a new x position
  var y = random(windowHeight) - myButton.height; // a new y position
  myButton.position(x, y);                        // move the button
  responseDiv.html(x + ',' + y);                  // update the responseDiv
}
