#include <MPU6050_tockn.h>
#include <NewPing.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();

unsigned long lastTelemetrySend = 0;
unsigned int telemetryFrequency = 500;

#define SERVOMIN  120 
#define SERVOMAX  600 
#define GUN_MAX_POWER 2000
#define GUN_MIN_POWER 1000

const int ledsPin = A0;
MPU6050 mpu6050(Wire);

const uint8_t cameraServoXChannel = 14;
const uint8_t cameraServoYChannel = 15;
int cameraAxisX = 90;
int cameraAxisY = 1;

const int buzzerPin = 2;

const uint8_t triggerPin = A1;
const uint8_t echoPin = A2;

#define MAX_DISTANCE 100
NewPing sonar(triggerPin, echoPin, MAX_DISTANCE);

const uint8_t gunMotorChannel = 4;
const uint8_t gunMotor2Channel = 5;
const int gunLoaderServoChannel = 6;
const int gunLeverServoChannel = 7;

int gunLeverAxisValue = 0;
#define GUN_LEVER_MAX 90
#define GUN_LEVER_MIN 180

void setup()
{
	pinMode(ledsPin, OUTPUT);
	pinMode(buzzerPin, OUTPUT);

	Wire.begin(0x68);
	mpu6050.begin();
	mpu6050.calcGyroOffsets(false);

	pwm.begin();
	//pwm.setOscillatorFrequency(27000000);
	pwm.setPWMFreq(50);

	pwm.writeMicroseconds(gunMotorChannel, GUN_MIN_POWER);
	pwm.writeMicroseconds(gunMotor2Channel, GUN_MIN_POWER);
	delay(500);

	servoWrite(gunLeverServoChannel, GUN_LEVER_MIN);
	servoWrite(cameraServoXChannel, cameraAxisX);
	servoWrite(cameraServoYChannel, cameraAxisY);

	Serial1.begin(115200);
	Serial1.println("ready");
}

void servoWrite(uint8_t channel, uint8_t degrees) {
	int pulselength = map(degrees, 0, 180, SERVOMIN, SERVOMAX);
	pwm.setPWM(channel, 0, pulselength);
}

void moveServoProgressive(uint8_t channel, int& currentValue, int degrees)
{
	if (degrees < 0 || degrees > 180 || degrees == currentValue)
	{
		return;
	}
	else if (currentValue < degrees)
	{
		for (currentValue; currentValue <= degrees; currentValue += 1)
		{
			servoWrite(channel, currentValue);
			delay(5);
		}
	}
	else if (currentValue > degrees)
	{
		for (currentValue; currentValue >= degrees; currentValue -= 1)
		{
			servoWrite(channel, currentValue);
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
	//motorFR.setMotorDirection(true);
	//motorFL.setMotorDirection(true);
	//motorRR.setMotorDirection(false);
	//motorRL.setMotorDirection(false);
	//setSpeed(100);
}

void backward()
{
	//motorFR.setMotorDirection(false);
	//motorFL.setMotorDirection(false);
	//motorRR.setMotorDirection(true);
	//motorRL.setMotorDirection(true);
	//setSpeed(100);

}

void left()
{
	//motorFL.setMotorDirection(0);
	//motorRL.setMotorDirection(0);

	//motorFR.setMotorDirection(1);
	//motorRR.setMotorDirection(1);
	//setSpeed(100);

}

void right()
{
	//motorFL.setMotorDirection(1);
	//motorRL.setMotorDirection(1);

	//motorFR.setMotorDirection(0);
	//motorRR.setMotorDirection(0);
	//setSpeed(100);

}

void engineStop()
{
	//motorFL.stopMotors();
	//motorRL.stopMotors();
	//motorFR.stopMotors();
	//motorRR.stopMotors();
}

void setSpeed(int value)
{
	//motorFL.setSpeed(value);
	//motorRL.setSpeed(value);
	//motorFR.setSpeed(value);
	//motorRR.setSpeed(value);
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
		moveServoProgressive(cameraServoXChannel, cameraAxisX, value);
		break;
	case 8:
		moveServoProgressive(cameraServoYChannel, cameraAxisY, value);
		break;
	case 9:
		beep(value);
		break;
	case 10:
		toggleLed();
		break;
	case 11:
		gunShot();
		break;
	case 12:
		value = map(value, 0, 180, GUN_LEVER_MIN, GUN_LEVER_MAX);
		moveServoProgressive(gunLeverServoChannel, gunLeverAxisValue, value);
		break;
	default:
		Serial1.print(type);
		Serial1.println(" command not found!");
		break;
	}
}

void gunShot() {
	pwm.writeMicroseconds(gunMotorChannel, 1250);
	pwm.writeMicroseconds(gunMotor2Channel, 1250);
	delay(200);
	servoWrite(gunLoaderServoChannel, 90);
	delay(800);
	servoWrite(gunLoaderServoChannel, 180);
	delay(400);
	pwm.writeMicroseconds(gunMotorChannel, GUN_MIN_POWER);
	pwm.writeMicroseconds(gunMotor2Channel, GUN_MIN_POWER);
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
	serializeJson(doc, Serial1);
	Serial1.println();
}

void loop()
{
	if (Serial1.available())
	{
		uint8_t command[3];
		Serial1.readBytesUntil('!', command, 3);
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
