(function() {
    'use strict';

    class KeyboardPlugin {
        constructor() {
            this.name = 'keyboard';
            this.callbacks = null;
            this.target = null;
            this.actions = new Map();
            this.keysPressed = new Set();

            this.handleKeyDown = this.handleKeyDown.bind(this);
            this.handleKeyUp = this.handleKeyUp.bind(this);
        }

        init(callbacks) {
            this.callbacks = callbacks;
        }

        bindAction(actionName, actionConfig) {
            if (actionConfig.keys && Array.isArray(actionConfig.keys) && actionConfig.keys.length > 0) {
                this.actions.set(actionName, {
                    name: actionName,
                    enabled: actionConfig.enabled,
                    keys: actionConfig.keys
                });
            } else {
                this.actions.delete(actionName);
            }
        }

        onActionEnabled(actionName) {
            const action = this.actions.get(actionName);
            if (action) {
                action.enabled = true;
            }
        }

        onActionDisabled(actionName) {
            const action = this.actions.get(actionName);
            if (action) {
                action.enabled = false;

                for (const key of action.keys) {
                    if (this.keysPressed.has(key)) {
                        this.callbacks.setActionActive(actionName, false);
                    }
                }
            }
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

        handleKeyDown(event) {
            if (!this.callbacks || !this.target || !this.callbacks.isControllerEnabled() || !this.callbacks.isControllerFocused()) return;

            const keyCode = event.keyCode;
            this.keysPressed.add(keyCode);

            for (const [actionName, action] of this.actions) {
                if (action.enabled && action.keys.includes(keyCode)) {
                    let alreadyActive = false;
                    for (const key of action.keys) {
                        if (key !== keyCode && this.keysPressed.has(key)) {
                            alreadyActive = true;
                            break;
                        }
                    }

                    if (!alreadyActive) {
                        this.callbacks.setActionActive(actionName, true);
                    }
                }
            }
        }

        handleKeyUp(event) {
            if (!this.callbacks || !this.target || !this.callbacks.isControllerEnabled() || !this.callbacks.isControllerFocused()) return;

            const keyCode = event.keyCode;
            this.keysPressed.delete(keyCode);

            for (const [actionName, action] of this.actions) {
                if (action.enabled && action.keys.includes(keyCode)) {
                    let stillActive = false;
                    for (const key of action.keys) {
                        if (this.keysPressed.has(key)) {
                            stillActive = true;
                            break;
                        }
                    }

                    if (!stillActive) {
                        this.callbacks.setActionActive(actionName, false);
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