/* jshint esversion: 6 */
const ZapparFaceTracker = pc.createScript('zapparFaceTracker');
// Input for max number of faces to track.
// Performance negatively correlates with number of faces.
ZapparFaceTracker.attributes.add('Max Faces', {
    type: 'number',
    default: 1,
    description: 'The maximum number of faces the tracker will look for'
});
// Display content upright by rotating X by 90.
ZapparFaceTracker.attributes.add('Target Upright', {
    type: 'boolean',
    default: true,
    description: 'Offset rotations for upright targets'
});
ZapparFaceTracker.attributes.add('Zappar Camera', { type: 'entity', description: "Zappar Camera (Drag from hierarchy)" });
ZapparFaceTracker.prototype.initialize = function () {
    if (!this['Zappar Camera'])
        throw new Error('Zappar Camera attribute undefined - Please link camera entity to attribute.');
    this.Camera = this['Zappar Camera'].script.zapparCamera;
    this.faceTracker = new Zappar.FaceTracker(this.Camera.pipeline);
    // Load the default level of detail model.
    this.faceTracker.loadDefaultModel().then(() => {
        console.log('face tracking model loaded');
    });
    // Console log the anchor's ID when the face is visible and not.
    this.faceTracker.onNewAnchor.bind((anchor) => {
        console.log('New anchor has appeared:', anchor.id);
    });
    this.faceTracker.onVisible.bind((anchor) => {
        console.log('Anchor is visible:', anchor.id);
    });
    this.faceTracker.onNotVisible.bind((anchor) => {
        console.log('Anchor is not visible:', anchor.id);
    });
    // Apply max faces specified from script's attributes to the tracker.
    this.faceTracker.maxFaces = this['Max Faces'];
};
// update code called every frame
ZapparFaceTracker.prototype.update = function () {
    // Grab the global camera pose from Zappar Camera script.
    const { cameraPoseMatrix } = this.Camera;
    // If target upright has been enabled, set our offset X to 90.
    const offset = this['Target Upright'] ? 90 : 0;
    // Loop through all visible face anchors.
    this.faceTracker.visible.forEach((anchor) => {
        // Create an anchor pose matrix from the anchor's pose and
        // mirror it if the user has selected mirroring options.
        const anchorPoseArray = Array.from(anchor.pose(cameraPoseMatrix.data, this.Camera.mirror));
        const anchorPoseMatrix = new pc.Mat4().set(anchorPoseArray);
        // Position our group to anchor's pose matrix.
        this.entity.setEulerAngles(anchorPoseMatrix.getEulerAngles().x + offset, anchorPoseMatrix.getEulerAngles().y, anchorPoseMatrix.getEulerAngles().z);
        this.entity.setPosition(anchorPoseMatrix.getTranslation());
    });
};
