
#include <MPU6050_tockn.h>
#include <NewPing.h>
#include <ArduinoJson.h>
#include <Servo.h>
#include <Wire.h>

MPU6050 mpu6050(Wire);

unsigned long lastTelemetrySend = 0;
unsigned int telemetryFrequency = 500;

Servo cameraServoX;
Servo cameraServoY;
int cameraAxisX = 90;
int cameraAxisY = 1;

unsigned int motorSpeed = 150;
//CH1 right side
const int ch1DirectionPin = 4;
const int ch1PwmPin = 5;
//CH2 left side
const int ch2DirectionPin = 7;
const int ch2PwmPin = 6;

const int ledsPin = 13;
const int buzzerPin = 2;

#define TRIGGER_PIN 12
#define ECHO_PIN 11
#define MAX_DISTANCE 100

NewPing sonar(TRIGGER_PIN, ECHO_PIN, MAX_DISTANCE);

void setup()
{
	Serial.begin(115200);
	pinMode(ledsPin, OUTPUT);

	pinMode(ch1DirectionPin, OUTPUT);
	pinMode(ch1PwmPin, OUTPUT);


	pinMode(ch2DirectionPin, OUTPUT);
	pinMode(ch2PwmPin, OUTPUT);

	pinMode(buzzerPin, OUTPUT);

	cameraServoX.attach(9);
	cameraServoY.attach(10);
	cameraServoX.write(cameraAxisX);
	cameraServoY.write(cameraAxisY);

	Wire.begin();
	mpu6050.begin();
	mpu6050.calcGyroOffsets(false);

	//analogWrite(5, 100);
	//analogWrite(6, 100);
	Serial.println("ready");
	//beep(500);
}

void moveCamera(Servo& cameraServo, int& currentValue, int degrees)
{
	if (degrees < 0 || degrees > 180 || degrees == currentValue)
	{
		return;
	}
	else if (currentValue < degrees)
	{
		for (currentValue; currentValue <= degrees; currentValue += 1)
		{
			cameraServo.write(currentValue);
			delay(5);
		}
	}
	else if (currentValue > degrees)
	{
		for (currentValue; currentValue >= degrees; currentValue -= 1)
		{
			cameraServo.write(currentValue);
			delay(5);
		}
	}
	return;
}

void toggleLed()
{
	int ledStatus = digitalRead(ledsPin);
	if (ledStatus == HIGH)
	{
		digitalWrite(ledsPin, LOW);
	}
	else
	{
		digitalWrite(ledsPin, HIGH);
	}
}

void ch1(int speed, bool forward)
{
	analogWrite(ch1PwmPin, speed);
	digitalWrite(ch1DirectionPin, !forward);
}

void ch2(int speed, bool forward)
{
	analogWrite(ch2PwmPin, speed);
	digitalWrite(ch2DirectionPin, forward);
}

void forward()
{
	ch1(motorSpeed, true);
	ch2(motorSpeed, true);
}

void backward()
{
	ch1(motorSpeed, false);
	ch2(motorSpeed, false);
}

void left()
{
	ch1(motorSpeed / 2, true);
	ch2(motorSpeed / 2, false);
}

void right()
{
	ch1(motorSpeed / 2, false);
	ch2(motorSpeed / 2, true);
}

void engineStop()
{
	ch1(0, true);
	ch2(0, true);
}

void changeSpeed(int value)
{
	motorSpeed = value;
}

void beep(unsigned int duration)
{
	tone(buzzerPin, 1000, duration);
	delay(duration);
	noTone(buzzerPin);
}

void execCommand(int type, int value)
{
	switch (type)
	{
	case 1:
		forward();
		break;
	case 2:
		backward();
		break;
	case 3:
		left();
		break;
	case 4:
		right();
		break;
	case 5:
		engineStop();
		break;
	case 6:
		changeSpeed(value);
		break;
	case 7:
		moveCamera(cameraServoX, cameraAxisX, value);
		break;
	case 8:
		moveCamera(cameraServoY, cameraAxisY, value);
		break;
	case 9:
		beep(value);
		break;
	case 10:
		toggleLed();
		break;
	default:
		Serial.print(type);
		Serial.println(" command not found!");
		break;
	}
}

void sendTelemetry()
{
	mpu6050.update();
	const int capacity = JSON_OBJECT_SIZE(4);
	StaticJsonDocument<capacity> doc;
	doc["dist"] = sonar.ping_cm();
	doc["temp"] = mpu6050.getTemp();
	doc["pitch"] = mpu6050.getAccAngleX();
	doc["roll"] = mpu6050.getAccAngleY();
	serializeJson(doc, Serial);
	Serial.println();
}

void loop()
{
	if (Serial.available())
	{
		uint8_t command[3];
		Serial.readBytesUntil('!', command, 3);
		execCommand(command[0], command[1]);
	}
	else
	{
		if ((millis() - lastTelemetrySend) > telemetryFrequency)
		{
			sendTelemetry();
			lastTelemetrySend = millis();
		}
	}
}
