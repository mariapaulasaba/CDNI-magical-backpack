var async = require('async');
var noble = require('noble');

//sensor tag UUID
//var sensorTagUUID = "49932ddb97074c838cba1c376b320ef6";
var sensorTagUUID = "d5583c264d30409c885bd12d2a70ee5e";
//var sensorTagUUID = "7de4492dca154befbc23b66528dff68d";


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
    noble.stopScanning();

    var advertisement = peripheral.advertisement;
    var localName = advertisement.localName;
    var txPowerLevel = advertisement.txPowerLevel;
    var manufacturerData = advertisement.manufacturerData;
    var serviceData = advertisement.serviceData;
    var serviceUuids = advertisement.serviceUuids;

    console.log("Peripheral "+localName + " with UUID " + sensorTagUUID + " found");
    console.log("TX Power Level "+ txPowerLevel + ", Manufacturer "+ manufacturerData);

    explore(peripheral);
	}	
   else{
   console.log("found wrong device");

   }	
});






function explore(peripheral) {

    
    
  //if disconnected, let us know and quit the program
  peripheral.on('disconnect', function() {
    console.log('disconneted');
    process.exit(0); 
  });
    
    
  peripheral.connect(function(error) {
    console.log('connected to peripheral');
    
    //it returns an array. 
    peripheral.discoverServices([], function(error, services) {
      var serviceIndex = 0;
      

      async.whilst(
        //while the number of services is bigger than the services read
        function () {
          return (serviceIndex < services.length);
        },

        //read service
        function(callback) {

          //gets service info
          var service = services[serviceIndex];
          
          //here I could save its data
          var serviceInfo = { UUID: service.uuid, name: service.name} 


          //find services characteristics, returns another array
          service.discoverCharacteristics([], function(error, characteristics) {
            var characteristicIndex = 0;
            

            async.whilst(

              //while the number of characteristics is bigger than the characteristics recorded
              function () {
                return (characteristicIndex < characteristics.length);
              },

             //saves the characteristic in an array     
              function(callback) {
                var characteristic = characteristics[characteristicIndex];
                var characteristicInfo = { uuid: characteristic.uuid, name: characteristic.name}


                //run an array of tasks
                async.series([

                  //for each characteristic, find descriptors.
                  function(callback) {
                    characteristic.discoverDescriptors(function(error, descriptors) {
                      //returns the first value that passes the test
                      async.detect(
                        //array of descriptors
                        descriptors,

                        //test
                        function(descriptor, callback) {
                          return callback(descriptor.uuid === '2901');
                        },


                        //result
                        function(userDescriptionDescriptor){
                          if (userDescriptionDescriptor) {
                            userDescriptionDescriptor.readValue(function(error, data) {
                              characteristicInfo['descriptor'] = data.toString();
                              callback();
                            });
                          } else {
                            callback();
                          }
                        }
                      );
                    });
                  },


                  function(callback) {
                    //add properties  
                    characteristicInfo['properties'] = characteristic.properties.join(', ');

                    if (characteristic.properties.indexOf('read') !== -1) {
                      characteristic.read(function(error, data) {
                        
                        if (data) {
                          var hex = data.toString('hex') 
                          var ascii = ' \'' + data.toString('ascii') + '\'';

                          characteristicInfo['value'] = hex;
                        }
                        callback();
                      });
                    } else {
                      callback();
                    }
                  },


                  //iterate in the characteristics array
                  function() {
                    console.log(characteristicInfo);
                    characteristicIndex++;
                    callback();
                  }
                ]);
              },

              //iterate in the service array
              function(error) {
                serviceIndex++;
                callback();
              }
            );
          });
        },
        // on error (it happens when it goes to sleep? or after it sent all data? disconnect)
        function (err) {
          console.log(err);    
          peripheral.disconnect();
        }
      );
    });
  });


}








