var util = require('util');
var async = require('async');
var SensorTag = require('./index');
 

SensorTag.discover(function(sensorTag) {
	
	sensorTag.on('disconnect', function() {
		console.log('disconnected!');
    sensorTag.reconnect();
	});
	
	
	
    async.series([
      function(callback) {
        console.log('connect');
        sensorTag.connect(callback);
      },
      function(callback) {
        console.log('discoverServicesAndCharacteristics');
        sensorTag.discoverServicesAndCharacteristics(callback);
      },
      function(callback) {
        console.log('enableAccelerometer');
        sensorTag.enableAccelerometer(callback);
      },
      function(callback) {
        console.log('readAccelerometer');
        // sensorTag.readAccelerometer(function(x, y, z) {
        //   console.log('\tx = %d G', x.toFixed(1));
        //   console.log('\ty = %d G', y.toFixed(1));
        //   console.log('\tz = %d G', z.toFixed(1));
        //
        //   callback();
        // });
        sensorTag.on('accelerometerChange', function(x, y, z) {
          console.log('\tx = %d G', x.toFixed(1));
          console.log('\ty = %d G', y.toFixed(1));
          console.log('\tz = %d G', z.toFixed(1));
          console.log("------------------------------");

        });

        sensorTag.notifyAccelerometer(function() {
			console.log("notify");

        });

      }



    ]);
});