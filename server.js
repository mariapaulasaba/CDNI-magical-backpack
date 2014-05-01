//node libraries
var noble = require('noble'),
	util = require('util');
    express = require('express'),
    http = require('http'),
    io = require('socket.io'),
    open = require('open'),
    async = require('async'),
    url = 'http://localhost:8080';
	
// create a server with express callback 
var app = express();
var server = http.createServer(app); 
var io = io.listen(server);

// configure server to serve static files:
app.use('/', express.static(__dirname + '/public/'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/public/img', express.static(__dirname + '/public/img'));


// start the server listening
server.listen(8080);
console.log('Server is listening to http://localhost on port 8080');
open(url);                   


//handling views code
app.get('/', function (request, response) {
  response.sendfile(__dirname + '/index.html');

});


app.get('/index*', function (request, response) {
   response.sendfile('index.html');
});




//Socket.io code
 io.sockets.on('connection', function (socket) {
    //console.log("We have a new client: " + socket.id);

    socket.on('message', function (data) {
       // console.log("message: " + data);
		// io.sockets.emit('message', "this goes to everyone");
    });
    
	socket.on('sessionStart', function(data){
		sessionStarted = data;
		if(sessionStarted) startSendingData();
	});
	 
	 
    socket.on('otherevent', function(data) {
      console.log("Received: 'otherevent' " + data);
    });
    
    socket.on('disconnect', function() {
      console.log("Client has disconnected");
    });
     
     
     
     
});















//BLE code

var sensorTag1 = {  id: 1,
					UUID: "49932ddb97074c838cba1c376b320ef6",
					accelData: {},
					rssiData: {}
}
	
var sensorTag2 = {  id: 2,
					UUID: "7de4492dca154befbc23b66528dff68d",
					accelData: {},
					rssiData: {}
}

var sensorTag3 = {  id: 3,
					UUID: "d5583c264d30409c885bd12d2a70ee5e",
					accelData: {},
					rssiData: {}
}

var sensorTags = [sensorTag1, sensorTag2, sensorTag3];

var ACCELEROMETER_UUID           = 'f000aa1004514000b000000000000000';
var ACCELEROMETER_CONFIG_UUID    = 'f000aa1204514000b000000000000000';
var ACCELEROMETER_DATA_UUID      = 'f000aa1104514000b000000000000000';
var ACCELEROMETER_PERIOD_UUID    = 'f000aa1304514000b000000000000000';


var sensorTagPeripheral;
var connected = false;
var accelEnabled = false;
var turn = 1;
var sessionStarted = false;


function startSendingData(){
	if(sessionStarted) setInterval(updateData, 60);
	//setInterval(loopTags, 3000);
}



function loopTags(){
	if(connected){
		sensorTagPeripheral.disconnect();
	}
	console.log('change turn');
	if(turn == 1) turn = 2;
	else if(turn == 2) turn = 1;
	//else if(turn == 3) turn = 1;
}






function updateData(){
    updateRSSI();
    getAccelerometerData(); 
	
	//send data to client
	for(var i = 0; i < sensorTags.length; i++){
		if(turn == sensorTags[i].id){
			io.sockets.emit('sensorTag', sensorTags[i]);
		}	
	}
}

function updateRSSI(){
    if(connected){
        sensorTagPeripheral.updateRssi(function(error, rssi){
			for(var i = 0; i < sensorTags.length; i++){
				if(turn == sensorTags[i].id){
					//console.log(rssi);
					sensorTags[i].rssiData = rssi;
				}	
			}
      	});
    }
	else{
	//console.log("tag not found yet");
	}   
}

//Bluetooth ON or OFF
noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    console.log("start scanning");
    noble.startScanning();
  } else {
    noble.stopScanning();
    console.log("stop scanning, is Bluetooth on?");
	
	//ask user if Bluetooth is on
	io.sockets.emit('bluetooth','is bluetooth on?');
  }
});


