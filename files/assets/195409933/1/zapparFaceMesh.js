/* jshint esversion: 6 */
const ZapparFaceMesh = pc.createScript('zapparFaceMesh');
ZapparFaceMesh.attributes.add('Face Tracker', { type: 'entity', description: "Face Tracker (Drag from hierarchy)" });
ZapparFaceMesh.attributes.add('Zappar Camera', { type: 'entity', description: "Zappar Camera (Drag from hierarchy)" });
ZapparFaceMesh.attributes.add('Fill mouth', {
    type: 'boolean',
    default: false,
    description: "Mesh fills mouth"
});
ZapparFaceMesh.attributes.add('Fill eye (left)', {
    type: 'boolean',
    default: false,
    description: "Mesh fills eye"
});
ZapparFaceMesh.attributes.add('Fill eye (right)', {
    type: 'boolean',
    default: false,
    description: "Mesh fills eye"
});
ZapparFaceMesh.attributes.add('Mask', {
    type: 'boolean',
    default: false,
    description: "Occlude depth, do not render colors"
});
ZapparFaceMesh.attributes.add('Full Head', {
    type: 'boolean',
    default: false,
    description: "Use full head mesh?"
});
// Face Mask's material. If none is specified, mask is not used.
ZapparFaceMesh.attributes.add('material', {
    type: 'asset',
    assetType: 'material',
    description: 'The material that the mesh uses'
});
// initialize code called once per entity
ZapparFaceMesh.prototype.initialize = function () {
    if (!this['Zappar Camera'])
        throw new Error('Zappar Camera attribute undefined - Please link camera entity to attribute.');
    if (!this['Face Tracker'])
        throw new Error('Face Tracker attribute undefined - Please link face tracker entity to attribute.');
    this.ZfaceMesh = new Zappar.FaceMesh();
    // Scope this into a variable so we can use it in callback functions.
    const FaceMesh = this["Full Head"] ? this.ZfaceMesh.loadDefaultFullHeadSimplified(this['Fill mouth'], this['Fill eye (left)'], this['Fill eye (right)']) : this.ZfaceMesh.loadDefaultFace(this['Fill mouth'], this['Fill eye (left)'], this['Fill eye (right)']);
    FaceMesh.then(() => {
        // Create a new node which is needed to create components.
        const node = new pc.GraphNode();
        // Create a new model which will store our face mesh.
        const model = new pc.Model();
        // Assign the node to the model.
        model.graph = node;
        // Create a new mesh using the vertices, normals and UVs provided by Zappar's face mesh.
        const mesh = pc.createMesh(this.app.graphicsDevice, Array.from(this.ZfaceMesh.vertices), {
            normals: Array.from(this.ZfaceMesh.normals),
            uvs: Array.from(this.ZfaceMesh.uvs),
        });
        // Create a new material from the one provided in script's attributes.
        let material; //TODO: Create material if not specified
        // Create a new instance of a mesh.
        // Add a model component.
        this.entity.removeComponent('model');
        this.entity.addComponent('model');
        if (this.Mask) {
            let materialAsset = this.app.assets.find('Occluder');
            if (materialAsset) {
                material = materialAsset.resource;
                material.depthTest = true;
                material.depthWrite = true;
                material.blueWrite = false;
                material.redWrite = false;
                material.greenWrite = false;
                material.alphaWrite = false;
            }
            else {
                material = this.material.resource;
                console.warn('Zappar: Missing "Occluder material');
            }
        }
        else {
            material = this.material.resource;
        }
        const meshInstance = new pc.MeshInstance(mesh, material, node);
        // create new entity here
        // Push meshInstance to the model's mesh instances.
        model.meshInstances.push(meshInstance);
        // Assign our face mesh model to the entity.
        if (this.entity.model)
            this.entity.model.model = model;
        this.entity.rotateLocal(0, 180, 0);
    });
    this.faceTracker = this['Face Tracker'].script.zapparFaceTracker.faceTracker;
    this.Camera = this['Zappar Camera'].script.zapparCamera;
};
// update code called every frame
ZapparFaceMesh.prototype.update = function () {
    this.faceTracker.visible.forEach((anchor) => {
        // Update Zappar face mesh data with the latest information
        // Provided by the face anchor.
        this.ZfaceMesh.updateFromFaceAnchor(anchor);
        if (this.entity.model && this.entity.model.meshInstances[0]) {
            // Update the model component's mesh to data provided by Zappar face mesh.
            const meshInstanceMesh = this.entity.model.meshInstances[0].mesh;
            meshInstanceMesh.setPositions(this.ZfaceMesh.vertices);
            meshInstanceMesh.setUvs(0, this.ZfaceMesh.uvs);
            meshInstanceMesh.setIndices(this.ZfaceMesh.indices);
            meshInstanceMesh.setNormals(this.ZfaceMesh.normals);
            // Instruct model's mesh to update.
            meshInstanceMesh.update();
        }
    });
};
