'use strict';
goog.provide('Blockly.Arduino.roboProStation');
goog.require('Blockly.Arduino');
Blockly.Arduino.ROBO_PRO_STATION_PINS_MAP = {
  // RoboPro Station
  Buzzer: 3,
  GreenLED: 5,
  YellowLED: 6,
  RedLED: 7,
};

// ledTurnOn
// ledTurnOff
// colorLedTurnOn
// colorLedTurnOff
// playNoteForBeats
// readSensor
// readButton
// readAnalogSensor
// readDigitalPin
// setDigitalOutput
// setPwmOutput
Blockly.Arduino['arduino_roboProStation_ledTurnOn'] = function(block) {
  Blockly.Arduino.setupShiftRegister_();
  var arg0 = block.getFieldValue('LED_INDEX') || 0;
  var code = `//Включение светодиода №${arg0}\n`;
  code += `ledState |= (1 << ${arg0});\n`;
  code += "_updateShiftRegister();\n";
  return code;
};

Blockly.Arduino['arduino_roboProStation_ledTurnOff'] = function(block) {
  Blockly.Arduino.setupShiftRegister_();
  var arg0 = block.getFieldValue('LED_INDEX') || 0;
  var code = `//Выключение светодиода №${arg0}\n`;
  code += `ledState &= ~(1 << ${arg0});\n`;
  code += "_updateShiftRegister();\n";
  return code;
};

Blockly.Arduino['arduino_roboProStation_colorLedTurnOn'] = function(block) {
  var arg0 = block.getFieldValue('LED_PIN') || Blockly.Arduino.ROBO_PRO_STATION_PINS_MAP.RedLED;
  var code = `//Включение цветного светодиода ${arg0}\n`;
  code += "digitalWrite(" + arg0 + ", HIGH);\n";
  return code;
};

Blockly.Arduino['arduino_roboProStation_colorLedTurnOff'] = function(block) {
  var arg0 = block.getFieldValue('LED_PIN') || Blockly.Arduino.ROBO_PRO_STATION_PINS_MAP.RedLED;
  var code = `//Выключение цветного светодиода ${arg0}\n`;
  code += "digitalWrite(" + arg0 + ", LOW);\n";
  return code;
};

Blockly.Arduino['arduino_roboProStation_menu_colorLeds'] = function(block) {
  var code = block.getFieldValue('LED_PIN') || Blockly.Arduino.ROBO_PRO_STATION_PINS_MAP.RedLED;
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['arduino_roboProStation_playNoteForBeats'] = function(block) {
  var arg0 = Blockly.Arduino.valueToCode(block, 'NOTE', Blockly.Arduino.ORDER_UNARY_POSTFIX);
  var arg1 = Blockly.Arduino.valueToCode(block, 'BEATS', Blockly.Arduino.ORDER_UNARY_POSTFIX);

  var code = `//Проигрывание ноты ${arg0}. Длительность: ${arg1} долей такта.\n`;
  code += `int buzzerPin = ${Blockly.Arduino.ROBO_PRO_STATION_PINS_MAP.Buzzer};\n`;
  code += `int frequency = max(0, 440 * (2 ^ (${arg0} - 69) / 12));\n`;
  code += "tone(buzzerPin, frequency);\n";
  code += `delay(${arg1} * 1000);\n`;
  code += "noTone(buzzerPin);\n";
  return code;
};

Blockly.Arduino['arduino_roboProStation_readSensor'] = function(block) {
  Blockly.Arduino.setupSensors_();
  var arg0 = block.getFieldValue('PIN') || 'A1';
  var code = `_mapSensorValue(${arg0}, analogRead(${arg0}))`;
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['arduino_roboProStation_readButton'] = function(block) {
  var arg0 = block.getFieldValue('PIN') || '0';
  var code = "digitalRead(" + arg0 + ")";
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['arduino_roboProStation_readAnalogSensor'] = function(block) {
  var arg0 = block.getFieldValue('PIN') || 'A1';
  var code = "analogRead(" + arg0 + ")";
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['arduino_roboProStation_readDigitalPin'] = function(block) {
  var arg0 = block.getFieldValue('PIN') || '0';
  var code = "digitalRead(" + arg0 + ")";
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['arduino_roboProStation_setDigitalOutput'] = function(block) {
  var arg0 = block.getFieldValue('PIN') || '0';
  var arg1 = Blockly.Arduino.valueToCode(block, 'LEVEL', Blockly.Arduino.ORDER_UNARY_POSTFIX) || 'LOW';
  var code = "digitalWrite(" + arg0 + ", " + arg1 + ");\n";
  return code;
};

Blockly.Arduino['arduino_roboProStation_menu_level'] = function(block) {
  console.log("arduino_roboProStation_menu_level");
  var code = block.getFieldValue('level') || 'LOW';
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['arduino_roboProStation_setPwmOutput'] = function(block) {
  var arg0 = block.getFieldValue('PIN') || '0';
  var arg1 = Blockly.Arduino.valueToCode(block, 'OUT', Blockly.Arduino.ORDER_UNARY_POSTFIX) || 0;
  var code = "analogWrite(" + arg0 + ", " + arg1 + ");\n";
  return code;
};

Blockly.Arduino.setupShiftRegister_ = function() {
  Blockly.Arduino.definitions_['SHIFT_REGISTER_CONSTANTS'] = `const int LATCH_PIN = A5;
const int CLOCK_PIN = 4;
const int DATA_PIN = 2;
int ledState = 0;`;

  Blockly.Arduino.setups_['shiftRegister'] = `// Инициализация состояния пинов
  pinMode(LATCH_PIN, OUTPUT);
  pinMode(CLOCK_PIN, OUTPUT);
  pinMode(DATA_PIN, OUTPUT);`;

  Blockly.Arduino.customFunctions_['_updateShiftRegister'] = `void _updateShiftRegister () {
    digitalWrite(LATCH_PIN, LOW);
    // ST_CP LOW to keep LEDs from changing while reading serial data
    digitalWrite(LATCH_PIN, LOW);
    // Shift out the bits
    shiftOut(DATA_PIN, CLOCK_PIN, MSBFIRST, ledState);
    // ST_CP HIGH change LEDs
    digitalWrite(LATCH_PIN, HIGH);
}\n`;
};
