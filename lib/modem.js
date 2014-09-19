/**
 * Controls the insteon modem
 **/

var serialPort = require('serialport');

/**
 * Scans over all available ports and connects to a PLM
 *
 * @param {Function} callback( error, port )
 * @return {String}
 **/
var detectPLMPort = exports.detectPLMPort = function(callback){
  serialPort.list(function(err,ports){
    if(err){
      if(callback){
        callback(err);
      }
      return;
    } else {
      for(var pIndex in ports){
        //scan over all available ports for PLM identifier
        var port = ports[pIndex];
        if(port.pnpId.indexOf("usb-FTDI_FT232R_USB_UART_A501LDGJ") > -1){
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
  this.port = null;
  this.connection = null;
  this.isOpen = false;
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
  if(this.connection !== null && this.isOpen){
    //kill the old connection
    this.connection.close();
  }
  //now establish a new connection

  //update variables
  this.isOpen = false;
  this.port = newPort;

  //initialize connectionproperties but don't open connection (final false flag)
  this.connection = new serialPort.SerialPort( newPort, {
    baudrate: 19200,
    databits: 8,
    stopbits: 1,
    parity: 0,
    flowcontrol: 0
  }, false);

  //open the connection
  this.connection.open(function(error){
    if(error){
      self.isOpen = false;
      if(callback){
        callback(error);
      }
      return;
    } else {
      self.isOpen = true;
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
  this.connection.on("data", function(data) {
    console.log(data);
  });
}

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
 **/
Modem.prototype.sendHex = function(hexString, callback){
  if(!this.connection || !this.isOpen){
    if(callback){
      callback(new Error("Modem not connected."));
    }
    return;
  }
  
  //throw an error if invalid hex
  if(! /^[0-9A-F]+$/i.test(hexString)){
    if(callback){
      callback(new Error("Misformatted hex."));
    }
    return;
  }
 
  //create a new buffer from the hex string
  var hexBuffer = new Buffer(hexString, 'hex');

  if(callback){
    this.connection.write(hexBuffer, callback);
  } else {
    this.connection.write(hexBuffer);
  }
};
