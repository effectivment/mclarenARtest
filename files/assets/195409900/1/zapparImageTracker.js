/* jshint esversion: 6 */
const zapparImageTracker = pc.createScript('zapparImageTracker');
// Input for a .zpt target file.
zapparImageTracker.attributes.add('Target Image', {
    type: 'asset',
    assetType: 'binary',
    description: 'Image Target file (.zpt) '
});
// Display content upright by rotating X by 90.
zapparImageTracker.attributes.add('Target Upright', {
    type: 'boolean',
    default: true,
    description: 'Offset rotations for upright targets'
});
zapparImageTracker.attributes.add('Zappar Camera', { type: 'entity', description: "Zappar Camera (Drag from hierarchy)" });
// initialize code called once per entity
zapparImageTracker.prototype.initialize = function () {
    if (!this['Zappar Camera'])
        throw new Error('Zappar Camera attribute undefined - Please link camera entity to attribute.');
    this.Camera = this['Zappar Camera'].script.zapparCamera;
    this.pipeline = this.Camera.pipeline;
    // Initialize the image tracker.
    this.imageTracker = new Zappar.ImageTracker(this.pipeline);
    // Console log the anchor's ID when the target is visible and not.
    this.imageTracker.onNewAnchor.bind((anchor) => {
        console.log('New anchor has appeared:', anchor.id);
    });
    this.imageTracker.onVisible.bind((anchor) => {
        console.log('Anchor is visible:', anchor.id);
    });
    this.imageTracker.onNotVisible.bind((anchor) => {
        console.log('Anchor is not visible:', anchor.id);
    });
    // If .zpt is not provided, throw an error.
    if (!this['Target Image'])
        throw new Error('No target image found in entity assets');
    // Load the target image into the image tracker.
    const target = this['Target Image'].resource;
    this.imageTracker.loadTarget(target);
};
zapparImageTracker.prototype.update = function () {
    // If target upright has been enabled, set our offset X to 90.
    const offset = this['Target Upright'] ? 90 : 0;
    // Loop through all visible anchors.
    this.imageTracker.visible.forEach((anchor) => {
        // Create an anchor pose matrix from the anchor's pose and
        // mirror it if the user has selected mirroring options.
        const { cameraPoseMatrix } = this.Camera;
        const anchorPoseArray = Array.from(anchor.pose(cameraPoseMatrix.data, this.Camera.mirror));
        const anchorPoseMatrix = new pc.Mat4().set(anchorPoseArray);
        // Position our group to anchor's pose matrix.
        this.entity.setEulerAngles(anchorPoseMatrix.getEulerAngles().x + offset, anchorPoseMatrix.getEulerAngles().y, anchorPoseMatrix.getEulerAngles().z);
        this.entity.setPosition(anchorPoseMatrix.getTranslation());
    });
};
