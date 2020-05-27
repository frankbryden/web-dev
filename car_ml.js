var population, stats, track
var targets = []
var step = 0
var lifetime = 1000
var generation = 1
var maxForce = 0.2
var populationSize = 200
var carsLeft = populationSize
var blocks = []
var block
var collision
var blockParams

function setup() {
  createCanvas(480, 380)
  
  blockParams = [
    { x: -100, y: -150, w: 200, h: 200 },
    { x: 140, y: -150, w: 200, h: 200 },
    { x: width-100, y: -150, w: 200, h: 200 },
    { x: -100, y: 90, w: 200, h: 200 },
    { x: 140, y: 90, w: 200, h: 200 },
    { x: width-100, y: 90, w: 200, h: 200 },
    { x: -100, y: height-50, w: 200, h: 200 },
    { x: 140, y: height-50, w: 200, h: 200 },
    { x: width-100, y: height-50, w: 200, h: 200 }
  ]
  
  population = new Population(width-50, height-70, 5, 10)
  targets.push(
    new Target(120, 120,20,20)
  )
  stats = new Stats()
  
  for(var i = 0; i < blockParams.length; i++) {
    blocks.push(new Block(blockParams[i]))
  }
  
  collision = new Collision()
}

function draw() {
  background(27,27,27)
  targets.forEach(function(target) {
    target.show()
  })
  
  blocks.forEach(function(block) {
    block.show()
  })
  
  population.run()
  
  step++
  stats.setSteps(step)
  stats.setCarsCount(carsLeft)
  if(step == lifetime || carsLeft <= 0) {
    population.evaluate()
    step = 0
    carsLeft = populationSize
  }
}

function Block(params) {
  this.width = params.w || 10
  this.height = params.h || 10
  this.x = params.x || 0
  this.y = params.y || 0
  
  this.show = function() {
    fill(27,27,27)
    strokeWeight(3)
    stroke(150, 135, 135)
    rect(this.x, this.y, this.width, this.height)
  }
}

function Collision() {
  this.detect = function(posX, posY) {
    
    for(var i = 0; i < blocks.length; i++) {
      if(posX > blocks[i].x &&
          posX < blocks[i].x + blocks[i].width &&
        posY > blocks[i].y &&
        posY < blocks[i].y + blocks[i].height) {
        // console.log(i)
        return true
      }
    }
  }
}

function Car(x, y, w, h) {
  this.width = w
  this.length = h
  this.position = createVector(x, y)
  this.velocity = createVector()
  this.acceleration = createVector()
  this.dna = new DNA()
  this.fitness = 0
  this.complited = false
  this.disqualified = false
  this.removed = false
  this.step = 0
  this.targetId = 0
  this.color = '#fecb2f'
  this.finish = false
  
  this.removeFromList = function() {
    if(!this.removed) {
      carsLeft--
      this.removed = true
      this.step = step
    }
  }
  
  this.crossover = function(partner) {
    var child = new Car(x, y, w, h)
    var genesLength = this.dna.getLength()
    var midPoint = floor(random(genesLength))
    
    for(var i = 0; i < genesLength; i++) {
      if(i > midPoint) {
        child.dna.genes[i] = this.dna.genes[i]
      } else {
        child.dna.genes[i] = partner.dna.genes[i]
      }
    }
    
    child.dna.mutation()
    
    return child
  }
  
  this.calcFitness = function() {
    var distance = dist(this.position.x, this.position.y, targets[this.targetId].position.x, targets[this.targetId].position.y)
    
    // this.fitness = map(distance, 0, width, width, 0)
    this.fitness = 1 / distance
    
    // this.fitness = norm(this.fitness, 0, 100)
    // this.fitness = distance/this.dna.genes.length
    if(this.fitness > 0) {
       this.fitness = pow(this.fitness, 2)
    }
    
    if(this.complited) {
      this.fitness *= 1 + (10/this.step)
    }
    
    // if(this.disqualified) {
    //   this.fitness *= this.step
    // }
    // this.fitness = floor(this.fitness, 2)
    // console.log(this.fitness)
  }
  
  this.applyForce = function(force) {
    this.acceleration.add(force)
  }
  
  this.changeTarget = function() {
    
    var colors = [
      '#4124fb',
      '#fc0d1b',
      'yellow',
      'black'
    ]
    
    if(this.complited) {
      var targetId = this.targetId + 1
      
      this.color = colors[targetId]
      
      if(targetId < targets.length) {
        this.targetId = targetId
        this.complited = false

        // console.log(this.targetId)
      } else {
        this.finish = true
        this.complited = true
        this.removeFromList()
      }
    }
  }
  
  this.move = function() {
    
    // var distance = dist(this.position.x, this.position.y, targets[this.targetId].position.x, targets[this.targetId].position.y)
    // if(distance < (targets[this.targetId].width/2)) {
    //   this.complited = true
    //   this.changeTarget()
    // }
    
    // console.log(targets[this.targetId])
    
    if(targets[this.targetId].detect(this.position.x, this.position.y)) {
      this.complited = true
      this.changeTarget()
    }
    
    
    if(!this.disqualified && collision.detect(this.position.x, this.position.y)) {
      this.disqualified = true
      this.removeFromList()
    }
    
    
    if(!this.disqualified) {
    if(this.position.x > width ||
       this.position.x < 0 ||
       this.position.y > height ||
       this.position.y < 0
    ) {
      this.disqualified = true
      this.removeFromList()
    }
    }
    
    this.applyForce(this.dna.genes[step])
    
    if(!this.finish && !this.disqualified){
      this.velocity.add(this.acceleration)
      this.position.add(this.velocity)
      this.acceleration.mult(0)
      // this.velocity.limit(4)
    }
    
    this.design()
  }
  
  this.design = function() {
    push()
    noStroke()
    translate(this.position.x, this.position.y)
    rotate(this.velocity.heading())
    rectMode(CENTER)
    fill(this.color)
    rect(0, 0, this.length, this.width)
    pop()
  }
}

