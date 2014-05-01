//BACKPACK VARIABLES
var sessionStarted = false;
var backpackID = 0;
var sensorTag = [];
var page = 0;
var animateCharacter = false;
var makeSound = false;
var changeBackground = false;
var timer = 0;
var checkNight = false;
var checkDay = false;

function init(){
	//initializing the sensorTag array	
	var sensorTag1 = {
			id: 1,
			accelData: {},
			rssiData: {}
	};

	var sensorTag2 = {
			id: 2,
			accelData: {},
			rssiData: {}
	};


	var sensorTag3 = {
			id: 3,
			accelData: {},
			rssiData: {}
	};

	sensorTag.push(sensorTag1);
	sensorTag.push(sensorTag2);
	sensorTag.push(sensorTag3);
	console.log(sensorTag);
	
	endSession();
	
}

window.addEventListener('load', init, false);


//$( document ).ready(function() {
//	init();
//});


$(function(){
    $('#startSetup').click(function(){
		if(page == 0){
		$( 'body' ).css( "background-image", "url('/public/img/background.png')");
		$('#startSetup').remove();
		$('#container').append("<h1>Register your backpack</h1><p id='instructions'>Turn on your backpack</p><img id='backpack' src='/public/img/backpack2.gif'  width='100'/>");
		page++;
		}
	});
});

$(function(){
    $(document).click(function(){
		if(page ==2){			
			$('h1').html("Choose your character");
			$("#instructions").html("Every backpack comes with a hidden character. Pick yours:");
			$('.scene').each(function(){
				$(this).remove();	
			});	
			$('#container').append('<input type="image" id="character1" value="character1" src="img/anteater.png" class="character"/><input type="image" id="character2" value="character2" src="img/fox.png" class="character"/><input type="image" id="character3" value="character3" src="img/camel.png"class="character"/>');
			page++;
		}
		
		else if(page ==3){
			$('.character').each(function(){
				$(this).remove();	
			});	
			
			$('h1').html("Choose your sound");
			$("#instructions").html("What sound will your toy activate when you shake it?");
			$('#container').append('<div id="sounds"><button class="actions">Birds</button><button class="actions">Coyote Howl</button><button class="actions">Owl</button></div>');
			page++;
		}
		else if(page==4){
			$('.sound').each(function(){
				$(this).remove();	
			});	
			$('#sounds').remove();	

			$('h1').html("Start Playing");
			$("#instructions").html("Are you ready to have some fun?");
			$('#container').append('<div id="action"><button class="actions" id="startSession">START</button><button class="actions">REGISTER + BACKPACKS</button></div>');
			page++
		}
		
	});
});



$(function(){
    $(document).on('click', '#startSession', function(){
		$('#container').remove();
		$('body').css("background-image", "url('/public/img/desert_day.png')");
		$('body').append('<button class="actions" id="back">BACK</button>');
		$('body').append('<img id="littleguy" src="img/ant.png" />');
		$('#littleguy').css('width', '300px');
		$('#littleguy').css('margin-top', '520px');
		$('#littleguy').css('position', 'absolute');
		$('#littleguy').css('margin-left', '650px');
		//setupAnimation();
		startSession();
		animate();

	});
});

$(function(){
    $(document).on('click', '#back', function(){
		$( 'body' ).css( "background-image", "url('/public/img/background.png')");
		$('#back').remove();
		$('#animation').remove();
		$('body').append("<div id='container'><h1>Register your backpack</h1><p id='instructions'>Turn on your backpack</p><img id='backpack' src='/public/img/backpack2.gif'  width='100'/></div>");
		page = 1;
		backpackID = 0;
		endSession();
	});
});


var chooseScenario = function(){
	$('h1').html("Choose your scene");
	$("#instructions").html("Backpack 1 is synced! Select a scenario for it:");
	$('#backpack').remove();
	$('#container').append('<input type="image" id="scene1" value="scene1" src="img/scene1.png" class="scene"/><input type="image" id="scene2" value="scene2" src="img/scene2.png" class="scene"/><input type="image" id="scene3" value="scene3" src="img/scene3.png" class="scene"/>');
}


