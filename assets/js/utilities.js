/**
 * Tilda Utilities - Optimized
 * Основные функции для управления загрузкой и инициализацией компонентов
 * С обработкой ошибок и оптимизацией производительности
 */

/**
 * Выполняет функцию после загрузки DOM
 * @param {Function} func - Функция для выполнения
 */
window.t_onReady = function(func) {
    if (document.readyState !== 'loading') {
        func();
    } else {
        document.addEventListener('DOMContentLoaded', func);
    }
};

/**
 * Ожидает загрузки функции по имени, затем вызывает callback
 * С защитой от бесконечного ожидания
 * @param {string} funcName - Имя функции для ожидания
 * @param {Function} okFunc - Callback при загрузке функции
 * @param {number} time - Интервал проверки в миллисекундах
 * @param {number} maxRetries - Максимальное количество попыток
 */
window.t_onFuncLoad = (function() {
    const cache = {};

    return function(funcName, okFunc, time, maxRetries) {
        time = time || 100;
        maxRetries = maxRetries || 50; // ~5 сек при 100ms интервале

        const retries = cache[funcName] || 0;

        if (typeof window[funcName] === 'function') {
            okFunc();
            delete cache[funcName];
        } else if (retries < maxRetries) {
            cache[funcName] = retries + 1;
            setTimeout(function() {
                window.t_onFuncLoad(funcName, okFunc, time, maxRetries);
            }, time);
        } else {
            // Функция не загрузилась за отведенное время
            console.warn('[t_onFuncLoad] Function not loaded:', funcName);
            delete cache[funcName];
        }
    };
})();

/**
 * Масштабирует элементы блока t396 в зависимости от ширины экрана
 * @param {string} t - ID блока (без префикса 'rec')
 */
window.t396_initialScale = function(t) {
    try {
        var e = document.getElementById("rec" + t);
        if (!e) return;

        var i = e.querySelector(".t396__artboard");
        if (!i) return;

        // Сохраняем начальную ширину окна
        window.tn_scale_initial_window_width || (window.tn_scale_initial_window_width = document.documentElement.clientWidth);
        var a = window.tn_scale_initial_window_width,
            r = [],
            n,
            l = i.getAttribute("data-artboard-screens");

        if (l) {
            l = l.split(",");
            for (var o = 0; o < l.length; o++) r[o] = parseInt(l[o], 10);
        } else {
            r = [320, 480, 640, 960, 1200];
        }

        // Определяем нужное разрешение
        for (var o = 0; o < r.length; o++) {
            var d = r[o];
            a >= d && (n = d);
        }

        var allrec = window.allrecords || {};
        var _ = "edit" === allrec.getAttribute("data-tilda-mode"),
            c = "center" === window.t396_getFieldValue(i, "valign", n, r),
            s = "grid" === window.t396_getFieldValue(i, "upscale", n, r),
            w = window.t396_getFieldValue(i, "height_vh", n, r),
            g = window.t396_getFieldValue(i, "height", n, r),
            u = !!window.opr && !!window.opr.addons || !!window.opera || -1 !== navigator.userAgent.indexOf(" OPR/");

        if (!_ && c && !s && !w && g && !u) {
            var h = parseFloat((a / n).toFixed(3)),
                f = [i, i.querySelector(".t396__carrier"), i.querySelector(".t396__filter")],
                v = Math.floor(parseInt(g, 10) * h) + "px";

            i.style.setProperty("--initial-scale-height", v);
            for (var o = 0; o < f.length; o++) {
                if (f[o]) f[o].style.setProperty("height", "var(--initial-scale-height)");
            }

            window.t396_scaleInitial__getElementsToScale(i).forEach((function(t) {
                t.style.zoom = h;
            }));
        }
    } catch (err) {
        console.warn('[t396_initialScale] Error scaling block:', t, err);
    }
};

/**
 * Получает элементы блока для масштабирования
 * @param {HTMLElement} t - Элемент для поиска
 * @returns {Array} Массив элементов для масштабирования
 */
window.t396_scaleInitial__getElementsToScale = function(t) {
    return t ? Array.prototype.slice.call(t.children).filter(function(el) {
        return el && (el.classList.contains("t396__elem") || el.classList.contains("t396__group"));
    }) : [];
};

