/*
  Video server
 context: Processing
 */

// include necessary libraries
import processing.net.*;
import processing.video.*;

// set global variables:
int port = 8080;                     // the port the server listens on
Server myServer;                     // the server object
ArrayList clients = new ArrayList(); // list of clients
Movie myVideo;                       //  movie player
boolean playing = false;             // state if the video: playing/paused
String lastMessage = "";             // last message received from client

void setup() { 
  size(640, 360);
  myVideo = new Movie(this, "train.mov"); // initialize the video
  myServer = new Server(this, port);      // start the server 
  scrub(0.0);                             // set the video to the start
}

void draw() {
  // listen for clients:
  Client currentClient = myServer.available();

  // if a client sends a message, read it:
  if (currentClient != null ) {
    readMessage(currentClient);
  }
  // display the latest video frame:
  image(myVideo, 0, 0, width, height);

  // display the client that sent the last message:
  fill(15);                          // dark grey fill
  text(lastMessage, 11, height-19);  // drop shadow
  fill(255);                         // white fill
  text(lastMessage, 10, height-20);  // main text
}

// ServerEvent occurs when a new client connects to the server:
void serverEvent(Server myServer, Client thisClient) {
  println("New client: " + thisClient.ip()); // print client's IP
  clients.add(thisClient);                   // add it to the clientList
  thisClient.write("client:" + clients.size() + "\n");     // say hello
}

// this event occurs whenever a new movie frame is ready:
void movieEvent(Movie myVideo) {
  myVideo.read();
}

void scrub(float newPosition) {
  myVideo.loop();                // play the video
  myVideo.jump(newPosition);       // jump to the calculated position
  if (!playing) myVideo.pause(); // if the movie should be paused, pause it
}

void readMessage(Client thisClient) {
  // read available text from client as a String and print it:
  String message = thisClient.readStringUntil('\n');
  // if there's no message, skip the rest of this function:
  if (message == null) return;
  // print the message and who it's from
  println(thisClient.ip() + "\t" + message); 

  message = message.trim();                   // trim whitespace from message 
  String[] decodedMsg = split(message, ":");  // split the message at the colon
  String property = decodedMsg[0];            // first part is the key (property name)
  int value = int(decodedMsg[1]);             // second part is the value

  //    if it's a play/pause message, change the video state:  
  if (property.equals("playing")) {  
    playing = boolean(value);      // convert value to a boolean
    if (playing) {                 // if it's true,
      myVideo.loop();              // play the video
    } else {                       // if not,
      myVideo.pause();             // pause it
    }
  }

  // if it's a position mesage, change the video time:
  if (property.equals("position")) {
    float frames = value * 0.033;
    float videoTime = myVideo.time() + frames;
    scrub(videoTime);      // set the video to the appropriate position
  }

  // if it's a disconnect message, disconnect the client:
  if (property.equals("exit") && value == 1) {  
    myServer.disconnect(thisClient); // disconnect client
    clients.remove(thisClient);      // delete client from the clientList
  }
  // save the last client message received for printing on the screen:
  lastMessage = thisClient.ip() + ": " + message;
}