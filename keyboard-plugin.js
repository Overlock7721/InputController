(function() {
    class keyboardPlugin {
        constructor() {
            this.name = 'keyboard';
            this.controller = null;
            this.keysPressed = new Set();

            this.handleKeyDown = this.handleKeyDown.bind(this);
            this.handleKeyUp = this.handleKeyUp.bind(this);
        }


        init(controller) {
            this.controller = controller;
        }

        attach(target) {
            window.addEventListener('keydown', this.handleKeyDown);
            window.addEventListener('keyup', this.handleKeyUp);
        }

        detach() {
            window.removeEventListener('keydown', this.handleKeyDown);
            window.removeEventListener('keyup', this.handleKeyUp);
            this.keysPressed.clear();
        }

        bindActions(actionsToBind) {

        }

        handleKeyDown(event) {
            if (!this.controller.enabled || !this.controller.focused || !this.controller) return;

            let keyCode = event.keyCode;
            this.keysPressed.add(keyCode);
        }

        handleKeyUp(event) {
            if (!this.controller.enabled || !this.controller.focused || !this.controller) return;

            let keyCode = event.keyCode;
            this.keysPressed.delete(keyCode);
        }
    }

    window.keyboardPlugin = keyboardPlugin;

})();