function Population(x, y, w, h) {
  this.cars = []
  this.size = populationSize
  this.matingPool = []
  
  for(var i = 0; i < this.size; i++) {
    this.cars[i] = new Car(x, y, w, h)
  }
  
  this.evaluate = function() {
    // Calculate maximum fitness
    var maxFitness = 0
    for(var i = 0; i < this.size; i++) {
      this.cars[i].calcFitness()
      if(this.cars[i].fitness > maxFitness) {
        maxFitness = this.cars[i].fitness
      }
    }
    stats.setMaxFitness(maxFitness)
    
    // Calculate average fitness
    var sumFitness = 0
    for(var i = 0; i < this.size; i++) {
      sumFitness += this.cars[i].fitness
    }
    stats.setAvgFitness(sumFitness/this.size)
    
    // Fitness normalization fitness/maxFitness
    for(var i = 0; i < this.size; i++) {
      this.cars[i].fitness /= maxFitness
      // this.cars[i].fitness = norm(this.cars[i].fitness, 0, 10)
    }
    
    this.matingPool = []
    for(var i = 0; i < this.size; i++) {
      var n = this.cars[i].fitness * 100
      for(var j = 0; j < n; j++) {
        this.matingPool.push(this.cars[i])
      }
    }
    
    this.selection()
    
    generation++
    stats.setGeneration(generation)
  }
  
  this.selection = function() {
    this.cars = []
    for(var i = 0; i < population.size; i++) {
      var parentA = random(this.matingPool)
      var parentB = random(this.matingPool)
      var child = parentA.crossover(parentB)
      this.cars.push(child)
    }
  }
  
  this.run = function() {
    for(var i = 0; i < population.size; i++) {
      this.cars[i].move()
    }
  }
}

function DNA() {
  this.genes = []
  
  for(var i = 0; i < lifetime; i++) {
    this.genes[i] = p5.Vector.random2D()
    this.genes[i].setMag(maxForce)
  }
  
  this.getLength = function() {
    return this.genes.length
  }
  
  this.mutation = function() {
    for(var i = 0; i < this.getLength(); i++) {
      if(random(1) < 0.01) {
        this.genes[i] = p5.Vector.random2D()
        this.genes[i].setMag(maxForce)
      }
    }
  }
}

function Target(x, y, w, h) {
  this.position = createVector(x, y)
  this.width = w
  this.height = h
  
  this.show = function() {
    // fill(22, 183, 45)
    fill(255, 255, 255)
    noStroke()
    ellipse(this.position.x, this.position.y, this.width, this.height)
  }
  
  this.detect = function(posX, posY) {
    if(posX > this.position.x &&
        posX < this.position.x + this.width/2 &&
      posY > this.position.y &&
      posY < this.position.y + this.height/2) {
      return true
    }
  }
}

function Stats() {
  this.populationSizeText = createP()
  this.maxFitnessText = createP()
  this.avgFitnessText = createP()
  this.generationText = createP()
  this.stepsText = createP()
  this.carsCountText = createP()
  
  this.populationSizeText.html('population size: ' + populationSize)
  this.maxFitnessText.html('max fitness: 0')
  this.avgFitnessText.html('avg fitness: 0')
  this.generationText.html('generation: 1')
  this.stepsText.html('steps: 0')
  this.carsCountText.html('cars left: ' + populationSize)
  
  this.setMaxFitness = function(value) {
    this.maxFitnessText.html('max fitness: ' + value)
  }
  
  this.setAvgFitness = function(value) {
    this.avgFitnessText.html('avg fitness: ' + value)
  }
  
  this.setGeneration = function(value) {
    this.generationText.html('generation: ' + value)
  }
  
  this.setSteps = function(value) {
    this.stepsText.html('steps: ' + value)
  }
  
  this.setCarsCount = function(value) {
    this.carsCountText.html('cars left: ' + value)
  }
}