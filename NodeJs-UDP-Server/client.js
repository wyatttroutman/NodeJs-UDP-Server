var dgram = require('dgram');
var sleep = require('system-sleep');
var client = dgram.createSocket('udp4');
var PORT = 9000;
var express = require('express');
var app = express();

var packets_sent = 0;
var packets_received = 0;
var packets_out_of_order = 0;
var bytes_sent = 0;
var bytes_received = 0;
var time_running = 0;
var time_started = 0;
var packet_last_sent = 0;

app.use(express.static('public'));
app.get('/index.htm', function (req, res) {
   res.sendFile( __dirname + "/" + "index.htm" );
})

app.get('/process_get', function (req, res) {
    // Parse input
    var target_ip = req.query.targetIP;
    var target_port = req.query.targetPort;
    var client_mode = req.query.clientMode;
    var client_message_size = '';
    var client_iterations = '';
    var client_echo_iteration_delay = '';
    var client_cbr_send_rate = '';
    
    var flag = 0;
    var iterations;
    var iteration_delay = 0;
    var sequence_number = 0;

    time_started = Math.round((new Date()).getTime() / 1000);
    
    if (client_mode == 'ECHO'){
            client_message_size = req.query.ECHOmessageSize;
            client_iterations = req.query.ECHOiterations;
            client_echo_iteration_delay = req.query.ECHOiterationDelay;
            
            iteration_delay = client_echo_iteration_delay;
    } else if (client_mode == 'CBR') {
            client_message_size = req.query.CBRmessageSize;
            client_iterations = req.query.CBRiterations;
            client_cbr_send_rate = req.query.CBRsendRate;
            
            iteration_delay = Math.round((client_message_size * 8.0) / (client_cbr_send_rate * 1.0) * 1000);
            
            console.log('Calculated CBR Iteration Delay (ms): ' + iteration_delay);
    }       
    
    var PORT = target_port;
    var HOST = target_ip;
    
    iterations = client_iterations;
    var infinite = 0;
    if (iterations == 0){
        infinite = 1;
    }
    
    
    while (iterations > 0 || infinite == 1){
            var buffer_string = '';
            var message;
            var current_bytes;
            var remaining_bytes;
            //console.log('Client Mode: ' + client_mode);
            if (client_mode == 'ECHO'){   
                buffer_string = '{'
                    + '"sequence_number" : ' + sequence_number + ','
                    + '"client_mode" : "ECHO",'
                    + '"data": "';
                
                current_bytes = buffer_string.length * 2;
                remaining_bytes = client_message_size - current_bytes;
                while (remaining_bytes > 4){
                    buffer_string += '-';
                    remaining_bytes -= 2;
                }
                
                buffer_string += '"}';
                
                message = new Buffer(buffer_string);
            } else if (client_mode == 'CBR') {
                buffer_string = '{'
                    + '"sequence_number" : ' + sequence_number + ','
                    + '"client_mode" : "CBR",'
                    + '"data": "';
                
                current_bytes = buffer_string.length * 2;
                remaining_bytes = client_message_size - current_bytes;
                while (remaining_bytes > 4){
                    buffer_string += '-';
                    remaining_bytes -= 2;
                }
                
                buffer_string += '"}';        
                
                message = new Buffer(buffer_string);
            }   
            
            //console.log("Preparing to send message..");
            client.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
                if (err) throw err;
                var timestamp = Math.round((new Date()).getTime() / 1000);
                console.log(timestamp + ': UDP ' + client_mode + ' message sent to ' + HOST +':'+ PORT);
                packet_last_sent = sequence_number;
                packets_sent++;
                bytes_sent += message.length * 2;
                time_running = Math.round((new Date()).getTime() / 1000);
            });  
            
            iterations--;
            sequence_number++;
            
            // Sleep for iteration delay.
            sleep(iteration_delay); 
    }
    

    res.sendFile( __dirname + "/" + "cont.htm" );
    
    console.log("Redirected user to cont.htm ... Continuing code.");
})

var server = app.listen(8081, function () {
   var host = server.address().address;
   var port = server.address().port;
   var timestamp = Math.round((new Date()).getTime() / 1000);
   console.log(timestamp + ": Node.js Express webserver (Client Mode) listening at http://%s:%s", host, port);

});

client.on('listening', function () {
    var address = client.address();
    var timestamp = Math.round((new Date()).getTime() / 1000);
    console.log(timestamp + ': Node.js UDP server (Client Mode) listening on ' + address.address + ":" + address.port);
});

client.on('message', function (message, remote) {
    var obj = JSON.parse(message);
    console.log('Echoing ' + remote.address + ':' + remote.port +' - ' + obj.client_sequence_number);
    packets_received++;
    bytes_received += message.length * 2;
    
    if (packet_last_sent < obj.sequence_number){
        packets_out_of_order++;
    }
    
    time_running = Math.round((new Date()).getTime() / 1000);
});

client.on('close', function() {
    var timestamp = Math.round((new Date()).getTime() / 1000);
    console.log(timestamp + ': Node.js UDP server (Client Mode) socket closed.')
});

client.bind(client.address.port);

process.on('SIGINT', function() {
    var timestamp = Math.round((new Date()).getTime() / 1000);
    console.log("\n" + timestamp + ": Caught interrupt signal!");

    console.log('Time Running (s): ' + (time_running - time_started));
    console.log('Packets Sent: ' + packets_sent);
    console.log('Packets Received: ' + packets_received);
    console.log('Packets Out Of Order: ' + packets_out_of_order);
    console.log('Bytes Sent: ' + bytes_sent);
    console.log('Bytes Received: ' + bytes_received);

    console.log(timestamp + ": Closing socket...");
    client.close();

    console.log(timestamp + ": Ending process...");
    process.exit();
});

