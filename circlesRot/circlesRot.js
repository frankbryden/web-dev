var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext('2d');

var radius = 7;
var baseOpacity = 0.1;
var trailCount = 10;
var trailAngleDiff = 10;

canvas.width = window.innerWidth - 10;
canvas.height = window.innerHeight - 10;

const mouse = {
    x: innerWidth / 2,
    y: innerHeight / 2
}

const colours = ['#e842f4', '#162a99', '#ce1053', '#36a00cx']

// Event Listeners
addEventListener('mousemove', event => {
    mouse.x = event.clientX
    mouse.y = event.clientY
})

// Utility Functions
function randInt(min, max) {
    let r = Math.floor(Math.random() * (max - min + 1) + min);
    //console.log("Rand number between " + min + " and " + max + " = " + r);
    //return Math.floor(Math.random() * (max - min + 1) + min);
    return r;
}

function randSmallInt(min, max) {
    let r = Math.floor((Math.random() * (max - min + 1) + min + 0.00001) * 100)/100;
    console.log("Small Rand number between " + min + " and " + max + " = " + r);
    //return Math.floor(Math.random() * (max - min + 1) + min);
    return r;
}

function randomColour(colours) {
    return colours[Math.floor(Math.random() * colours.length)]
}

function distance(x1, y1, x2, y2) {
    const xDist = x2 - x1
    const yDist = y2 - y1

    return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2))
}

function connectNodes(node1, node2){
  ctx.beginPath();
  ctx.moveTo(node1.x, node1.y);
  ctx.lineTo(node2.x, node2.y);
  ctx.strokeStyle = "black";
  ctx.stroke();
  ctx.closePath();
}


function Circ (x, y, dist, torque, radius, colour){
  this.polar = {
    theta : 0,
    radius : dist
  };
  this.x = x;
  this.y = y;
  this.torque = torque;
  this.opacity = baseOpacity;
  //console.log("Created a node with x = " + this.x + " y = " + this.y + " vel x = " + this.velocity.x + " velY = " + this.velocity.y);
  this.radius = radius;
  this.inEffect = false;
  this.colour = colour;
  this.update = function(){
    this.polar.theta += this.torque;
    if (this.polar.theta >= 2 * Math.PI){
      this.polar.theta = 0;
    }
    
    this.draw();
  }
  
  this.getX = function(angleDiff){
    return this.x + Math.cos(this.polar.theta - angleDiff) * this.polar.radius;
  }
  
  this.getY = function(angleDiff){
    return this.y + Math.sin(this.polar.theta - angleDiff) * this.polar.radius;
  }
  
  this.draw = function(){
    for (var i = 0; i < trailCount; i++){
      ctx.save();
      ctx.beginPath();
      if (this.torque > 0){
        ctx.arc(this.getX(i/trailAngleDiff), this.getY(i/trailAngleDiff), this.radius, 0, 2*Math.PI, false);
      } else {
        ctx.arc(this.getX(-i/trailAngleDiff), this.getY(-i/trailAngleDiff), this.radius, 0, 2*Math.PI, false);
      }
      ctx.fillStyle = this.colour;
      ctx.globalAlpha = 1 - 0.9*(i/trailCount);
      ctx.fill();
      if (i < trailCount - 1){
        ctx.closePath();
        ctx.beginPath();
        ctx.globalAlpha /= 2;
        ctx.moveTo(this.getX(i/trailAngleDiff), this.getY(i/trailAngleDiff));
        ctx.lineTo(this.getX((i + 1)/trailAngleDiff), this.getY((i + 1)/trailAngleDiff));
        ctx.strokeStyle = this.colour;
        ctx.stroke();
        ctx.closePath();
      } else {
        ctx.closePath();
      }
      ctx.restore();
    }
    
    /*ctx.beginPath();
    ctx.arc(this.x, this.y, this.polar.radius, 0, 2*Math.PI, false);
    ctx.stroke();
    ctx.closePath();*/
    //console.log("Drawing circle at x = " + this.getX() + " and y = " + this.getY() + " with radius "+ this.radius);
  }
}


var circleArray = [];
var circ = new Circ(canvas.width/2, canvas.height/2, 100, 0.1, 20, colours[0]);
function init(){
  for (var i = 1; i < 15; i++){
    //circleArray.push(new Circ(canvas.width/2, canvas.height/2, 10*i, Math.random()/10, 7, colours[0]));
    circleArray.push(new Circ(canvas.width/2, canvas.height/2, 10*i, Math.random()/5, 7, 'rgb(230, 80, ' + 25*i + ')'));
  }
}

function animate(){
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //circ.update();
  for (var i = 0; i < circleArray.length; i++){
    circleArray[i].update();
  }
}

init();
animate();