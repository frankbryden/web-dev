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

function Simulation(popSize, word){
  this.getWord = function(word){
    let w = [];
    for (var i = 0; i < word.length; i++){
      w.push(word.charCodeAt(i));
    }
  };
  
  this.population = [];
  this.popSize = popSize;
  this.wordSize = word.length;
  this.generation = 0;
  this.genStep = 0;
  this.word = this.getWord(word);
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
      console.log("running genration...");
      this.runGeneration();
    } else {
      console.error("gen is not ready");
    }
  };
  
  this.createRandomChromo = function(){
    let k = new Chromo();
    //4 genes : pow, ang, x, y
    for (var i = 0; i < this.wordSize; i++){
      k.addGene(Math.floor(Math.random()*25));
    }
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
    let i = 0;
    for (var k of this.population){
      ctx.fillText(k.getText(), 200, 20*i);
      i++;
    }
    
  };
  
  this.stepEndCallback = function(id, fitness){
    //console.log(ctx);
    this.population[id].fitness = fitness;
    this.maxFit = Math.max(this.maxFit, fitness);
    this.genMaxFit = Math.max(this.genMaxFit, fitness);
    
    this.genStep += 1;
    if (this.genStep == this.population.length - 1){
      this.endGeneration();
    }
  };
  
  this.runGeneration = function(){
    for (var k of this.population){
      let fitness = this.getFitness(k);
      this.stepEndCallback(this.population.indexOf(k), fitness);
    }
  };
  
  this.getFitness = function(guess){
    let f = 0;
    for (var i = 0; i < guess.length; i++){
      if (guess.genes[i] != this.word[i]){
        f += 1;
      }
    }
    return 1/f;
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
    console.log("after");
    //console.log(this.population);
    while (this.population.length < this.popSize){
      let a = Math.floor(Math.random()*this.population.length);
      let b = a;
      while (b == a){
        console.log("heyy");
        b = Math.floor(Math.random()*this.population.length);
      }
      console.log("out of inner while loop");
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
      for (gene of childBAgenes){
        childBA.addGene(gene);
      }
      /*childAB.addGene(childABgenes[0]);
      childAB.addGene(childABgenes[1]);
      childBA.addGene(childBAgenes[0]);
      childBA.addGene(childBAgenes[1]);
      this.population.push(childAB);
      this.population.push(childBA);*/
    }
    console.log("running mutations");
    for (var chromo of this.population){
      this.mutationCount += chromo.mutate();
    }
    this.genMaxFit = 0;
    this.genStep = 0;
    this.generation += 1;
    this.genReady = true;
    //this.runGeneration();
  };
  
  
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
  
  this.getText = function(){
    let s = "";
    for (var gene of this.genes){
      s += String.fromCharCode(gene + 65);
    }
    return s;
  }
}

var simulation;
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext('2d');



function init(){
  simulation = new Simulation(10, "hello");
  simulation.init();
}

var count = 0;

function animate(){
  //console.log(spawnPoints);
  //count++;
  if (count < 10){
    requestAnimationFrame(animate);
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  simulation.draw();
}

init();
animate();