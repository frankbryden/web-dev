var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext('2d');

var currentMode;

var carViewDist = 4;

var drag = false;
var roadPaths = [];
var lastMouseDown = 0;
var maxSpeed = 5;
var roadPathLen = 0;

var States = {
  TRACING : 1,
  DRAWN : 2,
  ERASING : 3,
  DONE : 4,
  ERASE_TIMER : 5,
  GREEN : 6,
  RED : 7
};

var Modes = {
  CAR : 1,
  T_LIGHT : 2,
  SINGLE : 3,
  FOLLOW : 4
};

var roadLength = 30;
var spawnMode = Modes.CAR;
var randEvProb = 0.997;
var stopSpeed = 0.4;

canvas.width = window.innerWidth - 10;
canvas.height = window.innerHeight - 10;

document.addEventListener('keydown', function(event){
  console.log(event);
  if (event.key == "p"){
    switchModes();
  }
});

function switchModes(){
  if (spawnMode == Modes.CAR){
    spawnMode = Modes.T_LIGHT;
  } else if (spawnMode == Modes.T_LIGHT){
    spawnMode = Modes.CAR;
  }
}

function getModeName(){
  if (spawnMode == Modes.CAR){
    return "Spawn Cars";
  } else if (spawnMode == Modes.T_LIGHT){
    return "Spawn Traffic Lights";
  }
}

function randInt(min, max) {
    let r = Math.floor(Math.random() * (max - min + 1) + min);
    return r;
}

