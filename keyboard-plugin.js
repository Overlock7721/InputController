(function() {
    class keyboardPlugin {
        constructor() {
            this.name = 'keyboard';
            this.controller = null;
            this.keysPressed = new Set();

            this.handleKeyDown = this.handleKeyDown.bind(this);
            this.handleKeyup = this.handleKeyup.bind(this);
        }


        init(controller) {
            this.controller = controller;
        }

        attach(target) {

        }

        detach(target) {

        }

        handleKeyDown(event) {
            if (!this.enabled || !this.focused || !this.target) return;

            let keyCode = event.keyCode;
            this.keysPressed.add(keyCode);
        }

        handleKeyup(event) {
            if (!this.enabled || !this.focused || !this.target) return;

            let keyCode = event.keyCode;
            this.keysPressed.delete(keyCode);
        }
    }

    window.keyboardPlugin = keyboardPlugin;

})();