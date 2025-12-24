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
            window.addEventListener('keydown', this.handleKeyDown.bind(this));
            window.addEventListener('keyup', this.handleKeyUp.bind(this));
        }

        detach(target) {
            window.removeEventListener('keydown', this.handleKeyDown.bind(this));
            window.removeEventListener('keyup', this.handleKeyUp.bind(this));
            this.keysPressed.clear();
        }

        handleKeyDown(event) {
            if (!this.controller.enabled || !this.controller.focused || !this.controller) return;

            let keyCode = event.keyCode;
            this.keysPressed.add(keyCode);
        }

        handleKeyup(event) {
            if (!this.controller.enabled || !this.controller.focused || !this.controller) return;

            let keyCode = event.keyCode;
            this.keysPressed.delete(keyCode);
        }
    }

    window.keyboardPlugin = keyboardPlugin;

})();