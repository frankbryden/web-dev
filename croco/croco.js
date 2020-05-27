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

class Obstacle {
  constructor(world){
    this.world = world;
    this.x = world.width;
    this.dead = false;
  }
  
  init(){
    
  }
  
  update(){
    this.x -= world.obstacleSpeed;
    if (this.x + this.width < 0){
      this.dead = true;
    }
  }
  
  render(){
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.width, this.y, this.width, this.height);
  }
}

class LowBlock extends Obstacle{
  constructor(world){
    super(world);
    this.width = 13;
    this.height = 34;
    this.y = this.world.ground - this.height;
    this.color = "rgb(0, 0, 0)";
  }
}

class HighBlock extends Obstacle{
  constructor(world){
    super(world);
    this.width = 25;
    this.height = 13;
    this.y = this.world.ground - this.height - 30;
    this.color = "rgb(90, 0, 50)";
  }
}

class TallHighBlock extends Obstacle{
  constructor(world){
    super(world);
    this.width = 30;
    this.height = 150;
    this.y = this.world.ground - this.height - 30;
    this.color = "rgb(120, 13, 90)";
  }
}

class TunnelBlock extends Obstacle{
  constructor(world){
    super(world);
    //First block
    this.y0 = 0;
    this.y1 = this.world.player.flyingY - this.world.player.headSize;
    
    //Second block
    this.y2 = this.y1 + this.world.player.width + 1.5*this.world.player.headSize;
    this.y3 = world.ground;
    this.width = 30;
    this.height = 150;
    this.y = this.world.ground - this.height - 30;
    this.color = "rgb(90, 13, 190)";
  }
  
  render(){
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y0, this.width, this.y1 - this.y0);
    ctx.fillRect(this.x, this.y2, this.width, this.y3 - this.y2);
    //console.log("Rect at " + this.x + "; " + this.y2 + " of dimension " + this.width + "x" + (this.y3 - this.y2));
  }
}



class World {
  constructor(){
    this.gravity = 0.8;
    this.ground = 2*canvas.height/3;
    this.width = canvas.width;
    this.col = colours[randInt(0, colours.length)];
    this.mousePos = {x : 0, y : 0};
    this.initialObstacleSpeed = 4;
    this.obstacleSpeed = this.initialObstacleSpeed;
    this.player = new Player(100, this);
    this.initialNewObstacleTrigger = 3*this.width/4;
    this.newObstacleTrigger = this.initialNewObstacleTrigger;
    this.obstacleTypes = [LowBlock, HighBlock, TallHighBlock, TunnelBlock];
    this.obstacles = [];
    this.gameTime = 0;
    this.diffIncreaseTime = 100;
    this.state = States.PLAYING;
    this.obstDet = false;
    this.score = 0;
  }
  
  keyPressed(keycode){
    switch(keycode){
      case "Space":
      case "KeyW":
        this.player.jump();
        break;
      case "KeyS":
        this.player.crouch();
        break;
      case "KeyD":
        this.player.fly();
        break;
      case "KeyR":
        this.restart();
        break;
    }
  }
  
  keyReleased(keycode){
    switch(keycode){
      case "KeyS":
        this.player.stand();
        break;
      case "KeyD":
        this.player.stand();
        break;
    }
  }
  
  spawnObstacle(){
    let obst;
    let v = (Math.round(Math.random() * 100)) % this.obstacleTypes.length;
    obst = new this.obstacleTypes[v](this);
    this.obstacles.push(obst);
  }
  
  getFirstNonTriggeredObstacle(){
    for (var obstacle of this.obstacles){
      if (!obstacle.hasTriggeredNewObstacle){
        return obstacle;
      }
    }
    return null;
  }
  
  checkGameOver(){
    let possibleObstacles = this.obstacles.filter(o => o.x <= this.player.x + this.player.width && o.x >= this.player.x);
    //console.log(possibleObstacles);
    if (possibleObstacles.length > 1){
      alert("oups" + possibleObstacles.length);
    } else if (possibleObstacles.length == 1){
      if (possibleObstacles[0].constructor.name == "TunnelBlock"){
        if (this.player.bodyState != States.FLYING){
          this.state = States.GAME_OVER;
        }
      } else if (this.player.y + this.player.height > possibleObstacles[0].y){
        //Either player was jumping above and missed his timing, or he was ducking under the obstacle
        if (Math.min(this.player.y, this.player.headY) < possibleObstacles[0].y + possibleObstacles[0].height){
          console.log("Game over");
          this.state = States.GAME_OVER;
          this.reason = "player Y + player height = " + (this.player.y + this.player.height) + " and obst at y = " + possibleObstacles[0].y;
        } else {
          console.log("duuck");
          if (this.player.y < this.player.headY){
            console.log("used player y");
          } else {
            console.log("used head y ");
          }
        }
        
        this.obstDet = true;
        
      } else {
        this.obstDet = false;
      }
      
    }
    
  }
  
  restart(){
    if (this.state == States.GAME_OVER){
      this.state = States.PLAYING;
      this.obstacles = [];
      this.obstacleSpeed = this.initialObstacleSpeed;
      this.newObstacleTrigger = this.initialNewObstacleTrigger;
      this.score = 0;
    }
  }
  
