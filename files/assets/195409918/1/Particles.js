var Particles = pc.createScript('particles');

// initialize code called once per entity
Particles.prototype.initialize = function() {
    const particles = this.entity.particlesystem;
    
    function stopParticles() {
        particles.enabled = false;
        particles.stop();
    }
    
    function startParticles() {
        particles.enabled = true;
        particles.play();
    }
    
    this.app.on('game:rocket_launch', startParticles);
    this.app.on('game:rocket_reset', stopParticles);
};
