/* jshint esversion: 6 */
const ZapparFaceLandmark = pc.createScript('zapparFaceLandmark');
ZapparFaceLandmark.attributes.add('Landmark Target', {
    type: 'string',
    enum: [
        { 'Eye (Left)': 'EYE_LEFT' },
        { 'Eye (Right)': 'EYE_RIGHT' },
        { 'Ear (Left)': 'EAR_LEFT' },
        { 'Ear (Right)': 'EAR_RIGHT' },
        { 'Nose (Bridge)': 'NOSE_BRIDGE' },
        { 'Nose (Tip)': 'NOSE_TIP' },
        { 'Nose (Base)': 'NOSE_BASE' },
        { 'Lip (Top)': 'LIP_TOP' },
        { 'Lip (Bottom)': 'LIP_BOTTOM' },
        { 'Mouth (Center)': 'MOUTH_CENTER' },
        { Chin: 'CHIN' },
        { 'Eyebrow (Left)': 'EYEBROW_LEFT' },
        { 'Eyebrow (Right)': 'EYEBROW_RIGHT' },
    ],
    default: 'none',
    description: "Which face feature the landmark should track to"
});
ZapparFaceLandmark.attributes.add('Face Tracker', { type: 'entity', description: "Face Tracker (Drag from hierarchy)" });
ZapparFaceLandmark.attributes.add('Zappar Camera', { type: 'entity', description: "Zappar Camera (Drag from hierarchy)" });
// initialize code called once per entity
ZapparFaceLandmark.prototype.initialize = function () {
    const currentLandmarkName = Zappar.FaceLandmarkName[this['Landmark Target']];
    this.faceLandmark = new Zappar.FaceLandmark(currentLandmarkName);
};
// update code called every frame
ZapparFaceLandmark.prototype.update = function () {
    if (!this['Zappar Camera'])
        throw new Error('Zappar Camera attribute undefined - Please link camera entity to attribute.');
    if (!this['Face Tracker'])
        throw new Error('Face Tracker attribute undefined - Please link face tracker entity to attribute.');
    const { faceTracker } = this['Face Tracker'].script.zapparFaceTracker;
    const Camera = this['Zappar Camera'].script.zapparCamera;
    const { pipeline } = Camera;
    const currentPoseMode = Camera['Camera Pose'];
    const currentMirrorMode = Camera['Mirror Mode'];
    const mirrorPoses = currentMirrorMode === 'poses';
    let cameraPose = pipeline.cameraPoseDefault();
    switch (currentPoseMode) {
        case 'attitude': {
            cameraPose = pipeline.cameraPoseWithAttitude(mirrorPoses);
            break;
        }
        case 'anchor': {
            const anchor = faceTracker.anchors.values().next().value;
            if (anchor) {
                cameraPose = pipeline.cameraPoseWithOrigin(anchor.poseCameraRelative(mirrorPoses));
            }
            break;
        }
        default: // Continue
    }
    faceTracker.visible.forEach((anchor) => {
        const pose = new pc.Mat4().set(Array.from(anchor.pose(cameraPose, mirrorPoses)));
        this.faceLandmark.updateFromFaceAnchor(anchor, mirrorPoses);
        const result = pose.mul(new pc.Mat4().set(Array.from(this.faceLandmark.pose)));
        this.entity.setEulerAngles(result.getEulerAngles().x, result.getEulerAngles().y, result.getEulerAngles().z);
        this.entity.setPosition(result.getTranslation());
    });
};
