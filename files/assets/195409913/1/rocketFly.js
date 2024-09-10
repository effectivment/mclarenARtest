var RocketFly = pc.createScript('rocketFly');

// attributes
RocketFly.attributes.add('speed', {
    type: 'number',
    default: 0.1,
});
RocketFly.attributes.add('targetHeight', {
    type: 'number',
    default: 4,
});



// initialize code called once per entity
RocketFly.prototype.initialize = function() {
    
    // set a target position using our attribute
    this.target = new pc.Vec3(0, this.targetHeight, 0);
    // set up a position to lerp (translate) to
    this.lerpedPosition = new pc.Vec3();
    
    this.flying = false;

    const onLaunchButtonPress = () => {
        this.flying = true;
    };
    
    // Set the entity's local position as the reset position
    const onResetButtonPress = () => {
        const resetPos = new pc.Vec3(0,0,0);
        this.entity.setLocalPosition(resetPos);
        this.flying = false;
    };
    
    this.app.on('game:rocket_launch', onLaunchButtonPress);
    this.app.on('game:rocket_reset', onResetButtonPress);

};



RocketFly.prototype.update = function(dt) {
    if(!this.flying) return;
    
    // Get our delta time speed based on the entity's speed
    const deltaTimedSpeed = this.speed * dt;
    
    // Lerp the position from the local position to the target according to the speed
    this.lerpedPosition.lerp(this.entity.getLocalPosition (), this.target, deltaTimedSpeed);
    
    // Set the local position so we know to update it
    this.entity.setLocalPosition(this.lerpedPosition);
};