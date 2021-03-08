#include <Arduino.h>
#include <Wire.h>

unsigned long lastTelemetrySend = 0;
const uint16_t telemetryFrequency = 500;

unsigned long lastPingReceived = 0;
unsigned int pingTimeout = 10000;
const uint8_t readyPin = 11;

void setup()
{
  Serial.begin(115200);
  pinMode(readyPin, OUTPUT);
  digitalWrite(readyPin, HIGH);
  delay(500);
  digitalWrite(readyPin, LOW);
}

void execCommand(uint8_t type, uint8_t value)
{
  // Serial.println("command");
  switch (type)
  {
  // case 1:
  //   forward();
  //   break;
  // case 2:
  //   backward();
  //   break;
  // case 3:
  //   left();
  //   break;
  // case 4:
  //   right();
  //   break;
  // case 5:
  //   stop();
  //   break;
  // case 6:
  //   setSpeed(value);
  //   break;
  // case 7:
  //   moveServoProgressive(cameraServoXChannel, cameraAxisX, value);
  //   break;
  // case 8:
  //   moveServoProgressive(cameraServoYChannel, cameraAxisY, value);
  //   break;
  // case 9:
  //   beep(value);
  //   break;
  // case 10:
  //   toggleLed();
  //   break;
  // case 11:
  //   gunShot();
  //   break;
  // case 12:
  //   value = map(value, 0, 180, GUN_LEVER_MIN, GUN_LEVER_MAX);
  //   moveServoProgressive(gunLeverServoChannel, gunLeverAxisValue, value);
  //   break;
  case 99:
    // Serial.println("ping");
    lastPingReceived = millis();
    digitalWrite(readyPin, HIGH);
    break;
  default:
    Serial.print(type);
    Serial.print(" ");
    Serial.print(value);
    Serial.println(" command not found!");
    break;
  }
}

void float2Bytes(byte bytes_temp[4], float float_variable)
{
  union
  {
    float a;
    unsigned char bytes[4];
  } thing;
  thing.a = float_variable;
  memcpy(bytes_temp, thing.bytes, 4);
}

void sendTelemetry()
{
  long distance = 120.5;
  float temp = 32.56;
  float angleX = 12.65;
  float angleY = 145.60;

  // Serial.print("Ping: ");
  // Serial.println(distance);
  uint8_t distanceBytes[4];
  float2Bytes(distanceBytes, distance);

  // Serial.print("Temp: ");
  // Serial.println(temp);
  uint8_t tempBytes[4];
  float2Bytes(tempBytes, temp);

  // Serial.print("angleX: ");
  // Serial.println(angleX);
  uint8_t angleXBytes[4];
  float2Bytes(angleXBytes, angleX);

  // Serial.print("angleY: ");
  // Serial.println(angleY);
  uint8_t angleYBytes[4];
  float2Bytes(angleYBytes, angleY);

  uint8_t allBytes[] = {
      distanceBytes[0],
      distanceBytes[1],
      distanceBytes[2],
      distanceBytes[3],
      tempBytes[0],
      tempBytes[1],
      tempBytes[2],
      tempBytes[3],
      angleXBytes[0],
      angleXBytes[1],
      angleXBytes[2],
      angleXBytes[3],
      angleYBytes[0],
      angleYBytes[1],
      angleYBytes[2],
      angleYBytes[3],
      '\0',
  };

  Serial.write(allBytes, sizeof(allBytes));  
  Serial.println();
}

void loop()
{
  if (Serial.available())
  {
    uint8_t command[3];
    Serial.readBytesUntil('\0', command, 3);
    uint8_t test = command[0];
    uint8_t test2 = command[1] - 1;
    execCommand(test, test2);
  }
  else
  {
    unsigned long currentMillis = millis();
    if ((currentMillis - lastTelemetrySend) > telemetryFrequency)
    {
      sendTelemetry();
      lastTelemetrySend = currentMillis;
    }
    if ((currentMillis - lastPingReceived) > pingTimeout)
    {
      digitalWrite(readyPin, LOW);
    }
  }
}