var littleGuyWalking = function(){
	var acceleration = 5;
	var position = parseInt($('#littleguy').css("margin-left"));
	position -= acceleration;
	$('#littleguy').css("margin-left", position);
	
	if(position < -1000){
		animateCharacter = false;
		$('#littleguy').css("margin-left", "650px");

	}
}


var changeBgImg = function(){
	if(changeBackground){
		$( 'body' ).css( "background-image", "url('/public/img/desert_night.png')");
	}
	else{
	$( 'body' ).css( "background-image", "url('/public/img/desert_day.png')");
	}
}
	

var animate = function(){
	if(sensorTag[0].rssiData > -40){
		animateCharacter=true;
	}
	
	var previousBg = changeBackground;
	
	if(	sensorTag[0].accelData.z < 70 && sensorTag[0].accelData.z > 50){
		changeBackground = true;
		timer++;
	}
	else{
		changeBackground = false;
		timer = 0;
	}
		
	if(previousBg != changeBackground){
		checkNight= true;
				console.log(previousBg);
				console.log(changeBackground);

	}
		
	if(checkNight){
		if(timer > 40){
			$( 'body' ).css( "background-image", "url('/public/img/desert_night.png')");
			checkNight = false;
			checkDay = true;
		}
	}

	if(checkDay){
		if(!changeBackground){
		console.log("checking timer");
			if(timer == 0){
				$( 'body' ).css( "background-image", "url('/public/img/desert_day.png')");
				checkDay = false;
			}		
		}	
	}
	

	
	if(animateCharacter){
		littleGuyWalking();
	}
	
	console.log(timer);
	//console.log($('#littleguy').css("margin-left"));
	if(backpackID != 0) window.requestAnimationFrame(animate);	
	
};





var socket = io.connect('http://localhost:8080/');

//ON CONNECTION
socket.on('connect', function() {
    console.log("Connected");
});


//RECEIVE DATA
socket.on('bluetooth', function (data) {
	alert(data);
}); 

//RECEIVE DATA
socket.on('backpack', function (data) {
	if(page == 1){
		chooseScenario();
		page++;
	}
	backpackID = data;
	//startSession();
});  


socket.on('sensorTag', function (data) {
	//var proximityData = map(data.rssiData, -45, -65, 1, 0);	
	for(var i = 0; i < sensorTag.length; i++){
		if(sensorTag[i].id == data.id){
			sensorTag[i].rssiData = data.rssiData;
			sensorTag[i].accelData = data.accelData;			
			//console.log(data.id+": "+data.accelData.z);

//			console.log(sensorTag[i].accelData.x);
//			console.log(sensorTag[i].accelData.y);
//			console.log(sensorTag[i].accelData.z);
//			console.log(sensorTag[i].rssiData);
		}
	}
	//console.log(sensorTag[0].accelData.z);
	//console.log(sensorTag[0].accelData.z);

});  


//ON DISCONNECT
socket.on('disconnect', function () {
	console.log("Disconnected");
	alert("Server is down!");
});    


//SENDING DATA
var startSession = function(){
	sessionStarted = true;
	socket.emit('sessionStart', sessionStarted);
};

var endSession = function(){
	sessionStarted = false;
	socket.emit('sessionStart', sessionStarted);
};


//OTHER FUNCTIONS
function map(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}
//
//
//
//
//// var audio = document.getElementById("myaudio");
//
//var event = new Event("audioGo");
//
//event.which=0;
//
//function audioBun(event) {
//
//var key = (event) ? event.which : event.keyCode;
//if (String.fromCharCode(key)=="g"){
//
//	document.getElementById('myaudio').play();
//	console.log("Im in the audio function");
//
//}
//else if (String.fromCharCode(key)=="h"){
//
//	document.getElementById('myaudio').pause();
//	console.log("Im in the audio function");
//
//}
//
//}