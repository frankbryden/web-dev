var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext('2d');


var cvs = document.createElement('canvas');
/*img.crossOrigin = "";*/


var currentMode;

const DROP_SIZE = 9;

var States = {
  RUNNING : 1,
  JUMPING : 2,
  DUCKING : 3,
  STANDING : 4,
  ERASE_TIMER : 5,
  PLAYING : 6,
  GAME_OVER : 7,
  FLYING : 8
};

var Modes = {
  AUTO : 1,
  FIXED : 2,
  SINGLE : 3,
  FOLLOW : 4
};

/*
 * Easing Functions - inspired from http://gizma.com/easing/
 * only considering the t value for the range [0, 1] => [0, 1]
 */
Easings = {
  // no easing, no acceleration
  linear: function (t) { return t },
  // accelerating from zero velocity
  easeInQuad: function (t) { return t*t },
  // decelerating to zero velocity
  easeOutQuad: function (t) { return t*(2-t) },
  // acceleration until halfway, then deceleration
  easeInOutQuad: function (t) { return t<0.5 ? 2*t*t : -1+(4-2*t)*t },
  // accelerating from zero velocity
  easeInCubic: function (t) { return t*t*t },
  // decelerating to zero velocity
  easeOutCubic: function (t) { return (--t)*t*t+1 },
  // acceleration until halfway, then deceleration
  easeInOutCubic: function (t) { return t<0.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
  // accelerating from zero velocity
  easeInQuart: function (t) { return t*t*t*t },
  // decelerating to zero velocity
  easeOutQuart: function (t) { return 1-(--t)*t*t*t },
  // acceleration until halfway, then deceleration
  easeInOutQuart: function (t) { return t<0.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
  // accelerating from zero velocity
  easeInQuint: function (t) { return t*t*t*t*t },
  // decelerating to zero velocity
  easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
  // acceleration until halfway, then deceleration
  easeInOutQuint: function (t) { return t<0.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
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
});

/*addEventListener('mousemove', event => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    grid.mouseMove(mouse.x, mouse.y);
    //spawnParticle(mouse.x, mouse.y);
});*/

addEventListener('click', event => {
  //spawnSpiral(event.clientX, event.clientY);
  //spawnDot(mouse.x, mouse.y);
});

addEventListener('keydown', event => {
  world.keyPressed(event.code);
});

addEventListener('keyup', event => {
  world.keyReleased(event.code);
});

addEventListener('resize', function(event){
  canvas.width = window.innerWidth - 10;
  canvas.height = window.innerHeight - 10;
  console.log("width : " + canvas.width);
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


class Block{
  constructor(startDelta, y, col, speed){
    console.log(startDelta);
    this.startx = 100;
    this.endx = canvas.width - 100;
    this.x = this.startx;
    this.y = y || canvas.height / 2;
    this.size = 10;
    this.color = col || "rgb(100, 190, 60)";
    this.delta = startDelta || 0;
    this.dir = 1;
    this.speed = speed || 0.01;
  }
  
  update(){
    this.delta += this.speed;
    if (this.delta > 1){
      this.delta = 0;
      this.dir *= -1;
    }
    let perc = Easings.easeOutQuad(this.delta);
    let xShift = (this.endx - this.startx)*perc;
    if (this.dir > 0){
      this.x = this.startx + xShift;
    } else {
      this.x = this.endx - xShift;
    }
  }
  
  render(){
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    //console.log("Rect at " + this.x + "; " + this.y2 + " of dimension " + this.width + "x" + (this.y3 - this.y2));
  }
}


var count = 0;
//var block = new Block();
var blocks = [];
var blockCount = 40;


function init(){
  let yStep = (canvas.height - 100)/blockCount;
  for (let i = 0; i < blockCount; i++){
    let shift = i/blockCount;
    let col;
    let speed;
    if (i % 3 === 0){
      shift = 1 - shift;
      col = "rgb(200, 90, 150)";
      speed = 0.007;
    } else if (i % 3 == 1){
      shift += 0.5;
      if (shift > 1){
        shift -= 1;
      }
      speed = 0.013;
      col = "rgb(90, 200, 150)";
    }
    blocks.push(new Block(shift, 50 + yStep * i, col, speed));
  }
}


function animate(){
  //console.log(spawnPoints);
  count++;
  /*if (count < 200){
    requestAnimationFrame(animate);
  }*/
  requestAnimationFrame(animate);
  
  //Updates
  for (let block of blocks){
    block.update();
  }
  
  //Rendering
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let block of blocks){
    block.render();
  }
  //block.render();

}


init();
animate();
