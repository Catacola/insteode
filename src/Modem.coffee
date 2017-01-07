sp = require 'serialport'
SerialPort = sp.SerialPort
u = require 'underscore'

class Modem
  constructor: ->
    @isOpen = false
    @currentMessage = ""
    @receivedMessages = []
    @sentCommands = []

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

          @connection.on( "data", @parseIncoming )
          resolve()

  autoConnect: =>
    return new Promise (resolve, reject) =>
      detectPLMPort()
        .then (port) =>
          @connect(port)


  parseIncoming: (data) =>
    targetLength = 18
    targetLength = 22 if @currentMessage.indexOf("0250") is 0

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

      commandObj = {
        command: hexString
        to: hexString.slice(4,10)
        status: 'sent'
      }

      if callback
        u.extend(commandObj, {callback: callback})

      hexBuffer = new Buffer(hexString, 'hex')
      @connection.write(hexBuffer,
        (res, err)=>
          if err
            reject err
            if callback
              callback(err)
          else
            @SentCommands.push commandObj
            resolve()
      )

exports.Modem = Modem

detectPLMPort = () ->
  new Promise (resolve, reject) ->
    serialPort.list (err, ports) ->
      if err
        reject err
        return

      plmPort = u.find(ports, (port) ->
        port.pnpId.indexOf("usb-FTDI_FT232R_USB_UART_A501LDGJ") > -1)

      if plmPort is undefined
        reject new Error "No PLM found"
      else
        resolve port.comName

exports.detectPLMPort = detectPLMPort


