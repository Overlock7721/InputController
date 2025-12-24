(function() {
    class InputController {
        constructor(actionsToBind = {}, target = null) {
            this.enabled = true;
            this.focused = true;
            this.ACTION_ACTIVATED = "input-controller:action-activated";
            this.ACTION_DEACTIVATED = "input-controller:action-deactivated";

            this.actions = {};
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
                this.deactivateAllActions();
            });
        }

        registerPlugin(plugin) {
            this.plugins.push(plugin);
            if (typeof plugin.init === 'function') {
                plugin.init(this);
            }
            for (let actionName in this.actions) {
                if (typeof plugin.bindAction === 'function') {
                    plugin.bindAction(actionName, this.actions[actionName]);
                }
            }
            return this;
        }

        setActionActive(actionName, active) {
            if (!this.actions[actionName] || !this.actions[actionName].enabled) return;

            const wasActive = this.activeActions.has(actionName);

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
                        enabled: actionsToBind[actionName].enabled == true,
                        params: actionsToBind[actionName].params || {}
                    };
                }

                for (let plugin of this.plugins) {
                    if (typeof plugin.bindAction === 'function') {
                        plugin.bindAction(actionName, this.actions[actionName]);
                    }
                }
            }
        }

        enableAction(actionName) {
            if (this.actions[actionName]) {
                this.actions[actionName].enabled = true;
                for (let plugin of this.plugins) {
                    if (typeof plugin.onActionEnabled === 'function') {
                        plugin.onActionEnabled(actionName);
                    }
                }
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
                for (let plugin of this.plugins) {
                    if (typeof plugin.onActionDisabled === 'function') {
                        plugin.onActionDisabled(actionName);
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

            for (let plugin of this.plugins) {
                if (typeof plugin.attach === 'function') {
                    plugin.attach(target);
                }
            }

            this.target.tabIndex = -1;
            this.target.focus();
        }

        detach() {
            for (let plugin of this.plugins) {
                if (typeof plugin.detach === 'function') {
                    plugin.detach();
                }
            }

            if (this.target) {
                this.target.blur();
                this.target = null;
            }
            this.deactivateAllActions();
            this.enabled = false;
        }

        isActionActive(actionName) {
            if (!this.enabled || !this.focused || !this.actions[actionName] || !this.actions[actionName].enabled) {
                return false;
            }
            return this.activeActions.has(actionName);
        }

        isKeyPressed(keyCode) {
            for (let plugin of this.plugins) {
                if (plugin.name === 'keyboard' && typeof plugin.isKeyPressed === 'function') {
                    return plugin.isKeyPressed(keyCode);
                }
            }
            return false;
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

            for (let plugin of this.plugins) {
                if (typeof plugin.clear === 'function') {
                    plugin.clear();
                }
            }
        }
    }

    window.InputController = InputController;
})();