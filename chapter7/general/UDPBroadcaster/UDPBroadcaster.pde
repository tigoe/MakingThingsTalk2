
//comment

import hypermedia.net.*;

UDP udp;  // define the UDP object
String outString = "";
int packetSize = 22;

void setup() {
  udp = new UDP( this, 10002 );  // create a new datagram connection on port 6000
  //udp.log( true ); 		// <-- printout the connection activity
  udp.listen( true );           // and wait for incoming message
}

void draw()
{
}

void keyPressed() {
switch (key) {
  case 'a':
    String ip = "128.122.151.255";	// the remote IP address
    int port = 9999;		// the destination port
    udp.send("calling all ducks\n\n", ip, port );   // the message to send
  break;
  case 'b':
       ip = "128.122.151.6";	// the remote IP address
     port = 10002;		// the destination port
    udp.send("Hey " + ip + ", I'm talking to YOU!\n\n", ip, port );   // the message to send
  break;
  case 'c':
       ip = "128.122.151.92";	// the remote IP address
     port = 10002;		// the destination port
    udp.send("Hey " + ip + ", I'm talking to YOU!\n", ip, port );   // the message to send
  break;

}
}



void receive( byte[] data ) { 			// <-- default handler
  //void receive( byte[] data, String ip, int port ) {	// <-- extended handler

  for(int i=0; i < data.length; i++) 
    print(int(data[i]) + ".");  
  println();
}

