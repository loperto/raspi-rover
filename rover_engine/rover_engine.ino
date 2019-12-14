
#include <Encoder.h>
#include <Dagu4Motor.h>
#include <MPU6050_tockn.h>
#include <NewPing.h>
#include <ArduinoJson.h>
#include <Servo.h>
#include <Wire.h>

MPU6050 mpu6050(Wire);

unsigned long lastTelemetrySend = 0;
unsigned int telemetryFrequency = 500;

const int cameraServoXPin = 9;
const int cameraServoYPin = 10;
Servo cameraServoX;
Servo cameraServoY;
int cameraAxisX = 90;
int cameraAxisY = 1;


Dagu4Motor motorFL(8, 26, A1, 0, 0);
Dagu4Motor motorFR(9, 27, A2, 0, 0);
Dagu4Motor motorRR(10, 28, A3, 0, 0);
Dagu4Motor motorRL(11, 29, A4, 0, 0);

const int ledsPin = 25;
const int buzzerPin = 2;

#define TRIGGER_PIN 23
#define ECHO_PIN 24
#define MAX_DISTANCE 100
NewPing sonar(TRIGGER_PIN, ECHO_PIN, MAX_DISTANCE);

#define GUN_MAX_POWER 2000
#define GUN_MIN_POWER 1000
const int gunLoaderPin = 4;
const int gunLeverPin = 5;
const int gunMotor1Pin = 6;
const int gunMotor2Pin = 7;

Servo gunMotor1;
Servo gunMotor2;
Servo gunLoaderServo;
Servo gunLeverServo;
int gunLeverAxisValue = 0;
#define GUN_LEVER_MAX 0
#define GUN_LEVER_MIN 105

void setup()
{
	Serial.begin(115200);
	pinMode(ledsPin, OUTPUT);
	pinMode(buzzerPin, OUTPUT);

	gunMotor1.attach(gunMotor1Pin, GUN_MIN_POWER, GUN_MAX_POWER);
	gunMotor2.attach(gunMotor2Pin, GUN_MIN_POWER, GUN_MAX_POWER);
	gunLoaderServo.attach(gunLoaderPin);
	gunLeverServo.attach(gunLeverPin);
	gunMotor1.write(GUN_MIN_POWER);
	gunMotor2.write(GUN_MIN_POWER);
	gunLeverServo.write(GUN_LEVER_MIN);


	cameraServoX.attach(2);
	cameraServoY.attach(3);
	cameraServoX.write(cameraAxisX);
	cameraServoY.write(cameraAxisY);

	Wire.begin();
	mpu6050.begin();
	mpu6050.calcGyroOffsets(false);
	Serial.println("ready");
}

void moveServoProgressive(Servo& servo, int& currentValue, int degrees)
{
	if (degrees < 0 || degrees > 180 || degrees == currentValue)
	{
		return;
	}
	else if (currentValue < degrees)
	{
		for (currentValue; currentValue <= degrees; currentValue += 1)
		{
			servo.write(currentValue);
			delay(5);
		}
	}
	else if (currentValue > degrees)
	{
		for (currentValue; currentValue >= degrees; currentValue -= 1)
		{
			servo.write(currentValue);
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

void forward()
{
	motorFR.setMotorDirection(true);
	motorFL.setMotorDirection(true);
	motorRR.setMotorDirection(false);
	motorRL.setMotorDirection(false);
	setSpeed(100);
}

void backward()
{
	motorFR.setMotorDirection(false);
	motorFL.setMotorDirection(false);
	motorRR.setMotorDirection(true);
	motorRL.setMotorDirection(true);
	setSpeed(100);

}

void left()
{
	motorFL.setMotorDirection(0);
	motorRL.setMotorDirection(0);

	motorFR.setMotorDirection(1);
	motorRR.setMotorDirection(1);
	setSpeed(100);

}

void right()
{
	motorFL.setMotorDirection(1);
	motorRL.setMotorDirection(1);

	motorFR.setMotorDirection(0);
	motorRR.setMotorDirection(0);
	setSpeed(100);

}

void engineStop()
{
	motorFL.stopMotors();
	motorRL.stopMotors();
	motorFR.stopMotors();
	motorRR.stopMotors();
}

void setSpeed(int value)
{
	motorFL.setSpeed(value);
	motorRL.setSpeed(value);
	motorFR.setSpeed(value);
	motorRR.setSpeed(value);
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
		setSpeed(value);
		break;
	case 7:
		moveServoProgressive(cameraServoX, cameraAxisX, value);
		break;
	case 8:
		moveServoProgressive(cameraServoY, cameraAxisY, value);
		break;
	case 9:
		beep(value);
		break;
	case 10:
		toggleLed();
		break;
	case 11:
		shot();
		break;
	case 12:
		value = map(value, 0, 180, GUN_LEVER_MIN, GUN_LEVER_MAX);
		moveServoProgressive(gunLeverServo, gunLeverAxisValue, value);
		break;
	default:
		Serial.print(type);
		Serial.println(" command not found!");
		break;
	}
}

void shot() {
	gunMotor1.write(1150);
	gunMotor2.write(1150);
	delay(200);
	gunLoaderServo.write(120);
	delay(800);
	gunLoaderServo.write(90);
	delay(400);
	gunLoaderServo.write(90);
	gunMotor1.write(1000);
	gunMotor2.write(1000);
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
