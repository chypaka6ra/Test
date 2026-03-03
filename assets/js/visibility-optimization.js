/**
 * Visibility Optimization
 * Оптимизирует рендеринг страницы для реальных пользователей и защищает от ботов
 */

(function() {
    'use strict';

    // Проверяем: не бот ли это (Google, Yandex, Baidu, Bing и т.д.)
    var isBot = /bot|google|yandex|baidu|bing|msn|duckduckbot|teoma|slurp|crawler|spider|robot|crawling|facebook/i.test(navigator.userAgent);
    var hasSessionStorage = typeof(sessionStorage) !== 'undefined';
    var isFirstVisit = hasSessionStorage && sessionStorage.getItem('visited') !== 'y';
    var hasVisibility = document.visibilityState;

    // Если это реальный пользователь, первый визит и страница видима
    if (!isBot && hasSessionStorage && isFirstVisit && hasVisibility) {
        // Создаем стиль для плавного появления контента
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = '@media screen and (min-width: 980px) {' +
            '.t-records {opacity: 0;}' +
            '.t-records_animated {' +
            '-webkit-transition: opacity ease-in-out .2s;' +
            '-moz-transition: opacity ease-in-out .2s;' +
            '-o-transition: opacity ease-in-out .2s;' +
            'transition: opacity ease-in-out .2s;' +
            '}' +
            '.t-records.t-records_visible {opacity: 1;}' +
            '}';
        document.getElementsByTagName('head')[0].appendChild(style);

        /**
         * Плавно отображает контент и устанавливает флаг посещения
         */
        function t_setvisRecs() {
            var alr = document.querySelectorAll('.t-records');
            Array.prototype.forEach.call(alr, function(el) {
                el.classList.add("t-records_animated");
            });

            setTimeout(function() {
                Array.prototype.forEach.call(alr, function(el) {
                    el.classList.add("t-records_visible");
                });
                hasSessionStorage && sessionStorage.setItem("visited", "y");
            }, 400);
        }

        // Выполняем при готовности DOM
        document.addEventListener('DOMContentLoaded', t_setvisRecs);
    }
})();
