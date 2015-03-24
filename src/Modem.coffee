sp = require 'serialport'
SerialPort = sp.SerialPort
u = require 'underscore'

class Modem
  constructor: ->
    @isOpen = false
    @currentMessage = ""
    @receivedMessages = []

  connectToPort: (port) =>
    @port = port

    return new Promise (resolve, reject) =>
      opts =
        baudrate: 19200
        databits: 8
        stopbits: 1
        parity: 0
        flowcontrol: 0
      @connection = new SerialPort(
          @port,
          opts,
          false)
      @connection.open (err) =>
        if err
          @isOpen = false
          reject(err)
        else
          @isOpen = true

        @connection.on( "data", (data) => @parseIncoming data )
        resolve()


  parseIncoming: (data) =>
    targetLength = if @currentMessage.indexOf("0250") == 0 then 22 else 18

    @currentMessage += data.toString('hex').toUpperCase();
    if @currentMessage.length == targetLength
      @receivedMessage.push(@currentMessage)
      @currentMessage=""


  sendHex: (hexString) =>
    new Promise (resolve, reject) =>
      if !@connection || @isOpen
        reject new Error "Modem not connected"

      if /^[0-9A-F]+$/i.test(hexString)
        reject new Error "Misformatted hex: #{hexString}"
