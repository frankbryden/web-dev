let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext('2d');

canvas.width = window.innerWidth - 10;
canvas.height = window.innerHeight - 10;


let gravity = 1;
let friction = 0.95;

function Ball(id, x, y, dy, radius, color) {
	this.x = x;
	this.y = y;
	this.dy = dy;
	this.radius = radius;
	this.color = color;
	this.bouncing = true;
	this.bounceTimeout = {};
	this.id = id;

	this.update = function () {
		if (this.y + this.radius + this.dy / 2 > canvas.height) {
			this.dy *= -friction;
		} else {
			if (this.bouncing) {
				this.dy += gravity;
			}
		}
		if (Math.abs(this.dy) < 0.05 && this.y + this.radius >= canvas.height) {
			this.dy = 0;
			this.bouncing = false;
		}
		this.y += this.dy;
		for (let id in this.bounceTimeout) {
			this.bounceTimeout[parseInt(id, 10)].timer -= 1;
			if (this.bounceTimeout[id].timer <= 0) {
				delete (this.bounceTimeout[id]);
			}
		}
		this.draw();
	};

	this.draw = function () {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
		if (this.bouncing) {
			ctx.fillStyle = this.color;
		} else {
			ctx.fillStyle = 'red';
		}
		ctx.fill();
		ctx.closePath();
	};

	this.collide = function (otherBall) {
		for (let id in this.bounceTimeout) {
			if (otherBall.id == id) {
				return false;
			}
		}
		let tempDy = otherBall.dy;
		otherBall.dy = this.dy;
		this.dy = tempDy;
		this.bounceTimeout[otherBall.id] = { timer: 50 };
		return true;
	};

	this.getDistance = function (otherBall) {
		return Math.sqrt(Math.pow(otherBall.x - this.x, 2) + Math.pow(otherBall.y - this.y, 2));
	};
}

let b = new Ball(-1, 100, 200, 0.5, 50, 'rgb(100, 50, 255)');
let ballArray = [];
let count = 0;
function animate() {
	console.log("anim");
	count++;
	if (count > 0) {
		requestAnimationFrame(animate);
	}
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (let i = 0; i < ballArray.length; i++) {
		//if (ballArray[i])
		ballArray[i].update();
		for (let j = i + 1; j < ballArray.length; j++) {
			if (ballArray[i].getDistance(ballArray[j]) <= ballArray[i].radius + ballArray[j].radius) {
				//We have a collision
				ballArray[i].collide(ballArray[j]);
			}
		}
	}
	b.update();
}

function init() {
	for (let i = 0; i < 10; i++) {
		let x = Math.random() * window.innerWidth;
		let y = Math.random() * (window.innerHeight - 50);
		let ball = new Ball(i, x, y, Math.random() * 3, Math.random() * 10 + 20, 'rgb(10, 100, 100)');
		for (let j = 0; j < ballArray.length; j++) {
			if (ballArray[j].getDistance(ball) <= ballArray[j].radius + ball.radius) {
				j = 0;
				ball.x = Math.random() * window.innerWidth;
				ball.y = Math.random() * (window.innerHeight - 50);
			}
		}
		ballArray.push(ball);
	}
}

init();

animate();