noble.on('discover', function(peripheral) {

	if(turn == 1){
		if(peripheral.uuid === sensorTags[0].UUID){		
			sensorTagPeripheral = peripheral;
			explore(peripheral);   
			logData(peripheral);
			noble.stopScanning();
		}
		else{
			console.log("no backpack found");
			io.sockets.emit('backpack', 0); 
    	}
	}
	else if(turn == 2){
			if( peripheral.uuid === sensorTags[1].UUID){
			sensorTagPeripheral = peripheral;
			explore(peripheral);   
			logData(peripheral);
			noble.stopScanning();
		}
		else{
		console.log("no backpack found");
		io.sockets.emit('backpack', 0); 
    	}
	}
	else if(turn == 3){
		if( peripheral.uuid === sensorTags[2].UUID){
		sensorTagPeripheral = peripheral;
		explore(peripheral);   
		logData(peripheral);
		noble.stopScanning();
		}
		else{
		console.log("no backpack found");
		io.sockets.emit('notFound','No backpacks found'); 
    	}
	}	
	

});


function explore(peripheral) {
    peripheral.connect(function(error){
        console.log('connected to peripheral');  
        if(!accelEnabled) enableAccelerometer();
        connected = true;
     });
    
     
    peripheral.on('disconnect', function() {
        console.log('disconneted');
        connected = false;
		accelEnabled = false;
        noble.startScanning();
    });
}

function logData(peripheral){
    var advertisement = peripheral.advertisement;
    var localName = advertisement.localName;
    var txPowerLevel = advertisement.txPowerLevel;
    var manufacturerData = advertisement.manufacturerData;
    console.log("Peripheral "+localName + " with UUID " + peripheral.uuid  + " found");
    console.log("TX Power Level "+ txPowerLevel + ", Manufacturer "+ manufacturerData);
}



function enableAccelerometer(){
        sensorTagPeripheral.discoverServices([ACCELEROMETER_UUID], function(error, services) {
        	var accelerometerService = services[0];
			console.log('discovered accel. service');			
			//connect to Accel. Data characteristic
			accelerometerService.discoverCharacteristics([ACCELEROMETER_CONFIG_UUID], function(error, characteristics) {
				console.log("found data config");
            	//write 1 to config to enable accel.
            	var accelerometerDataCharacteristic = characteristics[0];              
				accelerometerDataCharacteristic.write(new Buffer([0x01]), false, function(error) {
					console.log('enabling data aquisition');
					accelEnabled = true;
						io.sockets.emit('backpack',turn);

        		});
			  
          	});
        });
}       


function getAccelerometerData(){
   if(connected & accelEnabled){
      //find Accel. service
        sensorTagPeripheral.discoverServices([ACCELEROMETER_UUID], function(error, services) {
			var accelerometerService = services[0];
			  //connect to Accel. Data characteristic
			accelerometerService.discoverCharacteristics([ACCELEROMETER_DATA_UUID], function(error, characteristics) {
				var accelerometerDataCharacteristic = characteristics[0];
				accelerometerDataCharacteristic.read(function(error, data) {
					// data is a buffer
//					console.log(data[0]);
//					console.log(data[1]);
//					console.log(data[2]);
					
					//need a map function here?
					for(var i = 0; i < sensorTags.length; i++){
						if(turn == sensorTags[i].id){
							sensorTags[i].accelData.x = data[0];
							sensorTags[i].accelData.y = data[1];
							sensorTags[i].accelData.z = data[2];
							console.log(sensorTags[i].accelData.z);
						}	
					}			
				});  
			});
        });
    }   
    else{
    console.log("not connected");
	
    }
}



function map(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

//function discoverServices(peripheral){
//    peripheral.discoverServices([], function(error, services) {
//        console.log('discovered the following services:');
//        for (var i in services) {
//            console.log('  ' + i + ' uuid: ' + services[i].uuid + ' name: ' + services[i].name);        
//            
//            var deviceInformationService = services[i];
//            deviceInformationService.discoverCharacteristics(null, function(error, characteristics) {
//                //console.log('       discovered the following characteristics in the service:'+ services[i].name);
//                for (var j in characteristics) {
//                   // console.log('     ' + j + ' uuid: ' + characteristics[j].uuid + ' name: ' + characteristics[j].name );
//                }
//            });
//        }    
//     });
//}
