#include <Servo.h>

Servo servoX;
Servo servoY;
unsigned int posX = 0;
unsigned int posY = 0;

int ledPin = 13;
const int motorSpeed = 100;

//CH1 right side
int ch1DirPin = 3;
int ch1CurPin = 4;
int ch1Pwm = 9;

//CH2 left side
int ch2DirPin = 7;
int ch2CurPin = 8;
int ch2Pwm = 10;

void setup() {
	Serial.begin(9600);
	pinMode(ledPin, OUTPUT);
	pinMode(ch1DirPin, OUTPUT);
	pinMode(ch1CurPin, OUTPUT);
	pinMode(ch1Pwm, OUTPUT);
	pinMode(ch2DirPin, OUTPUT);
	pinMode(ch2CurPin, OUTPUT);
	pinMode(ch2Pwm, OUTPUT);
	servoX.attach(5);
	servoY.attach(6);
}

void sweepX() {
	for (posX = 0; posX <= 180; posX += 1) {
		servoX.write(posX);
		delay(20);
	}
	for (posX = 180; posX >= 0; posX -= 1) {
		servoX.write(posX);
		delay(20);
	}
}

void sweepY() {
	for (posY = 0; posY <= 180; posY += 1) {
		servoY.write(posY);
		delay(20);
	}
	for (posY = 180; posY >= 0; posY -= 1) {
		servoY.write(posY);
		delay(20);
	}
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

void ch1(int speed, bool forward) {
	analogWrite(ch1Pwm, speed);
	digitalWrite(ch1DirPin, forward);
	digitalWrite(ch1CurPin, HIGH);
}

void ch2(int speed, bool forward) {
	analogWrite(ch2Pwm, speed);
	digitalWrite(ch2DirPin, forward);
	digitalWrite(ch2CurPin, HIGH);
}

void forward() {
	ch1(motorSpeed, true);
	ch2(motorSpeed, true);
}

void backward() {
	ch1(motorSpeed, false);
	ch2(motorSpeed, false);
}

void left() {
	ch1(motorSpeed / 2, true);
	ch2(motorSpeed / 2, false);
}

void right() {
	ch1(motorSpeed / 2, false);
	ch2(motorSpeed / 2, true);
}

void engineStop() {
	ch1(0, true);
	ch2(0, true);
}

void loop() {
	if (Serial.available()) {
		char c = Serial.read();
		if (c == 'p') {
			toggleLed();
			Serial.println("recived");
		}
		else if (c == 'f') {
			forward();
		}
		else if (c == 'b') {
			backward();
		}
		else if (c == 'l') {
			left();
		}
		else if (c == 'r') {
			right();
		}
		else if (c == 's') {
			engineStop();
		}
		else if (c == 'a') {
			sweepX();
		}
		else if (c == 'z') {
			sweepY();
		}
	}

}