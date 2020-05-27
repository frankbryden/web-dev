var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext('2d');


var cvs = document.createElement('canvas');


var currentMode;

var drag = false;
var roadPaths = [];
var lastMouseDown = 0;
var particles = [];
var explosions = [];
var floor = window.innerHeight - 50;

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
   
});

addEventListener('mousedown', event => {
   
});

addEventListener('mousemove', event => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    //spawnParticle(mouse.x, mouse.y);
});

addEventListener("keydown", event => {
  if (event.key == "q"){
    canon.rotate(-0.1);
  } else if (event.key == "e"){
    canon.rotate(0.1);
  } else if (event.code == "Space"){
    canon.fire();
  } else if (event.key == "ArrowUp"){
    canon.adjustPow(0.1);
  } else if (event.key == "ArrowDown"){
    canon.adjustPow(-0.1);
  } else if (event.key == "r"){
    console.log("start gen");
    simulation.startGen();
    
  }
});

addEventListener('click', event => {
  //spawnSpiral(event.clientX, event.clientY);
  //spawnDot(mouse.x, mouse.y);
});

addEventListener('resize', function(event){
  canvas.width = window.innerWidth - 10;
  canvas.height = window.innerHeight - 10;
});



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

function Target(x, y, radius){
  this.x = x;
  this.y = y;
  this.radius = radius;
  
  this.draw = function(){
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
    ctx.fill();
  };
  
  this.dist = function(x, y){
    return Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2));
  };
}

function Canon(x, y, w, h){
  this.x = x;
  this.y = y;
  this.angle = Math.PI/2;
  this.pow = 0;
  this.maxPow = 30;
  this.w = w;
  this.h = h;
  this.balls = [];
  this.chromos = [];
  this.inAirCount = 0;
  
  this.update = function(){
    for (var ball of this.balls){
      ball.update();
      if (ball.isDead() && !ball.processed){
        
        //this.balls.splice(this.balls.indexOf(ball), 1);
        
        if (ball.id != -1){
          this.inAirCount -= 1;
          this.ballLanded(ball);
          ball.processed = true;
          ball.color = "rgb(180, 220, 90)";
        }
      }
    }
    this.draw();
  };
  
  this.draw = function(){
    ctx.save();
    
    ctx.translate(this.x, this.y);
    //base
    ctx.beginPath();
    ctx.strokeRect(0, 0, this.w, this.h/2);
    //ctx.fillStyle = this.colour;
    ctx.stroke();
    
    
    ctx.translate(this.w/2, this.h/8);
    ctx.rotate(this.angle);
    //power bar
    ctx.fillStyle = "rgb(240, 10, 10)";
    ctx.fillRect(-this.w/4 + 7, 0.5, this.w/3 - 5, this.h*this.pow);
    
    //canon
    ctx.beginPath();
    ctx.moveTo(-this.w/6, 0);
    ctx.lineTo(-this.w/6, this.h);
    ctx.lineTo(this.w/6, this.h);
    ctx.lineTo(this.w/6, 0);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "rgb(60, 10, 10)";
    ctx.beginPath();
    ctx.moveTo(this.w/6, 0);
    ctx.quadraticCurveTo(0, -this.h/3, -this.w/6, 0);
    ctx.fill();
    
    ctx.stroke();
    
    ctx.restore();
    
    
  };
  
  this.adjustPow = function(delta){
    this.pow += delta;
    if (this.pow > 1){
      this.pow = 1;
    } else if (this.pow < 0){
      this.pow = 0;
    }
  };
  
  this.rotate = function(ang){
    this.angle = (this.angle + ang)%(2*Math.PI);
  };
  
  this.setPower = function(pow){
    this.pow = pow;
  };
  
  this.setAngle = function(ang){
    this.angle = ang;
  };
  
  this.runChromo = function(id, callback, ctx, chromo){
    this.chromos.push({id: id, callback: callback, ctx : ctx});
    this.setAngle(chromo.genes[0] * 2*Math.PI);
    this.setPower(chromo.genes[1]);
    //this.x += 5 * chromo.genes[2];
    //this.y -= 5 * chromo.genes[3];
    this.fire(id);
  };
  
  this.ballLanded = function(ball){
    let myChromo = undefined;
    for (var chromo of this.chromos){
      if(chromo.id == ball.id){
        myChromo = chromo;
        break;
      }
    }
    
    //console.log("we have a ball - chromo relationship here with " + ball + " and " + myChromo);
    let fitness = 10 * (1/target.dist(ball.x, ball.y));
    myChromo.callback(myChromo.id, fitness, myChromo.ctx);
    
    let index = this.chromos.indexOf(myChromo);
    this.chromos.splice(index, 1);
  };
  
  this.fire = function(ballId){
    this.balls.push(new CanonBall(this.x + this.w/2 + Math.cos(this.angle + Math.PI/2)*this.h, this.y + Math.sin(this.angle + Math.PI/2)*this.h, {x: Math.cos(this.angle + Math.PI/2)*this.pow*this.maxPow, y: Math.sin(this.angle + Math.PI/2)*this.pow*this.maxPow}));
    this.inAirCount += 1;
    if (ballId){
      this.balls[this.balls.length - 1].id = ballId;
    }
  };
  
  this.resetBalls = function(){
    this.balls = [];
  }
  
  this.isDead = function(){
    return this.dead;
  };
  
}

