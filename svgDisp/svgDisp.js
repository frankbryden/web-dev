var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext('2d');


var cvs = document.createElement('canvas');
/*img.crossOrigin = "";*/


var currentMode;

var svg;
var rendering = false;

var a = "M100,200 C100,100 250,100 250,200 S400,300 400,200S";

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

function isUpperCase(c){
  if (c.length > 1){
    return false;
  }
  return c === c.toUpperCase() && c !== c.toLowerCase();
}

function readSingleFile(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = e.target.result;
    svg = parseImg(contents);
    svg.draw();
    //renderImg(img);
  };
  reader.readAsText(file);
}

// Event Listeners
document.getElementById('file-input')
  .addEventListener('change', readSingleFile, false);
  
document.getElementById("renderBtn").addEventListener("click", () => svg.draw());
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

class Point {
  constructor(x, y){
    this.x = x;
    this.y = y;
  }
}

class SvgShape{
  constructor(fill, stroke, strokeWidth){
    this.fill = fill == "none" ? undefined : fill;
    this.stroke = stroke == "none" ? undefined : stroke;
    this.strokeWidth = strokeWidth;
  }
  
  paint(){
    
    if (this.stroke){
      ctx.strokeStyle = this.stroke;
      if (this.strokeWidth){
        ctx.lineWidth = this.strokeWidth;
      }
      ctx.stroke();
    }
    if (this.fill){
      ctx.fillStyle = this.fill;
      ctx.fill();
    }
  }
}

class Line extends SvgShape {
  constructor(x1, y1, x2, y2, fill, stroke, strokeWidth){
    super(fill, stroke, strokeWidth);
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }
  
  draw(){
    ctx.beginPath();
    ctx.moveTo(this.x1, this.y1);
    ctx.lineTo(this.x2, this.y2);
    super.paint();
  }
}

class PolyLine extends SvgShape {
  constructor(points, fill, stroke, strokeWidth){
    super(fill, stroke, strokeWidth);
    this.points = points;
  }
  
  draw(){
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    for (let i = 0; i <= this.points.length - 2; i++){
      ctx.moveTo(this.points[i].x, this.points[i].y);
      ctx.lineTo(this.points[i + 1].x, this.points[i+1].y);
      console.log("line to " + this.points[i + 1].x + ", " + this.points[i+1].y);
      super.paint();
    }
  }
}

class Polygon extends SvgShape {
  constructor(points, fill, stroke, strokeWidth){
    super(fill, stroke, strokeWidth);
    this.points = points;
  }
  
  draw(){
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i <= this.points.length - 1; i++){
      ctx.lineTo(this.points[i].x, this.points[i].y);
      
    }
    ctx.lineTo(this.points[0].x, this.points[0].y);
    ctx.closePath();
    super.paint();
  }
}

class Rect extends SvgShape {
  constructor(x, y, w, h, fill, stroke, strokeWidth){
    super(fill, stroke, strokeWidth);
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.stroke = stroke;
    this.fill = fill;
  }
  
  draw(){
    ctx.rect(this.x, this.y, this.w, this.h);
    super.paint();
  }
}

class Circle extends SvgShape {
  constructor(cx, cy, r, fill, stroke){
    super(fill, stroke);
    this.x = cx;
    this.y = cy;
    this.r = r;
  }
  
  draw(){
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
    super.paint();
  }
}

class Path extends SvgShape {
  constructor(pathCommands, fill, stroke, strokeWidth){
    super(fill, stroke, strokeWidth);
    this.pathCommands = pathCommands;
  }
  
