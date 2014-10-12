/*****
 * insteon devices
 *****/

var parser = require('parser.js');
var mod = require('modem.js');

/**
 * @param {String} address
 **/
var Light = exports.Light = function(address, modem){
  //check to see if address is 6 hex characters
  if( ! /^#[0-9A-Fa-f]{6}$/i.test(address)){
    return new Error(address + " is not a valid insteon address.");
  }

  this.address = address;
  this.level = null;
  this.modem = modem;
};

Light.prototype.getLevelLocal = function(){
  return this.level;
};

Light.prototype.getLevelRemote = function(callback){
  //create the command
  var command = parser.compose({to:this.address,
                                command:"status"});

  var self = this;

  this.modem.sendHex(command,function(err,res){
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

  var command = parser({to:this.address,
                        command:"on",
                        cmd2:hexLevel});

  this.modem.sendHex(command);
};


Light.prototype.off = function(){
  var command = parser({to:this.address,
                        command:"off"});

  this.modem.sendHex(command);
};
