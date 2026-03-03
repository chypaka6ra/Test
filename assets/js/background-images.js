/**
 * Background Images Loader - Optimized
 * Динамически подставляет фоновые изображения из data-атрибутов
 * Оптимизировано для производительности с использованием Intersection Observer
 */

(function() {
    'use strict';

    /**
     * Загружает фоновые изображения с использованием Intersection Observer
     * Для оптимизации производительности (lazy-loading паттерн)
     */
    function lazyLoadBackgrounds() {
        const elements = document.querySelectorAll('.t-bgimg[data-original]');

        if (elements.length === 0) {
            return;
        }

        // Используем Intersection Observer если доступен
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        const url = el.getAttribute('data-original');
                        if (url) {
                            el.style.backgroundImage = 'url(' + url + ')';
                        }
                        observer.unobserve(el);
                    }
                });
            }, {
                rootMargin: '50px' // Начинаем загружать за 50px до видимости
            });

            elements.forEach(function(el) {
                observer.observe(el);
            });
        } else {
            // Fallback для старых браузеров - загружаем сразу
            elements.forEach(function(el) {
                const url = el.getAttribute('data-original');
                if (url) {
                    el.style.backgroundImage = 'url(' + url + ')';
                }
            });
        }
    }

    // Загружаем когда DOM готов
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', lazyLoadBackgrounds);
    } else {
        // DOM уже готов
        requestAnimationFrame(lazyLoadBackgrounds);
    }
})();
