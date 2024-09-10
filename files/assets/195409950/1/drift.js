var Drift = pc.createScript('drift');

// Editable attribute for the number of resitance
Drift.attributes.add('Resistance', {
    type: 'number',
    default: 100,
    description: "Resistance"
});

// initialize code called once per entity
Drift.prototype.initialize = function() {
    //dx = distance on x axis
     this.dx = 0;
};

// update code called every frame
Drift.prototype.update = function(dt) {
    //move dx slightly each second
    this.dx+= 0.01 + dt;
    //create a curve that will adjust based on the resistance and dx
    const curve = Math.sin(this.dx) / this.Resistance;
    
    //get the current angle
    const currentRotation = this.entity.getLocalEulerAngles();
    //set the angle so we are adjusting the new value
    this.entity.setLocalEulerAngles(currentRotation.x + curve, currentRotation.y + curve, currentRotation.z + curve); 
};