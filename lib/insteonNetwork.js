/**
 * Contains devices and the modem that runs them
 **/
var modem = require("./modem.js");
var device = requite("./device.js");
var us = require("underscore");

var InsteonNetwork = exports.InsteonNetwork = function(){
  this._modem = new modem.Modem();
  this._modem.autoConnect();
  this._devices = {};
};

/**
 * Adds a new Light to the network under the given name
 *
 * @param {String} deviceName
 * @param {String} deviceAddress
 **/
InsteonNetwork.addLight = function(deviceName, deviceAddress){
  if(us.contains(us.pluck(this._devices,"address"),deviceAddress)){
    //device list already contains an element with this insteon address
    console.log(new Error("Device with address " + deviceAddress + " already in collection."));
    return;
  }

  //create new light
  var newLight = new device.Light(deviceAddress, this._modem);
  this._devices[deviceName] = newLight;
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
