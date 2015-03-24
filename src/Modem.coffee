sp = require 'serialport'
SerialPort = sp.SerialPort
u = require 'underscore'

class Modem
  constructor: ->
    @isOpen = false
  
  connectToPort: (port) ->
    @port = port
    @connection = new SerialPort( @port,

