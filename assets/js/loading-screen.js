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

    /**
     * Инициализирует и запускает анимацию экрана загрузки
     */
    function initLoadingScreen() {
        const preloader = document.querySelector('.uc-preloader');
        const numberElement = document.querySelector('.number .tn-atom');
        const numberContainer = document.querySelector('.number');
        const preloaderShape = document.querySelector('.preloader-shape');
        const body = document.querySelector('.t-body');

        // Проверка наличия необходимых элементов
        if (!preloader || !numberElement || !preloaderShape) {
            console.error('Loading screen elements not found');
            return;
        }

        // Показываем прелоадер
        preloader.classList.remove('hide');
        preloader.style.display = 'flex';

        // Анимируем счетчик от 0 до 100
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
            preloader.classList.add('hide');
            numberContainer.classList.add('hide');
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

        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentValue = Math.floor(progress * endValue);

            numberElement.textContent = currentValue;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                numberElement.textContent = endValue;
            }
        }

        requestAnimationFrame(updateCounter);
    }

    /**
     * Резервная функция для полного скрытия прелоадера
     * (на случай, если основная логика не сработает)
     */
    function fallbackHideLoading() {
        const preloader = document.querySelector('.uc-preloader');
        const numberContainer = document.querySelector('.number');
        const body = document.querySelector('.t-body');

        if (preloader) {
            preloader.classList.add('hide');
        }
        if (numberContainer) {
            numberContainer.classList.add('hide');
        }
        if (body) {
            body.classList.add('overflow');
        }
    }

    // Инициализируем при загрузке DOM
    document.addEventListener('DOMContentLoaded', function() {
        window.addEventListener('load', function() {
            initLoadingScreen();
        });
    });

    // Резервный таймер
    setTimeout(fallbackHideLoading, TIMING.FALLBACK_HIDE_DELAY);
})();