  draw(){
    console.log("NEW PATH SHAPE");
    let lastX = 0, lastY = 0;
    let lastCommand = undefined;
    ctx.beginPath();
    for (let pc of this.pathCommands){
      console.log(pc);
      pc.applyIfRelative(lastX, lastY);
      if (pc instanceof MoveCommand){
        ctx.moveTo(pc.point.x, pc.point.y);
        console.log("move to " + pc.point.x + ", " + pc.point.y);
      } else if (pc instanceof LineCommand){
        ctx.lineTo(pc.point.x, pc.point.y);
        console.log("line to " + pc.point.x + ", " + pc.point.y);
      } else if (pc instanceof CurveCommand){
        let previousCp = lastCommand === undefined ? new Point(lastX, lastY) : lastCommand instanceof CurveCommand ? lastCommand.lastCp : new Point(lastX, lastY);
        pc.resolveSmoothCurve(previousCp.x, previousCp.y, lastX, lastY);
        if(pc.quadratic){
          ctx.quadraticCurveTo(pc.cp1.x, pc.cp1.y, pc.end.x, pc.end.y);
        } else {
          ctx.bezierCurveTo(pc.cp1.x, pc.cp1.y, pc.cp2.x, pc.cp2.y, pc.end.x, pc.end.y);
        }
        
        console.log("curve to " + pc.end.x + ", " + pc.end.y);
      } else if (pc instanceof FillCommand){
        let origin = this.pathCommands[0].endPoint;
        ctx.lineTo(origin.x, origin.y);
        ctx.closePath();
        super.paint();
      }
      lastX = pc.endPoint.x;
      lastY = pc.endPoint.y;
      lastCommand = pc;
      console.log("(lastX, lastY) " + lastX + ", " + lastY);
    }
    
    super.paint();
  }
}

class SvgImg {
  constructor(w, h){
    this.w = w;
    this.h = h;
    this.shapes = [];
  }
  
  draw(){
    console.log(this.shapes);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let shape of this.shapes){
      shape.draw();
    }
  }
}

//Path Commands

class PathCommand {
  constructor(endPoint){
    this.endPoint = endPoint;
  }
  
  
}

class MoveCommand extends PathCommand {
  constructor(point, relative){
    super(point);
    this.point = point;
    this.relative = relative;
  }
  
  applyIfRelative(lastX, lastY){
    if (!this.relative){
      return;
    }
    
    this.point.x += lastX;
    this.point.y += lastY;
  }
}

class LineCommand extends PathCommand {
  constructor(point, relative){
    super(point);
    this.point = point;
    this.relative = relative;
  }
  
  applyIfRelative(lastX, lastY){
    if (!this.relative){
      return;
    }
    
    this.point.x += lastX;
    this.point.y += lastY;
  }
}

class CurveCommand extends PathCommand {
  constructor(cp1, cp2, end, relative){
    super(end);
    
    if (relative === undefined){
      this.quadratic = true;
      //we know this is not a quadratic curve. Expecting 1 cp. Either cp1 is undefined (smooth) or it is not.
      this.cp1 = cp1;
      this.end = cp2;
      this.relative = end;
    } else {
      this.quadratic = false;
      //we know this is not a quadratic curve. Expecting 2 cps. Either cp1 is undefined (smooth) or it is not.
      this.cp1 = cp1;
      this.cp2 = cp2;
      this.end = end;
      this.relative = relative;
    }
    
    super.endPoint = this.end;
  }
  
  init(lastX, lastY){
    this.applyIfRelative(lastX, lastY);
    this.resolveSmoothCurve(lastX, lastY);
  }
  
  applyIfRelative(lastX, lastY){
    if (!this.relative){
      return;
    }
    
    this.cp1.x += lastX;
    this.cp1.y += lastY;
   
    this.cp2.x += lastX;
    this.cp2.y += lastY;
   
    this.end.x += lastX;
    this.end.y += lastY;
    
    this.relative = false;
  }
  
  get lastCp(){
    return this.quadratic ? this.cp1 : this.cp2;
  }
  
  resolveSmoothCurve(cp2X, cp2Y, lastX, lastY){
    let deltaX = cp2X - lastX;
    let deltaY = cp2Y - lastY;
    if (this.cp1 === undefined){
      this.cp1 = new Point(lastX - deltaX, lastY - deltaY);
      console.log("RESOLUTION APPLIED");
    }
  }
}

class FillCommand extends PathCommand {
  constructor(){
    super(new Point(0, 0));
  }
  
  applyIfRelative() {
    
  }
  
