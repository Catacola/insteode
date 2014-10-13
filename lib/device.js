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

Light.prototype.on = function(level){
  if(arguments.length === 0){
    var level = 255;
  }

  //convert level to hex string
  var hexLevel = level.toString(16);
  if(hexLevel.length === 1){
    hexLevel = "0" + hexLevel;
  }

  var command = parser.compose({to:this.address,
                                command:"on",
                                cmd2:hexLevel});

  this.modem.sendHex(command);
};


Light.prototype.off = function(){
  var command = parser.compose({to:this.address,
                                command:"off"});

  this.modem.sendHex(command);
};
