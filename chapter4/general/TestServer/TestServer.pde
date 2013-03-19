/*
  Test Server Program
 Context: Processing
 
 Creates a server that listens for clients and prints 
 what they say.  It also sends the last client anything that's  
 typed on the keyboard.
 */

// include the net library:
import processing.net.*;

int port = 8080;        // the port the server listens on
Server myServer;        // the server object
Client thisClient;
int counter = 0;
void setup()
{
  myServer = new Server(this, port); // Start the server
}

void draw()
{
  // get the next client that sends a message:
   thisClient = myServer.available();
  // if the message is not null, display what it sent:

  if (thisClient != null) {
    // read bytes incoming from the client:
    while(thisClient.available() > 0) {
      print(char(thisClient.read()));
    }
    // send an HTTP response:
    thisClient.write("HTTP/1.1 200 OK\r\n");
    thisClient.write("Content-Type: text/html\r\n\r\n");
    thisClient.write("<html><head><title>Hello</title></head>");
    thisClient.write("<body>Hello, Client! " + counter);
   thisClient.write("</body></html>\r\n\r\n");
    // disconnect:
    thisClient.stop();
    counter++;
  }
}
