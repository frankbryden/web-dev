var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext('2d');

var slotColours = {1: 'rgb(160, 160, 160)', 2: 'rgb(64, 188, 80)', 5: 'rgb(17, 50, 196)', 10: 'rgb(168, 29, 214)', 50: 'rgb(214, 211, 47)', 100: 'rgb(205, 89, 247)'};

var States = {
  TRACING : 1,
  DRAWN : 2,
  ERASING : 3,
  DONE : 4,
  ERASE_TIMER : 5
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
  
});

addEventListener('resize', function(event){
  canvas.width = window.innerWidth - 10;
  canvas.height = window.innerHeight - 10;
});


function Ball(x, y, radius, colour, height){
  this.update = function(delta){
    let val = this.x + delta;
    let normalised = val % (2*Math.PI);
    if (normalised > Math.PI/2 && normalised < 3*Math.PI/2){
      this.colour = "rgb(134, 137, 142)";
    } else {
      this.colour = "rgb(0, 0, 0)";

    }
    this.y = Math.sin(val) * (this.height/2);
    //-0.8...-0.9...-0.95..-0.94...-0.9..-0.8 never reaches -1 because we do incremental steps
    this.y += this.height/2;
  };
  this.getX = function(ang){
    return this.x;
  };
  
  this.getY = function(ang){
    return this.y;
  };
  
  this.draw = function(){
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI, false);
    ctx.fillStyle = this.colour;
    ctx.fill();
    //console.log("Drawing ball at " + this.x + "; " + this.y + " and radius " + this.radius);
  };
  
  
  this.x = x;
  this.y = y;
  this.dir = "up";
  this.radius = radius;
  this.state = States.CALCULATING;
  this.colour = colour;
  this.height = height;
  
}

function Wave(width, height, counts, colour){
  this.balls = [];
  this.ballCounts = counts;
  this.ballCount = this.ballCounts[0];
  this.width = width;
  this.height = height;
  this.delta = 0;//Math.random() * 2*Math.PI;
  this.count = 0;
  
  this.spawnBalls = function(){
    this.balls = [];
    for (var i = 0; i < this.ballCount; i++){
      this.balls.push(new Ball(this.width/this.ballCount*i, 0, 8, colour, this.height));
    }
  };
  
  this.update = function(){
    this.count++;
    if (this.count % 2 === 0){
      this.delta += 0.04;
      this.delta %= 2*Math.PI;
    }
    if (this.count %30 === 0){
      //this.ballCount = this.ballCounts[(this.ballCounts.indexOf(this.ballCount) + 1) % this.ballCounts.length];
      //this.ballCount--;
      this.spawnBalls();
    }
    for (var ball of this.balls){
      ball.update(this.delta);
    }
    for (var i = 0; i < this.balls.length - 2; i+=2){
      ctx.beginPath();
      ctx.moveTo(this.balls[i].x, this.balls[i].y);
      ctx.lineTo(this.balls[i + 1].x, this.balls[i + 1].y);
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  };
  
  this.draw = function(){
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillText("ball count : " + this.balls.length, 750, 50);
    for (var ball of this.balls){
      ball.draw();
    }
  };
}

function init(){

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var count = 0;
//Cool values : 80
var wave = new Wave(canvas.width, canvas.height, [94]);
var wave2 = new Wave(700, 200, [84]);
wave.delta = 0;
wave2.delta = 1.5;
wave.spawnBalls();
console.log("Spawned balls");

function animate(){
  //console.log(spawnPoints);
  //count++;
  if (count < 5){
    requestAnimationFrame(animate);
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  wave.update();
  //wave2.update();
  wave.draw();
  //wave2.draw();
  //ctx.fillText("Wave 1 detla : " + wave.delta, 750, 150);
  //ctx.fillText("Wave 2 detla : " + wave2.delta, 750, 200);
}

init();
animate();
