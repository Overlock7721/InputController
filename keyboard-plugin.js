(function() {
    class KeyboardPlugin {
        constructor() {
            this.name = 'keyboard';
            this.controller = null;
            this.target = null;
            this.keysPressed = new Set();
            this.actionsMap = {};

            this.handleKeyDown = this.handleKeyDown.bind(this);
            this.handleKeyUp = this.handleKeyUp.bind(this);
        }

        init(controller) {
            this.controller = controller;
        }

        attach(target) {
            this.target = target;
            window.addEventListener('keydown', this.handleKeyDown);
            window.addEventListener('keyup', this.handleKeyUp);
        }

        detach() {
            window.removeEventListener('keydown', this.handleKeyDown);
            window.removeEventListener('keyup', this.handleKeyUp);
            this.target = null;
            this.keysPressed.clear();
        }

        bindAction(actionName, actionConfig) {
            if (actionConfig.keys && actionConfig.keys.length > 0) {
                this.actionsMap[actionName] = actionConfig;
            }
        }

        onActionEnabled(actionName) {

        }

        onActionDisabled(actionName) {
            const action = this.actionsMap[actionName];
            if (action) {
                let hasActionKey = false;
                for (let key of action.keys) {
                    if (this.keysPressed.has(key)) {
                        hasActionKey = true;
                        break;
                    }
                }
                if (hasActionKey && this.controller) {
                    this.controller.setActionActive(actionName, false);
                }
            }
        }

        handleKeyDown(event) {
            if (!this.controller || !this.controller.enabled || !this.controller.focused) return;

            const keyCode = event.keyCode;
            this.keysPressed.add(keyCode);

            for (let actionName in this.actionsMap) {
                const action = this.actionsMap[actionName];
                if (action && action.enabled && action.keys.includes(keyCode)) {
                    this.controller.setActionActive(actionName, true);
                }
            }
        }

        handleKeyUp(event) {
            if (!this.controller || !this.controller.enabled || !this.controller.focused) return;

            const keyCode = event.keyCode;
            this.keysPressed.delete(keyCode);

            for (let actionName in this.actionsMap) {
                const action = this.actionsMap[actionName];
                if (action && action.enabled && action.keys.includes(keyCode)) {
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

        clear() {
            this.keysPressed.clear();
        }

        isKeyPressed(keyCode) {
            return this.keysPressed.has(keyCode);
        }
    }

    window.KeyboardPlugin = KeyboardPlugin;
})();