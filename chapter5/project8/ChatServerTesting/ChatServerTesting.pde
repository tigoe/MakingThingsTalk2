/*
  Test Server Program
 Context: Processing
 
 Creates a server that listens for clients and prints
 what they say.  It also sends the last client anything that's
 typed on the keyboard.
 */

// include the net library:
import processing.net.*;

int port = 8080;                     // the port the server listens on
Server myServer;                     // the server object
ArrayList clients = new ArrayList(); // list of clients

void setup()
{
  myServer = new Server(this, port);
}

void draw()
{
  // get the next client that sends a message:
  Client speakingClient = myServer.available();

  if (speakingClient !=null) {
    String message = trim(speakingClient.readString());
    // print who sent the message, and what they sent:
    println(speakingClient.ip() + "\t" + message);
  
    if (message.equals("exit")) {
      myServer.disconnect(speakingClient);
      clients.remove(speakingClient);
    }
  }
}

// ServerEvent message is generated when a new client
// connects to the server.
void serverEvent(Server myServer, Client thisClient) {
  println("We have a new client: " + thisClient.ip());
  clients.add(thisClient);
}

void keyReleased() {
    myServer.write(key);
}

