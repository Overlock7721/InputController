(function() {
    'use strict';

    class MousePlugin {
        constructor() {
            this.name = 'mouse';
            this.callbacks = null;
            this.target = null;
            this.actions = new Map();
            this.mouseButtons = new Set();
            this.isDragging = false;
            this.dragStartX = 0;
            this.dragStartY = 0;
            this.elementStartX = 0;
            this.elementStartY = 0;

            this.handleMouseDown = this.handleMouseDown.bind(this);
            this.handleMouseUp = this.handleMouseUp.bind(this);
            this.handleMouseMove = this.handleMouseMove.bind(this);
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
                    mouseButtons: actionConfig.mouseButtons,
                    dragEnabled: actionConfig.dragEnabled || false
                });
            } else {
                this.actions.delete(actionName);
            }
        }

        attach(target) {
            this.target = target;
            if (target) {
                target.addEventListener('mousedown', this.handleMouseDown);
                target.addEventListener('mouseleave', this.handleMouseLeave);
            }
        }

        detach() {
            if (this.target) {
                this.target.removeEventListener('mousedown', this.handleMouseDown);
                this.target.removeEventListener('mouseleave', this.handleMouseLeave);
            }
            document.removeEventListener('mousemove', this.handleMouseMove);
            document.removeEventListener('mouseup', this.handleMouseUp);
            this.target = null;
            this.mouseButtons.clear();
            this.isDragging = false;
        }

        handleMouseDown(event) {
            if (!this.callbacks || !this.target || !this.callbacks.isControllerEnabled() || !this.callbacks.isControllerFocused()) return;

            const button = event.button;
            this.mouseButtons.add(button);

            if (button === 0) {
                this.isDragging = true;
                this.dragStartX = event.clientX;
                this.dragStartY = event.clientY;

                const style = window.getComputedStyle(this.target);
                this.elementStartX = parseInt(style.left) || 0;
                this.elementStartY = parseInt(style.top) || 0;

                document.addEventListener('mousemove', this.handleMouseMove);
                document.addEventListener('mouseup', this.handleMouseUp);

                event.preventDefault();
            }

            for (const [actionName, action] of this.actions) {
                if (action.enabled && action.mouseButtons.includes(button)) {
                    this.callbacks.setActionActive(actionName, true);
                }
            }
        }

        handleMouseMove(event) {
            if (!this.callbacks || !this.target || !this.isDragging || !this.callbacks.isControllerEnabled() || !this.callbacks.isControllerFocused()) return;

            const deltaX = event.clientX - this.dragStartX;
            const deltaY = event.clientY - this.dragStartY;

            this.target.style.left = (this.elementStartX + deltaX) + 'px';
            this.target.style.top = (this.elementStartY + deltaY) + 'px';

            event.preventDefault();
        }
        handleMouseUp(event) {
            if (!this.callbacks || !this.target || !this.callbacks.isControllerEnabled() || !this.callbacks.isControllerFocused()) return;

            const button = event.button;

            if (button === 0 && this.isDragging) {
                this.isDragging = false;
                document.removeEventListener('mousemove', this.handleMouseMove);
                document.removeEventListener('mouseup', this.handleMouseUp);
            }

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
            if (!this.callbacks || !this.target || !this.callbacks.isControllerEnabled() || !this.callbacks.isControllerFocused()) return;

            if (!this.isDragging) {
                this.mouseButtons.clear();

                for (const [actionName, action] of this.actions) {
                    if (action.enabled && this.callbacks.isActionEnabled(actionName)) {
                        this.callbacks.setActionActive(actionName, false);
                    }
                }
            }
        }

        clear() {
            this.mouseButtons.clear();
            this.isDragging = false;
        }
    }

    window.MousePlugin = MousePlugin;
})();