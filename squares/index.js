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

class AnimatedSquare {
    constructor(ctx, x, y, width, stepCount, angle) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.stepCount = stepCount;
        this.stepSize = width/stepCount;
        console.log(`StepCount = ${stepCount}, stepSize = ${this.stepSize}, width = ${width}`);
        this.step = 0;
        this.lines = {
            top: this.createLine(this.x, this.y, this.x, this.y, angle),
            right: this.createLine(this.x + this.width, this.y, this.x, this.y, angle+Math.PI/2),
            bottom: this.createLine(this.x + this.width, this.y + this.width, this.x, this.y, angle+Math.PI),
            left: this.createLine(this.x, this.y + this.width, this.x, this.y, angle-Math.PI/2),
        };
        console.log(this.lines);
    }

    createLine(start_x, start_y, end_x, end_y, angle) {
        return {
            start: {
                x: start_x,
                y: start_y,
            },
            end: {
                x: end_x,
                y: end_y,
            },
            vel_x: Math.cos(angle)*this.stepSize,
            vel_y: Math.sin(angle)*this.stepSize,
            angle: angle,
        }
    }

    update() {
        if (this.step < this.stepCount){
            this.step += this.stepSize;
        }
    }

    render() {
        // for (let line of Object.values(this.lines)) {
        for (let lineName of Object.keys(this.lines)) {
            let line = this.lines[lineName];
            this.ctx.beginPath()
            this.ctx.moveTo(line.start.x, line.start.y);
            this.ctx.lineTo(line.start.x + (this.step*line.vel_x), line.start.y + (this.step*line.vel_y));
            this.ctx.fillText(`${lineName} with angle ${line.angle}`, line.start.x + (this.step*line.vel_x), line.start.y + (this.step*line.vel_y) - line.start.y/10);
            this.ctx.stroke();
        }
        // this.ctx.beginPath();
        // this.ctx.rect(this.x, this.y, this.width, this.width);
        // this.ctx.stroke();
    }

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
let square = new AnimatedSquare(ctx, 300, 300, 100, 200, 0);
let square2 = new AnimatedSquare(ctx, 800, 300, 100, 200, Math.PI);
let squares = [];
function init(){
    for (let i = 0; i < 10; i += 1) {
        squares.push(new AnimatedSquare(ctx, i * 100, i * 100, 80, 50, i * (2*Math.PI/10)));
    }
}

function animate(){
    // requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // for (let square of squares) {
    //     square.update();
    //     square.render();
    // }

    square.update();
    square.render();
    square2.update();
    square2.render();
}

init();
animate();

setInterval(animate, 10);