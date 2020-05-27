var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext('2d');


var cvs = document.createElement('canvas');
var img = document.getElementsByTagName("img")[0];   // your image goes here
console.log(img);
/*img.crossOrigin = "";*/


var currentMode;

const DROP_SIZE = 9;

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
    drops.push(new Drop(event.clientX, event.clientY, randInt(5, 20)/10, 10));
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
});

addEventListener('resize', function(event){
  canvas.width = window.innerWidth - 10;
  canvas.height = window.innerHeight - 10;
});



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
  this.a = 1;
  
  this.getCSSCol = function(){
    return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
  };
}

class Drop {
  constructor(x, y, vel, lifetime){
    this.x = x;
    this.y = y;
    this.vel = vel;
    this.trailLength = 16;
    this.lifetime = lifetime;
    this.blocks = [];
    this.col = new Colour(100, 90, randInt(0, 255));
    this.init();
  }
  
  init(){
    for (let i = 0; i < this.trailLength; i++){
      this.col.a -= 0.9/this.trailLength;
      this.blocks.push(new Block(this.x, this.y - i * DROP_SIZE, 0, this.vel, this.col.getCSSCol()));
    }
  }
  
  update(){
    this.blocks.map(block => {
      block.update();
      block.render();
    });
  }
  
}

class Block {
  constructor(x, y, velx, vely, col){
    this.x = x;
    this.y = y;
    this.velx = velx;
    this.vely = vely;
    this.col = col;
  }
  
  update(){
    this.x += this.velx;
    this.y += this.vely;
  }
  
  render(){
    ctx.fillStyle = this.col;
    ctx.fillRect(this.x, this.y, DROP_SIZE, DROP_SIZE);
  }
}
//jshhint ignore: end

function spawnParticle(x, y){
  particles.push(new Particle(x, y, Math.random()*2*Math.PI, Math.random()+0.5, 100));
}

function init(){

}

var drops = [];
var count = 0;
var currentMode = Modes.SINGLE;

function animate(){
  //console.log(spawnPoints);
  count++;
  /*if (count < 200){
    requestAnimationFrame(animate);
  }*/
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  /*if (count % 20 === 0){
    drops.push(new Block(-DROP_SIZE, randInt(0, canvas.height), randInt(50, 200)/100, 0, "rgb(10, 20, 190)"));
  }*/
  
  for (var drop of drops){
    drop.update();
    //drop.render();
  }
  
  ctx.fillText("Current block cout : " + drops.length, 10, 10);
}

init();
animate();