function CanonBall(x, y, vel){
  this.x = x;
  this.y = y;
  this.vel = vel;
  this.dead = false;
  this.radius = 10;
  this.color = "rgb(0, 0, 0)";
  this.id = -1;
  this.processed = false;
  
  this.update = function(){
    if (!this.dead){
      this.x += this.vel.x;
      this.y += this.vel.y;
    }
    
    this.vel.y += 0.5;
    
    if (this.x > window.innerWidth || this.x < 0){
      this.dead = true;
    }
    
    if (this.y > floor || this.y < 0){
      this.dead = true;
    }
    
    this.draw();
  };
  
  
  this.draw = function(){
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
    this.fillStyle = this.color;
    ctx.fill();
  };
  
  this.isDead = function(){
    return this.dead;
  };
}

function Simulation(popSize){
  this.population = [];
  this.popSize = popSize;
  this.generation = 0;
  this.genStep = 0;
  this.genReady = false;
  this.maxFit = 0;
  this.genMaxFit = 0;
  this.mutationCount = 0;
  
  this.init = function(){
    for (var i = 0; i < this.popSize; i++){
      this.population.push(this.createRandomChromo());
    }
    
    this.genStep = 0;
    this.genReady = true;
    //this.runGeneration();
  };
  
  this.startGen = function(){
    if (this.genReady){
      this.genReady = false;
      console.log("running genration...")
      this.runGeneration();
    } else {
      console.error("gen is not ready");
    }
  };
  
  this.createRandomChromo = function(){
    let k = new Chromo();
    //4 genes : pow, ang, x, y
    k.addGene(Math.random());
    k.addGene(Math.random());
    k.addGene(Math.random());
    k.addGene(Math.random());
    return k;
  };
  
  this.draw = function(){
    ctx.fillText("Step : " + this.genStep, 20, 40);
    ctx.fillText("Generation : " + this.generation, 20, 60);
    ctx.fillText("Max fitness : " + this.maxFit, 20, 80);
    ctx.fillText("Gen Max fitness : " + this.genMaxFit, 20, 100);
    ctx.fillText("Mutation count : " + this.mutationCount, 20, 120);
    ctx.fillText("Generation progress : " + this.genStep + " / " + this.population.length, 20, 140);
    if (this.genReady){
      ctx.fillText("Generation ready !", 20, 160);
    }
  };
  
  this.stepEndCallback = function(id, fitness, ctx){
    //console.log(ctx);
    ctx.population[id].fitness = fitness;
    ctx.maxFit = Math.max(ctx.maxFit, fitness);
    ctx.genMaxFit = Math.max(ctx.genMaxFit, fitness);
    
    ctx.genStep += 1;
    if (ctx.genStep == ctx.population.length - 1){
      ctx.endGeneration();
    }
  };
  
  this.runGeneration = function(){
    ////this.runChromo = function(id, callback, ctx, chromo){
    canon.resetBalls();
    
    for (var i = 0; i < this.population.length; i++){
      canon.runChromo(i, this.stepEndCallback, this, this.population[i]);
    }
  };
  
  this.endGeneration = function(){
    this.population.sort(function(a, b){
      var keyA = a.fitness;
      var keyB = b.fitness;
      if (keyA < keyB){
        return 1;
      } else {
        return -1;
      }
    });
    this.population = this.population.slice(0, this.population.length/4);
    //console.log("after");
    //console.log(this.population);
    while (this.population.length < this.popSize){
      let a = Math.floor(Math.random()*this.population.length);
      let b = a;
      while (b == a){
        b = Math.floor(Math.random()*this.population.length);
      }
      let parentA = this.population[a];
      let parentB = this.population[b];
      //console.log("parentA")
      //console.log(parentA);
      let childABgenes = parentA.cross(parentB);
      let childBAgenes = parentB.cross(parentA);
      let childAB = new Chromo();
      let childBA = new Chromo();
      for (var gene of childABgenes){
        childAB.addGene(gene);
      }
      for (var gene of childBAgenes){
        childBA.addGene(gene);
      }
      /*childAB.addGene(childABgenes[0]);
      childAB.addGene(childABgenes[1]);
      childBA.addGene(childBAgenes[0]);
      childBA.addGene(childBAgenes[1]);
      this.population.push(childAB);
      this.population.push(childBA);*/
    }
    for (var chromo of this.population){
      this.mutationCount += chromo.mutate();
    }
    this.genMaxFit = 0;
    this.genStep = 0;
    this.generation += 1;
    this.genReady = true;
    this.runGeneration();
  }
}

