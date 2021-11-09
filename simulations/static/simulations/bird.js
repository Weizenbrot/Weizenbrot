class Bird {
   constructor(beginning_Coord, beginning_Velocity, swarm, color) {
       this.position=beginning_Coord;
       this.velocity=beginning_Velocity;
       this.color=color;
       this.swarm=swarm;
       this.base=this.position.subtract(this.velocity.normalize(swarm.bird_length));
       var perp_to_base =  this.base.subtract(this.position).rightAngle().normalize(swarm.bird_width/2);
       this.right_corner = this.base.add(perp_to_base);
       this.left_corner = this.base.subtract(perp_to_base);
       this.neighbours = new Array();
       this.center=null;
   }

   update_triangle() {
        this.base = this.position.subtract(this.velocity.normalize(swarm.bird_length));
        var perp_to_base =  this.base.subtract(this.position).rightAngle().normalize(swarm.bird_width/2);
        this.right_corner = this.base.add(perp_to_base);
        this.left_corner = this.base.subtract(perp_to_base);
   }

   next_Velocity(seperation, align, cohesion) {
      this.velocity = this.velocity.add(((cohesion.add(align)).add(seperation)));
   }


   get_Center_of_Mass() {
       this.center = this.base.subtract(this.position).multiply(new Coordinate(2/3,2/3)).add(this.position);
       return this.center;
   }

   is_Neighbour(bird, distance) {
       var my_circle = this.get_Center_of_Mass();
       var other_circle = bird.get_Center_of_Mass();
       var diff = my_circle.subtract(other_circle).magnitude();
       return diff < ((distance)*2);
   }
   
   get_Neighbours(distance) {
       var local_swarm = this.swarm.swarm;
       var neighbours = new Array();
       for(var i = 0; i<this.swarm.swarm.length; i++) {
          if((this.swarm.swarm[i] != this) && (this.is_Neighbour(this.swarm.swarm[i], distance))) {
                neighbours.push(this.swarm.swarm[i]);
          }
       }
       this.neighbours = neighbours;
    }

    //Seperation
    rule_1() {
        this.get_Neighbours(this.swarm.distance/2);
        var sum = new Coordinate(0,0);
        for(var i = 0; i<this.neighbours.length; i++) {
            sum = sum.subtract(this.neighbours[i].position.subtract(this.position));
        } 
        return sum.normalize(this.swarm.speed*this.swarm.separation);
    }

    //Cohesion
    rule_2() {
        this.get_Neighbours(this.swarm.distance/4);
        var sum = new Coordinate(0,0);
        this.neighbours.forEach(
            (element) => (sum = sum.add(element.get_Center_of_Mass()))
        ); 
        if(this.swarm.swarm < 2) {
            return new Coordinate(0,0);
        }
        return this.position.subtract(sum).normalize(this.swarm.speed * this.swarm.cohesion);
    }

    //Alignment    
    rule_3() {
        this.get_Neighbours(this.swarm.distance/2);
        var sum = new Coordinate(0,0);
        this.neighbours.forEach(
            (boid) => (sum = sum.add(boid.velocity))
        );
        //return this.position.subtract(this.position.corr_subtract(sum).normalize(this.swarm.speed/2));
        return sum.normalize(this.swarm.speed * this.swarm.alignment);
    }

    // avoid borders     
    rule_4() {
        var Xmin=-10, Xmax=size.width, Ymin=-10, Ymax=size.height;
        var x=0, y=0;

        if(this.position.getX()<Xmin) {
            x = 10;
        }
        else if(this.position.getX() > Xmax) {
            x = -10;
        }
        if(this.position.getY() > Ymax) {
            y = -10;
        }
        else if(this.position.getY() < Ymin) {
            y = 10;
        }
        //if(this.position.getX() < Xmin && this.position.getY() < Ymin) {
        //    x = 500;
        //    y = 0;
        //}
        var result = new Coordinate(x,y);
        return result;
    }

    // avoid predators (die Maus)
    rule_5() {
        var diff = mouse_pos.subtract(this.position).magnitude();
        if(diff < ((this.swarm.distance*7))) {
            return this.position.subtract(mouse_pos).normalize(1000 * (1/diff));
            //return mouse_pos.subtract(this.position).normalize(1000 * (1/diff));
        }
        else return new Coordinate(0,0);
    }

// ich weiß dass das schlecht ist btw, lass mich in Ruhe : | 
    update() {
        //this.velocity = this.velocity.add(this.rule_1()).add(this.rule_2()).add(this.rule_3()).add(this.rule_4()).round();
        var old_velocity = this.velocity;
        this.velocity = this.velocity.add(this.rule_1()).add(this.rule_2()).add(this.rule_3().add(this.rule_4())).round();
        //var angle = Math.acos((old_velocity.getX()*this.velocity.getX() + old_velocity.getY() * this.velocity.getY()) / (Math.sqrt(Math.pow(old_velocity.getX(),2) * Math.pow(old_velocity.getY(), 2)) * Math.sqrt(Math.pow(this.velocity.getX(), 2) * Math.pow(this.velocity.getY(),2))));
        if(this.velocity.magnitude() > this.swarm.speed * 8) {
            this.velocity = this.velocity.normalize(this.swarm.speed * 8).round();
        }
        //if(!mouse_pos.equals(new Coordinate(5000, 5000))) {
        //    this.velocity = this.velocity.add(this.rule_5()).round();
        //}
        /*if(angle > 1*Math.PI) {
            this.velocity = this.velocity.rotate(1-1/10);
        }
        else if(angle < 1*Math.PI) {
            this.velocity = this.velocity.rotate(1/10);
        }*/
        this.velocity = this.velocity.add(this.rule_5());
        this.position = this.position.add(this.velocity);
        this.update_triangle();
    }

}