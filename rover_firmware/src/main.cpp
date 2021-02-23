#include <Arduino.h>
#include <Wire.h>

void setup()
{
  pinMode(13,OUTPUT);
  Serial.begin(9600);
}

void loop()
{
  Serial.println("ACCESO");
  digitalWrite(13, HIGH);  
  delay(500);
  Serial.println("SPENTO");
  digitalWrite(13, LOW);
  delay(500);
}