var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext('2d');


var cvs = document.createElement('canvas');
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

class Grid {
  constructor(dotSize, count){
    this.dots = [];
    this.count = count;
    this.dotSize = dotSize;
    this.col = colours[randInt(0, colours.length)];
    this.init();
  }
  
  init(){
    let reqRatio = canvas.width/canvas.height;
    let closestRatio = 100000;
    let closestDiv = 1;
    let divs = [];
    console.log("Required ratio : " + reqRatio);
    for (let i = 0; i < this.count; i++){
      if (this.count % i === 0){
        divs.push([i, this.count/i]);
        let ratio = i/(this.count/i);
        if (Math.abs(ratio - reqRatio) < Math.abs(closestRatio - reqRatio)){
          closestRatio = ratio;
          closestDiv = i;
        }
      }
    }
    console.log("Best arrangement is " + closestDiv + "x" + (this.count / closestDiv) + " with an optimal ratio of " + closestRatio);
    
    let xCount = closestDiv;
    let yCount = this.count/closestDiv;
    let xSpacing = canvas.width / xCount;
    let ySpacing = canvas.height / yCount;
    let xMargin = xSpacing/2;
    let yMargin = ySpacing/2;
    
    console.log("Margin is " + xMargin);
    for (let x = 0; x < xCount; x++){
      for (let y = 0; y < yCount; y++){
        this.dots.push(new Dot(xMargin + x*xSpacing, yMargin + y*ySpacing, 10, this.col));
      }
      //this.blocks.push(new Block(this.x, this.y - i * DROP_SIZE, 0, this.vel, this.col.getCSSCol()));
    }
  }
  
  update(){
    this.dots.map(dot => {
      dot.render();
    });
  }
  
}

class Dot {
  constructor(x, y, radius, col){
    this.x = x;
    this.y = y;
    this.r = radius;
    this.ang = null;
    this.col = col;
  }
  
  update(){
    
  }
  
  render(){
    ctx.fillStyle = this.col;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
    ctx.fill();
  }
}

function init(){

}

var dots = [];
var grid = new Grid(10, 120);
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
  grid.update();
  
  ctx.fillText("Current block cout : ", 10, 10);
}

init();
animate();
