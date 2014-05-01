function Mover() {
  this.position = new PVector(width/2,height/2);
  this.velocity = new PVector();
  this.acceleration = new PVector(-0.01, 0);
  this.topspeed = 1;  
}

Mover.prototype.update = function() {
  this.velocity.add(this.acceleration);
  this.velocity.limit(this.topspeed);
  this.position.add(this.velocity);  
}

Mover.prototype.display = function() {
    translate(this.position.x, this.position.y);
    imageMode(CENTER);
    image(img2, 100, 200);
    console.log("img2");


   // imageObj(this.position.x, this.position.y);
}

Mover.prototype.checkEdges = function() {

  if (this.position.x > width) {
    this.position.x = 0;
  } 
  else if (this.position.x < 0) {
    this.position.x = width;
  }

  if (this.position.y > height) {
    this.position.y = 0;
  } 
  else if (this.position.y < 0) {
    this.position.y = height;
  }
}


