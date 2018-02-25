#include <ArduinoJson.h>
#include <Servo.h>

Servo servoX;
Servo servoY;
int posX = 90;
int posY = 1;

const int ledPin = 13;

const int motorSpeed = 100;
//CH1 right side
const int ch1DirPin = 3;
const int ch1CurPin = 4;
const int ch1Pwm = 5;
//CH2 left side
const int ch2DirPin = 7;
const int ch2CurPin = 8;
const int ch2Pwm = 6;

void setup() {
	Serial.begin(9600);
	pinMode(ledPin, OUTPUT);
	pinMode(ch1DirPin, OUTPUT);
	pinMode(ch1CurPin, OUTPUT);
	pinMode(ch1Pwm, OUTPUT);
	pinMode(ch2DirPin, OUTPUT);
	pinMode(ch2CurPin, OUTPUT);
	pinMode(ch2Pwm, OUTPUT);
	servoX.attach(9);
	servoY.attach(10);
	servoX.write(posX);
	servoY.write(posY);
}

void moveCameraX(int degrees) {
	if (degrees < 0 || degrees > 180 || degrees == posX) {
		return;
	}
	else if (posX < degrees) {
		for (posX; posX <= degrees; posX += 1) {
			servoX.write(posX);
			delay(20);
		}
	}
	else if (posX > degrees) {
		for (posX; posX >= degrees; posX -= 1) {
			servoX.write(posX);
			delay(20);
		}
	}
}

void moveCameraY(int degrees) {
	if (degrees < 0 || degrees > 180 || degrees == posY) {
		return;
	}
	else if (posY < degrees) {
		for (posY; posY <= degrees; posY += 1) {
			servoY.write(posY);
			delay(20);
		}
	}
	else if (posY > degrees) {
		for (posY; posY >= degrees; posY -= 1) {
			servoY.write(posY);
			delay(20);
		}
	}
	return;
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


void execCommand(const char* type, int value) {
	if (strcmp(type, "forward") == 0) {
		forward();
	}
	else if (strcmp(type, "backward") == 0) {
		backward();
	}
	else if (strcmp(type, "left") == 0) {
		left();
	}
	else if (strcmp(type, "right") == 0) {
		right();
	}
	else if (strcmp(type, "stop") == 0) {
		engineStop();
	}
	else if (strcmp(type, "cameraX") == 0) {
		moveCameraX(value);
	}
	else if (strcmp(type, "cameraY") == 0) {
		moveCameraY(value);
	}
	else if (strcmp(type, "led") == 0) {
		toggleLed();
	}
	else {
		Serial.print(type);
		Serial.println(" command not found!");
	}
}

void loop() {
	if (Serial.available()) {
		StaticJsonBuffer<200> jsonBuffer;
		JsonObject& root = jsonBuffer.parse(Serial);
		if (!root.success()) {
			Serial.println("json parse failed");
			return;
		}
		else {
			const char* type = root["type"];
			int value = root["value"];
			Serial.println(type);
			Serial.println(value);
			execCommand(type, value);
		}
	}

}