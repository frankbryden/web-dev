let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext('2d');

let slotColours = {1: 'rgb(160, 160, 160)', 2: 'rgb(64, 188, 80)', 5: 'rgb(17, 50, 196)', 10: 'rgb(168, 29, 214)', 50: 'rgb(214, 211, 47)', 100: 'rgb(205, 89, 247)'};

let States = {
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


function Ball(x, y, radius, ang, colour){
  this.update = function(delta){
    this.baseRadius = this.originalRadius + Math.sin(delta) * 10;
    this.radius = this.baseRadius + Math.sin(this.shift + delta) * 4;
    //console.log(this.radius);
  };
  this.getX = function(){
    return this.x + Math.cos(this.ang)*this.radius;
  };
  
  this.getY = function(){
    return this.y + Math.sin(this.ang)*this.radius;
  };
  
  this.draw = function(){
    ctx.beginPath();
    ctx.arc(this.getX(), this.getY(), 10, 0, 2*Math.PI, false);
    ctx.fillStyle = this.colour;
    ctx.fill();
  };
  
  
  this.x = x;
  this.y = y;
  this.shift = Math.random()*2*Math.PI;
  this.dir = "up";
  this.radius = radius;
  this.baseRadius = radius;
  this.originalRadius = radius;
  this.state = States.CALCULATING;
  this.colour = colour;
  this.ang = ang;
  
}

function Blob(x, y, radius, ballCount, colour){
  this.balls = [];
  this.ballCount = ballCount;
  this.delta = 0;//Math.random() * 2*Math.PI;
  this.count = 0;
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.colour = colour;
  
  this.spawnBalls = function(){
    this.balls = [];
    let angIncr = 2*Math.PI/this.ballCount;
    for (let i = 0; i < this.ballCount; i++){
      this.balls.push(new Ball(this.x, this.y, this.radius, angIncr*i, colour));
    }
  };
  
  this.update = function(){
    this.count++;
    if (this.count % 1 === 0){
      this.delta += 0.05;
      this.delta %= 2*Math.PI;
    }
    if (this.count %30 === 0){
      //this.ballCount = this.ballCounts[(this.ballCounts.indexOf(this.ballCount) + 1) % this.ballCounts.length];
      //this.ballCount--;
      //this.spawnBalls();
    }
    for (let ball of this.balls){
      ball.update(this.delta);
    }
    ctx.beginPath();
    ctx.moveTo(this.balls[0].getX(), this.balls[0].getY());
    ctx.lineWidth = 3;
    for (let i = 1; i < this.balls.length; i++){
      ctx.lineTo(this.balls[i].getX(), this.balls[i].getY());
    }
    ctx.closePath();
    //ctx.stroke();
    ctx.fillStyle = this.colour;
    ctx.fill();
  };
  
  this.draw = function(){
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillText("ball count : " + this.balls.length, 750, 50);
    /*for (let ball of this.balls){
      ball.draw();
    }*/
  };
}

function init(){

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let count = 0;
//Cool values : 80
let blob = new Blob(200, 200, 150, 30, "rgb(200, 100, 90)");
blob.spawnBalls();
console.log("Spawned balls");

function animate(){
  //console.log(spawnPoints);
  //count++;
  if (count < 5){
    requestAnimationFrame(animate);
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  blob.update();
  //wave2.update();
  blob.draw();
  //wave2.draw();
  //ctx.fillText("Wave 1 detla : " + wave.delta, 750, 150);
  //ctx.fillText("Wave 2 detla : " + wave2.delta, 750, 200);
}

init();
animate();
