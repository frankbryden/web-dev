var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext('2d');

var nbPetTxt = document.getElementById("nbPetTxt");
var nbPetBtn = document.getElementById("nbPetBtn");
var heightPetTxt = document.getElementById("heightPetTxt");
var nbRadTxt = document.getElementById("nbRadTxt");
var rowColSelect = document.getElementById("rowCol");
var addRowBtn = document.getElementById("addRowBtn");
var saveCodeBtn = document.getElementById("saveCodeBtn");
var loadCodeBtn = document.getElementById("loadCodeBtn");
var selectBtnsDiv = document.getElementById("btnSelect");

var currentMode;

var drag = false;
var roadPaths = [];
var lastMouseDown = 0;
var particles = [];
var explosions = [];

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

var roadLength = 50;

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
    
    drag = false;

});

addEventListener('mousemove', event => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    //spawnParticle(mouse.x, mouse.y);
});


addEventListener('resize', function(event){
  canvas.width = window.innerWidth - 10;
  canvas.height = window.innerHeight - 10;
});

nbPetBtn.onclick = function(){
  flower.updatePetalCount(nbPetTxt.value);
};


nbPetTxt.oninput = function(){
  flower.updatePetalCount(nbPetTxt.value);
};

nbRadTxt.oninput = function(){
  flower.updateRowRadius(nbRadTxt.value);
  console.log(flower);
};

heightPetTxt.oninput = function(){
  flower.updatePetalHeight(heightPetTxt.value);
};

rowColSelect.oninput = function(){
  flower.updateRowColor(rowColSelect.value);
};


addRowBtn.onclick = function(){
  flower.addRow();
};

saveCodeBtn.onclick = function(){
  flower.generateSaveCode();
};


loadCodeBtn.onclick = function(){
  flower.loadSaveCode();
};


