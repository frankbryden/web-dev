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

const colours = ['#e842f4', '#162a99', '#ce1053', '#36a00cx'];

const AnimationStates = {
	Waiting: Symbol("summer"),
	Animating: Symbol("autumn"),
	Done: Symbol("winter"),
}

function distance(x1, y1, x2, y2) {
    const xDist = x2 - x1;
    const yDist = y2 - y1;
    return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
}

// Event Listeners
addEventListener('mousemove', event => {
    mouse.x = event.clientX
    mouse.y = event.clientY
});

addEventListener('keyup', event => {
    console.log(event.key);
    if (event.key == "r") {
        init();
    }
})

class AnimationObject {
    constructor(shape) {
        this.shape = shape;
        this.state = AnimationStates.Waiting;
        this.nextAnimationObjects = []; 
    }

    registerNextAnimationObject(obj) {
        this.nextAnimationObjects.push(obj);
    }

    startAnim() {
        this.state = AnimationStates.Animating;
    }

    doneWithAnim() {
        this.state = AnimationStates.Done;
        this.nextAnimationObjects.forEach(obj => obj.startAnim());
    }

    update() {
        if (this.state != AnimationStates.Animating) {
            return;
        }
        this.shape.update();
        if (this.shape.isDoneWithAnim()) {
            this.doneWithAnim();
        }
    }

    render() {
        this.shape.render();
    }
}

/**
 * Hooks two squares along their corners.
 * Visually, this is rendered as 4 lines joining each square's matching corner.
 */
class AnimatedSquareHook {
    constructor(ctx, squareA, squareB, stepCount) {
        this.ctx = ctx;
        this.stepCount = stepCount;
        this.step = 0;

        this.lines = [];
        for (let i = 0; i < 4; i++) {
            let lineA = squareA.shape.lines[i];
            let lineB = squareB.shape.lines[i];
            this.lines.push(this.createLine(lineA.start.x, lineA.start.y, lineB.start.x, lineB.start.y, stepCount));
        }
    }

    createLine(startX, startY, endX, endY, stepCount) {
        const angle = Math.atan2(endY - startY, endX - startX);
        const dist = distance(startX, startY, endX, endY);
        const stepSize = dist/stepCount;
        return {
            start: {
                x: startX,
                y: startY,
            },
            vel: {
                x: Math.cos(angle)*stepSize,
                y: Math.sin(angle)*stepSize,
            },
        }
    }

    isDoneWithAnim() {
        return this.step >= this.stepCount;
    }

    update() {
        this.step += 1;
    }

    render() {
        this.lines.forEach(line => {
            this.ctx.beginPath();
            this.ctx.moveTo(line.start.x, line.start.y);
            this.ctx.lineTo(line.start.x + line.vel.x*this.step, line.start.y + line.vel.y*this.step);
            this.ctx.stroke();
        });
    }
}


class AnimatedSquare {
    constructor(ctx, x, y, width, stepCount, angle, darkness) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.stepCount = stepCount;
        this.stepSize = width/stepCount;
        this.step = 0;
        this.angle = angle;
        this.darkness = darkness;
        this.direction = 1;

        this.lines = this.getLines(this.angle, this.width, this.stepSize);
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
                },
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

    isDoneWithAnim() {
        return this.step >= this.stepCount;
    }

    update() {
        this.step += this.direction;
    //     if (this.direction > 0) {
    //         if (this.step >= this.stepCount){
    //             this.doneWithAnim();
    //             this.direction *= -1;
    //         }
    //     } else {
    //         if (this.step < 0){
    //             this.direction *= -1;
    //         }
    //     }
    }

    render() {
        for (let lineName of Object.keys(this.lines)) {
            let line = this.lines[lineName];
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.moveTo(line.start.x, line.start.y);
            this.ctx.lineTo(line.start.x + (this.step*line.vel.x), line.start.y + (this.step*line.vel.y));
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = `rgb(${this.darkness}, 255, 100)`;
            this.ctx.stroke();
            this.ctx.restore();
        }
    }

}

let squares = [];
let hooks = [];
let x = 400;
let y = 300;

menu = document.getElementById("menu");
let square_count_slider = new Slider(menu, "Square count", 1, 500, 1, 20);
let rotations_slider = new Slider(menu, "Rotations", 0, 4, 0.1, 0.4);
let width_step_ratio_slider = new Slider(menu, "Width step ratio", 0, 1, 0.05, 0.2);

console.log(square_count_slider.value());

function init(){
    hooks = [];
    squares = [];
    let angle = 0;
    let width = 500;
    const squareCount = square_count_slider.value();
    const rotations = rotations_slider.value();
    const angleStep = (2*Math.PI*rotations)/squareCount;
    const widthStepRatio = width_step_ratio_slider.value();
    let d = 0;
    for (let i = 0; i < squareCount; i += 1) {
        let centerX = x-Math.cos(angle)*width/2 + Math.sin(angle)*width/2;
        let centerY = y-Math.sin(angle)*width/2 - Math.cos(angle)*width/2;
        squares.push(new AnimationObject(new AnimatedSquare(ctx, centerX, centerY, width, Math.max(20 - i, 1), angle, Math.floor(Math.min(d*(255/squareCount), 255)))));
        d++;
        if (i > 0) {
            hooks.push(new AnimationObject(new AnimatedSquareHook(ctx, squares[i - 1], squares[i], 5)));
            squares[i-1].registerNextAnimationObject(hooks[i - 1]);
            hooks[i - 1].registerNextAnimationObject(squares[i]);
        }
        angle += angleStep;
        width *= (1-widthStepRatio);
    }
    console.log(squares);
    squares[0].startAnim();
}

function animate(){
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let square of squares) {
        square.update();
        square.render();
    }
    for (let hook of hooks) {
        hook.update();
        hook.render();
    }

}

init();
animate();

// setInterval(animate, 10);
