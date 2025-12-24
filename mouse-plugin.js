(function() {
    class MousePlugin {
        constructor() {
            this.name = 'mouse';
            this.callbacks = null;
            this.target = null;
            this.actions = new Map();
            this.mouseButtons = new Set();

            this.handleMouseDown = this.handleMouseDown.bind(this);
            this.handleMouseUp = this.handleMouseUp.bind(this);
            this.handleMouseLeave = this.handleMouseLeave.bind(this);
        }

        init(callbacks) {
            this.callbacks = callbacks;
        }

        bindAction(actionName, actionConfig) {
            if (actionConfig.mouseButtons && Array.isArray(actionConfig.mouseButtons) && actionConfig.mouseButtons.length > 0) {
                this.actions.set(actionName, {
                    name: actionName,
                    enabled: actionConfig.enabled,
                    mouseButtons: actionConfig.mouseButtons
                });
            } else {
                this.actions.delete(actionName);
            }
        }

        attach(target) {
            this.target = target;
            if (target) {
                target.addEventListener('mousedown', this.handleMouseDown);
                target.addEventListener('mouseup', this.handleMouseUp);
                target.addEventListener('mouseleave', this.handleMouseLeave);
            }
        }

        detach() {
            if (this.target) {
                this.target.removeEventListener('mousedown', this.handleMouseDown);
                this.target.removeEventListener('mouseup', this.handleMouseUp);
                this.target.removeEventListener('mouseleave', this.handleMouseLeave);
            }
            this.target = null;
            this.mouseButtons.clear();
        }

        handleMouseDown(event) {
            if (!this.callbacks || !this.target) return;

            const button = event.button;
            this.mouseButtons.add(button);

            for (const [actionName, action] of this.actions) {
                if (action.enabled && action.mouseButtons.includes(button)) {
                    this.callbacks.setActionActive(actionName, true);
                }
            }
        }

        handleMouseUp(event) {
            if (!this.callbacks || !this.target) return;

            const button = event.button;
            this.mouseButtons.delete(button);

            for (const [actionName, action] of this.actions) {
                if (action.enabled && action.mouseButtons.includes(button)) {
                    let stillActive = false;
                    for (const btn of action.mouseButtons) {
                        if (this.mouseButtons.has(btn)) {
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
        handleMouseLeave() {
            if (!this.callbacks || !this.target) return;

            const previouslyActive = Array.from(this.actions.keys()).filter(actionName =>
                this.callbacks.isActionEnabled(actionName)
            );

            this.mouseButtons.clear();

            for (const actionName of previouslyActive) {
                this.callbacks.setActionActive(actionName, false);
            }
        }

        clear() {
            this.mouseButtons.clear();
        }
    }

    window.MousePlugin = MousePlugin;
})();