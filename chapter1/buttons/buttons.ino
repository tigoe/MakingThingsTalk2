void setup() {
  Serial.begin(9600);    // open serial communications
  pinMode(2, INPUT);     // make pin 2 an input
  pinMode(3, INPUT);     // make pin 3 an input
}

void loop() {
  int roundButton = digitalRead(2);    // read pin 2
  int squareButton = digitalRead(3);   // read pin 3
  Serial.print("round: " );            // print out:
  Serial.print(roundButton);              // pin 2
  Serial.print("   square: " );  
  Serial.println(squareButton);           // pin 3
}

