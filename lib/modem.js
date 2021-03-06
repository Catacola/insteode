/**
 * Controls the insteon modem
 **/

var serialPort = require('serialport');

//put underscore in us instead of _ since node uses _ internally
var us = require('underscore');

/**
 * Scans over all available ports and connects to a PLM
 *
 * @param {Function} callback( error, port )
 * @return {String}
 **/
var detectPLMPort = exports.detectPLMPort = function(callback){
  serialPort.list(function(err,ports){
    console.log(ports);
    if(err){
      if(callback){
        callback(err);
      }
      return;
    } else {
      for(var pIndex in ports){
        //scan over all available ports for PLM identifier
        var port = ports[pIndex];
        if((port.pnpId && port.pnpId.indexOf("usb-FTDI_FT232R_USB_UART_A501LDGJ") > -1)
           || (port.manufacturer === 'FTDI' && port.serialNumber === 'A501LDGJ')){
          //found the PLM
          //console.log("Found " + port.pnpId + " on port " + port.comName);
          if(callback){
            callback( null, port.comName);
          }
          return;
        }
      }

      callback(new Error("No PLM found"));
      return;
    }
  });
};

/**
 * Modem object to hold a modem instance
 **/
var Modem = exports.Modem = function(){
  //initialize variables for later use
  this._port = null;
  this._connection = null;
  this._isOpen = false;
  this._sendingCommand = false;

  //array to hold recently received data
  this._receivedMessages = [""];
  this._activeCommands=[];
};

/**
 * Connect the modem to supplied port
 *
 * @param {String} newPort
 * @param {Function} callback(error)
 * @return none
 **/
Modem.prototype.connectToPort = function(newPort, callback){
  var self = this;
  //first see if we need to close an old connection
  if(this._connection !== null && this._isOpen){
    //kill the old connection
    this._connection.close();
  }
  //now establish a new connection

  //update variables
  this._isOpen = false;
  this._port = newPort;

  //initialize connectionproperties but don't open connection (final false flag)
  this._connection = new serialPort( newPort, {
    autoOpen: false,
    baudrate: 19200,
    databits: 8,
    stopbits: 1,
  });

  //open the connection
  this._connection.open(function(error){
    if(error){
      self._isOpen = false;
      if(callback){
        callback(error);
      }
      return;
    } else {
      self._isOpen = true;
      self.startListener();
      //console.log("connected to port " + newPort);
      if(callback){
        callback(null);
      }
      return;
    }
  });
};

/**
 * establishes a listener on the modem
 **/
Modem.prototype.startListener = function(callback){
  var self = this;
  this._connection.on("data", function(data) {
    self.parseIncoming(data);
  });
};

/**
 * Parses incoming data into seperate messages
 **/
Modem.prototype.parseIncoming = function(data){
  //make sure we at least have a blank string to start with
  if(this._receivedMessages.length === 0){
    this._receivedMessages.push("");
  }
  //get last element of receivedMessages which is the one we might be working on
  var curMessage = this._receivedMessages.slice(-1)[0];
  var targetLength = 18;
  if( curMessage.indexOf("0250") === 0) {
    targetLength = 22;
  }

  if(curMessage.length < targetLength){
    //add to current message if incomplete
    curMessage += data.toString('hex').toUpperCase();
    this._receivedMessages[this._receivedMessages.length-1] = curMessage;
    //check to see if message is complete
    if(curMessage.length === targetLength){
      us.each(us.where(this._activeCommands, {to: curMessage.slice(4,10)}), function(activeCmd){
        if(activeCmd.status === 'active' && curMessage.slice(0,4) === "0262"){
          //echoed command from PLM
          //find status of response
          var cmdStatus = curMessage.slice(-2);
          if(cmdStatus === '06'){
            //all is well
            activeCmd.status='sent';
          } else {
            //command didn't send! ERROR!
            activeCmd.callback(new Error('Command not sent: ' + activeCmd.command));
            activeCmd.status='failed';
          }
        } else if(activeCmd.status === 'sent' && curMessage.slice(0,4) === "0250"){
          //response from device
          activeCmd.status='success';
          activeCmd.callback( null, curMessage );
        }
      });
    }
  } else  {
    this._receivedMessages.push(data.toString('hex').toUpperCase());
  }
};

/**
 * Auto-detects the PLM port and connects to it
 *
 * @param {Function} callback(error)
 * @return none
 **/
Modem.prototype.autoConnect = function(callback){
  var self = this;
  detectPLMPort(function(error, plmPort){
    if(error){
      if(callback){
        callback(error);
      }
      return;
    } else {
      //found a plm port
      if(callback){
        self.connectToPort(plmPort, callback);
      } else {
        self.connectToPort(plmPort);
      }
      return;
    }
  });
};

/**
 * Sends a raw hex signal through the plm
 *
 * @param {String} hexData
 * @param {Function} callback(error)
 *  The callback is called after the modem receives acknowledgement of command received from remote device
 **/
Modem.prototype.sendHex = function(hexString, callback){
  if(!this._connection || !this._isOpen){
    if(callback){
      callback(new Error("Modem not connected."));
    }
    return;
  }

  //throw an error if invalid hex
  if(! /^[0-9A-F]+$/i.test(hexString)){
    if(callback){
      callback(new Error("Misformatted hex: " + hexString));
    }
    return;
  }

  //save an object if we have a callback so we can invoke it upon command success confirmation
  if(callback){
    this._activeCommands.push({
      command: hexString,
      to: hexString.slice(4,10),
      status: 'queued',
      callback: callback
    });
  } else {
    this._activeCommands.push({
      command: hexString,
      to: hexString.slice(4,10),
      status: 'queued'
    });
  }

  this._sendQueuedCommands();

};

Modem.prototype._sendQueuedCommands = function(){
  var self = this;

  if(this._sendingCommand){
    //only send one command at a time
    return;
  }
  this._sendingCommand = true;

  var cmdObj = us.findWhere(this._activeCommands, {status: 'queued'});
  if(!cmdObj){
    //No more queued commands
    this._sendingCommand = false;
    return;
  }
  var hexString = cmdObj.command;
  //create a new buffer from the hex string
  var hexBuffer = new Buffer(hexString, 'hex');
  this._connection.write(hexBuffer,function(err,res){
    //unlock modem
    self._sendingCommand=false;

    if(err){
      cmdObj.status='error';
      if(cmdObj.callback){
        cmdObj.callback(err);
      }
    } else {
      cmdObj.status='active';
    }
    self._sendQueuedCommands();
  });

}
