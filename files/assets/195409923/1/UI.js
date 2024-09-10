var Ui = pc.createScript('ui');

Ui.attributes.add('Button', {
    type: 'entity',
    description: 'Button which sets placement mode, launches rocket and resets position'
});

Ui.attributes.add('ButtonText', {
    type: 'entity',
    description: 'Button Text'
});



Ui.prototype.initialize = function() {

    const button = this.Button;
    const buttonText = this.ButtonText;
    
    const buttonStates = {
        PLACE : 0,
        LAUNCH : 1,
        RESET : 2        
    };
    
    Object.freeze(buttonStates);
    
    let currentState = buttonStates.PLACE;
    
    const onButtonPress = () => {
        
        switch(currentState){
            case buttonStates.PLACE:
                this.app.fire('game:rocket_placed');
                currentState = buttonStates.LAUNCH;
                buttonText.element.text = "TAP TO LAUNCH";
            break;

            case buttonStates.LAUNCH:
                this.app.fire('game:rocket_launch');
                currentState = buttonStates.RESET;
                buttonText.element.text = "TAP TO RESET";
            break;

            case buttonStates.RESET:
                this.app.fire('game:rocket_reset');
                currentState = buttonStates.LAUNCH;
                buttonText.element.text = "TAP TO LAUNCH";
            break;
         }
    };
    
    
    button.element.on('mousedown',  onButtonPress);
    button.element.on('touchstart', onButtonPress);
    
};

// update code called every frame
Ui.prototype.update = function(dt) {
    
};
