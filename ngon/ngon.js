var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext('2d');


var cvs = document.createElement('canvas');


var currentMode;

var drag = false;
var roadPaths = [];
var lastMouseDown = 0;
var particles = [];
var explosions = [];

var States = {
  TRACING : 1,
  DRAWN : 2,
  ERASING : 3,
  DONE : 4,
  ERASE_TIMER : 5
};

var Modes = {
  AUTO : 1,
  FIXED : 2,
  SINGLE : 3,
  FOLLOW : 4
};

var roadLength = 50;

canvas.width = window.innerWidth - 10;
canvas.height = window.innerHeight - 10;

function randInt(min, max) {
    let r = Math.floor(Math.random() * (max - min + 1) + min);
    return r;
}

function dist(x1, y1, x2, y2){
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

const mouse = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
};

function getRandColour(){
  return 'rgb(' + randInt(0, 255) + ',' + randInt(0, 255) + ',' + randInt(0, 255) + ')';
}

const colours = ['#e842f4', '#162a99', '#ce1053', '#36a00cx'];

// Event Listeners
addEventListener('mouseup', event => {
    console.log("Mouse up");
    drag = false;

});

addEventListener('mousedown', event => {
    console.log("Mouse down");
    

});

addEventListener('mousemove', event => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    //spawnParticle(mouse.x, mouse.y);
});

addEventListener("keydown", event => {
  console.log(event);
  if (event.key == "w"){
    myGon.n += 1;
    myGon.init();
  } else if (event.key == "q"){
    if (myGon.n > 2){
      myGon.n -= 1;
      myGon.init();
    }
    
    
  }
});

addEventListener('click', event => {
  //spawnSpiral(event.clientX, event.clientY);
  //spawnDot(mouse.x, mouse.y);
  console.log("click");
  spawnExplosion(event.clientX, event.clientY);
});

addEventListener('resize', function(event){
  canvas.width = window.innerWidth - 10;
  canvas.height = window.innerHeight - 10;
});



function getAngle(a){
  var diff = 0.05;
  var angles = {
    "PI/3": Math.PI/3,
    "2 * Pi/3" : 2 * Math.PI/3,
    "2 * Pi" : 2 * Math.PI,
    "7 * Pi/6" : 7 * Math.PI/6,
    "11 * Pi/6" : 11 * Math.PI / 6,
    "Pi/2" : Math.PI/2,
    "Pi": Math.PI,
    "3 * Pi/2" : 3 * Math.PI/2,
    "0" : 0
  };
  for (var ang in angles){
    if (a > angles[ang] - diff && a < angles[ang] + diff){
      return ang;
    }
  }
  return "We don't have that angle (" + a + ")... :/";
}

function Point(x, y){
  this.x = x;
  this.y = y;
}

function Line(x1, y1, x2, y2, colour){
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
  this.colour = colour;

  this.draw = function(){
    ctx.beginPath();
    ctx.moveTo(this.x1, this.y1);
    ctx.lineTo(this.x2, this.y2);
    ctx.stroke();
  };
}

function Colour(r, g, b){
  this.r = r;
  this.g = g;
  this.b = b;
  
  this.getCSSCol = function(){
    return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
  };
}

function Particle(x, y, angle, vel, lifetime){
  this.x = x;
  this.y = y;
  this.angle = angle;
  this.vel = vel;
  this.radius = 2;
  this.lifetime = lifetime;
  this.dead = false;
  
  this.update = function(){
    this.x += Math.cos(this.angle)*this.vel;
    this.y += Math.sin(this.angle)*this.vel;
    
    this.lifetime--;
    if (this.lifetime <= 0){
      this.dead = true;
    }
    
    this.draw();
  };
  
  this.draw = function(){
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
    ctx.save();
    ctx.fillStyle = this.colour;
    ctx.fill();
    ctx.restore();
  };
  
  this.isDead = function(){
    return this.dead;
  };
  
}

function Ngon(x, y, radius, n){
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.n = n;
  
  this.init = function(){
    this.lineLength = Math.tan((Math.PI)/this.n)*this.radius*2;
    console.log("petal width : " + this.petalWidth);
    this.angStep = (2*Math.PI)/this.n;
    this.lines = [];
  
    for (var i = 0; i < this.n; i++){
      var startAng = this.angStep * i;
      var endAng = this.angStep * (i+1);
      this.lines.push(new Line(this.x + Math.cos(startAng) * this.radius, this.y + Math.sin(startAng) * this.radius, this.x + Math.cos(endAng) * this.radius, this.y + Math.sin(endAng) * this.radius, null));
      console.log("creating petal with ang " + this.angStep*i);
    }
    /*this.petals = [];
    this.petals.push(new Petal(this, Math.PI/2, 100, this.radius));
    this.petals.push(new Petal(this, 0, 100, this.radius));
    this.petals.push(new Petal(this, Math.PI, 100, this.radius));
    this.petals.push(new Petal(this, 3*Math.PI/2, 100, this.radius));*/
  };
  
  this.update = function(){
    for (var i = 0; i < this.lines.length; i++){
      this.lines[i].draw();
    }
  };
  
  this.isDead = function(){
    return this.particles.length == 0;
  };
}

function init(){

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var count = 0;
var currentMode = Modes.SINGLE;
var myGon = new Ngon(200, 200, 150, 4);
myGon.init();

function animate(){
  //console.log(spawnPoints);
  //count++;
  if (count < 200){
    requestAnimationFrame(animate);
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  myGon.update();
  //ctx.arc(200, 200, 50, 0, 2*Math.PI, false);
  //ctx.fill();
  var i = explosions.length;
  while (i--){
    //explosions[i].update();
  }
  
}

init();
animate();

var col = new Colour(200, 200, 200);