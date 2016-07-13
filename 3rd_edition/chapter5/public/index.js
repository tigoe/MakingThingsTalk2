/*
Video client
context: P5.js
*/

// set global variables:
var myVideo;                          //  movie player
var socket;                           // the websocket
var lastMessage;                      // last message received from server
var host = document.location.host;    // the server that served this page
var message = {"clientName": "browser"};  // what you'll send to the server

function setup() {
  myVideo = createVideo("movie.mp4"); // initialize the video
  myVideo.size(640, 360);             // set its size
  myVideo.position(10, 30);           // position it
  myVideo.loop();                     // loop the video
  lastMessage = createDiv('');        // create a div for text messages
  lastMessage.position(10, 10);       // position the div
  socket = new WebSocket('ws://' + host); // connect to server
  socket.onopen = sendIntro;          // socket connection listener
  socket.onmessage = readMessage;     // socket message listener
}


function sendIntro() {
  // convert the message object to a string and send it:
  socket.send(JSON.stringify(message));
}

function readMessage(event) {
  // read  text from server:
  var msg = event.data;           // read data from the onmessage event
  var videoTime = myVideo.time(); // get the current video time
  var message = JSON.parse(msg);  // convert incoming message to JSON

  // if it's a play/pause message, change the video state:
  if (message.playing) {
    myVideo.loop();
  } else {
    myVideo.pause();
  }

  // if it's a position message, change the video time:
  var value = parseFloat(message.position);
  if (!isNaN(value)) {          // if it's a numeric value,
    var frames = value * 0.033; // 1 frame in seconds at ~30fps
    videoTime += frames;        // add the change to the current time
    myVideo.time(videoTime);    // set the video position
  }

  // save the last client message received for printing on the screen:
  lastMessage.html(JSON.stringify(message));
}
