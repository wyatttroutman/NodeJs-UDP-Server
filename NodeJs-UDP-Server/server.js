var PORT = 9000;

var dgram = require('dgram');
var server = dgram.createSocket('udp4');

var packets_sent = 0;
var packets_received = 0;
var bytes_sent = 0;
var bytes_received = 0;
var time_running = 0;
var time_started = 0;
var packet_last_sent = 0;

server.on('listening', function () {
  time_started = Math.round((new Date()).getTime() / 1000);

  var address = server.address();
  var timestamp = Math.round((new Date()).getTime() / 1000);
  console.log(timestamp + ': Node.js UDP server (Server Mode) listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {
  var obj = JSON.parse(message);
  var client_ip = remote.address;
  var client_port = remote.port;
  var client_mode = obj.client_mode;
  var client_sequence_number = obj.sequence_number;
  
  packets_received++;
  bytes_received += message.length * 2;
  time_running = Math.round((new Date()).getTime() / 1000);
  
  var output = 'Client Mode: ' + client_mode + ', Client Sequence Number: ' + client_sequence_number;
  var timestamp = Math.round((new Date()).getTime() / 1000);
  console.log(timestamp + ': Received message from ' + remote.address + ':' + remote.port +' - ' + output);
  
  var response_string = '{"client_sequence_number" : ' + client_sequence_number + ', '
    + '"data" : "data"'
    + '}';
  var response_message = new Buffer(response_string);
  
  if (client_mode == 'ECHO'){
      server.send(response_message, 0, response_message.length, client_port, client_ip, function(err, bytes) {
        if (err) throw err;
        timestamp = Math.round((new Date()).getTime() / 1000);
        console.log(timestamp + ': Echoed ' + client_sequence_number + ' to ' + client_ip +':'+ client_port);
        packets_sent++;
        bytes_sent += response_message.length * 2;
        time_running = Math.round((new Date()).getTime() / 1000);
      }); 
  }
});

server.bind(PORT);

process.on('SIGINT', function() {
    var timestamp = Math.round((new Date()).getTime() / 1000);
    console.log("\n" + timestamp + ": Caught interrupt signal!");

    console.log('Time Running (s): ' + (time_running - time_started));
    console.log('Packets Sent: ' + packets_sent);
    console.log('Packets Received: ' + packets_received);
    console.log('Bytes Sent: ' + bytes_sent);
    console.log('Bytes Received: ' + bytes_received);

    console.log(timestamp + ": Closing socket...");
    server.close();

    console.log(timestamp + ": Ending process...");
    process.exit();
});