  draw() {
    
  }
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
  let parser = new DOMParser();
  xml = parser.parseFromString(data, "text/html");
  let svgRoot = xml.getElementsByTagName("svg")[0];
  console.log(xml.getElementsByTagName("svg"));
  console.log(svgRoot);
  let width = svgRoot.width.baseVal.value;
  let height = svgRoot.height.baseVal.value;
  let svg = new SvgImg(width, height);
  console.log(svg);
  for (let shapeChild of svgRoot.children){
    let shape = parseShape(shapeChild);
    if (shape !== null)
      svg.shapes.push(shape);
  }
  console.log(svgRoot);
  return svg;
}

function parsePoints(data){
  return data.trim().split(" ").map(s => {
        let parts = s.split(",").map(d => parseInt(d));
        return new Point(parts[0], parts[1]);
      });
}

function parsePathCommand(code, data){
  console.log("Parsing command with code " + code + " and data " + data);
  let points = parsePoints(data);
  let relative = !isUpperCase(code);
  let commands = [];
  switch(code.toUpperCase()){
    case "M":
      for (let point of points){
        commands.push(new MoveCommand(point, relative));
      }
      break;
    case "L":
      for (let point of points){
        commands.push(new LineCommand(point, relative));
      }
      break;
    case "C":
      for (let i = 0; i < points.length/3; i++){
          commands.push(new CurveCommand(points[i], points[i+1], points[i+2], relative));
      }
      break;
    case "S":
      for (let i = 0; i < points.length/2; i++){
          commands.push(new CurveCommand(undefined, points[i], points[i+1], relative));
      }
      break;
    case "Q":
      for (let i = 0; i < points.length/2; i++){
        commands.push(new CurveCommand(points[i], points[i+1], relative));
      }
      break;
    case "T":
      for (let i = 0; i < points.length; i++){
        console.log("creating smooth quadratic curve with point ");
        console.log(points[i]);
        commands.push(new CurveCommand(undefined, points[i], relative));
      }
      break;
    case "H":
      points = data.trim().split(" ").map(n => new Point(parseInt(n), 0));
      for (let point of points){
        commands.push(new LineCommand(point, relative));
      }
      break;
    case "V":
      points = data.trim().split(" ").map(n => new Point(0, parseInt(n)));
      for (let point of points){
        commands.push(new LineCommand(point, relative));
      }
      break;
    default:
      console.log("unknown code " + code);
      commands.push(new LineCommand(new Point(0, 0), relative));
      break;
  }
  return commands;
  
}

var CharType = {
  DIGIT: "digit",
  COMMA: "comma",
  FULL_STOP: "full stop",
  SPACE: "space",
  HYPHEN: "hyphen",
  COMMAND: "command",
  UNKNOWN : "unknown"
}

class CharData {
  constructor(charType, data){
    this.type = charType;
    this.data = data;
  }
}

function getCharType(c){
  if (c == ","){
    return CharType.COMMA;
  } else if (c == "."){
    return CharType.FULL_STOP;
  } else if (c == " "){
    return CharType.SPACE;
  } else if (c == "-"){
    return CharType.HYPHEN;
  } else if ("CcQqTtMmLlSsVvHhzZ".indexOf(c) > -1){
    return CharType.COMMAND;
  }
  let n = parseInt(c);
  return n == NaN ? CharType.UNKNOWN : CharType.DIGIT;
}

class PathParser {
  constructor(data){
    this.data = data;
    this.commands = [];
    this.pointBuffer = []; //Add points to this as we get them. Consumed by commands. eg. curve command consumes 3.
    this.numbers = []; //numbers get added here, then consumed to go into the pointbugger. In turn consumed by commands.
    this.currentCommand, this.currentNumber = "";
    this.commandsRequiredArgsLength = {
      "M" : 2,
      "L" : 2,
      "H" : 1,
      "V" : 1,
      "C" : 6,
      "S" : 4,
      "Q" : 4,
      "T" : 2,
      "Z" : 0
    }
  }
  
