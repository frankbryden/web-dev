var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext('2d');

var radius = 7;
var effectRadius = 150;
var baseOpacity = 0.1;

var slowSpeed = 1.5;
var snapSpeed = 3;
var slotCount = 3;

var slotVals = [1, 1, 1, 1, 1, 1, 2];
slotVals = [1, 1, 1, 1, 2];
var newSlotPrices = {1: 5, 2: 8, 5: 20, 10: 50, 50: 200, 100: 1000};
var removeSlotPrices = {1: 30, 2: 40, 5: 150, 10: 500, 50 : 5000, 100: 1000};
var newSlotButtons = [];
var slotColours = {1: 'rgb(160, 160, 160)', 2: 'rgb(64, 188, 80)', 5: 'rgb(17, 50, 196)', 10: 'rgb(168, 29, 214)', 50: 'rgb(214, 211, 47)', 100: 'rgb(205, 89, 247)'};

var States = {
  SPINNING : 1,
  WAITING : 2,
  SNAPPING : 3,
  DONE : 4,
  WIN : 5,
  FLASH : 6,
  LOSE : 7,
  ERROR : 8,
};

canvas.width = window.innerWidth - 10;
canvas.height = window.innerHeight - 10;

const mouse = {
    x: innerWidth / 2,
    y: innerHeight / 2
};

const colours = ['#e842f4', '#162a99', '#ce1053', '#36a00cx'];

