/**
 * Loading Screen Module - Two-Stage Animation
 *
 * Stage 1 (Page Load): Отображает прямоугольник со счетчиком 0-100%
 * Stage 2 (On Scroll): Запускает исчезание при доскролле до элемента
 *
 * Использование:
 * 1. Скрипт автоматически запускается при загрузке страницы
 * 2. Поместите элемент с id="loading-screen-trigger" где нужно запустить исчезание
 */

(function() {
    'use strict';

    // Конфигурация таймингов
    const TIMING = {
        COUNTER_DURATION: 2100,      // 0-100% счетчик (ms)
        SCROLL_ENABLE_DELAY: 2500,   // Разрешить скролл после счетчика (ms)
        SHAPE_DELAY: 400,            // Задержка перед началом исчезания (ms)
        HIDE_DELAY: 1700             // Полное удаление прямоугольника (ms)
    };

    // Состояние
    let preloaderState = {
        counterStarted: false,
        counterComplete: false,
        hideAnimationStarted: false,
        isComplete: false
    };

    /**
     * Создает HTML структуру прямоугольника загрузки
     */
    function createPreloaderHTML() {
        const preloaderHTML = `
            <div class="uc-preloader" style="display: flex;">
                <div class="preloader-shape"></div>
                <div class="number">
                    <div class="tn-atom">0</div>
                </div>
            </div>
        `;

        const body = document.body;
        if (body && !document.querySelector('.uc-preloader')) {
            body.insertAdjacentHTML('afterbegin', preloaderHTML);
            console.log('[Loading Screen] HTML structure created');
            return true;
        }
        return false;
    }

    /**
     * ========== STAGE 1: СЧЕТЧИК ==========
     * Запускает анимацию счетчика от 0 до 100%
     * Затем разблокирует скролл
     */
    function startCounterAnimation() {
        if (preloaderState.counterStarted) {
            return;
        }

        preloaderState.counterStarted = true;

        // Создаем HTML если его нет
        createPreloaderHTML();

        const preloader = document.querySelector('.uc-preloader');
        const numberElement = document.querySelector('.number .tn-atom');
        const body = document.querySelector('.t-body');

        if (!preloader || !numberElement || !body) {
            console.error('[Loading Screen] Failed to initialize counter');
            return;
        }

        console.log('[Loading Screen] ✓ Rectangle displayed (width: 100%, height: 100%, color: #FBF7EE)');
        console.log('[Loading Screen] ✓ Starting counter animation (0% → 100%)');

        // Убедимся что прямоугольник видимый
        preloader.style.display = 'flex';
        preloader.style.zIndex = '9999';

        // Блокируем скролл во время счетчика
        body.classList.add('loading-screen-active');

        // Запускаем анимацию счетчика
        animateCounter(numberElement, TIMING.COUNTER_DURATION);

        // После завершения счетчика - начинаем fade out (0.5s)
        setTimeout(function() {
            console.log('[Loading Screen] ✓ Counter reached 100%, starting fade out...');

            // Добавляем плавное исчезание
            preloader.style.transition = 'opacity 0.5s ease-out';
            preloader.style.opacity = '0';
        }, TIMING.COUNTER_DURATION);

        // Разрешаем скролл после завершения счетчика + fade out
        setTimeout(function() {
            console.log('[Loading Screen] ✓ Counter complete, page scrolling enabled');
            preloaderState.counterComplete = true;

            if (body) {
                body.classList.remove('loading-screen-active');
            }
        }, TIMING.SCROLL_ENABLE_DELAY);
    }

    /**
     * ========== STAGE 2: ИСЧЕЗАНИЕ ==========
     * Запускает анимацию исчезания и удаляет прямоугольник
     */
    function startHideAnimation() {
        if (preloaderState.hideAnimationStarted) {
            return;
        }

        preloaderState.hideAnimationStarted = true;

        const preloader = document.querySelector('.uc-preloader');
        const numberContainer = document.querySelector('.number');
        const preloaderShape = document.querySelector('.preloader-shape');

        if (!preloader) {
            return;
        }

        console.log('[Loading Screen] ✓ Trigger element detected, starting hide animation...');

        // Начинаем исчезание прямоугольника
        if (preloaderShape) {
            preloaderShape.classList.add('slide-up-smooth');
        }
        preloader.classList.add('slide-up-smooth');

        // Полностью удаляем прямоугольник из DOM
        setTimeout(function() {
            if (preloader) {
                preloader.style.display = 'none';
            }
            if (numberContainer) {
                numberContainer.style.display = 'none';
            }
            preloaderState.isComplete = true;
            console.log('[Loading Screen] ✓ Rectangle removed, loading complete');
        }, TIMING.SHAPE_DELAY + TIMING.HIDE_DELAY);
    }

    /**
     * Анимирует счетчик от 0 до конечного значения
     */
    function animateCounter(numberElement, duration) {
        const endValue = 100;
        const startTime = performance.now();
        let hasLogged = false;

        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentValue = Math.floor(progress * endValue);

            numberElement.textContent = currentValue;

            if (!hasLogged && progress > 0) {
                console.log('[Loading Screen] Counter animation started');
                hasLogged = true;
            }

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                numberElement.textContent = endValue;
                console.log('[Loading Screen] ✓ Counter reached 100%');
            }
        }

        requestAnimationFrame(updateCounter);
    }

    /**
     * Запускает Intersection Observer для отслеживания триггер-элемента
     */
    function setupScrollTrigger() {
        const triggerElement = document.getElementById('loading-screen-trigger');

        if (triggerElement) {
            const observer = new IntersectionObserver(
                function(entries) {
                    entries.forEach(function(entry) {
                        if (entry.isIntersecting && !preloaderState.hideAnimationStarted) {
                            startHideAnimation();
                            observer.unobserve(triggerElement);
                        }
                    });
                },
                { threshold: 0.1 }
            );

            observer.observe(triggerElement);
            console.log('[Loading Screen] ✓ Intersection Observer ready (watching #loading-screen-trigger)');
        } else {
            console.warn('[Loading Screen] ⚠ Trigger element #loading-screen-trigger not found');
            console.log('[Loading Screen] Use window.LoadingScreen.startHide() to manually trigger hide animation');
        }
    }

    /**
     * Инициализирует модуль при загрузке DOM
     */
    function initializeModule() {
        console.log('[Loading Screen] Module loaded');

        // Stage 1: Запускаем счетчик сразу
        startCounterAnimation();

        // Stage 2: Подготавливаем триггер для исчезания
        setupScrollTrigger();
    }

    /**
     * Запускаем при готовности DOM
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeModule);
    } else {
        initializeModule();
    }

    // ========== PUBLIC API ==========
    window.LoadingScreen = {
        /**
         * Запустить счетчик вручную
         */
        startCounter: function() {
            if (!preloaderState.counterStarted) {
                console.log('[Loading Screen] Manual counter start');
                startCounterAnimation();
            }
        },

        /**
         * Запустить анимацию исчезания вручную
         */
        startHide: function() {
            if (!preloaderState.hideAnimationStarted) {
                console.log('[Loading Screen] Manual hide start');
                startHideAnimation();
            }
        },

        /**
         * Проверить статусы
         */
        isCounterComplete: function() {
            return preloaderState.counterComplete;
        },

        isHideStarted: function() {
            return preloaderState.hideAnimationStarted;
        },

        isComplete: function() {
            return preloaderState.isComplete;
        }
    };

    console.log('[Loading Screen] ✓ Module ready (two-stage mode)');
})();
