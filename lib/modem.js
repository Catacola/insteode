/**
 * Controls the insteon modem
 **/

var serialPort = require('serialport');

var modemSettings = {
  port: null,
  type: 'PLM',
  connection: null,
  isOpen: false
};

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
 * Connect the modem to supplied port
 *
 * @param {String} newPort
 * @param {Function} callback(error)
 * @return none
 **/
var connectToPort = exports.connectToPort = function(newPort, callback){
  //first see if we need to close an old connection
  if(modemSettings.connection !== null && modemSettings.isOpen){
    //kill the old connection
    modemSettings.connection.close();
  }
  //now establish a new connection

  //update variables
  modemSettings.isOpen = false;
  modemSettings.port = newPort;

  //initialize connectionproperties but don't open connection (final false flag)
  modemSettings.connection = new serialPort.SerialPort( newPort, {
    baudrate: 19200,
    databits: 8,
    stopbits: 1,
    parity: 0,
    flowcontrol: 0
  }, false);

  //open the connection
  modemSettings.connection.open(function(error){
    if(error){
      modemSettings.isOpen = false;
      if(callback){
        callback(error);
      }
      return;
    } else {
      modemSettings.isOpen = true;
      console.log("connected to port " + newPort);
      if(callback){
        callback(null); 
      }
      return;
    }
  });
};

/**
 * Auto-detects the PLM port and connects to it
 *
 * @param {Function} callback(error)
 * @return none
 **/
var autoConnect = exports.autoConnect = function(callback){
  detectPLMPort(function(error, plmPort){
    if(error){
      if(callback){
        callback(error);
      }
      return;
    } else {
      //found a plm port
      if(callback){
        connectToPort(plmPort, callback);
      } else {
        connectToPort(plmPort);
      }
      return;
    }
  });
};

