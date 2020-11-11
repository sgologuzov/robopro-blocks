/**
 * Created by Riven on 7/14/2016.
 */

'use strict';

goog.provide('Blockly.Arduino.arduino');

goog.require('Blockly.Arduino');

Blockly.Arduino['pin_setPinMode'] = function (block) {
  var arg0 = block.getFieldValue('PIN') || '0';
  var arg1 = block.getFieldValue('MODE') || 'INPUT';
  var code = "pinMode(" + arg0 + ", " + arg1 + ");\n";
  return code;
};

Blockly.Arduino['pin_setDigitalOutput'] = function (block) {
  var arg0 = block.getFieldValue('PIN') || '0';
  var arg1 = Blockly.Arduino.valueToCode(block, 'LEVEL', Blockly.Arduino.ORDER_UNARY_POSTFIX) || 'LOW';
  var code = "digitalWrite(" + arg0 + ", " + arg1 + ");\n";
  return code;
};

Blockly.Arduino['pin_menu_level'] = function (block) {
  var code = block.getFieldValue('level') || 'LOW';
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['pin_setPwmOutput'] = function (block) {
  var arg0 = block.getFieldValue('PIN') || '0';
  var arg1 = Blockly.Arduino.valueToCode(block, 'OUT', Blockly.Arduino.ORDER_UNARY_POSTFIX) || 0;
  var code = "analogWrite(" + arg0 + ", " + arg1 + ")\n";
  return code;
};

Blockly.Arduino['pin_readDigitalPin'] = function (block) {
  var arg0 = block.getFieldValue('PIN') || '0';
  var code = "digitalRead(" + arg0 + ")";
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['pin_readAnalogPin'] = function (block) {
  var arg0 = block.getFieldValue('PIN') || 'A1';
  var code = "analogRead(" + arg0 + ")";
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['pin_setServoOutput'] = function (block) {
  var arg0 = block.getFieldValue('PIN') || 'A1';
  var arg1 = Blockly.Arduino.valueToCode(block, 'OUT', Blockly.Arduino.ORDER_UNARY_POSTFIX) || 0;

  Blockly.Arduino.includes_['include_servo'] = '#include <Servo.h>';
  Blockly.Arduino.definitions_['definitions_servo' + arg0] = 'Servo servo_' + arg0 + ';';
  Blockly.Arduino.setups_['setups_servo' + arg0] = 'servo_' + arg0 + '.attach' + '(' + arg0 + ');';

  var code = 'servo_' + arg0 + '.write' + '(' + arg1 + ');\n';
  return code;
};

// Blockly.Arduino['arduino_pin_mode'] = function(block) {
//     var order = Blockly.Arduino.ORDER_NONE;
//     var arg0 = Blockly.Arduino.valueToCode(block, 'PINNUM', order);
//     var arg1 = Blockly.Arduino.valueToCode(block, 'ARDUINO_PIN_MODE_OPTION', order);
//     var code = Blockly.Arduino.tab()+"pinMode("+arg0+","+arg1+")"+Blockly.Arduino.END;
//     return code;
// };

// Blockly.Arduino['arduino_pwm_write'] = function(block) {
//     var order = Blockly.Arduino.ORDER_NONE;
//     var arg0 = Blockly.Arduino.valueToCode(block, 'ARDUINO_PWM_OPTION', order);
//     var arg1 = Blockly.Arduino.valueToCode(block, 'PWM', order);
//     var code = Blockly.Arduino.tab()+"analogWrite("+arg0+","+arg1+")"+Blockly.Arduino.END;
//     return code;
// };

// Blockly.Arduino['arduino_digital_write'] = function(block) {
//     var order = Blockly.Arduino.ORDER_NONE;
//     var arg0 = Blockly.Arduino.valueToCode(block, 'PINNUM', order);
//     var arg1 = Blockly.Arduino.valueToCode(block, 'ARDUINO_LEVEL_OPTION', order);
//     var code = Blockly.Arduino.tab()+"digitalWrite("+arg0+","+arg1+")"+Blockly.Arduino.END;
//     return code;
// };

// Blockly.Arduino['arduino_digital_read'] = function(block) {
//     var order = Blockly.Arduino.ORDER_NONE;
//     var arg0 = Blockly.Arduino.valueToCode(block, 'PINNUM', order);
//     var code = "digitalRead("+arg0+")";
//     return [code,order];
// };

// Blockly.Arduino['arduino_analog_read'] = function(block) {
//     var order = Blockly.Arduino.ORDER_NONE;
//     var arg0 = Blockly.Arduino.valueToCode(block, 'PINNUM', order);
//     var code = "analogRead("+arg0+")";
//     return [code,order];
// };

// Blockly.Arduino['arduino_map'] = function(block) {
//     var order = Blockly.Arduino.ORDER_NONE;
//     var val = Blockly.Arduino.valueToCode(block, 'VAL', order);
//     var fromlow = Blockly.Arduino.valueToCode(block, 'FROMLOW', order);
//     var fromhigh = Blockly.Arduino.valueToCode(block, 'FROMHIGH', order);
//     var tolow = Blockly.Arduino.valueToCode(block, 'TOLOW', order);
//     var tohigh = Blockly.Arduino.valueToCode(block, 'TOHIGH', order);

//     var code = "map("+val+","+fromlow+","+fromhigh+","+tolow+","+tohigh+")";
//     return [code,order];
// };

// Blockly.Arduino['arduino_tone'] = function(block) {
//     var order = Blockly.Arduino.ORDER_NONE;
//     var pin = Blockly.Arduino.valueToCode(block, 'PINNUM', order);
//     var freq = Blockly.Arduino.valueToCode(block, 'FREQUENCY', order);
//     var time = Blockly.Arduino.valueToCode(block, 'DURATION', order);
//     var code = Blockly.Arduino.tab()+"tone("+pin+","+freq+","+time+")"+Blockly.Arduino.END;
//     return code;
// };

// Blockly.Arduino['arduino_servo'] = function(block) {
//     var order = Blockly.Arduino.ORDER_NONE;
//     Blockly.Arduino.includes_["servo"]="#include <Servo.h>";
//     Blockly.Arduino.definitions_["servo"]="Servo servo;";
//     var pin = Blockly.Arduino.valueToCode(block, 'PINNUM', order);
//     var degree = Blockly.Arduino.valueToCode(block, 'ANGLE', order);
//     var code = Blockly.Arduino.tab()+"servo.attach("+pin+")"+Blockly.Arduino.END;
//     code += (Blockly.Arduino.tab()+"servo.write("+degree+")"+Blockly.Arduino.END);
//     return code;
// };

// Blockly.Arduino["arduino_menu_option"] = function (block) {
//     var order = Blockly.Arduino.ORDER_ATOMIC;
//     var code = block.inputList[0].fieldRow[0].value_;
//     return [code,order];
// };


// Blockly.Arduino['arduino_println'] = function(block) {
//     var order = Blockly.Arduino.ORDER_NONE;
//     var arg0 = Blockly.Arduino.valueToCode(block, 'TEXT', order);
//     if(arg0.indexOf("(")>-1){
//         var code = Blockly.Arduino.tab()+"Serial.println("+arg0+")"+Blockly.Arduino.END;
//     }else{
//         var code = Blockly.Arduino.tab()+"Serial.println(\""+arg0+"\")"+Blockly.Arduino.END;
//     }

//     return code;
// };


// Blockly.Arduino["arduino_pin_mode_option"] = Blockly.Arduino["arduino_menu_option"];

// Blockly.Arduino["arduino_pwm_option"] = Blockly.Arduino["arduino_menu_option"];

// Blockly.Arduino["arduino_level_option"] = Blockly.Arduino["arduino_menu_option"];

// Blockly.Arduino["arduino_analog_in_option"] = Blockly.Arduino["arduino_menu_option"];


