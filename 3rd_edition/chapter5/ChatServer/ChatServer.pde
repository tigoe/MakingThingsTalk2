/*
  Test Server Program
 Context: Processing
 
 Creates a server that listens for clients and prints
 what they say.  It also sends the last client anything that's
 typed on the keyboard.
 */

// include the net library:
import processing.net.*;

// set global variables:
int port = 8080;                     // the port the server listens on
Server myServer;                     // the server object
ArrayList clients = new ArrayList(); // list of clients

void setup() {
  myServer = new Server(this, port);  // start the server
}

void draw() {
  // listen for clients:
  Client currentClient = myServer.available();

  // if a client sends a message, read it:
  if (currentClient != null ) {
    readMessage(currentClient);
  }
}

// ServerEvent occurs when a new client connects to the server:
void serverEvent(Server myServer, Client thisClient) {
  println("New client: " + thisClient.ip()); // print client's IP
  clients.add(thisClient);                   // add it to the clientList
  thisClient.write("client:" + clients.size() + "\n");     // say hello
}

void readMessage(Client thisClient) {
  // read available text from client as a String and print it:
  String message = thisClient.readStringUntil('\n');
  // if there's no message, skip the rest of this function:
  if (message == null) return;
  // print the message and who it's from
  println(thisClient.ip() + ": " + message);  

  if (message.contains("exit")) {      // if it's a disconnect message, 
    myServer.disconnect(thisClient); // disconnect client  
    clients.remove(thisClient);      // delete client from the clientList
  }
}

void keyReleased() {
  myServer.write(key);
}