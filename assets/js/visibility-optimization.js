/**
 * Visibility Optimization - Optimized
 * Оптимизирует рендеринг страницы для реальных пользователей
 * Скрывает контент от ботов для SEO оптимизации
 */

(function() {
    'use strict';

    // Быстрая проверка: это бот?
    const isBot = /bot|google|yandex|baidu|bing|msn|duckduckbot|teoma|slurp|crawler|spider|robot|crawling|facebook|whatsapp|telegram/i.test(
        navigator.userAgent
    );

    // Быстрая проверка: есть ли поддержка sessionStorage?
    const hasSessionStorage = (function() {
        try {
            sessionStorage.setItem('_test', '1');
            sessionStorage.removeItem('_test');
            return true;
        } catch (e) {
            return false;
        }
    })();

    // Проверяем первый визит
    const isFirstVisit = hasSessionStorage && sessionStorage.getItem('visited') !== 'y';

    // Проверяем видимость документа
    const isVisible = typeof document.visibilityState === 'string' && document.visibilityState !== 'hidden';

    // Если это реальный пользователь на первом визите
    if (!isBot && hasSessionStorage && isFirstVisit && isVisible) {
        // Асинхронно добавляем стили для оптимизации рендеринга
        requestAnimationFrame(function() {
            const style = document.createElement('style');
            style.type = 'text/css';
            style.textContent = '@media screen and (min-width: 980px) {' +
                '.t-records {opacity: 0;transition: opacity ease-in-out 0.2s;}' +
                '.t-records_animated.t-records_visible {opacity: 1;}' +
                '}';

            // Вставляем стиль в конец head
            document.head.appendChild(style);
        });

        /**
         * Плавно отображает контент с задержкой
         * Предотвращает Cumulative Layout Shift (CLS)
         */
        function makeRecordsVisible() {
            const records = document.querySelectorAll('.t-records');

            if (records.length === 0) {
                return;
            }

            // Добавляем класс анимации
            records.forEach(function(el) {
                el.classList.add('t-records_animated');
            });

            // После небольшой задержки показываем содержимое
            requestAnimationFrame(function() {
                setTimeout(function() {
                    records.forEach(function(el) {
                        el.classList.add('t-records_visible');
                    });

                    // Отмечаем что посетили
                    if (hasSessionStorage) {
                        sessionStorage.setItem('visited', 'y');
                    }
                }, 100);
            });
        }

        // Вызываем когда DOM готов
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', makeRecordsVisible);
        } else {
            makeRecordsVisible();
        }
    } else {
        // Для ботов или повторных визитов просто показываем контент сразу
        if (document.readyState !== 'loading') {
            const records = document.querySelectorAll('.t-records');
            records.forEach(function(el) {
                el.classList.add('t-records_visible');
            });
        }
    }
})();
