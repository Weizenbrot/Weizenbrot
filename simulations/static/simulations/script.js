'use strict'

var canvas = document.querySelector("#boids");
var context = canvas.getContext("2d");

// Set Size
var size = {
    width: window.innerWidth || document.body.clientWidth,
    height: window.innerHeight || document.body.clientHeight
}
canvas.width = size.width;
canvas.height = size.height;

class Coordinate {
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
    setPosition(x,y) {
        this.x = x;
        this.y = y;
    }
    add(coord) {
        return new Coordinate(this.x+coord.getX(), this.y+coord.getY());   
    }
    
    subtract(coord) {
        return new Coordinate(this.x-coord.getX(),this.y-coord.getY());
    }
    
    corr_add(coord) {
        return new Coordinate(this.x+coord.getX(), this.y-coord.getY());   
    }
    
    corr_subtract(coord) {
        return new Coordinate(this.x-coord.getX(),this.y+coord.getY());
    }
    
    multiply(coord) {
        return new Coordinate(this.x*coord.getX(), this.y*coord.getY());   
    }
    
    getX() {
        return this.x;
    }
    
    getY() {
        return this.y;
    }
    
    normalize(value) {
        var length = this.magnitude();
        if(length != 0) {
            return new Coordinate((this.x/length)*value, (this.y/length)*value);
        } else {
            return new Coordinate(this.x, this.y);
        }
    }
    
    magnitude() {
        return Math.sqrt(Math.pow(this.x,2) + Math.pow(this.y, 2) );
    }
    
    rightAngle() {
        return new Coordinate(this.x * Math.cos(1/2*Math.PI) + this.y * Math.sin(1/2*Math.PI), 0-this.x * Math.sin(1/2*Math.PI) + this.y*Math.cos(1/2*Math.PI));
    }
    
    round() {
        this.x = this.x.toFixed(0);
        this.y = this.y.toFixed(0);
    }
    
    equals(coord) {
        return (this.x == coord.x && this.y == coord.y);
    }
    
    diff_smaller(coord, value) {
        return this.magnitude(this.subtract(coord)) < value;
    }
    
    scalar_multiply(value) {
        return new Coordinate(value*this.getX(), value*this.getY());
    }
    
    round() {
        return new Coordinate(Math.floor(this.getX()), Math.floor(this.getY()));
    }
    
    rotate(angle) {
        return new Coordinate(this.x * Math.cos(angle*Math.PI) + this.y * Math.sin(angle*Math.PI), 0-this.x * Math.sin(angle*Math.PI) + this.y*Math.cos(angle*Math.PI));
    }
    
}

var mouse_pos = new Coordinate(0,0);
//nimm 10 als Länge? 
class Swarm {
    constructor(distance, angle, number_of_birds, speed, bird_length, bird_width, separation, cohesion, alignment) {
        this.distance = distance; // Wie weit weg können Nachbarn sein? 
        this.angle = angle;
        this.number_of_birds = number_of_birds;
        this.speed = speed;
        this.bird_length = bird_length;
        this.bird_width = bird_width;
        this.swarm = new Array(number_of_birds);
        this.colors = new Array(number_of_birds);
        this.separation = separation;
        this.cohesion = cohesion;
        this.alignment = alignment;
    }

    init() {
        var position;
        var ok = true;
        var total=0;
        for(var i=0; i<this.number_of_birds && total <= this.number_of_birds*3; i++) {
            total++;
            position = this.getRandomPosCoord();
            ok = true;
            if(ok == true) {
                this.swarm[i] = new Bird(position, this.getRandomVelCoor(), this, this.pickColor()); 
            }
        }

    }

    drawCanvas() {
        for(var i = 0; i<this.swarm.length; i++) {
            this.drawRectangle(this.swarm[i]);
            //this.drawCenter(this.swarm[i]);
            //console.log(this.swarm[i].getX(), this.swarm[i].getY());
            //console.log(this.swarm[i].get_Center_of_Mass.getX(), this.swarm[i].get_Center_of_Mass.getY());
        }
    }


    getRandomVelCoor() {
        var x = Math.floor((Math.random() * 21 ) - 10);
        var y = Math.floor((Math.random() * 21) - 10);
        return new Coordinate(x,y); 
    }

