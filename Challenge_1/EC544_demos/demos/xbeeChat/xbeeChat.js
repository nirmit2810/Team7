var SerialPort = require("serialport");
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var portName = process.argv[2],
portConfig = {
	baudRate: 9600,
	parser: SerialPort.parsers.readline("\n")
};

var sp;

var MongoClient 

// Connection URL
var url;

var deviceID = 9;
		
var temperature = 999.99;

var current;
		
var time = '99:99:99';

var time_ms = 999999999; 

MongoClient = require('mongodb').MongoClient
				, assert = require('assert');

url = 'mongodb://localhost:27017/dbTest';				
				
sp = new SerialPort.SerialPort(portName, portConfig);

app.get('/', function(req, res){
  res.sendfile('index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
  });
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
    sp.write(msg + "\n");
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

sp.on("open", function () {
	console.log('open');
  
	sp.on('data', function(data) {
	
		// Handle received Data
		console.log('data received: ' + data);
	
		// Parse data
		deviceID = parseInt(data.substring(1, 2));
		
		temperature = parseFloat(data.substring(4, (data.length - 1)));
	
		current = new Date();
		
		time = current.toString();
		
		time_ms = Date.parse(time);
	
		// DB operations
		// Use connect method to connect to the Server
		MongoClient.connect(url, function(err, db) {
			assert.equal(null, err);
		
			console.log("Connected correctly to server");	
		
			// Get the documents collection
			var collection = db.collection('test');

			//Create some users
			var message = {Device_ID: deviceID, Temperature: temperature, Time: time, Time_ms: time_ms};
		
			collection.insert([message], function (err, result) 
			{
				if (err) 
				{
					console.log(err);
				} 
				else 
				{
					console.log('Inserted %d documents into the "test" collection. The documents inserted with "_id" are:', result.length, result);
				}
		
				db.close();
			});
		});
  
		// Transmit the parsed data to the html
		io.emit("chat message", (data + '(' + time +')'));
	});
});


