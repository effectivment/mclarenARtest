var Shadow = pc.createScript('shadow');

// https://playcanvas.com/editor/code/481413?tabs=8792451

Shadow.attributes.add('shadowStrength', {
    type: 'number',
    default: 0.5,
    min: 0,
    max: 1,
    title: 'Shadow Strength',
    description: 'Control the strength of the shadow. 1 is full strength and 0 is disabled. Defaults to 0.5.'
});

// initialize code called once per entity
Shadow.prototype.initialize = function() {

        var material = new pc.StandardMaterial();
        material.chunks.lightDiffuseLambertPS = "float getLightDiffuse() { return 1.0; }";
        material.chunks.outputAlphaPS = "gl_FragColor.a = dAlpha * (1.0 - dDiffuseLight.r);";
        material.diffuse.set(0, 0, 0);
        material.specular.set(0, 0, 0);
        material.emissive.set(0, 0, 0);
        material.opacity = this.shadowStrength;
        material.blendType = pc.BLEND_NORMAL;
        material.useGammaTonemap = false;
        material.useFog = false;
        material.useSkybox = false;
        material.depthWrite = false;
        material.update();
        
        Shadow.shadowMaterial = material;

    this.shadowEntity = new pc.Entity('Shadow');
    this.shadowEntity.addComponent('model', {
        type: 'plane',
        castShadows: false
    });
    this.shadowEntity.model.material = Shadow.shadowMaterial;
    this.shadowEntity.setLocalScale(5, 5, 5);

    this.entity.addChild(this.shadowEntity);
};