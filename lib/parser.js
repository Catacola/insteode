/**
 * composes messages given an address and a command
 **/

var us = require('underscore');

var commandHeaders={
  standard:'0262',
  extended:'0262'
}

//create a list to hold all insteon commands
var insteonCommands = [
  {name: "on",
   hex: "11"},
  {name: "onFast",
   hex: "12"},
  {name: "off",
   hex: "13"},
  {name: "offFast",
   hex: "14"},
  {name: "bright",
   hex: "15"},
  {name: "dim",
   hex: "16"},
  {name: "startManualDim",
   hex: "17"},
  {name: "stopManualDim",
   hex: "18"},
  {name: "status",
   hex: "19"},
  {name: "onAtRate",
   hex: "2E"},
  {name: "offAtRate",
   hex: "2F"}
];

var insteonCommandDefaults = {
  length:'standard',
  type:'direct'
};

//fill in defaults where not specified
insteonCommands = us.defaults(insteonCommands,insteonCommandDefaults);

var msgDefaults = {
  maxHops: 3,
};

/**
 * Takes a message object and returns a hex command
 *
 * @param {Object} msgOptions
 **/
var compose = exports.compost = function(msgOptions){
  //apply defaults to messageOptions
  msgOptions = us.defaults(msgOptions,msgDefaults);

  var address = msgOptions.to;
};

/**
 * Calculates message flag byte
 *
 * @param {String} msgType
 * @param {String} msgLength
 * @param {Number} maxHops
 *
 * @return {String}
 **/
var calcFalgByte = function(msgType, msgLength, maxHops){
  var msgBinary = '';

  //set message type bits
  if(mgsType === 'direct'){
    msgBinary += '000';
  } else if (msgType === 'broadcast'){
    msgBinary += '100';
  }

  //set message length bit
  if(msgLength === 'standard'){
    msgBinary += '0';
  } else if(msgLength === 'extended') {
    msgBinary += '1';
  }

  //set hop bits
  msgBinary += maxHops.toString(2);
  msgBinary += maxHops.toString(2);

  return parseInt(msgBinary,2).toString(16);
};

/**
 * composes a standard message
 *
 * @param {String} deviceHex
 * @param {String} command1Hex
 * @param {String} command2Hex
 **/
var composeStandardCommand = exports.composeStandardCommand = function(deviceHex,cmd1Hex,cmd2Hex){
  //set command 2 to 00 if not specified
  if(arguments.length == 2){
    cmd2Hex = "00";
  }
  //start all standard commands with 0262
  var messageHex = "0262";

  //add address
  messageHex += deviceHex;

  //add message flags
  //hardcode to 15 (3 hops max, 3 hops left) for now
  messageHex += "0F";

  //add commands
  messageHex += cmd1Hex;
  messageHex += cmd2Hex;

  return messageHex;
}

/**
 * Composes a turn on message to deviceHex
 *
 * @param {String} deviceHex
 * @param {Int} level
 * @param {Function} callback(error)
 **/
var turnOn = exports.turnOn = function(deviceHex, level, callback){
  //initialize blank string to build the command
  var hexCommand = "";
};

