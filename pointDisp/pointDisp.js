var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext('2d');


var cvs = document.createElement('canvas');
/*img.crossOrigin = "";*/


var currentMode;

var img;
var rendering = false;

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

function readSingleFile(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = e.target.result;
    img = parseImgRgb(contents);
    //renderImg(img);
  };
  reader.readAsText(file);
}

// Event Listeners
document.getElementById('file-input')
  .addEventListener('change', readSingleFile, false);
  
document.getElementById("renderBtn").addEventListener("click", () => renderImg(img));
document.getElementById("renderAsyncBtn").addEventListener("click", startBatch);



addEventListener('mouseup', event => {
    console.log("Mouse up");
    drag = false;

});

addEventListener('resize', function(event){
  canvas.width = window.innerWidth - 10;
  canvas.height = window.innerHeight - 10;
  console.log("width : " + canvas.width);
});

class Image {
  constructor(rows){
    this.rows = rows;
    this.width = rows[0].length;
    this.height = rows.length;
  }
}

class Pixel {
  constructor(r, g, b){
    this.col = new Colour(r, g, b);
  }
  
  get val(){
    return this.col.getCSSCol();
  }
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
  this.a = 1;
  
  this.getCSSCol = function(){
    return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";// + ", " + this.a + ")";
  };
}

class RenderBatch {
  constructor(img, batchStep){
    this.x = 0;
    this.y = 0;
    this.img = img;
    this.pixWidth = canvas.width/img.width;
    this.pixHeight = canvas.height/img.height;
    this.renderStep = batchStep;
    this.done = false;
  }
}

function startBatch(){
  //If we don't have an img or if we're already rendering, then skip render request
  if (!img || rendering){
    return;
  }
  let step = document.getElementById("batchStep").value;
  console.log(step);
  renderImgAsync(new RenderBatch(img, step));
}

function parseImg(data){
  let lines = data.split("\n"); //"0,1,2"
  let ints_lines = lines.map(line => line.split(",")); // [0,1,2],[0,3,4],[4,5,6]
  let rows = ints_lines.map(int_line => int_line.map(int => new Pixel(int, int, int)));
  console.log(rows);
  return new Image(rows);
}

function parseImgRgb(data){
  //Input : (0, 0, 0),(0, 0, 0),...(list of those on lines)
  let lines = data.split("\n"); //"0,1,2"
  console.log(lines);
  let ints_lines = lines.map(line => {
    let rgbRaw = line.split("),"); //(0,1,2
    console.log(rgbRaw);
    let pixels = rgbRaw.map(rawRgb => {
      let rawParts = rawRgb.substring(1).split(",");
      return new Pixel(parseInt(rawParts[0]), parseInt(rawParts[1]), parseInt(rawParts[2]));
    });
    return pixels;
  });
  console.log(ints_lines);
  let rows = ints_lines.map(int_line => int_line.map(int => new Pixel(int, int, int)));
  //console.log(rows);
  return new Image(ints_lines);
}

function renderImg(img){
  if (!img){
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let pixWidth = canvas.width/img.width;
  let pixHeight = canvas.height/img.height;
  
  let y = 0;
  for (let row of img.rows){
    let x = 0;
    for (let pix of row){
      ctx.fillStyle = pix.val;
      ctx.fillRect(x*pixWidth, y*pixHeight, pixWidth, pixHeight);
      console.log("Drawing rect " + pixWidth + "x" + pixHeight + " with style " + pix.val + " at x " + x + " and y " + y);
      x += 1;
    }
    y += 1;
  }
  
  //ctx.fillRect(0, 0, 200, 200);
  
}


function renderImgAsync(batch){
  //console.log(batch.y + ", " + batch.img.height + ", " + batch.img.rows.length + ", " + batch.done);
  for (let i = 0; i < batch.renderStep; i++){
    let pix = batch.img.rows[batch.y][batch.x];
    ctx.fillStyle = pix.val;
    ctx.fillRect(batch.x*batch.pixWidth, batch.y*batch.pixHeight, batch.pixWidth, batch.pixHeight);
    batch.x++;
    if (batch.x == batch.img.width){
      batch.x = 0;
      batch.y++;
      if (batch.y == batch.img.height){
        batch.done = true;
        break;
      }
    }
    
  }
  //ctx.fillRect(0, 0, 200, 200);
  if (!batch.done){
    requestAnimationFrame(function(){renderImgAsync(batch)});
  } else {
    rendering = false;
  }
}

function init(){

}

var count = 0;

function animate(){
  //console.log(spawnPoints);
  count++;
  /*if (count < 200){
    requestAnimationFrame(animate);
  }*/
  requestAnimationFrame(animate);
  
  //Updates
  world.update();
  
  //Rendering
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  world.render();

}


init();
