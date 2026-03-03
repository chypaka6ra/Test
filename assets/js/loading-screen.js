/**
 * Loading Screen Module
 * Управляет экраном загрузки с анимированным счетчиком процентов
 */

(function() {
    'use strict';

    // Конфигурация таймингов
    const TIMING = {
        COUNTER_DURATION: 2100,      // Длительность анимации счетчика (ms)
        SHAPE_DELAY: 400,            // Задержка перед скрытием формы (ms)
        SCROLL_ENABLE_DELAY: 3500,   // Задержка перед включением скролла (ms)
        HIDE_DELAY: 5300,            // Задержка перед полным скрытием (ms)
        FALLBACK_HIDE_DELAY: 5300    // Резервная задержка скрытия (ms)
    };

    // Состояние
    let preloaderState = {
        isInitialized: false,
        isComplete: false
    };

    /**
     * Создает HTML структуру прелоадера в DOM
     */
    function createPreloaderHTML() {
        const preloaderHTML = `
            <div class="uc-preloader slide-up-smooth" style="display: flex;">
                <div class="preloader-shape slide-up-smooth"></div>
                <div class="number">
                    <div class="tn-atom">0</div>
                </div>
            </div>
        `;

        // Вставляем в самый начало body
        const body = document.body;
        if (body && !document.querySelector('.uc-preloader')) {
            body.insertAdjacentHTML('afterbegin', preloaderHTML);
            return true;
        }
        return false;
    }

    /**
     * Инициализирует и запускает анимацию экрана загрузки
     */
    function initLoadingScreen() {
        // Не инициализируем дважды
        if (preloaderState.isInitialized) {
            return;
        }

        // Создаем прелоадер если его нет
        const created = createPreloaderHTML();

        const preloader = document.querySelector('.uc-preloader');
        const numberElement = document.querySelector('.number .tn-atom');
        const numberContainer = document.querySelector('.number');
        const preloaderShape = document.querySelector('.preloader-shape');
        const body = document.querySelector('.t-body');

        // Проверка наличия необходимых элементов
        if (!preloader || !numberElement || !preloaderShape || !body) {
            console.error('[Loading Screen] Failed to initialize:', {
                created: created,
                preloader: !!preloader,
                numberElement: !!numberElement,
                preloaderShape: !!preloaderShape,
                body: !!body
            });
            return;
        }

        preloaderState.isInitialized = true;

        console.log('[Loading Screen] Initialized and showing preloader');

        // Убедимся что прелоадер видимый и поверх всего
        preloader.style.display = 'flex';
        preloader.style.zIndex = '9999';
        preloaderShape.style.zIndex = '9998';

        // Убедимся что body не имеет overflow
        body.classList.remove('overflow');

        // Запускаем анимацию счетчика
        animateCounter(numberElement, TIMING.COUNTER_DURATION);

        // После завершения счетчика - скрываем элементы
        setTimeout(function() {
            preloaderShape.classList.add('slide-up-smooth');
            preloader.classList.add('slide-up-smooth');
        }, TIMING.SHAPE_DELAY);

        // Разрешаем прокрутку страницы
        setTimeout(function() {
            if (body) {
                body.classList.add('overflow');
            }
        }, TIMING.SCROLL_ENABLE_DELAY);

        // Полностью скрываем элементы
        setTimeout(function() {
            preloader.style.display = 'none';
            numberContainer.style.display = 'none';
            preloaderState.isComplete = true;
        }, TIMING.HIDE_DELAY);
    }

    /**
     * Анимирует счетчик от 0 до конечного значения
     * @param {HTMLElement} numberElement - Элемент для отображения числа
     * @param {number} duration - Длительность анимации в миллисекундах
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
                console.log('[Loading Screen] Counter animation completed (100%)');
            }
        }

        requestAnimationFrame(updateCounter);
    }

    /**
     * Резервная функция для полного скрытия прелоадера
     * (на случай, если основная логика не сработает)
     */
    function fallbackHideLoading() {
        if (preloaderState.isComplete) {
            return; // Уже скрыто
        }

        const preloader = document.querySelector('.uc-preloader');
        const numberContainer = document.querySelector('.number');
        const body = document.querySelector('.t-body');

        if (preloader) {
            preloader.style.display = 'none';
        }
        if (numberContainer) {
            numberContainer.style.display = 'none';
        }
        if (body) {
            body.classList.add('overflow');
        }

        preloaderState.isComplete = true;
        console.log('[Loading Screen] Fallback: hidden loading screen');
    }

    /**
     * Инициализирует загрузку экрана
     */
    function setupLoadingScreen() {
        // Если DOM еще загружается
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initLoadingScreen);
        } else {
            // DOM уже готов
            initLoadingScreen();
        }
    }

    // Запускаем инициализацию как можно раньше
    setupLoadingScreen();

    // Резервный таймер для гарантированного скрытия
    setTimeout(fallbackHideLoading, TIMING.FALLBACK_HIDE_DELAY);

    // Экспортируем функции для внешнего использования
    window.LoadingScreen = {
        hide: fallbackHideLoading,
        isComplete: function() { return preloaderState.isComplete; },
        isInitialized: function() { return preloaderState.isInitialized; }
    };

    // Отличительная метка успешной инициализации
    console.log('[Loading Screen] Module loaded successfully');
})();