  parse(){
    for (let c of this.data){
      //It's either a new command
      // or a digit -> digit making up a number in a point
      // or a comma -> second component of a point
      // or a full stop -> decimal
      // or a space -> new point
      // or a hyphen -> negative sign, can be used as an implied separator
      let type = getCharType(c);
      switch(type){
        case CharType.COMMA:
          //we reached a separator. Parse current number, add it to our numbers, and clear it.
          this.consumeCurrentNumberBuffer();
          //If we have 2 numbers, consume them to form a point, and add it to the point buffer.
          /*if (numbers.length == 2){
            pointBuffer.push(new Point(numbers[0], numbers[1]));
            numbers = [];
          }
          currentNumber = "";*/ //Don't do that!! Some params (H or V for ex) simply require one number, and not a point.
          break;
        case CharType.FULL_STOP:
          //Simply a decimal. Not much to do other than add it to the current number
          this.currentNumber += ".";
          break;
        case CharType.SPACE:
          //I think this is always a separator. Not 100% sure though. No spaces in our more advanced test files anyways.
          console.log("not doing anything with this space");
          break;
        case CharType.HYPHEN:
          this.consumeCurrentNumberBuffer();
          this.currentNumber += "-";
          break;
        case CharType.COMMAND:
          //Multiple things need to be done here. First off, keep track of current command. Needed cause a list of points
          //may follow, without a command character, the last used command implied.
          //Point buffer needs to be consumed to create a command based on the previous command character.
          this.consumeCurrentNumberBuffer();
          this.attemptNextCommand(); //Before we switch to new command, complete previous.
          this.currentCommand = c;
          console.log("Current command is now: " + this.currentCommand);
          break;
        case CharType.DIGIT:
          this.currentNumber += c;
          break;
        default:
          console.log("here");
      }
      this.attemptNextCommand();
      /*console.log(this.numbers);*/
      
    }
    console.log(this.commands);
    return this.commands;
    
  }
  
  consumeCurrentNumberBuffer(){
    //if (!this.canBeConsumedNumberBuffer()) return;
    if (this.currentNumber.length == 0) return
    console.log("Consuming : " + this.currentNumber);
    this.numbers.push(parseFloat(this.currentNumber));
    console.log(this.numbers);
    this.currentNumber = "";
  }
  
  attemptNextCommand(){
    if (this.currentCommand == undefined) return;
    let argLength = this.commandsRequiredArgsLength[this.currentCommand.toUpperCase()];
    let nextCommand;
    if (argLength == 1 && this.numbers.length == 1){
      nextCommand = this.getNextCommand();
    } else if (this.numbers.length >= argLength){
      nextCommand = this.getNextCommand();
    }
    if (nextCommand == undefined){
      return;
    }
    this.commands.push(nextCommand);
    console.log(this.commands);
    console.log(this.numbers);
  }
  
  getNextCommand(){
    let relative = !isUpperCase(this.currentCommand);
    switch (this.currentCommand.toUpperCase()){
      case "M":
        var end = this.getPoint();
        return new MoveCommand(end, relative);
      case "L":
        var end = this.getPoint();
        return new LineCommand(end, relative);
       case "H":
        var value = this.getNumber();
        return new LineCommand(new Point(value, 0), relative);
      case "V":
        var value = this.getNumber();
        return new LineCommand(new Point(0, value), relative);
      case "C":
        var end = this.getPoint();
        var cp2 = this.getPoint();
        var cp1 = this.getPoint();
        return new CurveCommand(cp1, cp2, end, relative);
      case "S":
        var end = this.getPoint();
        var cp2 = this.getPoint();
        return new CurveCommand(undefined, cp2, end, relative);
      case "Q":
        var end = this.getPoint();
        var cp = this.getPoint();
        return new CurveCommand(cp, end, relative);
      case "T":
        var end = this.getPoint();
        return new CurveCommand(undefined, end, relative);
      case "Z":
        return new FillCommand();
    }
  }
  
  getNumber(){
    return this.numbers.pop();
  }
  
  getPoint(){
    let y = this.getNumber();
    let x = this.getNumber();
    return new Point(x, y);
  }
  
  consumePointBuffer(){
    
  }
  
