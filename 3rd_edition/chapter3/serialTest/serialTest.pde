import processing.serial.*;
 Serial myPort;


void setup() {
  printArray(Serial.list());
  myPort = new Serial(this, Serial.list()[0], 9600);
}

void draw() {
  
}

void serialEvent(Serial myPort) {
 int foo = myPort.read();
 println(foo);
 myPort.write(foo + 1);
}

void keyReleased(){
  myPort.write(key);
}

void mouseReleased() {
 myPort.write(mouseX + "," + mouseY); 
 println(mouseX + "," + mouseY);
}