  update(){
    if (this.state == States.GAME_OVER){
      return;
    }
    this.gameTime++;
    this.player.update();
    //Obstacle logic
    if (this.gameTime % this.diffIncreaseTime === 0){
      this.obstacleSpeed += 0.1;
      this.newObstacleTrigger -= 4;
      console.log(this.obstacleSpeed);
    }
    //this.obstacleSpeed += 0.05;
    if (this.obstacles.length === 0){
      this.spawnObstacle();
    } else {
      let obstacle = this.getFirstNonTriggeredObstacle();
      if (obstacle.x < this.newObstacleTrigger){
        obstacle.hasTriggeredNewObstacle = true;
        this.spawnObstacle();
      }
    }
    this.obstacles.map(o => o.update());
    this.obstacles = this.obstacles.filter(o => !o.dead);
    this.checkGameOver();
  }
  
  render(){
    ctx.fillStyle = this.col;
    ctx.fillRect(0, this.ground, this.width, canvas.height);
    //ctx.fillText("Rect filled with " + ctx.fillStyle, 50, 20);
    this.player.render();
    this.obstacles.map(o => o.render());
    if (this.state == States.GAME_OVER){
      ctx.fillStyle = "rgb(200, 200, 220)";
      ctx.fillRect(150, 100, 200, 100);
      ctx.fillStyle = "rgb(0, 0, 0)";
      ctx.font = "30px Arial";
      ctx.fillText("Game Over", 170, 160);
      ctx.font = "18px Arial";
      //ctx.fillText(this.reason, 140, 180);
    }
  }
  
  
}

class Player {
  constructor(x, world){
    this.width = 15;
    this.height = 30;
    this.standingX = x;
    this.standingY = world.ground - this.height;
    this.stand();
    this.flyingX = this.standingX - this.width;
    this.flyingY = this.standingY - this.height/2;
    this.world = world;
    this.velY = 0;
    this.col = "rgb(120, 0, 190)";
    this.headCol = "rgb(255, 140, 40)";
    this.headSize = 18;
    this.headMargin = (this.width - this.headSize)/2;
    this.eyeSize = 4;
    this.eyeMargin = this.headSize/4;
    this.baseCol = this.col;
    this.attracted = false;
    this.state = States.RUNNING;
    this.bodyState = States.STANDING;
    this.headY = this.y - this.headSize;
    this.hasTriggeredNewObstacle = false;
  }
  
  setMousePos(x, y){
    
  }
  
  jump(){
    if (this.state == States.RUNNING && this.bodyState != States.FLYING){
      this.state = States.JUMPING;
      this.velY = -13;
    }
  }
  
  crouch(){
    this.bodyState = States.DUCKING;
  }
  
  stand(){
    this.bodyState = States.STANDING;
    this.headXDelta = 0;
    if (this.state != States.JUMPING){
      this.x = this.standingX;
      this.y = this.standingY;
    }
  }
  
  fly(){
    if (this.state != States.RUNNING){
      console.log("state is not " + States.RUNNING + ", it is " + this.state);
      return;
    }
    this.headXDelta = 20;
    this.bodyState = States.FLYING;
    this.x = this.flyingX;
    this.y = this.flyingY;
  }
  
  setAttracted(attracted){
    //console.log("set attracted to " + attracted);
    this.attracted = attracted;
  }
  
  update(){
    if (this.state == States.JUMPING){
      this.velY += world.gravity;
      this.y += this.velY;
      this.checkGroundHit();
    } else if (this.state == States.RUNNING){
      
    }
    
    if (this.bodyState == States.STANDING){
      this.headY = this.y - this.headSize;
    } else if (this.bodyState == States.DUCKING){
      this.headY = this.y + this.headSize/2;
    } else if (this.bodyState == States.FLYING){
      
    }
  }
  
  checkGroundHit(){
    if (this.y + this.height >= this.world.ground){
      this.velY = 0;
      this.y = this.world.ground - this.height;
      this.state = States.RUNNING;
    }
  }
  
  render(){
    //Render body
    ctx.fillStyle = this.col;
    if (this.bodyState == States.FLYING){
      ctx.fillRect(this.x, this.y, this.height, this.width);
    } else {
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    
    //Render head;
    ctx.fillStyle = this.headCol;
    ctx.beginPath();
    ctx.arc(this.x + this.headSize/2 - 2 + this.headXDelta, this.headY + this.headSize/2, this.headSize, 0, 2*Math.PI);
    ctx.fill();
    //Moving on to the eyes
    ctx.fillStyle = "rgb(200, 40, 150)";
    //left eye
    ctx.beginPath();
    ctx.arc(this.x + this.eyeMargin - this.eyeSize/2, this.headY + this.eyeMargin, this.eyeSize, 0, 2*Math.PI);
    ctx.fill();
    //right eye
    ctx.beginPath();
    ctx.arc(this.x + this.headSize - this.eyeMargin - this.eyeSize/2, this.headY + this.eyeMargin, this.eyeSize, 0, 2*Math.PI);
    ctx.fill();
  }
  
}

function init(){

}

var count = 0;
var world = new World();

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
animate();
