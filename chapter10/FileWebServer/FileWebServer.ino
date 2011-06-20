/*
  RGB Web  Server
 Language: Arduino
 
 */

#include <SPI.h>
#include <Ethernet.h>
#include <TextFinder.h>

Server server(80);

byte mac[] = {  
  0x00, 0xAA, 0xBB, 0xCC, 0xDE, 0x01 };
IPAddress gateway(192,168,1,1);
IPAddress subnet(255,255,0,0);
IPAddress ip(192,168,1,20);


// Initialize the Ethernet server library
// with the IP address and port you want to use 
// (port 80 is default for HTTP):

int lineLength = 0;    // length of the incoming text line
String token = "";

void setup()
{
  Serial.begin(9600);
  // start the Ethernet connection and the server:
  if (!Ethernet.begin(mac)) {
    Ethernet.begin(mac, ip, gateway, subnet);
  }
  Serial.print(Ethernet.localIP()[0]);
  Serial.print(".");
  Serial.print(Ethernet.localIP()[1]);
  Serial.print(".");
  Serial.print(Ethernet.localIP()[2]);
  Serial.print(".");
  Serial.println(Ethernet.localIP()[3]);

  server.begin();

}

void loop()
{
  // listen for incoming clients
  Client client = server.available();
  if (client) {
    TextFinder  finder(client );  
    // an http request ends with a blank line
    //    boolean current_line_is_blank = true;
    while (client.connected()) {      
      if (client.available()) {          
        int digitalRequests = 0;  // counters to show the number of pin change requests
        int analogRequests = 0;
        if( finder.find("GET /") ) {            
          // find tokens starting with "pin" and stop on the first blank line  
          while(finder.findUntil("/", "\n\r")){  
            token+= (char)client.read();
          }
          Serial.println(token);
          token = "";
        }
      }
      // give the web browser time to receive the data
      delay(1);
      client.stop();
    }
    Serial.println("Breaking");
    // give the web browser time to receive the data
    delay(1);
    // close the connection:
    client.stop();
  }
}

float readSensor() {
  // read the value from the sensor:
  int sensorValue = analogRead(A0);
  // convert the reading to millivolts:
  float voltage = sensorValue *  (5000/ 1024); 
  // convert the millivolts to temperature celsius:
  float temperature = (voltage - 500)/10;
  // print the temperature:
  return temperature; 
}


void makeResponse(Client thisClient) {
  thisClient.print("HTTP/1.1 200 OK\n");
  thisClient.print("Content-Type: text/html\n\n");
  thisClient.print("<html><head>");
  thisClient.print("<title>Lair of Herr Fuzzipantzen</title></head>");

  // get the temperature:
  float temperature = readSensor();

  // now print the temp in the body of the HTML page:
  thisClient.print("Temperature: ");
  thisClient.print(temperature);
  thisClient.print(" degrees C");

  // close the page:
  thisClient.println("</body></html>\n");
}



