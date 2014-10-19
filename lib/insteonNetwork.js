/**
 * Contains devices and the modem that runs them
 **/
var modem = require("./modem.js");
var us = require("underscore");

var InsteonNetwork = exports.InsteonNetwork = function(){
  this._modem = new modem.Modem();
  this._modem.autoConnect();
  this._devices = {};
};

/**
 * Adds a new device to the network under the given name
 *
 * @param {String} deviceName
 **/
InsteonNetwork.addDevice = function(deviceName, deviceObject){
  if(us.contains(us.pluck(this._devices,"address"),deviceObject.address)){
    //device list already contains an element with this insteon address
    return new Error("Device with address " + deviceObject.address + " already in collection.");
  }
  deviceObject.associateModem(this._modem);
  this._devices[deviceName] = deviceObject;
};

/**
 * Removes named device from network
 *
 * @param {String} deviceName
 **/
InsteonNetwork.prototype.removeDevice = function(deviceName){
  delete this._devices[deviceName];
};

/**
 * Gets named device
 *
 * @param {String} deviceName
 **/
InsteonNetwork.prototype.getDevice = function(deviceName){
  return this._devices[deviceName];
};

InsteonNetwork.prototype.sendCommand = function(targetDevices, command, optArgs){
  //if targetDevices is a string, transform to an array
  if(typeof targetDevices === 'string' || myVar instanceof String){
    targetDevices = [targetDevices];
  }

  var self = this;

  us.each(targetDevices, function(devName){
    if(us.has(self._devices, devName)){
      if(optArgs){
        self._devices[devName][command](optArgs);
      } else {
        self._devices[devName][command]();
      }
    }
  });
};