  canBeConsumedPoint(){
    return this.pointBuffer.length >= this.commandsRequiredArgsLength[this.currentCommand];
  }
  
  
}

function parsePath(data){
  let commands = [];
  let pointBuffer = []; //Add points to this as we get them. Consumed by commands. eg. curve command consumes 3.
  let numbers = []; //numbers get added here, then consumed to go into the pointbugger. In turn consumed by commands.
  let currentCommand, currentNumber = "";
  
  
  console.log(commands);
}

function genPathCommand(code, point){
  
}

function groupPathCommands(data){
  console.log(data);
  let spliced = data.replace("\n", "").replace("\r", "").replace("\t", "").split(/([CcQqTtMmLlSsVvHh])/g);
  let emptyStrippedStart = 0;
  let emptyStrippedEnd = spliced.length;
  
  //Strip off starting and trailing empty str
  if (spliced[0].length === 0){
    emptyStrippedStart = 1;
  }
  if (spliced[spliced.length - 1].length === 0){
    emptyStrippedEnd = spliced.length - 2;
  }
  console.log(spliced);
  spliced = spliced.splice(emptyStrippedStart,emptyStrippedEnd);
  
  let grouped = [];
  for (let i = 0; i <= spliced.length - 2; i+=2){
    let commands = parsePathCommand(spliced[i], spliced[i + 1]);
    console.log(commands);
    for (var command of commands){
      grouped.push(command);
    }
    
    //grouped.push({[spliced[i]] = spliced[i+1];
  }
  console.log(grouped);
  return grouped;
}

function parseShape(shape){
  let attr = shape.attributes;
  let fill = attr.fill? attr.fill.value : undefined;
  let stroke = attr.stroke ? attr.stroke.value : undefined;
  let strokeWidth = attr["stroke-width"] ? attr["stroke-width"].value : undefined;
  let points;
  switch(shape.nodeName){
    case "circle":
      return new Circle(parseInt(attr.cx.value), parseInt(attr.cy.value), parseInt(attr.r.value), fill, stroke);
    case "rect":
      return new Rect(parseInt(attr.x.nodeValue), parseInt(attr.y.nodeValue), parseInt(attr.width.nodeValue), parseInt(attr.height.nodeValue), fill, stroke, strokeWidth);
    case "polyline":
      points = parsePoints(attr.points.value);
      console.log(points);
      return new PolyLine(points, fill, stroke, strokeWidth);
    case "polygon":
      points = parsePoints(attr.points.value);
      console.log("Polygon");
      console.log(points);
      return new Polygon(points, fill, stroke, strokeWidth);
    case "line":
      return new Line(parseInt(attr.x1.value), parseInt(attr.y1.value), parseInt(attr.x2.value), parseInt(attr.y2.value), fill, stroke, strokeWidth);
    case "desc":
      console.log(shape.innerHTML);
      return null;
    case "path":
      let parser = new PathParser(attr.d.value);
      let pathCommands = parser.parse();//groupPathCommands(attr.d.value);
      return new Path(pathCommands, fill, stroke, 2);
    default:
      return null;
  }
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

var pathData = "M821.1949,614.8401c-0.0492-0.0232-0.0984-0.046-0.1478-0.0692c-17.5145-8.0881-30.0135-4.9405-37.4157-0.8752c-10.4772,5.7531-17.5582,17.0209-19.428,30.9158c-2.0208,15.0541,8.2581,25.486,19.4572,27.9868c9.327,2.0931,17.485-1.616,19.8427-9.0255c2.8452-8.9625-2.4808-16.5321-7.1791-23.2117c-3.4207-4.8602-6.65-9.4529-5.4698-12.928";
let parser = new PathParser(pathData);
let commands = parser.parse();
let img = new SvgImg(10, 10);
img.shapes.push(new Path(commands, "red", "blue", 2));
//img.draw();
//parsePath(pathData);

var count = 0;

function animate(){
  //console.log(spawnPoints);
  count++;
  if (count < 200){
    requestAnimationFrame(animate);
  }
  img.draw();
  //requestAnimationFrame(animate);
}

//animate();