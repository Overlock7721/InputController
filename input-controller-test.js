(function() {
    let controller;
    let activeSquare = null;
    let isJumping = false;

    function init() {
        controller = new InputController({
            'left': {
                keys: [37, 65],
                enabled: true
            },
            'right': {
                keys: [39, 68],
                enabled: true
            },
            'up': {
                keys: [38, 87],
                enabled: true
            },
            'down': {
                keys: [40, 83],
                enabled: true
            },
            'jump': {
                keys: [32],
                enabled: false
            },
            'mouseClick': {
                enabled: true,
                params: {
                    mouseButtons: [0]
                }
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
        let square1 = document.getElementById('square1');
        let square2 = document.getElementById('square2');
        let square3 = document.getElementById('square3');
        let square4 = document.getElementById('square4');

        square1.onclick = function() {
            if (activeSquare) {
                activeSquare.style.border = 'none';
            }
            controller.attach(square1);
            activeSquare = square1;
            activeSquare.style.border = '3px solid black';
            updateStatus();
        };

        square2.onclick = function() {
            if (activeSquare) {
                activeSquare.style.border = 'none';
            }
            controller.attach(square2);
            activeSquare = square2;
            activeSquare.style.border = '3px solid black';
            updateStatus();
        };

        square3.onclick = function() {
            if (activeSquare) {
                activeSquare.style.border = 'none';
            }
            controller.attach(square3);
            activeSquare = square3;
            activeSquare.style.border = '3px solid black';
            updateStatus();
        };

        square4.onclick = function() {
            if (activeSquare) {
                activeSquare.style.border = 'none';
            }
            controller.attach(square4);
            activeSquare = square4;
            activeSquare.style.border = '3px solid black';
            updateStatus();
        };

        document.querySelectorAll('button').forEach(btn => {
            btn.tabIndex = -1;
        });

        document.getElementById('attachBtn1').onclick = function() {
            document.getElementById('square1').click();
        };

        document.getElementById('attachBtn2').onclick = function() {
            document.getElementById('square2').click();
        };

        document.getElementById('attachBtn3').onclick = function() {
            document.getElementById('square3').click();
        };

        document.getElementById('attachBtn4').onclick = function() {
            document.getElementById('square4').click();
        };

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
            let select = document.getElementById('actionSelect');
            let action = select.value;

            if (controller.actions[action] && controller.actions[action].enabled) {
                controller.disableAction(action);
            } else if (controller.actions[action]) {
                controller.enableAction(action);
            }

            updateActionsList();
            updateStatus();
        };

        updateActionsList();
    }

    function updateStatus() {
        let statusText = document.getElementById('statusText');

        let status = [
            'Контроллер: ' + (controller.enabled ? 'ВКЛ' : 'ВЫКЛ'),
            'Фокус окна: ' + (controller.focused ? 'ДА' : 'НЕТ'),
            'Активный объект: ' + (activeSquare ? activeSquare.id : 'НЕТ'),
            'Плагины: ' + controller.plugins.length
        ];

        statusText.innerHTML = status.join('<br>');
    }

    function updateActionsList() {
        let select = document.getElementById('actionSelect');
        select.innerHTML = '';

        for (let actionName in controller.actions) {
            let option = document.createElement('option');
            option.value = actionName;
            option.text = actionName + ' (' + (controller.actions[actionName].enabled ? 'вкл' : 'выкл') + ')';
            select.appendChild(option);
        }
    }

    function startMovementLoop() {
        setInterval(function() {
            if (!controller.enabled || !controller.focused || !activeSquare) return;

            let speed = 5;

            let currentStyle = window.getComputedStyle(activeSquare);
            let left = parseInt(currentStyle.left) || 0;
            let top = parseInt(currentStyle.top) || 0;

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
                activeSquare.style.backgroundColor = 'orange';
            } else {
                if (activeSquare.id === 'square1') {
                    activeSquare.style.backgroundColor = '#3498db';
                } else if (activeSquare.id === 'square2') {
                    activeSquare.style.backgroundColor = '#e74c3c';
                } else if (activeSquare.id === 'square3') {
                    activeSquare.style.backgroundColor = '#ffe926';
                } else if (activeSquare.id === 'square4') {
                    activeSquare.style.backgroundColor = '#08ca08';
                }
            }

            activeSquare.style.left = left + 'px';
            activeSquare.style.top = top + 'px';
        }, 16);

        document.addEventListener('keydown', function(event) {
            if (event.keyCode === 32 && controller.enabled && activeSquare && controller.focused) {
                if (!isJumping && controller.actions['jump'] && controller.actions['jump'].enabled) {
                    jump();
                }
            }
        });
    }

    function jump() {
        if (isJumping) return;

        isJumping = true;
        let originalColor = activeSquare.style.backgroundColor;
        activeSquare.style.backgroundColor = 'purple';
        let currentStyle = window.getComputedStyle(activeSquare);
        let startTop = parseInt(currentStyle.top) || 0;
        let jumpMax = 100;
        let currentHeight = 0;
        let goingUp = true;

        let jumpInterval = setInterval(function() {
            if (goingUp) {
                currentHeight += 5;
                activeSquare.style.top = (startTop - currentHeight) + 'px';

                if (currentHeight >= jumpMax) {
                    goingUp = false;
                }
            } else {
                currentHeight -= 5;
                activeSquare.style.top = (startTop - currentHeight) + 'px';

                if (currentHeight <= 0) {
                    clearInterval(jumpInterval);
                    activeSquare.style.top = startTop + 'px';
                    activeSquare.style.backgroundColor = originalColor;
                    isJumping = false;
                }
            }
        }, 16);
    }


    window.onload = init;

})();