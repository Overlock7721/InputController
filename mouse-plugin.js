(function() {
    class MousePlugin {
        constructor() {
            this.name = 'mouse';
            this.controller = null;
            this.target = null;
            this.mouseButtons = new Set();
            this.actionsMap = {};

            this.handleMouseDown = this.handleMouseDown.bind(this);
            this.handleMouseUp = this.handleMouseUp.bind(this);
        }

        init(controller) {
            this.controller = controller;
        }

        bindAction(actionName, actionConfig) {
            if (actionConfig.params && actionConfig.params.mouseButtons) {
                this.actionsMap[actionName] = {
                    ...actionConfig,
                    mouseButtons: actionConfig.params.mouseButtons
                };
            }
        }

        attach(target) {
            this.target = target;
            if (target) {
                target.addEventListener('mousedown', this.handleMouseDown);
                target.addEventListener('mouseup', this.handleMouseUp);
            }
        }

        detach() {
            if (this.target) {
                this.target.removeEventListener('mousedown', this.handleMouseDown);
                this.target.removeEventListener('mouseup', this.handleMouseUp);
            }
            this.target = null;
            this.mouseButtons.clear();
        }

        onActionEnabled(actionName) {

        }

        onActionDisabled(actionName) {
            const action = this.actionsMap[actionName];
            if (action) {
                let hasMouseButton = false;
                for (let button of action.mouseButtons) {
                    if (this.mouseButtons.has(button)) {
                        hasMouseButton = true;
                        break;
                    }
                }
                if (hasMouseButton && this.controller) {
                    this.controller.setActionActive(actionName, false);
                }
            }
        }

        clear() {
            this.mouseButtons.clear();
        }

        handleMouseDown(event) {
            if (!this.controller || !this.controller.enabled || !this.controller.focused) return;

            const button = event.button;
            this.mouseButtons.add(button);

            for (let actionName in this.actionsMap) {
                const action = this.actionsMap[actionName];
                if (action && action.enabled && action.mouseButtons && action.mouseButtons.includes(button)) {
                    this.controller.setActionActive(actionName, true);
                }
            }
        }

        handleMouseUp(event) {
            if (!this.controller || !this.controller.enabled || !this.controller.focused) return;

            const button = event.button;
            this.mouseButtons.delete(button);

            for (let actionName in this.actionsMap) {
                const action = this.actionsMap[actionName];
                if (action && action.enabled && action.mouseButtons && action.mouseButtons.includes(button)) {
                    let stillActive = false;
                    for (let btn of action.mouseButtons) {
                        if (this.mouseButtons.has(btn)) {
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
    }

    window.MousePlugin = MousePlugin;

})();