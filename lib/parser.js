/**
 * composes messages given an address and a command
 **/

var commandHeaders={
  standard:'0262',
  extended:'0262'
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

