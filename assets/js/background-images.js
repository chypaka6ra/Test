/**
 * Background Images Loader
 * Динамически подставляет фоновые изображения из data-атрибутов
 */

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.t-bgimg[data-original]').forEach(function(el) {
        el.style.backgroundImage = 'url(' + el.getAttribute('data-original') + ')';
    });
});
