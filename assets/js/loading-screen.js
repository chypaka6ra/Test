/**
 * Loading Screen Module - Simple and Reliable
 * Отображает полноэкранный прямоугольник (цвет #FBF7EE) со счетчиком загрузки от 0 до 100%
 * Затем удаляет прямоугольник и включает прокрутку страницы
 */

(function() {
    'use strict';

    // Конфигурация таймингов
    const TIMING = {
        COUNTER_DURATION: 2100,      // 0-100% счетчик (ms)
        SHAPE_DELAY: 400,            // Задержка перед началом исчезания (ms)
        SCROLL_ENABLE_DELAY: 3500,   // Разрешить скролл (ms)
        HIDE_DELAY: 5300,            // Полное удаление прямоугольника (ms)
        FALLBACK_HIDE_DELAY: 5300    // Резервное удаление (ms)
    };

    // Состояние
    let preloaderState = {
        isInitialized: false,
        isComplete: false
    };

    /**
     * Создает HTML структуру прямоугольника загрузки
     * Полноэкранный div с цветом #FBF7EE и счетчиком
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
            console.log('[Loading Screen] HTML structure created');
            return true;
        }
        return false;
    }

    /**
     * Инициализирует и запускает анимацию экрана загрузки
     * - Показывает полноэкранный прямоугольник (#FBF7EE)
     * - Анимирует счетчик от 0 до 100%
     * - Скрывает и удаляет прямоугольник
     */
    function initLoadingScreen() {
        // Не инициализируем дважды
        if (preloaderState.isInitialized) {
            return;
        }

        // Создаем HTML структуру если ее нет
        const created = createPreloaderHTML();

        const preloader = document.querySelector('.uc-preloader');
        const numberElement = document.querySelector('.number .tn-atom');
        const numberContainer = document.querySelector('.number');
        const preloaderShape = document.querySelector('.preloader-shape');
        const body = document.querySelector('.t-body');

        // Проверка наличия всех элементов
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

        console.log('[Loading Screen] ✓ Rectangle created (width: 100%, height: 100%, color: #FBF7EE)');
        console.log('[Loading Screen] ✓ Starting counter animation (0% → 100%)');

        // Убедимся что прямоугольник видимый
        preloader.style.display = 'flex';
        preloader.style.zIndex = '9999';
        preloaderShape.style.zIndex = '9998';

        // Убедимся что body не имеет прокрутки
        body.classList.remove('overflow');

        // ========== СЧЕТЧИК 0-100% ==========
        animateCounter(numberElement, TIMING.COUNTER_DURATION);

        // ========== СКРЫТИЕ ПРЯМОУГОЛЬНИКА ==========
        // Начинаем исчезание прямоугольника
        setTimeout(function() {
            console.log('[Loading Screen] Counter complete, starting to hide rectangle...');
            preloaderShape.classList.add('slide-up-smooth');
            preloader.classList.add('slide-up-smooth');
        }, TIMING.SHAPE_DELAY);

        // Разрешаем прокрутку страницы
        setTimeout(function() {
            console.log('[Loading Screen] ✓ Page scrolling enabled');
            if (body) {
                body.classList.add('overflow');
            }
        }, TIMING.SCROLL_ENABLE_DELAY);

        // Полностью удаляем прямоугольник из DOM
        setTimeout(function() {
            preloader.style.display = 'none';
            numberContainer.style.display = 'none';
            preloaderState.isComplete = true;
            console.log('[Loading Screen] ✓ Rectangle removed, loading complete');
        }, TIMING.HIDE_DELAY);
    }

    /**
     * Анимирует счетчик от 0 до 100%
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

            // Обновляем числовое значение (0 → 100)
            numberElement.textContent = currentValue;

            // Логируем начало анимации
            if (!hasLogged && progress > 0) {
                console.log('[Loading Screen] Counter animation started');
                hasLogged = true;
            }

            // Продолжаем анимацию если не закончилось
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                // Окончательно устанавливаем 100%
                numberElement.textContent = endValue;
                console.log('[Loading Screen] ✓ Counter reached 100%');
            }
        }

        requestAnimationFrame(updateCounter);
    }

    /**
     * Резервная функция для гарантированного удаления прямоугольника
     * (на случай, если основная логика не сработает)
     */
    function fallbackHideLoading() {
        if (preloaderState.isComplete) {
            return; // Уже удалено
        }

        const preloader = document.querySelector('.uc-preloader');
        const numberContainer = document.querySelector('.number');
        const body = document.querySelector('.t-body');

        // Удаляем все элементы
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
        console.log('[Loading Screen] ⚠ Fallback: Rectangle forcefully removed');
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

    // ========== ЗАПУСК ==========
    console.log('[Loading Screen] Module loaded, starting initialization...');
    setupLoadingScreen();

    // Резервный таймер для гарантированного удаления
    setTimeout(fallbackHideLoading, TIMING.FALLBACK_HIDE_DELAY);

    // ========== PUBLIC API ==========
    // Экспортируем функции для внешнего управления
    window.LoadingScreen = {
        /**
         * Принудительно скрыть прямоугольник загрузки
         */
        hide: fallbackHideLoading,

        /**
         * Проверить завершена ли загрузка
         * @returns {boolean} true если загрузка завершена
         */
        isComplete: function() {
            return preloaderState.isComplete;
        },

        /**
         * Проверить инициализирован ли экран
         * @returns {boolean} true если экран инициализирован
         */
        isInitialized: function() {
            return preloaderState.isInitialized;
        }
    };

    console.log('[Loading Screen] ✓ Module ready');
})();
