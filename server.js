//node libraries
var noble = require('noble'),
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
    console.log("We have a new client: " + socket.id);

    socket.on('message', function (data) {
        console.log("message: " + data);
        
         io.sockets.emit('message', "this goes to everyone");
      }
    );
    
 
    
     
    socket.on('otherevent', function(data) {
      console.log("Received: 'otherevent' " + data);
    });
    
    socket.on('disconnect', function() {
      console.log("Client has disconnected");
    });
     
     
     
     
});















//BLE code
var sensorTagUUID = "49932ddb97074c838cba1c376b320ef6";
var sensorTagPeripheral;
var connected = false;
var sensorTagRSSI;


setInterval(updateData, 1000);




//Bluetooth ON or OFF
noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    console.log("start scanning");
    noble.startScanning();
  } else {
    noble.stopScanning();
    console.log("stop scanning, is Bluetooth on?");
  }
});


noble.on('discover', function(peripheral) {
  if (peripheral.uuid === sensorTagUUID) {
    sensorTagPeripheral = peripheral;
    noble.stopScanning();
    logData(peripheral);
    explore(peripheral); 
      
   }
    
   else{
   console.log("found wrong device");
   }

});


function explore(peripheral) {
    peripheral.connect(function(error){
        console.log('connected to peripheral');  
        enableAccelerometer();
        connected = true;
        //discoverServices(peripheral);    
        //getAccelerometerData(peripheral);  
     });
    
     
    peripheral.on('disconnect', function() {
        console.log('disconneted');
        connected = false;
        noble.startScanning();
    });
    //peripheral.disconnect();
}


function logData(peripheral){
    var advertisement = peripheral.advertisement;
    var localName = advertisement.localName;
    var txPowerLevel = advertisement.txPowerLevel;
    var manufacturerData = advertisement.manufacturerData;
    console.log("Peripheral "+localName + " with UUID " + sensorTagUUID + " found");
    console.log("TX Power Level "+ txPowerLevel + ", Manufacturer "+ manufacturerData);
}

function updateData(){
    updateRSSI();
    getAccelerometerData();    
}

function updateRSSI(){
  if(connected){
        sensorTagPeripheral.updateRssi(function(error, rssi){
        console.log(rssi);      
        //send RSSI to browser.
        io.sockets.emit('rssi', rssi);
        });
    }
    else{
    console.log("tag not found yet");
    }   
}


function getAccelerometerData(){
   if(connected){
      //find Accel. service
        sensorTagPeripheral.discoverServices(['f000aa1004514000b000000000000000'], function(error, services) {
          var accelerometerService = services[0];

          //connect to Accel. Data characteristic
          accelerometerService.discoverCharacteristics(['f000aa1104514000b000000000000000'], function(error, characteristics) {
            var accelerometerDataCharacteristic = characteristics[0];
              
//            accelerometerDataCharacteristic.discoverDescriptors(function(error, data){
//               var descriptor = data[0];
//              // console.log(data.length);    
//                descriptor.readValue(function(error, data){
//                });
//           
        //    });

            accelerometerDataCharacteristic.read(function(error, data) {
              // data is a buffer
              console.log('acc.'+data.toString());    
             // console.log('accel. data is: ' + data.toString());
            });  

        //        //not reading this :(  
        //        accelerometerDataCharacteristic.on('read', function(data, isNotification) {    
        //          console.log('Accelerometer data is now: ', data);
        //        });
        //

          });
        });
    }   
    else{
    console.log("not connected");
    }
}


function enableAccelerometer(){
        sensorTagPeripheral.discoverServices(['f000aa1004514000b000000000000000'], function(error, services) {
          var accelerometerService = services[0];

          console.log('discovered accel. service');
          //connect to Accel. Data characteristic
          accelerometerService.discoverCharacteristics(['f000aa1104514000b000000000000000'], function(error, characteristics) {
            var accelerometerDataCharacteristic = characteristics[0];
            console.log('discovered accel. data characteristic');
              
            // true to enable notify
            accelerometerDataCharacteristic.notify(true, function(error) {
              console.log('accel. data notification on');
            });
           
            //not reading this :(  
            accelerometerDataCharacteristic.on('read', function(data, isNotification) {    
              console.log('Accelerometer data is now: ', data);
            });
          });
        });
}       


function discoverServices(peripheral){
    peripheral.discoverServices([], function(error, services) {
        console.log('discovered the following services:');
        for (var i in services) {
            console.log('  ' + i + ' uuid: ' + services[i].uuid + ' name: ' + services[i].name);        
            
            var deviceInformationService = services[i];
            deviceInformationService.discoverCharacteristics(null, function(error, characteristics) {
                //console.log('       discovered the following characteristics in the service:'+ services[i].name);
                for (var j in characteristics) {
                   // console.log('     ' + j + ' uuid: ' + characteristics[j].uuid + ' name: ' + characteristics[j].name );
                }
            });
        }    
     });
}
