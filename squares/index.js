var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext('2d');

var radius = 7;
var baseOpacity = 0.1;
var trailCount = 10;
var trailAngleDiff = 10;

canvas.width = window.innerWidth - 10;
canvas.height = window.innerHeight - 10;

const mouse = {
    x: innerWidth / 2,
    y: innerHeight / 2
}

const colours = ['#e842f4', '#162a99', '#ce1053', '#36a00cx']

// Event Listeners
addEventListener('mousemove', event => {
    mouse.x = event.clientX
    mouse.y = event.clientY
})

// Utility Functions
function randInt(min, max) {
    let r = Math.floor(Math.random() * (max - min + 1) + min);
    //console.log("Rand number between " + min + " and " + max + " = " + r);
    //return Math.floor(Math.random() * (max - min + 1) + min);
    return r;
}

function randSmallInt(min, max) {
    let r = Math.floor((Math.random() * (max - min + 1) + min + 0.00001) * 100)/100;
    console.log("Small Rand number between " + min + " and " + max + " = " + r);
    //return Math.floor(Math.random() * (max - min + 1) + min);
    return r;
}

function randomColour(colours) {
    return colours[Math.floor(Math.random() * colours.length)]
}

function distance(x1, y1, x2, y2) {
    const xDist = x2 - x1
    const yDist = y2 - y1

    return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2))
}

function connectNodes(node1, node2){
  ctx.beginPath();
  ctx.moveTo(node1.x, node1.y);
  ctx.lineTo(node2.x, node2.y);
  ctx.strokeStyle = "black";
  ctx.stroke();
  ctx.closePath();
}

class AnimatedSquare {
    constructor(ctx, x, y, width, stepCount, angle) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.stepCount = stepCount;
        this.stepSize = width/stepCount;
        console.log(`StepCount = ${stepCount}, stepSize = ${this.stepSize}, width = ${width}`);
        this.step = 0;
        this.angle = angle;
        this.direction = 1;
        
        // this.lines = {
        //     top: this.createLine(this.x, this.y, this.x, this.y, angle),
        //     right: this.createLine(this.x + this.width, this.y, this.x, this.y, angle+Math.PI/2),
        //     // bottom: this.createLine(this.x + this.width, this.y + this.width, this.x, this.y, angle+Math.PI),
        //     // left: this.createLine(this.x, this.y + this.width, this.x, this.y, angle-Math.PI/2),
        // };
        this.lines = this.getLines(this.angle, this.width, this.stepSize);
        console.log(this.lines);
    }

    getLines(startAngle, width, stepSize) {
        let lines = [];
        let curX = this.x;
        let curY = this.y;
        let curAngle = startAngle;
        for (let i = 0; i < 4; i++) {
            lines.push({
                start: {
                    x: curX,
                    y: curY,
                },
                vel: {
                    x: Math.cos(curAngle)*stepSize,
                    y: Math.sin(curAngle)*stepSize,
                }
            });
            curX += Math.cos(curAngle)*width;
            curY += Math.sin(curAngle)*width;
            curAngle += Math.PI/2;
        }
        return lines;
    }

    createLine(start_x, start_y, end_x, end_y, angle) {
        const vel_x = Math.cos(angle);
        const vel_y = Math.sin(angle);
        const x = vel_x * this.width;
        const y = vel_y * this.width;
        const x_rot = vel_x * (x - this.x) - vel_y * (y - this.y) + this.x;
        const y_rot = vel_y * (x - this.x) + vel_x * (y - this.y) + this.y;
        console.log(x_rot);
        console.log(y_rot);
        return {
            start: {
                x: start_x,
                y: start_y,
            },
            end: {
                x: x_rot,
                y: y_rot,
            },
            vel_x: Math.cos(angle)*this.stepSize,
            vel_y: Math.sin(angle)*this.stepSize,
            angle: angle,
        }
    }

    update() {
        if (this.step >= this.stepCount) {
            return;
        }
        this.step += this.direction;
        if (this.direction > 0) {
            if (this.step > this.stepCount){
                this.direction *= -1;
            }
        } else {
            if (this.step < 0){
                this.direction *= -1;
            }
        }
    }

    render() {
        // this.ctx.save();
        // this.ctx.translate(this.x, this.y);
        // this.ctx.rotate(this.angle);
        // this.ctx.beginPath();
        // this.ctx.arc(this.x, this.y, 5, 0, 2*Math.PI);
        // this.ctx.fillColor = 'red';
        // this.ctx.fill();
        for (let lineName of Object.keys(this.lines)) {
            let line = this.lines[lineName];
            this.ctx.beginPath()
            this.ctx.moveTo(line.start.x, line.start.y);
            this.ctx.lineTo(line.start.x + (this.step*line.vel.x), line.start.y + (this.step*line.vel.y));
            // this.ctx.lineTo(line.end.x, line.end.y);
            // this.ctx.fillText(`${lineName} with angle ${line.angle} (dist = ${Math.sqrt(Math.pow(line.start.x - line.start.x - (this.step*line.vel.x), 2) + (line.start.y - line.start.y - (this.step*line.vel.y)))})`, line.start.x + (this.step*line.vel.x), line.start.y + (this.step*line.vel.y) - line.start.y/10);
            this.ctx.stroke();
        }
        // this.ctx.restore();
        // this.ctx.beginPath();
        // this.ctx.rect(this.x, this.y, this.width, this.width);
        // this.ctx.stroke();
    }

}

let square = new AnimatedSquare(ctx, 300, 300, 200, 10, 0);
let square2 = new AnimatedSquare(ctx, 800, 300, 100, 200, Math.PI/6);
let squares = [];
let x = 400;
let y = 300;

function init(){
    let angle = 0;
    let width = 500;
    const squareCount = 100;
    const rotations = 3.5;
    const angleStep = (2*Math.PI*rotations)/squareCount;
    const widthStepRatio = 0.1;
    for (let i = 0; i < squareCount; i += 1) {
        let centerX = x-Math.cos(angle)*width/2 + Math.sin(angle)*width/2;
        let centerY = y-Math.sin(angle)*width/2 - Math.cos(angle)*width/2;
        console.log(x, y, centerX, centerY);
        squares.push(new AnimatedSquare(ctx, centerX, centerY, width, 100, angle));
        angle += angleStep;
        // x += widthStepRatio*width*Math.cos(angle);
        // y += widthStepRatio*width*Math.sin(angle);
        width *= (1-widthStepRatio);
    }
}

function animate(){
    // requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ctx.save();
    // ctx.beginPath();
    // ctx.arc(x, y, 5, 0, 2*Math.PI);
    // ctx.fillStyle = "red";
    // ctx.fill();
    // ctx.restore();

    for (let square of squares) {
        square.update();
        square.render();
    }

    // square.update();
    // square.render();
    // square2.update();
    // square2.render();
}

init();
animate();

setInterval(animate, 10);