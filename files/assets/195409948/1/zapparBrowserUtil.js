/* jshint esversion: 6 */
const zapparBrowserUtil = pc.createScript('zapparBrowserUtil');
zapparBrowserUtil.attributes.add('Mobile Only', {
    type: 'boolean',
    default: false,
    description: "Redirect users to mobile"
});
zapparBrowserUtil.attributes.add('Compatibility Check', {
    type: 'boolean',
    default: false,
    description: "Perform compatability checks"
});
zapparBrowserUtil.prototype.initialize = function () {
    if (this['Compatibility Check']) {
        if (Zappar.browserIncompatible()) {
            Zappar.browserIncompatibleUI();
            this.app.autoRender = false;
        }
    }
    if (this['Mobile Only']) {
        if (!MobileOnly.isMobile()) {
            MobileOnly.showUI();
            this.app.autoRender = false;
        }
    }
};
