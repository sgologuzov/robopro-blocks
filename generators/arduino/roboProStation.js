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

// ledPixelTurn
// ledTurn
// colorLedTurn
// playNoteForBeats
// readSensor
// readButton
// readAnalogSensor
// readDigitalPin
// setDigitalOutput
// setPwmOutput
// setIndicatorBrightness
// setIndicatorDigitValue
// turnIndicatorSeparator
// turnIndicator
// setIndicatorValue

Blockly.Arduino['arduino_roboProStation_ledPixelTurn'] = function(block) {
  Blockly.Arduino.setupLEDStrip_();
  var arg0 = Blockly.Arduino.valueToCode(block, 'LED_INDEX', Blockly.Arduino.ORDER_UNARY_POSTFIX) || '';
  var arg1 = Blockly.Arduino.valueToCode(block, 'COLOR', Blockly.Arduino.ORDER_UNARY_POSTFIX) || '#000';
  var arg2 = block.getFieldValue('VALUE') || 'off';

  if (arg2 === 'off') {
    arg1 = '#000';
    var code = `//Выкючение светодиода №${arg0}\n`;
  } else {
    var code = `//Включение светодиода №${arg0}, цвет: ${arg1}\n`;
  }
  var color = Blockly.Arduino.adjustColor_(arg1);
  code += `leds[(uint16_t)${arg0}] = strtol("${color}", NULL, 0);\n`;
  code += "FastLED.show();\n";
  return code;
};

Blockly.Arduino['arduino_roboProStation_ledTurn'] = function(block) {
  Blockly.Arduino.setupLEDStrip_();
  var arg1 = Blockly.Arduino.valueToCode(block, 'COLOR', Blockly.Arduino.ORDER_UNARY_POSTFIX);
  var arg2 = block.getFieldValue('VALUE') || 'off';

  if (arg2 === 'off') {
    arg1 = '#000';
    var code = `//Выкючение всех светодиодов в ленте\n`;
  } else {
    var code = `//Включение всех светодиодов в ленте, цвет: ${arg1}\n`;
  }
  var color = Blockly.Arduino.adjustColor_(arg1);
  code += `fill_solid(leds, LED_STRIP_NUM_LEDS, strtol("${color}", NULL, 0));\n`;
  code += "FastLED.show();\n";
  return code;
};