function updateGui(){
  nbPetTxt.value = flower.petalCount;
  heightPetTxt.value = flower.petalHeight;
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

function e(x){
  return Math.abs(((x) % 10)-(10/2));
}

function Animator(start, end, freq, rr, callback, clbCtx){
  this.start = start;
  this.end = end;
  this.amp = this.end - this.start;
  this.freq = freq;
  this.c = this.start;
  this.x = 0;
  this.dir = 1;
  this.callback = callback;
  this.clbCtx = clbCtx;
  this.running = false;
  this.lastCall = null;
  this.pollTime = rr;
  console.log("anim with function : abs(mod(" + this.freq + "x, " + this.amp + ") - " + (this.amp/2));
  
  this.run = function(){
    this.running = true;
    var _this = this;
    setTimeout(function(){_this.update();}, this.pollTime);
    let d = new Date();
    this.lastCall = d.getTime();
  };
  
  this.update = function(){
    //y=abs(mod(kx, n)-n/2)
    let d = new Date();
    this.x += (d.getTime() - this.lastCall)/1000;
    //console.log(this.x);
    this.lastCall = d.getTime();
    this.c = this.start + Math.abs(((this.freq*this.x) % this.amp)-(this.amp/2));
    this.callback(this.c, clbCtx);
    //flower.updatePetalHeight(this.c);
    if (this.running){
      var _this = this;
      setTimeout(function(){_this.update();}, this.pollTime);
    }
  };
  
  this.stop = function(){
    this.running = false;
  };
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
  
  this.getCSSCol = function(){
    return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
  };
}


function Petal(flower, a, w, h, radius, pistil){
  this.flower = flower;
  this.x = this.flower.x;
  this.y = this.flower.y;
  this.a = a;
  this.radius = radius;
  
  this.h = h;
  this.pistil = pistil;
  this.col = new Colour(randInt(0, 255), randInt(0, 255), randInt(0, 255)).getCSSCol();
  this.color = -1;
  
  this.update = function(){
    
    //direction pointer
    /*
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + Math.cos(this.a)*this.w, this.y - Math.sin(this.a)*this.w);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(this.x + Math.cos(this.a - 0.1)*this.w, this.y - Math.sin(this.a - 0.1)*this.w);
    ctx.lineTo(this.x + Math.cos(this.a + 0.1)*this.w, this.y - Math.sin(this.a + 0.1)*this.w);
    ctx.stroke();*/
    //console.log("we have a width : " + this.w);
    
    ctx.save();
    
    ctx.translate(this.x, this.y - 20);
    ctx.rotate(this.a);
    
    //Line debugging (under petal)
    /*
    ctx.beginPath();
    ctx.moveTo(-this.w/2, -this.radius);
    ctx.lineTo(this.w/2, -this.radius);
    ctx.stroke();
    */
    
    //left side of petal
    ctx.beginPath();
    ctx.moveTo(- this.w/2, -this.radius);
    ctx.quadraticCurveTo(this.cp.x, this.cp.y - this.radius, -this.w/4, -this.h/2 - this.radius);
    ctx.quadraticCurveTo(this.cp2.x, this.cp2.y - this.radius, 0, -this.h - this.radius);
    ctx.stroke();
    ctx.lineTo(0, 0);
    
    ctx.fillStyle = this.color;
    if (this.color != -1){
      ctx.fill();
    }
    
    
    //right side of petal
    ctx.beginPath();
    ctx.moveTo(this.w/2, -this.radius);
    ctx.quadraticCurveTo(this.cpR.x, this.cpR.y - this.radius, this.w/4, -this.h/2 - this.radius);
    ctx.stroke();
    ctx.quadraticCurveTo(this.cpR2.x, this.cpR2.y - this.radius, 0, -this.h - this.radius);
    ctx.stroke();
    ctx.lineTo(0, 0);
    
    ctx.fillStyle = this.color;
    if (this.color != -1){
      ctx.fill();
    }
    
    //pistil
    if (this.pistil){
      ctx.beginPath();
      ctx.moveTo(0, -this.radius);
      //ctx.lineTo(0, -this.radius - this.h/2);
      ctx.quadraticCurveTo(10, -this.radius - this.h/4, 0, -this.radius - this.h/2);
      ctx.stroke();
    }
    
    ctx.fillRect(0, 0, 20, 20);
    
    ctx.restore();
    //control points visualisation
    /*
    ctx.beginPath();
    ctx.arc(this.cp.x, this.cp.y, 5, 0, 2*Math.PI, false);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.cp2.x, this.cp2.y, 5, 0, 2*Math.PI, false);
    ctx.fill();*/
    
    //ctx.strokeStyle = "rgb(100, 10, 10)";
    
    //ctx.rotate(-this.a);
    //ctx.stroke();
    
  };
  
  this.resizeWidth = function(w){
    console.log("Resizing petal width from " + this.w + " to " + w);
    this.w = w;
    let _this = this;
    this.cp = {x: -_this.w/2, y: -_this.h/2};
    this.cp2 = {x: 0, y: -_this.h/2};
    this.cpR = {x: _this.w/2, y: -_this.h/2};
    this.cpR2 = {x: 0, y: -_this.h/2};
  };
  
  this.resizeHeight = function(h){
    this.h = h;
    this.resizeWidth(this.w);
  };
  
  this.resizeWidth(w);
}

function Flower(x, y, petalCount, radius, h){
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.petalCount = petalCount;
  this.petalWidth = (this.radius*2*Math.PI)/(4*this.petalCount);
  this.petalWidth = this.getPetalWidth;
  this.petalHeight = h;
  //default to inner row. Might wanna change this. (in case flower has no rows)
  this.selectedRow = 0;
  console.log("petal width : " + this.petalWidth);
  this.selectionButtons = [];
  this.petals = [];
  this.rows = [];
  
  this.init = function(){
    //console.log("init with count " + this.petalCount + " -> width is " + this.getPetalWidth(this.petalCount, this.radius));
    this.petals = [];
    this.angStep = (2*Math.PI)/this.petalCount;
    
    //inner
    for (var i = 0; i < this.petalCount; i++){
      //this.addPetal(0, this.angStep*i, this.petalHeight, 2*this.radius/5);
      console.log("original data used to determine width : " + this.petalCount + " along with " + (2*this.radius/5));
    }
    //this.autoAdjustRow(0);
    
    //outer 2
    /*
    for (var i = 0; i < this.petalCount; i++){
      this.addPetal(1, this.angStep*i, this.petalHeight, 2*this.radius/3);
    }
    var petalWidth = this.getPetalWidth(this.petalCount, 2*this.radius/3);
    this.resizeRow(1, petalWidth);
    
    //outer 1
    for (var i = 0; i < this.petalCount; i++){
      this.addPetal(2, this.angStep*i, this.petalHeight, this.radius);
    }
    var petalWidth = this.getPetalWidth(this.petalCount, this.radius);
    this.resizeRow(2, petalWidth);*/
  };
  
  this.addPetal = function(row, ang, height, radius){
    if (row > this.rows.length){
      console.error("row " + row + " is too high (" + row + " > " + this.rows.length + ")");
      return;
    } else if (row == this.rows.length){
      this.addRow();
    }
    console.log("creating petal with row id " + row + " and radius " + radius);
    this.rows[row].petals.push(new Petal(this, ang, 10, height, radius, (row == 0)));
    this.rows[row].radius = radius;
    
  };
  
  this.addRow = function(noFill){
    let radius;
    if (this.rows.length == 0){
      radius = this.radius;
    } else {
      radius = this.rows[this.rows.length - 1].radius + this.rows[this.rows.length - 1].petals[0].h;
    }
    
    this.rows.push({petals: [], radius: radius});
    if (noFill == undefined){
      this.defaultRow(this.rows.length - 1);
    }
    
    
    //add a button to enable selection of row.
    var button = document.createElement("button");
    button.innerHTML = "Row " + (this.rows.length - 1);
    button.classList.add("selectionButton");
    let _this = this;
    let _i = this.rows.length - 1;
    button.onclick = function(){
      _this.selectRow(_i);
    };
    this.selectionButtons.push(button);
    selectBtnsDiv.appendChild(button);
    
    //Once we've created a row, select it.
    this.selectRow(this.rows.length - 1);
  };
  
  this.defaultRow = function(row){
    if (this.rows[row].petals.length != 0){
      console.error("Row is already non-empty. no need to fill. -> " + (this.rows[row].petals.length));
      return;
    }
    
    let angleStep = (2*Math.PI)/8;
    
    //inner
    for (var i = 0; i < this.petalCount; i++){
      this.addPetal(row, angleStep*i, 80, (2 + this.rows.length - 1)*this.radius/5);
    }
    
    this.autoAdjustRow(row);
  }
  
  this.resizeRow = function(row, width){
    if (row > this.rows.length - 1){
      console.error("row " + row + " is too high");
      return;
    }
    for (var i = 0; i < this.rows[row].petals.length; i++){
      this.rows[row].petals[i].resizeWidth(width);
    }
    console.log("Setting width of row " + row + " to " + width);
  };
  
  this.updatePetalCount = function(count){
    this.rows[this.selectedRow].petals = [];
    let angleStep = (2*Math.PI)/count;
    
    //inner
    for (var i = 0; i < count; i++){
      this.addPetal(this.selectedRow, angleStep*i, this.petalHeight, this.rows[this.selectedRow].radius);
    }
    this.autoAdjustRow(this.selectedRow);
  };
  
  this.updateRowRadius = function(radius){
    if (!this.selectedRow && this.selectedRow != 0){
      console.error("no row is selected");
      return;
    }
    let minRadius;
    if (this.selectedRow == 0){
      minRadius = 10;
    } else {
      minRadius = this.rows[this.selectedRow - 1].radius;
    }
    radius = Math.max(radius, minRadius);
    console.log("Changing radius of row " + this.selectedRow + " from " + this.rows[this.selectedRow].radius + " to " + Math.max(radius, minRadius));
    this.rows[this.selectedRow].radius = radius;
    for (var i = 0; i < this.rows[this.selectedRow].petals.length; i++){
      this.rows[this.selectedRow].petals[i].radius = radius;
    }
    this.autoAdjustRow(this.selectedRow);
  };
  
  this.updatePetalHeight = function(height){
    this.petalHeight = height;
    for (var i = 0; i < this.rows[this.selectedRow].petals.length; i++){
      this.rows[this.selectedRow].petals[i].resizeHeight(height);
    }
  };
  
  this.updateRowColor = function(color){
    for (var i = 0; i < this.rows[this.selectedRow].petals.length; i++){
      this.rows[this.selectedRow].petals[i].color = color;
    }
  };
  
  this.autoAdjustRow = function(row){
    var petalWidth = this.getPetalWidth(this.rows[row].petals.length, this.rows[row].radius);
    console.log(this.rows[row]);
    //var petalWidth = this.getPetalWidth(this.rows[row].petals.length, this.rows[row].petals[0].radius);
    console.log("we now use : " + this.rows[row].petals.length + " along with " + this.rows[row].radius);
    console.log("we got a petal width of " + petalWidth);
    this.resizeRow(row, petalWidth);
  };
  
  this.selectRow = function(row){
    if (row < this.rows.length){
      this.selectedRow = row;
      this.unselectButtons();
      this.selectionButtons[row].classList.add("selected");
    } else {
      console.error("Invalid selection : " + row + ".");
    }
    this.updateSliders();
  };
  
  this.updateSliders = function(){
    nbPetTxt.value = this.rows[this.selectedRow].petals.length;
    try {
      heightPetTxt.value = this.rows[this.selectedRow].petals[0].h;
    } catch{
      
    }
    nbRadTxt.value = this.rows[this.selectedRow].radius;
  };
  
  this.unselectButtons = function(){
    for (var i = 0; i < this.selectionButtons.length; i++){
      this.selectionButtons[i].classList.remove("selected");
    }
  };
  
  this.update = function(){
    var i = this.rows.length;
    while(i--){
      for (var j = 0; j < this.rows[i].petals.length; j++){
        this.rows[i].petals[j].update();
      }
    }
  };
  
  this.getPetalWidth = function(count, radius){
    console.log("(" + count + ", " + radius + ") -> " + (Math.tan((Math.PI)/count)*radius*2));
    return Math.tan((Math.PI)/count)*radius*2;
  };
  
  /*this.updatePetalCount = function(count){
    this.petalCount = count;
    this.init();
  };*/

  
  this.updatePetalHeightClb = function(height, ctx){
    ctx.updatePetalHeight(height);
  };
  
  this.rotate = function(a){
    for (var i = 0; i < this.petals.length; i++){
      this.petals[i].a += 0.01;
      if (this.petals[i].a > 2*Math.PI){
        this.petals[i].a = 0;
      }
    }
  };
  
  this.rotateClb = function(a, ctx){
    ctx.rotate(a);
  };
  
  this.resetFlower = function(){
    this.rows = [];
  }
  
  this.generateSaveCode = function(){
    let saveCode = "";
    for (var i = 0; i < this.rows.length; i++){
      saveCode += i + ";" + this.rows[i].petals.length + ";" + this.rows[i].radius + ";" + this.rows[i].petals[0].h + ";" + this.rows[i].petals[0].color + ";";
    }
    console.log(saveCode);
  };
  
  this.loadSaveCode = function(){
    let code = prompt("save code ?");
    console.log("Loading code " + code + "...");
    let parts = code.split(";");
    this.resetFlower();
    for (var i = 0; i < parts.length/5 - 1; i++){
      let rowId = parseInt(parts[(5*i) + 0]);
      let petalCount = parseInt(parts[(5*i) + 1]);
      let petalRadius = parseInt(parts[(5*i) + 2]);
      let petalHeight = parseInt(parts[(5*i) + 3]);
      let angleStep = (2*Math.PI)/petalCount;
      let rowColor = parts[(5*i) + 4];
      this.addRow(true);
      
      console.log("loading row with : ID " + rowId + ", petal Count " + petalCount + ", petal Radius " + petalRadius + ", petalHeight " + petalHeight + ", angle step " + angleStep);
    
      for (var j = 0; j < petalCount; j++){
        this.addPetal(rowId, angleStep*j, petalHeight, petalRadius);
        this.rows[rowId].petals[j].color = rowColor;
      }
      
      this.autoAdjustRow(rowId);
    }
  };
}

function spawnParticle(x, y){
  particles.push(new Particle(x, y, Math.random()*2*Math.PI, Math.random()+0.5, 100));
}

function spawnExplosion(x, y){
  explosions.push(new Explosion(x, y, 150, 50));
}

function init(){

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var count = 0;
var currentMode = Modes.SINGLE;
var dots = [];
var indicesToRemove = [];
var flower = new Flower(300, 300, 8, 150, 100);
console.log(flower);
flower.init();
//function Animator(start, end, freq, rr, callback){
var anim = new Animator(60, 120, 40, 50, flower.updatePetalHeightClb, flower);
//anim.run();
var animRot = new Animator(10, 10, 1, 50, flower.rotateClb, flower);
//animRot.run();
updateGui();


function animate(){
  //console.log(spawnPoints);
  //count++;
  if (count < 200){
    requestAnimationFrame(animate);
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  flower.update();
  //ctx.arc(200, 200, 50, 0, 2*Math.PI, false);
  //ctx.fill();
  var i = explosions.length;
  while (i--){
    //explosions[i].update();
  }
  
  
}

init();
animate();

//cool flower
//0;8;66;33;#9214ed;1;8;90;80;#14ed60;2;8;120;80;#edb114;3;8;150;80;#59a7a8;4;8;180;80;#ed1414;