/**
 * Получает значение поля данных с поддержкой адаптивности по разрешениям
 * @param {HTMLElement} t - Элемент
 * @param {string} e - Имя атрибута
 * @param {number} i - Текущее разрешение
 * @param {Array} a - Доступные разрешения
 * @returns {string} Значение атрибута
 */
window.t396_getFieldValue = function(t, e, i, a) {
    var r, n = a[a.length - 1];
    if (!(r = i === n ? t.getAttribute("data-artboard-" + e) : t.getAttribute("data-artboard-" + e + "-res-" + i))) {
        for (var l = 0; l < a.length; l++) {
            var o = a[l];
            if (!(o <= i) && (r = o === n ? t.getAttribute("data-artboard-" + e) : t.getAttribute("data-artboard-" + e + "-res-" + o))) break;
        }
    }
    return r;
};

/**
 * Пустая функция-заглушка для совместимости с lazyload
 * Предотвращает ошибку "t_lazyload_update is undefined"
 */
window.t_lazyload_update = function() {
    // Stub function for compatibility
};

// Версия инициализации масштабирования
window.TN_SCALE_INITIAL_VER = "1.0";
window.tn_scale_initial_window_width = null;

// Экспортируем логи для отладки (опционально)
window.TildaDebug = {
    enabled: false,
    log: function(msg) {
        if (this.enabled) {
            console.log('[Tilda Debug]', msg);
        }
    }
};

/**
 * Отправляет сообщение в Telegram бот
 * @param {string} botToken - Токен Telegram бота
 * @param {string} chatId - ID чата или пользователя (780759394)
 * @param {string} message - Текст сообщения
 * @returns {Promise} Промис с результатом отправки
 */
window.sendTelegramMessage = function(botToken, chatId, message) {
    if (!botToken || !chatId || !message) {
        console.warn('[Telegram] Missing required parameters');
        return Promise.reject(new Error('Missing parameters'));
    }

    console.log('[Telegram] Attempting to send message to chat:', chatId);

    // Primary method: Use CORS proxy
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const proxyUrl = corsProxy + apiUrl;

    const params = new URLSearchParams({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
    });

    console.log('[Telegram] URL:', apiUrl);
    console.log('[Telegram] Message length:', message.length);

    return fetch(proxyUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
        mode: 'cors'
    })
    .then(response => {
        console.log('[Telegram] Response status:', response.status);
        console.log('[Telegram] Response ok:', response.ok);

        if (!response.ok) {
            // Try without CORS proxy if it fails
            console.warn('[Telegram] CORS proxy failed, trying direct method...');
            return fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'HTML'
                })
            }).then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            });
        }

        return response.json();
    })
    .then(data => {
        console.log('[Telegram] Response data:', data);
        if (data.ok) {
            console.log('[Telegram] ✓ Message sent successfully');
            return data;
        } else {
            console.error('[Telegram] API error:', data.description);
            throw new Error(data.description || 'Unknown Telegram API error');
        }
    })
    .catch(error => {
        console.error('[Telegram] Error sending message:', error.message);
        console.error('[Telegram] Error stack:', error.stack);
        throw error;
    });
};

/**
 * Отправляет данные формы RSVP в Telegram бот
 * @param {Object} formData - Данные формы {name, visit, allergy, drinks, comments}
 * @param {string} botToken - Токен Telegram бота
 * @param {string} chatId - ID чата (780759394)
 * @returns {Promise} Промис с результатом отправки
 */
window.sendRSVPToTelegram = function(formData, botToken, chatId) {
    if (!botToken || !chatId) {
        console.warn('[RSVP] Missing bot token or chat ID');
        return Promise.reject(new Error('Missing bot configuration'));
    }

    const drinksList = formData.drinks && formData.drinks.length > 0
        ? formData.drinks.join(', ')
        : 'Не указано';

    const message = `
<b>📋 Новая RSVP заявка:</b>

<b>👤 Имя:</b> ${formData.name || 'Не указано'}

<b>✅ Присутствие:</b> ${formData.visit || 'Не указано'}

<b>⚠️ Аллергия:</b> ${formData.allergy || 'Нет'}

<b>🍷 Предпочтения напитков:</b>
${drinksList}

<b>💬 Комментарии:</b>
${formData.comments || 'Нет'}
    `.trim();

    return window.sendTelegramMessage(botToken, chatId, message);
};
