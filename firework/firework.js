var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext('2d');


var cvs = document.createElement('canvas');
var img = document.getElementsByTagName("img")[0];   // your image goes here
console.log(img);
/*img.crossOrigin = "";*/
window.onload = function(){
  console.log("Draw image");
  img.crossOrigin = "Anonymous";
  ctx.drawImage(img, 0, 0);
  cvs.width = img.width; cvs.height = img.height;
  var ctx2 = cvs.getContext("2d");
  ctx2.drawImage(img,0,0,cvs.width,cvs.height);
  var spotBaseImg = ctx2.getImageData(0,0,cvs.width,cvs.height);

};

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

function Explosion(x, y, partCount, radius){
  this.x = x;
  this.y = y;
  this.partCount = partCount;
  this.radius = radius;
  this.explosionTime = 50;
  this.particlesPerFrame = Math.round(this.partCount/this.explosionTime);
  this.particles = [];
  
  this.update = function(){
    var spawnedParticles;
    if (this.partCount > 0){
      spawnedParticles = Math.min(this.particlesPerFrame, this.partCount);
      for (var i = 0; i < spawnedParticles; i++){
        this.particles.push(new Particle(this.x, this.y, Math.random()*2*Math.PI, Math.round(Math.random()+2), 40 + Math.round(Math.random()*20)));
      }
    }
    
    this.partCount -= spawnedParticles;
    
    
    var i = this.particles.length;
    
    while(i--){
      this.particles[i].update();
      this.particles[i].draw();
      if (i > 1){
        ctx.moveTo(this.particles[i].x, this.particles[i].y);
        ctx.lineTo(this.particles[i - 1].x, this.particles[i - 1].y);
        ctx.stroke();
      }
      if (this.particles[i].isDead()){
        this.particles.splice(i, 1);
      }
    }
    ctx.font = "24px Georgia";
    ctx.fillText(this.particles.length, this.x + 100, this.y + 100);
  };
  
  this.isDead = function(){
    return this.particles.length == 0;
  }
}

function spawnParticle(x, y){
  particles.push(new Particle(x, y, Math.random()*2*Math.PI, Math.random()+0.5, 100));
}

function spawnExplosion(x, y){
  explosions.push(new Explosion(x, y, 150, 50));
}

function init(){

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var count = 0;
var currentMode = Modes.SINGLE;
var dots = [];
var indicesToRemove = [];

function animate(){
  //console.log(spawnPoints);
  //count++;
  if (count < 200){
    requestAnimationFrame(animate);
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  var i = explosions.length;
  while (i--){
    explosions[i].update();
    if (explosions[i].isDead()){
      explosions.splice(i, 1);
      continue;
    }
  }
  //road.draw();
}

init();
animate();

var col = new Colour(200, 200, 200);