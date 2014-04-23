$( document ).ready(function() {
   $("#content").append( "<p>Test</p>" );
});

$(document).click(function(){
    sendmessage();
});


console.log("hi");






var socket = io.connect('http://localhost:8080/');
			
socket.on('connect', function() {
    console.log("Connected");
});

// Receive a message
socket.on('message', function(data) {
    console.log("Got: " + data);
    $("#content").append(data);
});

// Receive from any event
socket.on('rssi', function (data) {
console.log(data);
});

socket.on('disconnect', function () {
console.log("Disconnected");
});    

			


var sendmessage = function() {
    var message = $("#content").html();
    console.log("Sending: " + message);

    // Send a messaage
    socket.send(message);
};