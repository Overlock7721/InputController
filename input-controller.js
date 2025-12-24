(function() {
    class InputController {
        constructor(actionsToBind = {}, target = null) {
            this.enabled = true;
            this.focused = true;
            this.ACTION_ACTIVATED = "input-controller:action-activated";
            this.ACTION_DEACTIVATED = "input-controller:action-deactivated";

            this.actions = {};
            this.keysPressed = new Set();
            this.activeActions = new Set();
            this.target = null;
            this.plugins = [];

            if (actionsToBind && Object.keys(actionsToBind).length > 0) {
                this.bindActions(actionsToBind);
            }

            if (target) {
                this.attach(target);
            }

            window.addEventListener('focus', () => {
                this.focused = true;
            });
            window.addEventListener('blur', () => {
                this.focused = false;
                this.keysPressed.clear();
                this.deactivateAllActions();
            });
        }

        registerPlugin(plugin) {
            this.plugins.push(plugin);
            if (typeof plugin.init === 'function') {
                plugin.init(this);
            };
            return this;
        }

        setActionActive(actionName, active) {
            if (!this.actions[actionName] || !this.actions[actionName].enabled) return;

            const wasActive = this.activeActions.has[actionName];

            if (active && !wasActive) {
                this.activeActions.add(actionName);
                if (this.target && this.enabled && this.focused) {
                    const event = new CustomEvent(this.ACTION_ACTIVATED, {
                        detail: actionName
                    });
                    this.target.dispatchEvent(event);
                }
            } else if (!active && wasActive) {
                this.activeActions.delete(actionName);
                if (this.target && this.enabled && this.focused) {
                    const event = new CustomEvent(this.ACTION_DEACTIVATED, {
                        detail: actionName
                    });
                    this.target.dispatchEvent(event);
                }
            }
        }

        bindActions(actionsToBind) {
            for (let actionName in actionsToBind) {
                if (this.actions[actionName]) {
                    const existingAction = this.actions[actionName];
                    existingAction.keys = actionsToBind[actionName].keys || [];
                    if (actionsToBind[actionName].enabled !== undefined) {
                        existingAction.enabled = actionsToBind[actionName].enabled;
                    }
                } else {
                    this.actions[actionName] = {
                        keys: actionsToBind[actionName].keys || [],
                        enabled: actionsToBind[actionName].enabled == true
                    };
                }
            }
        }

        enableAction(actionName) {
            if (this.actions[actionName]) {
                this.actions[actionName].enabled = true;
            }
        }

        disableAction(actionName) {
            if (this.actions[actionName]) {
                this.actions[actionName].enabled = false;
                if (this.activeActions.has(actionName)) {
                    this.activeActions.delete(actionName);
                    if (this.target && this.enabled && this.focused) {
                        const event = new CustomEvent(this.ACTION_DEACTIVATED, {
                            detail: actionName
                        });
                        this.target.dispatchEvent(event);
                    }
                }
            }
        }

        attach(target, dontEnable = false) {
            if (this.target) {
                this.detach();
            }

            this.target = target;

            if (dontEnable) {
                this.enabled = false;
            } else {
                this.enabled = true;
            }

            this.target.tabIndex = -1;
            this.target.focus();
        }

        detach() {

            if (this.target) {
                this.target.blur();
                this.target = null;
            }
            this.keysPressed.clear();
            this.activeActions.clear();
            this.enabled = false;
        }

        isActionActive(actionName) {
            if (!this.enabled || !this.focused || !this.actions[actionName] || !this.actions[actionName].enabled) {
                return false;
            }
            for (let key of this.actions[actionName].keys) {
                if (this.keysPressed.has(key)) {
                    return true;
                }
            }

            return false;
        }

        isKeyPressed(keyCode) {
            return this.enabled && this.focused && this.keysPressed.has(keyCode);
        }

        deactivateAllActions() {
            for (let actionName of this.activeActions) {
                if (this.target && this.enabled) {
                    const event = new CustomEvent(this.ACTION_DEACTIVATED, {
                        detail: actionName
                    });
                    this.target.dispatchEvent(event);
                }
            }
            this.activeActions.clear();
        }
    }

    window.InputController = InputController;
})();