function dist(x1, y1, x2, y2){
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function roadDist(index1, index2){
  var rawDist1 = Math.min(index1, Math.abs(index1 - roadPathLen));
  
  if (index1 > index2){
    rawDist = index1 - index2;
  } else {
    rawDist = index2 - index1;
  }
  
  if (rawDist > roadPathLen/2){
    rawDist = roadPathLen - rawDist;
  }
  
  
  return rawDist;
}

function angle(p1, p2){
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
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
addEventListener('mouseup', event => {
    console.log("Mouse up");
    drag = false;

});

addEventListener('mousedown', event => {
    console.log("Mouse down");
    drag = true;
    lastMouseDown = new Date().getTime();
    if(roadPaths.length === 0){
      roadPaths.push(new RoadPath(event.clientX, event.clientY));
    }
    

});

addEventListener('mousemove', event => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    if (drag){
      //spawnDot(mouse.x, mouse.y);
      roadPaths[roadPaths.length - 1].mouseMove(mouse.x, mouse.y);
    }
});

addEventListener('click', event => {
  //spawnSpiral(event.clientX, event.clientY);
  //spawnDot(mouse.x, mouse.y);
  console.log("click");
  if ((new Date().getTime() - lastMouseDown) < 200){
    for (var i = 0; i < roadPaths.length; i++){
      roadPaths[i].mouseClick(event.clientX, event.clientY);
    }
  }
  //spawnTrafficLight(event.clientX, event.clientY);
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

function TrafficLight(x, y, road){
  this.x = x;
  this.y = y;
  this.road = road;
  this.green_time = 2000;
  this.red_time = 100;
  this.state_timer = Date.now();
  console.log(this.state_timer);
  this.state = States.GREEN;
  this.colour = "rgb(0, 255, 0)";
  this.radius = 15;
  this.timerSet = false;
  this.timerHandle = setInterval(this.switchStates, 500);
  var me = this;
  setInterval(function(){me.switchStates();}, me.green_time);
  
  this.update = function(){
    this.draw();
  };
  
  this.sayHello = function(){
    console.log("HEllo from traffic light");
  };
  
  this.switchStates = function(){
    console.log("switch states");
    console.log(this);
    this.timerSet = false;
    switch(this.state){
        case States.RED:
          this.state = States.GREEN;
          this.state_timer = this.green_time;
          this.colour = "rgb(0, 255, 0)";
          break;
        case States.GREEN:
          this.state = States.RED;
          this.state_timer = this.red_time;
          this.colour = "rgb(255, 0, 0)";
          break;
      }
  }
  
  this.draw = function(){
    ctx.beginPath();
    ctx.fillStyle = this.colour;
    ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
    ctx.stroke();
    ctx.fill();
  };
  
  this.switchStates();
  this.sayHello();
}

function Car(x, y, colour, roadIndex, direction){
  this.x = x;
  this.y = y;
  this.colour = colour;
  this.colour = getRandColour();
  this.radius = 20;
  this.vel = Math.round((Math.random() + 0.5)*20)/10;
  this.waypoint = 0;
  this.angle = 0;
  this.roadIndex = roadIndex;
  this.carInFront = null;
  this.direction = direction;
  this.maxSpeed = maxSpeed - randInt(0, 3);
  
  this.setWaypoint = function(waypoint){
    this.waypoint = waypoint;
    this.recalculateAngle();
  };
  
  this.setCarInFront = function(car){
    if (car == null || car == this){
      return;
    }
    this.carInFront = car;
    this.adjustSpeed();
  };
  
  this.setTrafficLight = function(tl){
    if (tl == null){
      return;
    }
    this.trafficLight = tl;
    console.log("We have a traffic light !")
    this.adjustSpeed();
  };
  
  this.hasTrafficLight = function(){
    return this.trafficLight == null;
  }
  
  this.hasCarInFront = function(){
    return this.carInFront != null;
  };
  
  this.accelerate = function(){
    if (Math.random() > 0.7){
        this.vel += 0.08;
        this.vel = Math.min(this.vel, this.maxSpeed);
      }
  };
  
  this.decelerate = function(factor){
    this.vel -= factor;
    this.vel = Math.max(this.vel, 0);
  }
  
  this.adjustSpeed = function(){
    var a = Math.random();
    if (a > randEvProb){
      this.vel = 9;
      if (this.carInFront != null){
        //this.vel = stopSpeed;
        this.vel = this.vel/2;
      } else {
        if (a > (1 - randEvProb)/2 + randEvProb){
          //console.log("ACCEL !");
          //this.vel *= 1.25;
          this.accelerate();
        } else {
          //console.log("Rand STOP !");
          //this.vel = stopSpeed;
          this.decelerate();
          //this.vel = this.vel*0.75;
        }
      }
      this.maxSpeed += 0.2;
    }
    if (this.carInFront == null){
      this.accelerate();
      return;
    }
    if (roadDist(this.roadIndex, this.carInFront.roadIndex) > carViewDist){
      //console.log("we can no longer see the car in front ( dist is " + roadDist(this.roadIndex, this.carInFront.roadIndex) + " )")
      this.carInFront = null;
      return;
    }
    var d = dist(this.x, this.y, this.carInFront.x, this.carInFront.y);
    
    if (d < this.radius*3){
      //this.vel -= d/2;
      //this.vel = Math.max(this.vel, 0.05);
      //this.vel = Math.max(Math.max(this.carInFront.vel - 0.1, this.vel - 0.1), 0);
      if (this.carInFront.vel < this.vel){
        this.decelerate(this.radius/d);
      }
      
    }else if (d < this.radius*4){
      //we have a good speed (well, a good distance from the car in front)
      
      //console.log("Slowing down to " + this.vel + " px/frame");
      
    } else {
      this.accelerate();
    }
    
    if (d <= this.radius*1.5){
      console.log("CRASH");
      this.vel = 0;
      this.maxSpeed += 0.1;
    }
    
    if (this.trafficLight){
      tld = dist(this.x, this.y, this.trafficLight.x, this.trafficLight.y);
      if (tld < this.radius*2 && this.trafficLight.state == States.RED){
        this.decelerate(this.radius/tld);
      }
    }
    
    
    
  }
  
  this.setAngle = function(angle){
    this.angle = angle;
  };
  
  this.isEndOfRoad = function(){
    return dist(this.waypoint.x, this.waypoint.y, this.x, this.y) < 10;
  };
  
  this.recalculateAngle = function(){
    this.angle = Math.atan2(this.waypoint.y - this.y, this.waypoint.x - this.x);
  };
  
  this.update = function(){
    this.x += Math.cos(this.angle)*this.vel;
    this.y += Math.sin(this.angle)*this.vel;
    this.adjustSpeed();
    this.draw();
  };
  
  this.draw = function(){
    ctx.beginPath();
    ctx.fillStyle = this.colour;
    ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
    ctx.fill();
    
    if (this.carInFront != null){
      
      ctx.save();
      ctx.strokeStyle = "rgb(255, 0, 0)";
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.carInFront.x, this.carInFront.y);
      //console.log("Line from " + this.x + ", " + this.y + " to " + this.carInFront.x + ", " + this.carInFront.y + "( cars are equal ? " + (this == this.carInFront));
      ctx.strokeStyle = this.colour;
      //ctx.stroke();
      ctx.restore();
    } else {
      ctx.strokeStyle = "rgb(0, 255, 0)";
      ctx.stroke();
      ctx.strokeStyle = "rgb(0, 0, 0)";
    }
  };
}

function RoadPath(x, y){
  this.lastSpawn = new Point(x, y);
  this.roads = [];
  this.cars = [];
  this.trafficLights = [];
  this.previousTopEnd = null;
  this.previousBotEnd = null;
  this.mouseMove = function(x, y){
    if (dist(this.lastSpawn.x, this.lastSpawn.y, x, y) > roadLength){
      var end = new Point(x, y);
      this.roads.push(new Road(this.lastSpawn, end, this.previousTopEnd, this.previousBotEnd, this.roads.length));
      this.previousBotEnd = new Point(this.roads[this.roads.length - 1].botLine.x2, this.roads[this.roads.length - 1].botLine.y2);
      this.previousTopEnd = new Point(this.roads[this.roads.length - 1].topLine.x2, this.roads[this.roads.length - 1].topLine.y2);
      this.lastSpawn = end;
      roadPathLen = this.roads.length;
    }
  };

  this.mouseClick = function(x, y){
    for (var i = 0; i < this.roads.length; i++){
      if (this.roads[i].contains(x, y)){
        if (spawnMode == Modes.CAR){
          this.spawnCar(x, y, this.roads[i]);
        } else if (spawnMode == Modes.T_LIGHT){
          this.spawnTrafficLight(x, y, this.roads[i]);
        }
        return;
      }
    }
  };
  
  this.spawnCar = function(x, y, road){
    var dir = road.getDirection(x, y);
    this.cars.push(new Car(x, y, 'rgb(200, 50, 110)', road.index + 1, dir));
    //console.log("Setting waypoint to " + this.roads[i].getWaypoint().x + ", " + this.roads[i].getWaypoint().y);
    this.cars[this.cars.length - 1].setWaypoint(this.roads[(road.index + 2*dir)%this.roads.length].getWaypoint(dir));
  };
  
  this.spawnTrafficLight = function(x, y, road){
    var tl = new TrafficLight(x, y, road);
    this.trafficLights.push(tl);
    console.log("we now have " +  this.trafficLights.length + " traffic lights");
    road.trafficLights.push(tl);
  };
  
  this.getTrafficLight = function(car){
    for (var i = 0; i <= carViewDist; i++){
      var currentRoadIndex;
      if (car.direction == 1){
        currentRoadIndex = (car.roadIndex + i) % this.roads.length;
      } else if (car.direction == -1){
        currentRoadIndex = (car.roadIndex - i) % this.roads.length;
      }
      
      var currentRoad = this.roads[currentRoadIndex];
      var trafficLightsInRoad = currentRoad.trafficLights;
      
      var closestTl;
      var closestDist = 1000;
      
      for (var j = 0; j < trafficLightsInRoad; j++){
        var d;
        if (car.direction == 1){
          d = dist(trafficLightsInRoad[j].x, trafficLightsInRoad[j].y, currentRoad.centerLine.x1, currentRoad.centerLine.y1);
        } else if (car.direction == -1){
          d = dist(trafficLightsInRoad[j].x, trafficLightsInRoad[j].y, currentRoad.centerLine.x2, currentRoad.centerLine.y2);
        }
        
        if (d < closestDist){
          closestDist = d;
          closestTl = trafficLightsInRoad[j];
        }
      }
      
      
      return closestTl;
    }
  }
  
  this.getCarInFront = function(car){
    if (this.cars.length <= 1){
      return null;
    }
    
    for (var i = 0; i <= carViewDist; i++){
      var currentRoadIndex;
      if (car.direction == 1){
        currentRoadIndex = (car.roadIndex + i) % this.roads.length;
      } else if (car.direction == -1){
        currentRoadIndex = (car.roadIndex - i) % this.roads.length;
      }
      
      var currentRoad = this.roads[currentRoadIndex];
      var carsInRoad = this.carRoadMap[currentRoadIndex];
      /*for (var j = 0; j < carsInRoad.length; j++){
        var distFromRoadEnd = dist(currentRoad.)
      }*/
      if (carsInRoad){
        if (carsInRoad.length == 1 && carsInRoad[0].direction == car.direction){
          return carsInRoad[0];
        }
        
        var closestDist = 10000; //TODO : find the closest car within the road section
        var closestCar = null;     //       for now, simply pick one and return that one
        //this returns undefined
        var waypoint;
        if (i == 0){
          waypoint = currentRoad.getWaypoint(car.direction);
        } else {
          waypoint = currentRoad.getWaypoint(-car.direction);
        }
        if (waypoint == undefined){
          console.log("Waypoint is undefined");
        }
        
        for (var j = 0; j < carsInRoad.length; j++){
          if (carsInRoad[j].direction == car.direction && carsInRoad[j] !== car){
            //this car is elligible
            var d = dist(waypoint.x, waypoint.y, carsInRoad[j].x, carsInRoad[j].x);
            if (d < closestDist){
              closestDist = d;
              closestCar = carsInRoad[j];
            }
            
          }
        }
        if (closestCar != null){
          console.log("new car direction : " + closestCar.direction + ", our car's direction : " + car.direction);
          return closestCar;
        } else {
          continue;
        }
      } else {
        continue;
      }
      
    }
    
    return null;
    
  };
  
  this.getContainingRoad = function(x, y){
    for (var i = 0; i < this.roads.length; i++){
      if (this.roads[i].contains(x, y)){
        return this.roads[i];
      }
    }
  }
  
  this.getContainingRoadIndex = function(x, y){
    for (var i = 0; i < this.roads.length; i++){
      if (this.roads[i].contains(x, y)){
        return i;
      }
    }
  }

  this.draw = function(){
    this.carRoadMap = {};
    for (var i = 0; i < this.cars.length; i++){
      var roadIndex = this.getContainingRoadIndex(this.cars[i].x, this.cars[i].y);
      if (!this.carRoadMap[roadIndex]){
        this.carRoadMap[roadIndex] = [];
      }
      this.carRoadMap[roadIndex].push(this.cars[i]);
      
    }
    for (var i = 0; i < this.roads.length; i++){
      this.roads[i].draw();
      //ctx.fillText(i, this.roads[i].centerLine.x1,this.roads[i].centerLine.y1)
    }
    var i = this.cars.length;
    while (i--){
      if (this.cars[i].isEndOfRoad()){
        this.cars[i].roadIndex += this.cars[i].direction;
        this.cars[i].roadIndex = (this.cars[i].roadIndex + this.roads.length) % this.roads.length;
        this.cars[i].setWaypoint(this.roads[this.cars[i].roadIndex].getWaypoint(this.cars[i].direction));
        if (!this.cars[i].hasCarInFront()){
          this.cars[i].setCarInFront(this.getCarInFront(this.cars[i]));
        }
        
        if (!this.cars[i].hasTrafficLight()){
          this.cars[i].setTrafficLight(this.getTrafficLight(this.cars[i]));
        }
        
      }
      this.cars[i].update();
    }
    for (var i = 0; i < this.trafficLights.length; i++){
      this.trafficLights[i].update();
    }
  }
}

function Road(start, end, previousTopEnd, previousBotEnd, index){



  this.init = function(previousTopEnd, previousBotEnd){
    this.angle = Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x) - Math.PI/2;
    var botPointStart = new Point(this.start.x + Math.cos(this.angle)*-this.roadWidth, this.start.y + Math.sin(this.angle)*-this.roadWidth);
    var botPointEnd = new Point(this.end.x + Math.cos(this.angle)*-this.roadWidth, this.end.y + Math.sin(this.angle)*-this.roadWidth);
    var topPointStart = new Point(this.start.x + Math.cos(this.angle)*this.roadWidth, this.start.y + Math.sin(this.angle)*this.roadWidth);
    var topPointEnd = new Point(this.end.x + Math.cos(this.angle)*this.roadWidth, this.end.y + Math.sin(this.angle)*this.roadWidth);
    if (previousTopEnd != null){
      topPointStart = previousTopEnd;
    }
    if (previousBotEnd != null){
      botPointStart = previousBotEnd;
    }
    this.topLine = new Line(topPointStart.x, topPointStart.y, topPointEnd.x, topPointEnd.y);
    this.botLine = new Line(botPointStart.x, botPointStart.y, botPointEnd.x, botPointEnd.y);
    this.centerLine = new Line(this.start.x, this.start.y, this.end.x, this.end.y);
  }

  this.draw = function(){
      this.topLine.draw();
      this.botLine.draw();
      ctx.save();
      ctx.setLineDash(this.lineDash);
      this.centerLine.draw();
      ctx.restore();
      //ctx.fillText(this.index, this.botLine.x1,this.botLine.y1)
  };
  
  this.getWaypoint = function(direction){
    if (direction == 1){
      return new Point((this.centerLine.x1 + this.botLine.x1)/2, (this.centerLine.y1 + this.botLine.y1)/2);
    } else if (direction == -1){
      return new Point((this.centerLine.x1 + this.topLine.x1)/2, (this.centerLine.y1 + this.topLine.y1)/2);
    } else {
      console.log("Invalid direction : " + direction);
    }
    
  };
  
  this.getDirection = function(x, y){
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(this.topLine.x1, this.topLine.y1);
    ctx.stroke();
    if (dist(x, y, this.topLine.x1, this.topLine.y1) < dist(x, y, this.botLine.x1, this.botLine.y1)){
      return -1;
    } else {
      return 1;
    }
  };

  this.contains = function(x, y){
    var centerPoint = new Point((this.centerLine.x1 + this.centerLine.x2)/2, (this.centerLine.y1 + this.centerLine.y2)/2);
    return dist(centerPoint.x, centerPoint.y, x, y) < this.roadWidth;
  };


  this.start = start;
  this.trafficLights = [];
  this.end = end;
  this.index = index;
  this.cars = [];
  this.roadWidth = 75;
  this.lineDash = [40, 10];
  this.init(previousTopEnd, previousBotEnd);
}


function spawnDot(x, y){
  dots.push(new Point(x, y));
}

function spawnTrafficLight(x, y){
  trafficLights.push(new TrafficLight(x, y));
}

function init(){

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var count = 0;
var currentMode = Modes.SINGLE;
var dots = [];
var trafficLights = [];
var road = new Road(new Point(10, 100), new Point(400, 100));
var count = 0;

function animate(){
  //console.log(spawnPoints);
  //count++;
  if (count < 200){
    requestAnimationFrame(animate);
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (var i = 0; i < roadPaths.length; i++){
    roadPaths[i].draw();

  }
  
  for (var i = 0; i < trafficLights.length; i++){
    trafficLights[i].update();
  }
  
  var t;
  if (spawnMode == Modes.CAR){
    t = "CAR";
  } else if (spawnMode == Modes.T_LIGHTS){
    t = "TRAFFIC LIGHT";
  }
  ctx.fillText(getModeName(), 10, 10);
  //road.draw();
}

init();
animate();
