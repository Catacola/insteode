/**
 * composes messages given an address and a command
 **/

var commandHeaders={
  standard:'0262',
  extended:'0262'
}

var insteonCommands = {
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

