var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext('2d');

var radius = 7;
var effectRadius = 150;
var baseOpacity = 0.1;

canvas.width = window.innerWidth - 10;
canvas.height = window.innerHeight - 10;

const mouse = {
    x: innerWidth / 2,
    y: innerHeight / 2
};

const colours = ['#e842f4', '#162a99', '#ce1053', '#36a00cx'];

// Event Listeners
addEventListener('mousemove', event => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

// Utility Functions
function randInt(min, max) {
    let r = Math.floor(Math.random() * (max - min + 1) + min);
    //console.log("Rand number between " + min + " and " + max + " = " + r);
    //return Math.floor(Math.random() * (max - min + 1) + min);
    return r;
}

function randSmallInt(min, max) {
    let r = Math.floor((Math.random() * (max - min + 1) + min + 0.00001) * 100)/100;
    //return Math.floor(Math.random() * (max - min + 1) + min);
    return r;
}

function randomColour(colours) {
    return colours[Math.floor(Math.random() * colours.length)];
}

function distance(x1, y1, x2, y2) {
    const xDist = x2 - x1;
    const yDist = y2 - y1;

    return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
}



function Node (x, y, velX, velY, radius, colour){
  this.x = x;
  this.y = y;
  this.velocity = {
    x: velX,
    y: velY
  };
  this.opacity = baseOpacity;
  //console.log("Created a node with x = " + this.x + " y = " + this.y + " vel x = " + this.velocity.x + " velY = " + this.velocity.y);
  this.radius = radius;
  this.inEffect = false;
  this.colour = colour;
  this.update = function(){
    
    if (this.x + radius >= canvas.width || this.x - radius <= 0){
      this.velocity.x *= -1;
    }
    
    if (this.y + radius >= canvas.height || this.y - radius <= 0){
      this.velocity.y *= -1;
    }
    
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    
    if (distance(this.x, this.y, mouse.x, mouse.y) < effectRadius){
      this.opacity += 0.03;
      this.inEffect = true;
    } else {
      this.inEffect = false;
      this.opacity = Math.max(this.opacity - 0.03, baseOpacity);
    }
    
    this.draw();
  };
  
  this.draw = function(){
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI, false);
    ctx.fillStyle = this.colour;
    ctx.fill();
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.closePath();
    //console.log("Drawing circle at x = " + this.x + " and y = " + this.y + " with radius " + this.radius);
  };
  
  this.collide = function(otherNode){
    var tempX = this.velocity.x;
    this.velocity.x = otherNode.velocity.x;
    otherNode.velocity.x = tempX;
    
    var tempY = this.velocity.y;
    this.velocity.y = otherNode.velocity.y;
    otherNode.velocity.y = tempY;
  };
}

function getDistance(node1, node2){
  return Math.sqrt(Math.pow(node1.x - node2.x, 2) + Math.pow(node1.y - node2.y, 2));
}


var nodeArray = [];

function init(){
  for (var i = 0; i < 30; i++){
    nodeArray.push(new Node(randInt(2 * radius, canvas.width - radius), randInt(2 * radius, canvas.height - 2 * radius), randSmallInt(-0.5, 0.5), randSmallInt(-0.5, 0.5), radius, randomColour(colours)));
  }
}

function animate(){
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let connectedNodes = [];
  for (var i = 0; i < nodeArray.length; i ++){
    nodeArray[i].update();
    if (nodeArray[i].inEffect){
      connectedNodes.push(nodeArray[i]);
    }
  }
}
init();
animate();