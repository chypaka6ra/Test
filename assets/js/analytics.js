/**
 * Google Analytics DataLayer - Optimized
 * Инициализация Google Tag Manager dataLayer
 * Безопасная инициализация с проверкой ошибок
 */

(function() {
    'use strict';

    try {
        // Инициализируем dataLayer если его еще нет
        window.dataLayer = window.dataLayer || [];

        // Логируем для отладки
        if (window.dataLayer && typeof window.dataLayer.push === 'function') {
            // console.log('[Analytics] DataLayer initialized');
        }
    } catch (err) {
        console.warn('[Analytics] Error initializing dataLayer:', err);
    }
})();
