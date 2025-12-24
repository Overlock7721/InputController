(function() {
    let controller;
    let activeSquare = null;
    let isJumping = false;
    let originalColors = new Map();
    let wasMouseDragActive = false;

    function init() {
        document.querySelectorAll('.square').forEach(square => {
            const style = window.getComputedStyle(square);
            originalColors.set(square.id, style.backgroundColor);
        });

        controller = new InputController({
            'left': {
                enabled: true,
                keys: [37, 65]
            },
            'right': {
                enabled: true,
                keys: [39, 68]
            },
            'up': {
                enabled: true,
                keys: [38, 87]
            },
            'down': {
                enabled: true,
                keys: [40, 83]
            },
            'jump': {
                enabled: false,
                keys: [32]
            },
            'mouseDrag': {
                enabled: true,
                mouseButtons: [0],
                dragEnabled: true
            }
        });

        const keyboardPlugin = new KeyboardPlugin();
        const mousePlugin = new MousePlugin();

        controller.registerPlugin(keyboardPlugin);
        controller.registerPlugin(mousePlugin);

        setupButtons();
        updateStatus();
        startMovementLoop();
        setInterval(updateStatus, 100);
    }

    function setupButtons() {
        const squares = document.querySelectorAll('.square');

        squares.forEach(square => {
            square.addEventListener('mousedown', function(event) {
                if (event.button !== 0) return;

                if (activeSquare !== square) {
                    if (activeSquare) {
                        activeSquare.style.border = 'none';
                        resetSquareColor(activeSquare);
                    }
                    controller.attach(square);
                    activeSquare = square;
                    activeSquare.style.border = '3px solid black';
                    updateStatus();
                }
            });
        });

        document.querySelectorAll('button').forEach(btn => {
            btn.tabIndex = -1;
        });

        document.getElementById('attachBtn1').onclick = () => {
            const square = document.getElementById('square1');
            if (activeSquare) {
                activeSquare.style.border = 'none';
                resetSquareColor(activeSquare);
            }
            controller.attach(square);
            activeSquare = square;
            activeSquare.style.border = '3px solid black';
            updateStatus();
        };

        document.getElementById('attachBtn2').onclick = () => {
            const square = document.getElementById('square2');
            if (activeSquare) {
                activeSquare.style.border = 'none';
                resetSquareColor(activeSquare);
            }
            controller.attach(square);
            activeSquare = square;
            activeSquare.style.border = '3px solid black';
            updateStatus();
        };

        document.getElementById('attachBtn3').onclick = () => {
            const square = document.getElementById('square3');
            if (activeSquare) {
                activeSquare.style.border = 'none';
                resetSquareColor(activeSquare);
            }
            controller.attach(square);
            activeSquare = square;
            activeSquare.style.border = '3px solid black';
            updateStatus();
        };

        document.getElementById('attachBtn4').onclick = () => {
            const square = document.getElementById('square4');
            if (activeSquare) {
                activeSquare.style.border = 'none';
                resetSquareColor(activeSquare);
            }
            controller.attach(square);
            activeSquare = square;
            activeSquare.style.border = '3px solid black';
            updateStatus();
        };
        document.getElementById('detachBtn').onclick = function() {
            if (activeSquare) {
                activeSquare.style.border = 'none';
                resetSquareColor(activeSquare);
            }
            controller.detach();
            activeSquare = null;
            updateStatus();
        };

        document.getElementById('enableBtn').onclick = function() {
            controller.enabled = true;
            updateStatus();
        };

        document.getElementById('disableBtn').onclick = function() {
            controller.enabled = false;
            updateStatus();
        };

        document.getElementById('addJumpBtn').onclick = function() {
            controller.enableAction('jump');
            updateActionsList();
        };

        document.getElementById('toggleBtn').onclick = function() {
            const select = document.getElementById('actionSelect');
            const action = select.value;

            if (controller.isActionEnabled(action)) {
                controller.disableAction(action);
            } else {
                controller.enableAction(action);
            }

            updateActionsList();
            updateStatus();
        };

        updateActionsList();
    }

    function resetSquareColor(square) {
        const originalColor = originalColors.get(square.id);
        if (originalColor) {
            square.style.backgroundColor = originalColor;
        }
    }

    function updateStatus() {
        const statusText = document.getElementById('statusText');

        const status = [
            'Контроллер: ' + (controller.enabled ? 'ВКЛ' : 'ВЫКЛ'),
            'Фокус окна: ' + (controller.focused ? 'ДА' : 'НЕТ'),
            'Активный объект: ' + (activeSquare ? activeSquare.id : 'НЕТ'),
            'Плагины: ' + Array.from(controller.plugins.keys()).join(', ')
        ];

        statusText.innerHTML = status.join('<br>');
    }

    function updateActionsList() {
        const select = document.getElementById('actionSelect');
        select.innerHTML = '';

        for (const [actionName, action] of controller.actions) {
            const option = document.createElement('option');
            option.value = actionName;

            let description = `${actionName} (${action.enabled ? 'вкл' : 'выкл'})`;

            option.text = description;
            select.appendChild(option);
        }
    }

    function startMovementLoop() {
        function gameLoop() {
            if (!controller.enabled || !controller.focused || !activeSquare) {
                requestAnimationFrame(gameLoop);
                return;
            }

            const speed = 5;
            const style = window.getComputedStyle(activeSquare);
            let left = parseInt(style.left) || 0;
            let top = parseInt(style.top) || 0;

            const mousePlugin = controller.plugins.get('mouse');
            const isDragging = mousePlugin && mousePlugin.isDragging;
            const isMouseDragActive = controller.isActionActive('mouseDrag');

            if (!isDragging) {
                if (controller.isActionActive('left')) {
                    left -= speed;
                }
                if (controller.isActionActive('right')) {
                    left += speed;
                }
                if (controller.isActionActive('up')) {
                    top -= speed;
                }
                if (controller.isActionActive('down')) {
                    top += speed;
                }
            }

            if (isMouseDragActive) {
                activeSquare.style.backgroundColor = 'purple';
                wasMouseDragActive = true;
            } else if (wasMouseDragActive && !isJumping) {
                resetSquareColor(activeSquare);
                wasMouseDragActive = false;
            }

            activeSquare.style.left = left + 'px';
            activeSquare.style.top = top + 'px';

            requestAnimationFrame(gameLoop);
        }

        gameLoop();

        document.addEventListener('keydown', (event) => {
            if (event.keyCode === 32 && controller.enabled && activeSquare && controller.focused) {
                if (!isJumping && controller.isActionEnabled('jump')) {
                    jump();
                }
            }
        });
    }

    function jump() {
        if (isJumping) return;

        isJumping = true;
        const originalColor = activeSquare.style.backgroundColor;
        const style = window.getComputedStyle(activeSquare);
        const startTop = parseInt(style.top) || 0;
        const startLeft = parseInt(style.left) || 0;
        let height = 0;
        let goingUp = true;

        activeSquare.style.backgroundColor = 'orange';

        const jumpInterval = setInterval(() => {
            if (goingUp) {
                height += 5;
                activeSquare.style.top = (startTop - height) + 'px';

                if (height >= 100) {
                    goingUp = false;
                }
            } else {
                height -= 5;
                activeSquare.style.top = (startTop - height) + 'px';

                if (height <= 0) {
                    clearInterval(jumpInterval);
                    activeSquare.style.top = startTop + 'px';
                    activeSquare.style.left = startLeft + 'px';

                    if (controller.isActionActive('mouseDrag')) {
                        activeSquare.style.backgroundColor = 'purple';
                        wasMouseDragActive = true;
                    } else {
                        resetSquareColor(activeSquare);
                        wasMouseDragActive = false;
                    }

                    isJumping = false;
                }
            }
        }, 16);
    }

    window.onload = init;
})();