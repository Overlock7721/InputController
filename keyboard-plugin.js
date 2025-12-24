(function() {
    class keyboardPlugin {
        constructor() {
            this.name = 'keyboard';
            this.controller = null;
            this.keysPressed = new Set();
            this.actionsMap = {};

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

        bindActions(actionName, actionConfig) {
            if (actionConfig.keys && actionConfig.keys.length > 0) {
                this.actionsMap[actionName] = actionConfig;
            }
        }

        handleKeyDown(event) {
            if (!this.controller.enabled || !this.controller.focused || !this.controller) return;

            let keyCode = event.keyCode;
            this.keysPressed.add(keyCode);

            for (let actionName in this.actionsMap) {
                const action = this.actionsMap[actionName];
                if (action && action.enabled && action.keys.includes(KeyCode)) {
                    this.controller.setActionActive(actionName, true);
                }
            }


        }

        handleKeyUp(event) {
            if (!this.controller.enabled || !this.controller.focused || !this.controller) return;

            let keyCode = event.keyCode;
            this.keysPressed.delete(keyCode);

            for (actionName in this.actionsMap) {
                let stillActive = false;
                for (let key of action.keys) {
                    if (this.keysPressed.has(key)) {
                        stillActive = true;
                        break;
                    }
                }
                if (!stillActive) {
                    this.controller.setActionActive(actionName, false);
                }
            }
        }
    }

    window.keyboardPlugin = keyboardPlugin;

})();