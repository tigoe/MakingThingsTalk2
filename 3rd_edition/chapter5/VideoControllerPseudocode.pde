/*
  Video server
 context: Processing
 */

// include necessary libraries

// set global variables:
// the port the server listens on
// the server object
// list of clients
//  movie player
// latest time to set the movie
// state if the video: playing/paused
// last message received from client

void setup() {
// initialize the movie
// start the server
// set the video to the beginning
}

void draw() {
// listen for clients:

// if a client sends a message, read it:
// display the latest video frame:

// display the client that sent the last message:
// dark grey fill
// drop shadow
// white fill
// main text
}

// this event occurs whenever a new movie frame is ready:
void movieEvent(Movie myVideo) {
}

void scrub(float changeValue) {
// use number from client as a percentage of video length
// play the video
// jump to the calculated position
// if the movie should be paused, pause it
}

// ServerEvent occurs when a new client connects to the server:
// print client's IP
// add it to the clientList
}

void readMessage(Client thisClient) {
// read available text from client as a String and print it:

// if it's a play/pause message, change the video state:
// if it's a numeric value,
// constrain it to a range from 0 -100
// set the video to the appropriate position

// if it's a disconnect message,
// disconnect client
// delete client from the clientList

// save the last client message received for printing on the screen:
  lastMessage = thisClient.ip() + ": " + message;
}
