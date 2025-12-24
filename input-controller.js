(function() {
    class InputController {
        constructor(actionsToBind = {}, target = null) {
            this.enabled = true;
            this.focused = true;
            this.ACTION_ACTIVATED = "input-controller:action-activated";
            this.ACTION_DEACTIVATED = "input-controller:action-deactivated";

            this.actions = new Map();
            this.activeActions = new Set();
            this.plugins = new Map();
            this.target = null;

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
                this.clearActiveActions();
            });
        }

        registerPlugin(plugin) {
            if (!plugin || !plugin.name) {
                return false;
            }

            if (this.plugins.has(plugin.name)) {
                return false;
            }

            this.plugins.set(plugin.name, plugin);

            if (typeof plugin.init === 'function') {
                plugin.init({
                    getActions: () => this.actions,
                    setActionActive: (actionName, active) => this.setActionActive(actionName, active),
                    isActionEnabled: (actionName) => this.isActionEnabled(actionName)
                });
            }

            this.bindActionsToPlugin(plugin);

            return true;
        }

        unregisterPlugin(pluginName) {
            if (!this.plugins.has(pluginName)) return false;

            const plugin = this.plugins.get(pluginName);
            if (typeof plugin.detach === 'function') {
                plugin.detach();
            }

            this.plugins.delete(pluginName);
            return true;
        }

        bindActionsToPlugin(plugin) {
            for (const [actionName, action] of this.actions) {
                if (typeof plugin.bindAction === 'function') {
                    plugin.bindAction(actionName, action);
                }
            }
        }

        bindActions(actionsToBind) {
            for (const [actionName, actionConfig] of Object.entries(actionsToBind)) {
                if (this.actions.has(actionName)) {
                    const existingAction = this.actions.get(actionName);
                    Object.assign(existingAction, actionConfig);
                } else {
                    this.actions.set(actionName, {
                        name: actionName,
                        enabled: actionConfig.enabled !== false,
                        ...actionConfig
                    });
                }

                this.notifyPluginsAboutAction(actionName);
            }
        }

        notifyPluginsAboutAction(actionName) {
            const action = this.actions.get(actionName);
            if (!action) return;
            for (const plugin of this.plugins.values()) {
                if (typeof plugin.bindAction === 'function') {
                    plugin.bindAction(actionName, action);
                }
            }
        }

        enableAction(actionName) {
            const action = this.actions.get(actionName);
            if (action) {
                action.enabled = true;
                this.notifyPluginsAboutAction(actionName);
            }
        }

        disableAction(actionName) {
            const action = this.actions.get(actionName);
            if (action) {
                action.enabled = false;

                if (this.activeActions.has(actionName)) {
                    this.setActionActive(actionName, false);
                }

                this.notifyPluginsAboutAction(actionName);
            }
        }

        setActionActive(actionName, active) {
            const action = this.actions.get(actionName);
            if (!action || !action.enabled) return;

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

        isActionActive(actionName) {
            if (!this.enabled || !this.focused) return false;
            return this.activeActions.has(actionName);
        }

        isActionEnabled(actionName) {
            const action = this.actions.get(actionName);
            return action ? action.enabled : false;
        }

        attach(target, dontEnable = false) {
            if (this.target) {
                this.detach();
            }

            this.target = target;
            this.enabled = !dontEnable;

            for (const plugin of this.plugins.values()) {
                if (typeof plugin.attach === 'function') {
                    plugin.attach(target);
                }
            }

            this.target.tabIndex = -1;
            this.target.focus();
        }

        detach() {
            for (const plugin of this.plugins.values()) {
                if (typeof plugin.detach === 'function') {
                    plugin.detach();
                }
            }

            if (this.target) {
                this.target.blur();
                this.target = null;
            }

            this.clearActiveActions();
            this.enabled = false;
        }

        clearActiveActions() {
            const previouslyActive = Array.from(this.activeActions);
            this.activeActions.clear();
            if (this.target) {
                for (const actionName of previouslyActive) {
                    const event = new CustomEvent(this.ACTION_DEACTIVATED, {
                        detail: actionName
                    });
                    this.target.dispatchEvent(event);
                }
            }
        }
    }

    window.InputController = InputController;
})();