function Chromo(){
  this.genes = [];
  this.fitness = 0;
  
  this.addGene = function(data){
    this.genes.push(data);
  };
  
  this.cross = function(otherChromo){
    if (otherChromo.genes.length != this.genes.length){
      let repr = "";
      for (var gene of otherChromo.genes){
        repr += gene + ", ";
      }
      repr += " / ";
      for (var gene of this.genes){
        repr += gene;
      }
    }
    //we always keep the second half and use the first half from the other K
    let firstHalf = otherChromo.genes.slice(Math.floor(otherChromo.genes.length/4), otherChromo.genes.length);
    for (var i = Math.floor(this.genes.length/2); i < this.genes.length; i++){
      firstHalf.push(otherChromo.genes[i]);
    }
    return firstHalf;
  };
  
  this.mutate = function(){
    let c = 0;
    for (var i = 0; i < this.genes.length; i++){
      if (Math.random() < 0.1){
        this.genes[i] += ((Math.random() * 10) - 5)/100;
        this.genes[i] = Math.min(Math.max(0, this.genes[i]), 1);
        console.log("gene mutation");
        c++;
      }
    }
    return c;
  };
}

var canon;
var target;
var simulation;
function init(){
  canon = new Canon(100, floor - 25, 50, 50);
  target = new Target(window.innerWidth - 100, floor, 10);
  simulation = new Simulation(10);
  simulation.init();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var count = 0;

function animate(){
  //console.log(spawnPoints);
  //count++;
  if (count < 10){
    requestAnimationFrame(animate);
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(0, floor);
  ctx.lineTo(window.innerWidth, floor);
  ctx.stroke();
  target.draw();
  canon.update();
  simulation.draw();
}

init();
animate();

var col = new Colour(200, 200, 200);