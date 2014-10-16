/*****
 * insteon devices
 *****/

var parser = require('./parser.js');
var mod = require('./modem.js');

/**
 * @param {String} address
 **/
var Light = exports.Light = function(deviceAddress, modem){
  //check to see if address is 6 hex characters
  if( ! /^[0-9A-Fa-f]{6}$/i.test(deviceAddress)){
    return new Error(deviceAddress + " is not a valid insteon address.");
  }

  this.address = deviceAddress;
  this.level = null;
  this.modem = modem;
};

Light.prototype.getLevelLocal = function(){
  return this.level;
};

/**
 * gets current level from device, stores it, and invokes callback
 **/
Light.prototype.getLevelRemote = function(callback){
  //create the command
  var self = this;

  var cmdObj ={"to":this.address,"command":"status"};
  var hexCommand = parser.compose(cmdObj,function(err){if(err && callback) callback(err);});

  this.modem.sendHex(hexCommand,function(err,res){

    if(err){
      if(callback){
        callback(err);
      }
    } else {
      var responseLevel = parseInt(res.slice(-2),16);
      //store level
      self.level = responseLevel;
      if(callback){
        callback(null, responseLevel);
      }
    }
  });
};

/**
 * @param {Int} level
 *
 * Sets light to level (0-255);
 **/
Light.prototype.on = function(level){
  if(arguments.length === 0){
    var level = 255;
  }

  var self = this;

  //make sure level is in range 0-255
  level = Math.max(Math.min(level,255),0);

  //convert level to hex string
  var hexLevel = level.toString(16);
  if(hexLevel.length === 1){
    hexLevel = "0" + hexLevel;
  }

  var command = parser.compose({to:this.address,
                                command:"on",
                                cmd2:hexLevel});

  this.modem.sendHex(command,function(err,res){
    if(res && !err){
      self.level = level;
    }
  });
};

/**
 * Turns light off
 **/
Light.prototype.off = function(){
  var command = parser.compose({to:this.address,
                                command:"off"});

  this.modem.sendHex(command,function(err,res){
    if(res && !err){
      self.level = 0;
    }
  });
};


/**
 * Adjust current level by amount
 *
 * @param {Int} levelChange
 **/
Light.prototype.adjustLevel(levelChange){
  var newLevel = this.level+levelChange;

  //set the new level
  //bounds checking happens in on function
  this.on(newLevel);
};
