
// the setup function runs once when you press reset or power the board
void setup() {
	Serial.begin(9600);
	// initialize digital pin LED_BUILTIN as an output.
	pinMode(LED_BUILTIN, OUTPUT);
}

void toggleLed() {
	int ledStatus = digitalRead(LED_BUILTIN);
	if (ledStatus == HIGH) {
		digitalWrite(LED_BUILTIN, LOW);
	}
	else {
		digitalWrite(LED_BUILTIN, HIGH);
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