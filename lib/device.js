/*****
 * insteon devices
 *****/

var parser = require('./parser.js');
var mod = require('./modem.js');

/**
 * @param {String} address
 **/
var Light = exports.Light = function(deviceAddress, modem){
  if(arguments.length < 2){
    modem = null;
  }
  //check to see if address is 6 hex characters
  if( ! /^[0-9A-Fa-f]{6}$/i.test(deviceAddress)){
    console.log(new Error(deviceAddress + " is not a valid insteon address."));
    deviceAddress = null;
  }

  this._address = deviceAddress;
  this._level = null;
  this._modem = modem;
};

Light.prototype.associateModem = function(newModem){
  this._modem = newModem;
};

Light.prototype.getAddress = function(){
  return this._address;
};

Light.prototype.getLevelLocal = function(){
  return this._level;
};

Light.prototype.sendHexToModem = function(hexCommand, callback){
  //only send command if we have an address and modem
  if(this._address !== null && this._modem !== null){
    this._modem.sendHex(hexCommand,callback);
  }
};

/**
 * gets current level from device, stores it, and invokes callback
 **/
Light.prototype.getLevelRemote = function(callback){
  //create the command
  var self = this;

  var cmdObj ={to:this._address,command:"status"};
  var hexCommand = parser.compose(cmdObj,function(err){if(err && callback) callback(err);});

  this.sendHexToModem(hexCommand,function(err,res){

    if(err){
      if(callback){
        callback(err);
      }
    } else {
      //translate last two digits from hex to decimal
      var responseLevel = parseInt(res.slice(-2),16);
      //store level
      self._level = responseLevel;
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

  var command = parser.compose({to:this._address,
                                command:"on",
                                cmd2:hexLevel});

  this.sendHexToModem(command,function(err,res){
    if(res && !err){
      self._level = level;
    }
  });
};

/**
 * Turns light off
 **/
Light.prototype.off = function(callback){
  var self = this;

  var command = parser.compose({to:this._address,
                                command:"off"});

  this.sendHexToModem(command,function(err,res){
    if(res && !err){
      self._level = 0;
    }
  });
};


/**
 * Adjust current level by amount
 *
 * @param {Int} levelChange
 **/
Light.prototype.adjustLevel = function(levelChange){
  var newLevel = this._level+levelChange;

  //set the new level
  //bounds checking happens in on function
  this.on(newLevel);
};