// Event Listeners
addEventListener('mousemove', event => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

addEventListener('resize', function(event){
  console.log("RESIZE");
  console.log(event);
  canvas.width = window.innerWidth - 10;
  canvas.height = window.innerHeight - 10;
  slotMachine.spin();
});

addEventListener('click', function(event){
  if (spinButton.isClicked(event.clientX, event.clientY)){
    slotMachine.spin();
  } else if (add5Button.isClicked(event.clientX, event.clientY)){
    cashCounter.addCash(5);
  }
  for (var button of newSlotButtons){
    if (button.isClicked(event.clientX, event.clientY)){
      let itemPrice = newSlotPrices[button.actionCommand];
      console.log("User wants to add " + button.actionCommand + " for a cost of " + itemPrice + "$");
      if (cashCounter.currentCash >= itemPrice){
        cashCounter.spendCash(itemPrice);
        //slotVals.push(Number(button.actionCommand));
        slotValsManager.add(Number(button.actionCommand));
      } else {
        button.error();
      }
    }
  }
  slotValsManager.click(event.clientX, event.clientY);
});

// Utility Functions
function randInt(min, max) {
    let r = Math.floor(Math.random() * (max - min + 1) + min);
    return r;
}

function randSignedInt(min, max) {
    let r = Math.floor(Math.random() * (max - min + 1) + min);
    let mult = 1;
    if (Math.random() > 0.5){
      mult = -1;
    }
    return r * mult;
}

function randSmallInt(min, max) {
    let r = Math.floor((Math.random() * (max - min + 1) + min + 0.00001) * 100)/100;
    console.log("Small Rand number between " + min + " and " + max + " = " + r);
    //return Math.floor(Math.random() * (max - min + 1) + min);
    return r;
}

function randomColour(colours) {
    return colours[Math.floor(Math.random() * colours.length)];
}

function shuffleArray(arr){
  console.log(arr);
  var counter = arr.length;
  let x, y;
  while (counter > 0){
    counter--;
    j = randInt(0, arr.length - 1);
    x = arr[j];
    arr[j] = arr[counter];
    arr[counter] = x;
  }
  console.log("shuffled");
  console.log(arr);
  return arr;
}

function getDistance(x1, y1, x2, y2) {
  const xDist = x2 - x1;
  const yDist = y2 - y1;
  //console.log("Determining distance with params" + x1 + ", " + y1 + ", " + x2 + ", " + y2);
  return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
}

function getDiamondHeightFromWidth(width){
  return 0.75 * width;
}

function CashCounter(){
  this.currentCash = 0;
  this.loadCash = function(){
    if (localStorage.currentCash) {
      this.currentCash = Number(localStorage.currentCash);
    } else {
      this.currentCash = 0;
    }
  };
  
  this.addCash = function(amount){
    console.log("We currently have " + this.currentCash + " and we are adding " + amount + ".");
    console.log("Types are " + typeof(this.currentCash) + " and " + typeof(amount) + ".");
    this.currentCash += amount;
    console.log("After addition, we have currentCash " + this.currentCash);
    this.persistCash();
  };
  
  this.spendCash = function(amount){
    this.currentCash -= amount;
    this.persistCash();
  };
  
  this.persistCash = function(){
    localStorage.currentCash = this.currentCash;
  };
  
  this.draw = function(){
    ctx.strokeText("Current Cash : " + this.currentCash + "$", 50, 200);
  };
}

function SlotValsManager(){
  this.slotVals = [];
  this.slotValsButtons = [];
  this.slotCounts = null;
  this.load = function(){
    if (localStorage.slotVals && localStorage.slotVals != "[]") {
      console.log("Is currentVals = to [] ? -> " + (localStorage.slotVals == "[]"));
      this.slotVals = JSON.parse(localStorage.slotVals);
      this.resetButtons();
    } else {
      console.log("New user, adding fresh vals...")
      this.slotVals = [1, 1, 1, 2];
      this.persist();
    }
  };
  
  this.getSlotValsCount = function(){
    console.log(this.slotCounts);
    console.log("Is slotcounts == null ? -> " + (this.slotCounts == null));
    if (this.slotCounts != null){
      return this.slotCounts;
    }
    this.slotCounts = {};
    for (var i = 0; i < this.slotVals.length; i++){
      let currentVal = this.slotVals[i];
      if (currentVal in this.slotCounts){
        this.slotCounts[currentVal] += 1;
      } else {
        this.slotCounts[currentVal] = 1;
      }
    }
    return this.slotCounts;
  }
  
  this.add = function(val){
    this.slotVals.push(val);
    this.persist();
  };
  
  this.remove = function(val){
    let valIndex = this.slotVals.indexOf(val);
    console.log("Removing val " + val + "(at index " + valIndex + ")...");
    console.log(this.slotVals);
    this.slotVals.splice(valIndex, 1);
    console.log("Slot vals after deletion :");
    console.log(this.slotVals);
    this.persist();
  };
  
  this.persist = function(){
    localStorage.slotVals = JSON.stringify(this.slotVals);
    this.slotCounts = null;
    this.resetButtons();
  };
  
  this.click = function(x, y){
    for (var button of this.slotValsButtons){
      if (button.isClicked(x, y)){
        let valToRemove = button.actionCommand;
        let removePrice = Number(removeSlotPrices[valToRemove]);
        
        console.log("User wants to remove slot with val " + valToRemove);
        if (cashCounter.currentCash >= removePrice){
          cashCounter.spendCash(removePrice);
          this.remove(valToRemove);
          return;
        }
      }
    }
  }
  
  this.resetButtons = function(){
    this.slotValsButtons = [];
    let i = 0;
    let buttonWidth = 120;
    let buttonHeight = 80;
    
    console.log(this.getSlotValsCount());
    console.log(this.slotCounts);
    for (var slotVal in this.slotCounts){
      this.slotValsButtons.push(new Button(rightPanel + 20, 50 + (i * buttonHeight), buttonWidth, buttonHeight, 'rgb(170, 200, 90)', this.slotCounts[slotVal] + " x " + slotVal + " (" + removeSlotPrices[slotVal] + "$)"));
      this.slotValsButtons[i].setActionCommand(slotVal);
      i++;
      console.log("Created remove slot button with val " + slotVal);
    }
    console.log("Finished resetting buttons");
    console.log(this.slotValsButtons);
  }
  
  this.draw = function(){
    ctx.strokeText("Remove Slots", rightPanel + 20, 25);
    for (var button of this.slotValsButtons){
      button.draw();
    }
  };
}

function Diamond(slot, x, y, w, h, value, colour){
  this.slot = slot;
  this.x = x;
  this.y = y;
  this.width = w;
  this.height = h;
  this.colour = colour;
  console.log("Spawning diamond with colour " + colour + " and value " + value);
  this.value = value;
  this.state = States.SPINNING;
  this.draw = function(){
    ctx.save();
    ctx.beginPath();
    //(x; y) is top left of image
    //We move to top point of diamond
    ctx.moveTo(this.x + this.width/2, this.y);
    //Line to mid left corner
    ctx.lineTo(this.x, this.y + this.height/2);
    // and bottom corner
    ctx.lineTo(this.x + this.width/2, this.y + this.height);
    
    //Then right corner
    ctx.lineTo(this.x + this.width, this.y + this.height/2);
    //Line to top corner
    ctx.lineTo(this.x + this.width/2, this.y);
    // and mid right corner
    //ctx.lineTo(this.x + this.width, this.y + this.height/2);
    
    ctx.strokeStyle = 'rgb(220, 180, 100);';
    if (this.state == States.SPINNING){
      ctx.fillStyle = this.colour;
    } else if (this.state == States.WIN){
      ctx.fillStyle = this.colour;
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgb(255, 0, 0)';
    } else if (this.state == States.FLASH){
      ctx.lineWidth = 4;
      ctx.fillStyle = this.colour;
      ctx.strokeStyle = 'rgb(250, 200, 50)';
    } else {
      console.log("ERRROOOOOR : Diamond state is " + this.state);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.font = "26px Arial";
    ctx.strokeText(this.value, this.x + 3*this.width/7, this.y + this.height/3);
    
  };
  
  this.getCenterY = function(){
    return this.y + this.height/2;
  };
}

function Button(x, y, w, h, color, text){
  this.x = x;
  this.y = y;
  this.width = w;
  this.height = h;
  this.color = color;
  this.text = text;
  this.state = States.DONE;
  this.errorTimer = 0;
  this.errorTime = 50;
  
  
  this.isClicked = function(x, y){
    if (x > this.x && x < this.x + this.width){
      if (y > this.y && y < this.y + this.height + 4){
        return true;
      }
    }
    /* console.log("Mouse click needs to be between x ");
    console.log(this.x + " and " + (this.x + this.width) + ",");
    console.log(" and Y : " + this.y + " and " + (this.y + this.height));
    console.log("When we have x = " + x + " and y = " + y); */
  };
  
  this.error = function(){
    this.errorTimer = this.errorTime;
    this.state = States.ERROR;
  };
  
  this.draw = function(){
    
    if (this.state == States.DONE){
      ctx.strokeStyle = 'black';
      ctx.fillStyle = this.color;
    } else if (this.state == States.ERROR){
      ctx.fillStyle = 'rgb(255, 0, 0)';
      this.errorTimer--;
      if (this.errorTimer <= 0){
        this.state = States.DONE;
      }
    }
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.font = "20px Arial";
    let textWidth = ctx.measureText(this.text).width;
    let margin = (this.width - textWidth)/2;
    ctx.strokeText(this.text, this.x + margin, this.y + 2*this.height/3);
  };
  
  this.setActionCommand = function(ac){
    this.actionCommand = ac;
  };
}


function Slot (x, y, w, h, torque, colour, slotVals, slotType, snapY){
  this.x = x;
  this.y = y;
  this.width = w;
  this.height = h;
  this.slotMargin = 20;
  this.slotType = slotType;
  this.slotCount = 7;
  this.state = States.WAITING;
  this.slotVals = slotVals;
  this.snapY = snapY;
  this.closestSlot = null;
  this.slotHeight = ((this.height - this.slotCount * this.slotMargin)/this.slotCount);
  this.maxSlotCount = Math.floor(this.height/getDiamondHeightFromWidth(this.width));
  this.frameCount = 0;
  /*console.log("slotType / slotHeight / height / slotCount");
  console.log(this.slotType);
  console.log(this.slotHeight);
  console.log(this.height);
  console.log(this.slotCount);*/
  this.torque = torque;
  this.diamondArray = [];
  this.opacity = 0.5;
  this.radius = radius;
  this.inEffect = false;
  this.colour = colour;
  this.lowestSlot = null;
  this.topSlotY = 0;
  
  
  
  //We need to find out if we have more slots than the max number of slots we can fit
  
  
  if (this.slotVals.length > this.maxSlotCount){
    
    //console.log("We were given more slots than the max amount of available slots (" + this.slotVals.length + " > " + this.maxSlotCount + ")");
    
    if (this.torque > 0){
      this.topSlotY = - (this.slotHeight + this.slotMargin);
      for (var i = this.maxSlotCount - this.slotVals.length; i < this.maxSlotCount; i++){
        //console.log("Creating diamond with colour " + slotColours[i - (this.maxSlotCount - this.slotVals.length)]);
        
        let slotValue = this.slotVals[i - (this.maxSlotCount - this.slotVals.length)];
        //console.log("New slot at y = " + i * (this.slotHeight + this.slotMargin));
        this.diamondArray.push(new Diamond(this, this.x, i * (this.slotHeight + this.slotMargin), this.width, this.slotHeight, slotValue, slotColours[slotValue]));
        
        
        // console.log("Created slot with val " + this.slotVals[i - (this.maxSlotCount - this.slotVals.length)] + " (index " + (i - (this.maxSlotCount - this.slotVals.length)) + ")");
      }
    
    } else {
      for (var i = 0; i < this.slotVals.length; i++){
        //console.log("Creating diamond with colour " + slotColours[i - (this.maxSlotCount - this.slotVals.length)]);
      
        let slotValue = this.slotVals[i];
        //console.log("New slot at y = " + i * (this.slotHeight + this.slotMargin));
        this.diamondArray.push(new Diamond(this, this.x, i * (this.slotHeight + this.slotMargin), this.width, this.slotHeight, slotValue, slotColours[slotValue]));
      
      
        //console.log("Created slot with val " + this.slotVals[i - (this.maxSlotCount - this.slotVals.length)] + " (index " + (i - (this.maxSlotCount - this.slotVals.length)) + ")");
      }
    }
  } else {
    console.log("We have less slots given to us than the max amount of available slots");
    
    //this.slotMargin = this.height - ( 2 *  this.slotVals.length ) * this.slotHeight;
    
    
    for (var i = 0; i < this.slotVals.length; i++){
      console.log("Created slot with val " + this.slotVals[i]);
      
      
      this.diamondArray.push(new Diamond(this, this.x, i * (this.slotHeight + this.slotMargin), this.width, this.slotHeight, this.slotVals[i], slotColours[i]));
      
    }
    
    
    
  }
  
  this.lowestSlot = this.diamondArray[this.diamondArray.length - 1];
  
  
  this.getClosestSlot = function(){
    let closestDist = 1000;
    let closestSlot = null;
    for (var i = 0; i < this.diamondArray.length; i++){
      let currentSlot = this.diamondArray[i];
      let dist = getDistance(currentSlot.x, currentSlot.getCenterY(), currentSlot.x, this.snapY);
      if (dist < closestDist){
        console.log("Found one !")
        closestDist = dist;
        closestSlot = currentSlot;
      } else {
      }
    }
    return closestSlot;
  }
  
  this.shiftSlots = function(amount){
    for (var i = 0; i < this.diamondArray.length; i++){
      this.diamondArray[i].y += amount;
    }
  }
  
  this.update = function(){
    this.frameCount += 1;
    if (this.state == States.SPINNING){
      for (var i = 0; i < this.diamondArray.length; i++){
        let currDiam = this.diamondArray[i];
        currDiam.y += this.torque;
        if (this.torque > 0){
          if (currDiam.y > this.height){
            //CHANGE
            currDiam.y = Math.min(this.lowestSlot.y - (this.slotHeight + this.slotMargin), - (this.slotHeight + this.slotMargin));
            
            //currDiam.y = this.topSlotY;
            
            //CHANGE
            this.lowestSlot = currDiam;
          }
        } else {
          if (currDiam.y  + currDiam.height < 0){
            //CHANGE
            currDiam.y = Math.max(this.lowestSlot.y + (this.slotHeight + this.slotMargin), canvas.height + this.slotHeight + this.slotMargin);
            
            //currDiam.y = this.topSlotY;
            console.log("resetting slot position to y = " + this.topSlotY);
            
            //CHANGE
            this.lowestSlot = currDiam;
          }
        }
      }
      
      if (this.frameCount % 5 === 0){
        if (this.torque > 0){
          this.torque -= Math.min(slowSpeed, this.torque);
        } else {
          this.torque += Math.min(slowSpeed, -this.torque);
        }
      }
      
      if (Math.abs(this.torque) < 0.01){
        this.torque = 0;
      }
      
      if (this.torque == 0){
        this.state = States.SNAPPING;
        console.log("Slot has stopped spinning");
      }
    } else if (this.state == States.SNAPPING){
      if (this.closestSlot === null){
        this.closestSlot = this.getClosestSlot();
        console.log("this.closestSlot is now " + this.closestSlot);
        this.closestSlot.state = States.WIN;
      }
      if (this.closestSlot.getCenterY() > this.snapY){
        //if slot is under line, go up
        this.shiftSlots(-snapSpeed);
      } else {
        //go down
        this.shiftSlots(snapSpeed);
      }
      if (Math.abs(this.closestSlot.getCenterY() - this.snapY) < snapSpeed){
        this.closestSlot.y = this.snapY - this.closestSlot.height/2;
        this.state = States.DONE;
        //this.state = States.FLASH;
      }
    } else if (this.state == States.FLASH){
      if (this.closestSlot == null){
        console.error("Error : closest slot should not be null here");
      }
      this.closestSlot.state = States.FLASH;
    } else if (this.state == States.WIN){
      this.closestSlot.state = States.WIN;
    }
    
  };
  
  this.resetSlots = function(){
    for (var i = 0; i < this.diamondArray.length; i++){
      this.diamondArray[i].state = States.SPINNING;
    }
  }
  
  this.spin = function(initialTorque){
    this.state = States.SPINNING;
    this.torque = initialTorque;
  };
  
  this.draw = function(){
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.fillStyle = this.colour;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
    //console.log("Drawing circle at x = " + this.x + " and y = " + this.y + " with radius "+ this.radius);
    for (var i = 0; i < this.diamondArray.length; i++){
      this.diamondArray[i].draw();
    }
  }
  
  this.collide = function(otherNode){
    var tempX = this.velocity.x;
    this.velocity.x = otherNode.velocity.x;
    otherNode.velocity.x = tempX;
    
    var tempY = this.velocity.y;
    this.velocity.y = otherNode.velocity.y;
    otherNode.velocity.y = tempY;
  };
}

function SlotMachine(slotVals){
  
  
  this.spin = function(){
    this.state = States.SPINNING;
    this.resetSlots();
    for (var i = 0; i < this.slotArray.length; i++){
      this.slotArray[i].spin(randSignedInt(15, 20));
      //this.slotArray[i].spin(1);
    }
    this.slotSpinCount = this.slotArray.length;
  }
  
  this.resetSlots = function(){
    /*for (var i = 0; i < this.slotArray.length; i++){
      this.slotArray[i].resetSlots();
    }*/
    this.createSlots();
  }
  
  this.update = function(){
    this.frameCount++;
    if (this.state == States.SPINNING){
      var finished = true;
      this.spinCount = 0;
      for (var i = 0; i < this.slotArray.length; i++){
        this.slotArray[i].update();
        if (this.slotArray[i].state != States.DONE){
          finished = false;
          this.spinCount++;
        }
      }
      if (finished){
        //this.state = States.WAITING;
        let winVal = this.hasWon();
        if (winVal != -1){
          this.state = States.FLASH;
          console.log("Adding cash " + winVal + " of type " + typeof(winVal));
          cashCounter.addCash(winVal);
          cashCounter.persistCash();
          console.log("going into flash mode");
        } else {
          this.state = States.LOSE;
        }
      }
    } else if (this.state == States.LOSE){
      for (var i = 0; i < this.slotArray.length; i++){
        this.slotArray[i].update();
      }
    } else if (this.state == States.FLASH){
      if (this.frameCount % this.flashFrameCount == 0){
        this.slotArray[this.currentFlashingIndex].state = States.WIN;
        this.currentFlashingIndex += 1;
        if (this.currentFlashingIndex >= this.slotArray.length){
          this.currentFlashingIndex = 0;
        }
        this.slotArray[this.currentFlashingIndex].state = States.FLASH;
        //console.log("setting slot array rotor number " + this.currentFlashingIndex + " to flash");
      }
      for (var i = 0; i < this.slotArray.length; i++){
        this.slotArray[i].update();
      }
    } else {
      
    }
  }
  
  this.hasWon = function(){
    this.slotCounts = {};
    for (var i = 0; i < this.slotArray.length; i++){
      let currentVal = this.slotArray[i].closestSlot.value;
      if (currentVal in this.slotCounts){
        this.slotCounts[currentVal] += 1;
      } else {
        this.slotCounts[currentVal] = 1;
      }
    }
    for (var key in this.slotCounts){
      if (this.slotCounts[key] == slotCount){
        console.log("We have a win !");
        return Number(key);
      }
    }
    return -1;
    console.log("And the final slots are...");
    console.log(this.slotCounts);
  }
  
  this.draw = function(){
    for (var i = 0; i < this.slotArray.length; i++){
      this.slotArray[i].draw();
    }
    if (this.state == States.SPINNING){
      //ctx.strokeText("Spinning : " + this.spinCount, 50, 300);
    } else if (this.state == States.WAITING){
      ctx.strokeText("Waiting", 50, 300);
    }
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.slotArray[0].x, this.winLineY);
    ctx.lineTo(this.slotArray[this.slotArray.length - 1].x + this.slotArray[this.slotArray.length - 1].width, this.winLineY);
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }
  
  this.createSlots = function(){
    console.log("Creating slots with winLine")
    this.slotArray = [];
    for (var i = 0; i < slotCount; i++){
      this.slotArray.push(new Slot(margin + i * slotWidth, 0, slotWidth, canvas.height, 0, 'rgb(200, 160, 100)', shuffleArray(slotValsManager.slotVals), Diamond, this.winLineY));
    }
  }
  
  
  this.slotArray = [];
  this.slotCounts = {};
  this.slotVals = slotVals;
  this.winLineY = canvas.height/2;
  this.currentFlashingIndex = 0;
  this.flashFrameCount = 4;
  this.frameCount = 0;
  this.createSlots();
  this.spin();
  this.state = States.SPINNING;
  
}

var margin = canvas.width / 4;
var slotAreaWidth = canvas.width - 2*margin; //The whole canvas minus left and right panels
var rightPanel = canvas.width - margin;
var leftPanel = 0;

var cashCounter = new CashCounter();
var slotValsManager = new SlotValsManager();
slotValsManager.load();

console.log(slotValsManager.slotVals);

cashCounter.loadCash();

var slotWidth = slotAreaWidth /slotCount;
var slotMachine = new SlotMachine(slotVals);
var diamondArray = [];
var slot = new Slot(200, 0, 80, canvas.height, 5, 'rgb(200, 150, 20)', Diamond);

var buttons = [];
var spinButtonMargin = 10;
var spinButton = new Button(spinButtonMargin, 50, margin - 2*spinButtonMargin, 30, 'rgb(100, 250, 150)', "Spin");
var add5Button = new Button(5, 100, 80, 30, 'rgb(100, 250, 150)', "Add 5");
buttons.push(spinButton);
//buttons.push(add5Button);

function addDiamond(x, y){
  diamondArray.push(new Diamond(null, x, y));
}

function init(){
  let buttonWidth = 190;
  let buttonHeight = 60;
  let i = 0;
  for(var val of Object.keys(newSlotPrices)){
    newSlotButtons.push(new Button(leftPanel + 20, 250 + (i * buttonHeight), buttonWidth, buttonHeight, 'rgb(180, 220, 100)', "Add " + val + " (" + newSlotPrices[val] + "$)"));
    newSlotButtons[i].setActionCommand(val);
    i++;
  }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var count = 0;


function animate(){
  //count++;
  if (count < 50){
    requestAnimationFrame(animate);
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  slotMachine.update();
  
  for (var i = 0; i < diamondArray.length; i++){
    diamondArray[i].draw();
  }
  
  for (var i = 0; i < buttons.length; i++){
    buttons[i].draw();
  }
  
  for (var i = 0; i < newSlotButtons.length; i++){
    newSlotButtons[i].draw();
  }
  
  slotMachine.draw();
  
  cashCounter.draw();
  
  slotValsManager.draw();
  
  ctx.font = "18px Georgia";
  let torque = "Torque : ";
  torque += slot.torque;
  ctx.strokeText(torque, 10, 10);
  
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, effectRadius, 0, 2*Math.PI, false);
  ctx.strokeStyle = 'purple';
  //ctx.stroke();
}

init();
animate();