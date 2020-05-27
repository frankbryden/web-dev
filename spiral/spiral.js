var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext('2d');

var radius = 7;
var effectRadius = 150;
var baseOpacity = 0.1;

var fibo = [];

var drawnTime = 20;

var spawnPoints = [];
var currentSpawnPoint = 0;

var spirals = [];

var currentMode;


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

canvas.width = window.innerWidth - 10;
canvas.height = window.innerHeight - 10;

function randInt(min, max) {
    let r = Math.floor(Math.random() * (max - min + 1) + min);
    return r;
}

const mouse = {
    x: innerWidth / 2,
    y: innerHeight / 2
};

function getRandColour(){
  return 'rgb(' + randInt(0, 255) + ',' + randInt(0, 255) + ',' + randInt(0, 255) + ')';
}

const colours = ['#e842f4', '#162a99', '#ce1053', '#36a00cx'];

// Event Listeners
addEventListener('mousemove', event => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    
});

addEventListener('click', event => {
  spawnSpiral(event.clientX, event.clientY);
});

addEventListener('resize', function(event){
  canvas.width = window.innerWidth - 10;
  canvas.height = window.innerHeight - 10;
});

function generateFibo(n){
  var current = 1;
  var previous = 1;
  fibo.push(previous);
  fibo.push(current);
  for (var i = 0; i < n; i++){
    var tmp = current;
    current = previous + current;
    fibo.push(current);
    previous = tmp;
  }
}


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
}


function Spiral(x, y, angularStep, end){
  
  this.update = function(){
    if (this.state == States.TRACING){
      this.theta += this.angularStep;
      this.theta = this.theta % (2*Math.PI);
      this.currentStep += this.radialStep;
      this.currentPoint = this.getPoint();
      this.lines.push(new Line(this.previousPoint.x, this.previousPoint.y, this.currentPoint.x, this.currentPoint.y, 'rgb(' + Math.floor(this.startRed) + ', 0, ' + (255 - Math.floor(this.startRed)) + ')'));
      this.previousPoint = this.currentPoint;
      this.startRed -= this.redStep;
      this.draw();
      if (this.currentStep > this.end){
        this.state = States.DRAWN;
      }
    } else if (this.state == States.DRAWN){
      this.drawnTimer--;
      if (this.drawnTimer <= 0){
        this.state = States.ERASING;
      }
    } else if (this.state == States.ERASING){
      this.currentStep--;
      if (this.currentStep <= 0){
        this.state = States.DONE;
      }
    } else if (this.state == States.DONE){
      
    }
    
    this.draw();
  };
  
  this.rotate = function(){
    this.currentAngularRot += this.angularRotStep;
    this.currentAngularRot = this.currentAngularRot % (2*Math.PI);
  };
  
  this.getPoint = function(theta, pointNumber){
    var x = this.x + Math.cos(this.theta) * this.currentStep;
    var y = this.y + Math.sin(this.theta) * this.currentStep;
    return new Point(x, y);
  };
  
  this.draw = function(){
    ctx.save();
    //console.log("here");
    for (var i = 0; i < this.currentStep; i++){
      ctx.beginPath();
      ctx.moveTo(this.lines[i].x1, this.lines[i].y1);
      ctx.lineTo(this.lines[i].x2, this.lines[i].y2);
      ctx.strokeStyle = this.lines[i].colour;
      ctx.stroke();
    }
    ctx.restore();
  };
  
  this.x = x;
  this.y = y;
  this.theta = 0;
  this.angularStep = angularStep;
  this.radialStep = this.angularStep / (Math.PI/6);
  this.end = end;
  this.drawSpeed = 0.1;
  this.currentStep = 0;
  this.drawnTimer = drawnTime;
  this.currentAngularRot = 0;
  this.angularRotStep = Math.PI/12;
  this.lines = [];
  this.state = States.TRACING;
  this.previousPoint = this.getPoint();
  this.startRed = 255;
  this.redStep = 220/this.end;
  
  
}


function spawnSpiral(x, y){
  spirals.push(new Spiral(x, y, Math.PI/8, 200));
}

function init(){
  generateFibo(100);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var count = 0;
var spiral = new Spiral(300, 300, Math.PI/12, 100);
var currentMode = Modes.SINGLE;


function animate(){
  //console.log(spawnPoints);
  //count++;
  if (count < 50){
    requestAnimationFrame(animate);
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (var i = 0; i < spirals.length; i++){
    spirals[i].update();
  }
}

init();
animate();
