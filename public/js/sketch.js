// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

var mover;
var mySound = new buzz.sound("/audio/owl.ogg", {
    formats: [ "ogg", "mp3", "aac", "wav" ],
    preload: true,
    autoplay: true,
    loop: false
});


var canvas;
var img2;
var backdrop;
var backdrop2;
var color;
var ctx;



function setup() {
  canvas = createCanvas(1231,748);
  mover = new Mover(); 

  img = createHTMLImage("http://stateofrelationships.com/wp-content/uploads/2014/05/desert_night.png");
  
// Here we call methods of each element to set the position and id.
  // Use view-source to look at the HTML generated from this code when you load the sketch in your browser.
  img.position(190, 50);
  img.size(200, AUTO);
  // Attach listeners for mouse events related to img.
  img.mousePressed(uniHide);


  backdrop =loadImage("img/desert_day.png");
  backdrop2 =loadImage("img/desert_night.png");
  img2 = loadImage("img/ant.png");
  console.log("img2 in setup");

  // backdrop.mousePressed(uniHide);

  canvas.position(0,0);
}

function draw() {

  context(canvas);

  imageMode(CENTER);
  // image(backdrop2, 400, 400, width, height);
  image(backdrop, 400, 400, width, height);
  image(img2, 1231, 748);
    //somehow changing this got rid of 2nd ant 

  mover.update();
  mover.checkEdges();
  mover.display(); 

}


function uniHide(){
  img.hide();
}


function uniShow(){
  img.show();
}

function mousePressed(){
  uniHide();
  // backdrop.tint(0, 153, 204, 126);
  background(200);
}




function keyPressed() {
  console.log("key is pressed");
  // tint();
  console.log("tint is here");
  
  // Using the third-party library to call play() on the buzz object
  mySound.play();
}