    getRandomPosCoord() {
        var x = Math.floor(Math.random() * (size.width));
        var y = Math.floor(Math.random() * (size.height));
        return new Coordinate(x,y);
    }

    // Rectangle heißt Viereck <-<
    drawRectangle(bird) {
        // the triangle
        if(bird != undefined  && bird.position.getX() > 0 && bird.position.getX() <= canvas.width && bird.position.getY() > 0 && bird.position.getY() < canvas.height) {
            context.beginPath();
            context.moveTo(bird.position.getX(), bird.position.getY());;
            context.lineTo(bird.left_corner.getX(), bird.left_corner.getY());
            context.lineTo(bird.right_corner.getX(), bird.right_corner.getY());
            context.closePath();
            // the outline
            context.stroke();        
            // the fill color
            context.fillStyle = bird.color;
            context.fill();
        }
    }

    drawCenter(bird) {
        if(bird!=undefined) {
            var center = bird.get_Center_of_Mass();
            context.beginPath();
            context.arc(center.getX(), center.getY(), this.distance, 0, 2 * Math.PI);
            context.stroke();
        }
    }
    

    drawVectors(bird) {
        if(bird!=undefined) {
            context.beginPath();
            //console.log(bird.rule_1());
            context.moveTo(bird.rule_1().getX(), bird.rule_1().getY());
            context.lineTo(bird.position.getX(), bird.position.getY());
            context.stroke();        
            // the fill color
            context.beginPath();
            context.moveTo(bird.rule_2().getX(), bird.rule_2().getY());
            context.lineTo(bird.position.getX(), bird.position.getY());
            context.stroke();
            context.beginPath();
            context.moveTo(bird.rule_3().getX(), bird.rule_3().getY());
            context.lineTo(bird.position.getX(), bird.position.getY()); 
            context.stroke(); 
            context.beginPath();
            context.moveTo(bird.rule_4().getX(), bird.rule_4().getY());
            context.lineTo(bird.position.getX(), bird.position.getY());
            context.stroke();
        }
    }


    pickColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    update() {
        this.swarm.forEach(
            (boid) => (boid.update())
        );
    }


}

// constructor(distance, angle, number_of_birds, speed, bird_length, bird_width, separation, cohesion, alignment)
// distance -> wie weit weg sind Nachbars
// angle -> wie weit können Vögel hinter sich sehen
// number_of_birds -> Wie viele Vögel spawnen
// speed -> Wie groß kann Velocity sein
// bird_length/bird_width -> Wie groß sind Vögel
let animFrameHandler;
let swarm = new Swarm(50, 1.7, 100, 0.8, 30, 8, 10, 1, 10);
swarm.init()



var stop = false;
var frameCount = 0;
var fps, fpsInterval, startTime, now, then, elapsed;

function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    animate();
}



function animate() {

    // request another frame

    requestAnimationFrame(animate);

    // calc elapsed time since last loop

    now = Date.now();
    elapsed = now - then;
    // if enough time has elapsed, draw the next frame

    if (elapsed > fpsInterval) {

        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
        then = now - (elapsed % fpsInterval);
        //console.log(swarm.swarm);
        // Put your drawing code here
        context.clearRect(0, 0, size.width, size.height);
        context.fillStyle = "black";
        context.fillRect(0, 0, size.width, size.height);
        swarm.update();
        swarm.drawCanvas();
    }
}



function findObjectCoords(mouseEvent)
{
  var obj = document.getElementById("boids");
  var obj_left = 0;
  var obj_top = 0;
  var xpos;
  var ypos;
  while (obj.offsetParent)
  {
    obj_left += obj.offsetLeft;
    obj_top += obj.offsetTop;
    obj = obj.offsetParent;
  }

    xpos = mouseEvent.pageX;
    ypos = mouseEvent.pageY;

  xpos -= obj_left;
  ypos -= obj_top;
  if(mouseEvent.target != "boids") {
    mouse_pos.setPosition(xpos, ypos);
  } else {
    mouse_pos.setPosition(5000,5000);
  }
}
document.getElementById("boids").onmousemove = findObjectCoords;


startAnimating(60);
//swarm.update();







// Kick off the simulation
//document.addEventListener("DOMContentLoaded", fly);