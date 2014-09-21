/**
 * composes messages given an address and a command
 **/

var commandHeaders={
  standard:'0262',
  extended:'0262'
}

var insteonCommands = [
  {name: "on",
   type: "standard",
   hex: "11"},
  {name: "onFast",
   type: "standard",
   hex: "12"},
  {name: "off",
   type: "standard",
   hex: "13"},
  {name: "offFast",
   type: "standard",
   hex: "14"},
  {name: "bright",
   type: "standard",
   hex: "15"},
  {name: "dim",
   type: "standard",
   hex: "16"},
  {name: "startManualDim",
   type: "standard",
   hex: "17"},
  {name: "stopManualDim",
   type: "standard",
   hex: "18"},
  {name: "status",
   type: "standard",
   hex: "19"},
  {name: "onAtRate",
   type: "standard",
   hex: "2E"},
  {name: "offAtRate",
   type: "standard",
   hex: "2F"}
];

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
  messageHex += "15";

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

