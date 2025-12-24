(function() {
    let controller;
    let activeSquare = null;
    let isJumping = false;
    let originalColor = '';

    function init() {
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
            'mouseClick': {
                enabled: true,
                mouseButtons: [0]
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
            square.onclick = function() {
                if (activeSquare) {
                    activeSquare.style.border = 'none';
                }
                controller.attach(square);
                activeSquare = square;
                activeSquare.style.border = '3px solid black';
                originalColor = square.style.backgroundColor;
                updateStatus();
            };
        });

        document.querySelectorAll('button').forEach(btn => {
            btn.tabIndex = -1;
        });

        document.getElementById('attachBtn1').onclick = () => document.getElementById('square1').click();
        document.getElementById('attachBtn2').onclick = () => document.getElementById('square2').click();
        document.getElementById('attachBtn3').onclick = () => document.getElementById('square3').click();
        document.getElementById('attachBtn4').onclick = () => document.getElementById('square4').click();

        document.getElementById('detachBtn').onclick = function() {
            if (activeSquare) {
                activeSquare.style.border = 'none';
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

            let description = `${actionName} (${action.enabled ? 'вкл' : 'выкл' })`;

            option.text = description;
            select.appendChild(option);
        }
    }

    function startMovementLoop() {
        setInterval(() => {
            if (!controller.enabled || !controller.focused || !activeSquare) return;

            const speed = 5;
            const style = window.getComputedStyle(activeSquare);
            let left = parseInt(style.left) || 0;
            let top = parseInt(style.top) || 0;

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

            if (controller.isActionActive('mouseClick')) {
                activeSquare.style.backgroundColor = 'purple';
            } else if (controller.isActionActive('action')) {
                activeSquare.style.backgroundColor = 'orange';
            } else {
                activeSquare.style.backgroundColor = originalColor;
            }

            activeSquare.style.left = left + 'px';
            activeSquare.style.top = top + 'px';
        }, 16);

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
        const startColor = activeSquare.style.backgroundColor;
        const style = window.getComputedStyle(activeSquare);
        const startTop = parseInt(style.top) || 0;
        let height = 0;
        let goingUp = true;

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
                    activeSquare.style.backgroundColor = startColor;
                    isJumping = false;
                }
            }
        }, 16);
    }

    window.onload = init;
})();