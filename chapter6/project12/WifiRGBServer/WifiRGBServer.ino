/*
  Wi-Fi RGB Web  Server
 Context: Arduino
 */

#include <SPI.h>
#include <WiFi.h>

// use these settings for WPA:
char ssid[] = "myNetwork";        // the name of your network
char password[] = "secretpassword"; // the password you’re using to connect  

// use these settings instead for WEP:
//char keyIndex = 0;               // WEP networks can have multiple keys. 
// the 128-bit WEP key you’re using to connect:
//char key[] = "FACEDEEDDADA01234567890ABC";  

int status = WL_IDLE_STATUS;     // the Wifi radio's status

WiFiServer server(80);
int lineLength = 0;    // length of the incoming text line


void setup() {
  // initialize serial:
  Serial.begin(9600);

  Serial.println("Attempting to connect to network...");
  // attempt to connect using WPA encryption:
  status = WiFi.begin(ssid, password);

  // or use this to attempt to connect using WEP 128-bit encryption:
  // status = WiFi.begin(ssid, keyIndex, key);

  Serial.print("SSID: ");
  Serial.println(ssid);

  // if you're not connected, stop here:
  if ( status != WL_CONNECTED) { 
    Serial.println("Couldn't get a wifi connection");
    while(true);
  } 
}


void loop() {
  // listen for incoming clients
  WiFiClient client = server.available();
  if (client) {
    Serial.println("Got a client");

    while (client.connected()) {
      if (client.available()) {
        // read in a byte and send it serially:
        char thisChar = client.read();
        Serial.write(thisChar);
        // if you get a linefeed and the request line is blank,
        // then the request is over:
        if (thisChar == '\n' && lineLength < 1) {
          // send a standard http response header
          makeResponse(client);
          break;
        }
        //if you get a newline or carriage return,
        // you're at the end of a line:
        if (thisChar == '\n' || thisChar == '\r') {
          lineLength = 0;
        } 
        else {
          // for any other character, increment the line length:
          lineLength++;

        }
      }    
    }
    Serial.println("Breaking");
    // give the web browser time to receive the data
    delay(1);
    // close the connection:
    client.stop();
  }
}


void makeResponse(WiFiClient thisClient) {
  thisClient.print("HTTP/1.1 200 OK\n");
  thisClient.print("Content-Type: text/html\n\n");
  thisClient.print("<html><head><meta http-equiv=\"refresh\" content=\"3\">");
  thisClient.print("<title>Hello from Arduino</title></head>");
  // set up the body background color tag:
  thisClient.print("<body bgcolor=#");
  // read and the three analog sensors:
  int red = analogRead(A0)/4;
  int green = analogRead(A1)/4;
  int blue = analogRead(A2)/4;
  // print them as one hexadecimal string:
  thisClient.print(red, HEX);
  thisClient.print(green, HEX);
  thisClient.print(blue, HEX);
  // close the tag:
  thisClient.print(">");
  // now print the color in the body of the HTML page:
  thisClient.print("The color of the light on the Arduino is #");
  thisClient.print(red, HEX);
  thisClient.print(green, HEX);
  thisClient.println(blue, HEX);
  // close the page:
  thisClient.println("</body></html>\n");
}