Blockly.Arduino['arduino_roboProStation_colorLedTurn'] = function(block) {
  var arg0 = block.getFieldValue('LED_PIN') || Blockly.Arduino.ROBO_PRO_STATION_PINS_MAP.RedLED;
  var arg2 = block.getFieldValue('VALUE') || 'off';
  if (arg2 === 'off') {
    var code = `//Выкючение цветного светодиода ${arg0}\n`;
    code += "digitalWrite(" + arg0 + ", LOW);\n";
  } else {
    var code = `//Включение цветного светодиода ${arg0}\n`;
    code += "digitalWrite(" + arg0 + ", HIGH);\n";
  }
  return code;
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
  Blockly.Arduino.setupSensorPins_();
  Blockly.Arduino.setupSensors_();
  var arg0 = block.getFieldValue('PIN') || 'A1';
  var code;
  if (arg0 === 'A0') {
    code = `_readTemperature();`
  } else {
    code = `_mapSensorValue(${arg0}, analogRead(${arg0}))`;
  }
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['arduino_roboProStation_readButton'] = function(block) {
  Blockly.Arduino.setupDigitalInputPins_();
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
  Blockly.Arduino.setupDigitalInputPins_();
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

Blockly.Arduino['arduino_roboProStation_setPwmOutput'] = function(block) {
  var arg0 = block.getFieldValue('PIN') || '0';
  var arg1 = Blockly.Arduino.valueToCode(block, 'OUT', Blockly.Arduino.ORDER_UNARY_POSTFIX) || 0;
  var code = "analogWrite(" + arg0 + ", " + arg1 + ");\n";
  return code;
};

Blockly.Arduino['arduino_roboProStation_setIndicatorBrightness'] = function(block) {
  Blockly.Arduino.setupIndicator_();
  var arg0 = block.getFieldValue('VALUE') || '3';
  var code = `display.brightness(${arg0});\n`;
  return code;
}

Blockly.Arduino['arduino_roboProStation_setIndicatorDigitValue'] = function(block) {
  Blockly.Arduino.setupIndicator_();
  var arg0 = Blockly.Arduino.valueToCode(block, 'DIGIT', Blockly.Arduino.ORDER_UNARY_POSTFIX);
  var arg1 = Blockly.Arduino.valueToCode(block, 'VALUE', Blockly.Arduino.ORDER_UNARY_POSTFIX);

  var code = `display.setCursor(${arg0});\n`
  code += `display.print("${arg1.replace("°", "*")}");\n`
  code += `display.update();\n`;
  return code;
}

Blockly.Arduino['arduino_roboProStation_turnIndicatorSeparator'] = function(block) {
  Blockly.Arduino.setupIndicator_();
  var arg0 = block.getFieldValue('VALUE') || 'on';

  var code = `display.colon(${(arg0 === 'on')});\n`
  code += `display.update();\n`;
  return code;
}

Blockly.Arduino['arduino_roboProStation_turnIndicator'] = function(block) {
  Blockly.Arduino.setupIndicator_();
  var arg0 = block.getFieldValue('VALUE') || 'on';

  var code = `display.power(${(arg0 === 'on')});\n`
  code += `display.update();\n`;
  return code;
}

Blockly.Arduino['arduino_roboProStation_setIndicatorValue'] = function(block) {
  Blockly.Arduino.setupIndicator_();
  var arg0 = Blockly.Arduino.valueToCode(block, 'VALUE', Blockly.Arduino.ORDER_UNARY_POSTFIX) || '';

  var code = `display.print(${arg0.replace("°", "*")});\n`
  code += `display.update();\n`;
  return code;
}

// Меню
Blockly.Arduino['arduino_roboProStation_menu_level'] = function(block) {
  var code = block.getFieldValue('level') || 'LOW';
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['arduino_roboProStation_menu_leds'] = function(block) {
  var code = block.getFieldValue('leds') || '0';
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['arduino_roboProStation_menu_colorLeds'] = function(block) {
  var code = block.getFieldValue('LED_PIN') || Blockly.Arduino.ROBO_PRO_STATION_PINS_MAP.RedLED;
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['arduino_roboProStation_menu_indicatorDigits'] = function(block) {
  var code = block.getFieldValue('indicatorDigits') || '0';
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['arduino_roboProStation_menu_indicatorValues'] = function(block) {
  var code = block.getFieldValue('indicatorValues') || '';
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino.adjustColor_ = function(hexcolor) {
  // If a three-character hexcolor, make six-character
  if (hexcolor.length === 3 || hexcolor.length === 4) {
    hexcolor = hexcolor.split('').map(function (hex) {
      if (hex === "#") {
        return "0x"
      }
      return hex + hex;
    }).join('');
  }
  return hexcolor.toUpperCase();
}

Blockly.Arduino.setupSensorPins_ = function() {
  Blockly.Arduino.includes_['SENSOR_PINS'] = `#include <OneWire.h> // Библиотека для шины 1W
#include <DallasTemperature.h> // Библиотека для ds18b20`;
  Blockly.Arduino.definitions_['SENSOR_PINS'] = `#define TEMP_SENSOR_PIN A0 // Пин, к которому подключен датчик температуры
#define SOUND_SENSOR_PIN A3 // Пин, к которому подключен микрофон
#define LIGHT_SENSOR_PIN A4 // Пин, к которому подключен датчик света

OneWire oneWire(TEMP_SENSOR_PIN); // Создаем экземпляр шины W1 и указываем что он подключен к пину TEMP_SENSOR_PIN
DallasTemperature sensors(&oneWire); // Создаем экземпляр датчика температуры и передаем в него W1
`
  Blockly.Arduino.setups_['SENSOR_PINS'] = `sensors.begin(); // Инициализируем датчик температуры`

  Blockly.Arduino.customFunctions_['_readTemperature'] = `float _readTemperature() {
    sensors.requestTemperatures(); // Даем команду датчику на измерение температуры, это занимает около одной секунды
    return sensors.getTempCByIndex(0);
}\n`;
}

Blockly.Arduino.setupDigitalInputPins_ = function() {
  Blockly.Arduino.definitions_['PINS'] = `#define BUTTON_1_PIN 8 // Пин, к которому подключена кнопка 1
#define BUTTON_2_PIN 9 // Пин, к которому подключена кнопка 1
#define BUTTON_3_PIN 10 // Пин, к которому подключена кнопка 1
#define BUTTON_4_PIN 11 // Пин, к которому подключена кнопка 1
#define BUTTON_5_PIN 12 // Пин, к которому подключена кнопка 1`

  Blockly.Arduino.setups_['PINS'] = `// Инициализация пинов датчиков
  pinMode(BUTTON_1_PIN, INPUT_PULLUP);
  pinMode(BUTTON_2_PIN, INPUT_PULLUP);
  pinMode(BUTTON_3_PIN, INPUT_PULLUP);
  pinMode(BUTTON_4_PIN, INPUT_PULLUP);
  pinMode(BUTTON_5_PIN, INPUT_PULLUP);`
}


Blockly.Arduino.setupLEDStrip_ = function() {
  Blockly.Arduino.includes_['LED_STRIP'] = `#include <FastLED.h> // Библиотека для работы с адресной лентой`;
  Blockly.Arduino.definitions_['LED_STRIP'] = `#define LED_STRIP_NUM_LEDS 16 // Количество светодиодов в ленте
#define LED_STRIP_DATA_PIN 13 // Пин, к которому подключена лента

CRGB leds[LED_STRIP_NUM_LEDS]; // Создаем экземпляр ленты и указываем сколько в нем светодиодов`

  Blockly.Arduino.setups_['LED_STRIP'] = `// Инициализация светодиодной ленты
  FastLED.addLeds<NEOPIXEL, LED_STRIP_DATA_PIN>(leds, LED_STRIP_NUM_LEDS); // Указываем куда подключена лента
  FastLED.setBrightness(32); // Задаем яркость ленты, от 0 до 255`;
};

Blockly.Arduino.setupIndicator_ = function() {
  Blockly.Arduino.includes_['INDICATOR'] = `#include <GyverSegment.h> // Библиотека для работы с семисегментным индикатором`;
  Blockly.Arduino.definitions_['INDICATOR'] = `#define CLK_PIN 4 // Пин CLK
#define DIO_PIN 2 // Пин DIO

Disp1637Colon display(DIO_PIN, CLK_PIN);`
}
