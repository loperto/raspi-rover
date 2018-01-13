
int ledPin = 13;

void setup() {
	Serial.begin(9600);
	// initialize digital pin LED_BUILTIN as an output.
	pinMode(ledPin, OUTPUT);
}

void toggleLed() {
	int ledStatus = digitalRead(ledPin);
	if (ledStatus == HIGH) {
		digitalWrite(ledPin, LOW);
	}
	else {
		digitalWrite(ledPin, HIGH);
	}

}

// the loop function runs over and over again forever
void loop() {
	if (Serial.available()) {
		char c = Serial.read();
		Serial.println(c);
		if (c == 'l') {
			toggleLed();
			Serial.println("recived");
		}
	}

}