/**
 * Secure RSVP Form Handler
 *
 * Отправляет данные формы на защищённый backend вместо прямого использования токена
 * Токен остаётся на сервере и не видно в браузере
 *
 * API: POST /api/send-rsvp
 */

(function() {
    'use strict';

    // Конфигурация
    const CONFIG = {
        // Используйте относительный путь, чтобы работало на любом домене
        apiEndpoint: '/api/send-rsvp',
        timeout: 30000, // 30 секунд таймаут
        retryAttempts: 3,
        retryDelay: 1000 // 1 секунда между попытками
    };

    /**
     * Отправляет RSVP форму на backend
     *
     * @param {Object} formData - Данные формы
     * @param {string} formData.name - Имя
     * @param {string} formData.visit - Присутствие (Приду/Не приду/Может быть)
     * @param {string} [formData.allergy] - Информация об аллергии
     * @param {Array<string>} [formData.drinks] - Предпочитаемые напитки
     * @param {string} [formData.comments] - Комментарии
     * @returns {Promise<Object>} Результат отправки {success, message/error}
     */
    window.submitRSVPForm = async function(formData) {
        try {
            console.log('[RSVP] 📤 Отправляем форму на сервер...', formData);

            // Клиентская валидация
            const validationError = validateFormData(formData);
            if (validationError) {
                console.warn('[RSVP] ⚠️ Ошибка валидации:', validationError);
                return {
                    success: false,
                    error: validationError
                };
            }

            // Подготавливаем данные
            const payload = {
                name: formData.name?.trim() || '',
                visit: formData.visit?.trim() || '',
                allergy: formData.allergy?.trim() || '',
                drinks: Array.isArray(formData.drinks) ? formData.drinks : [],
                comments: formData.comments?.trim() || ''
            };

            // Отправляем на backend с retry механизмом
            const response = await fetchWithRetry(CONFIG.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }, CONFIG.retryAttempts);

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.error || 'Ошибка сервера';
                console.error('[RSVP] ❌ Ошибка:', errorMessage);
                throw new Error(errorMessage);
            }

            console.log('[RSVP] ✅ Форма успешно отправлена');

            return {
                success: true,
                message: data.message || 'Спасибо! Ваша заявка отправлена.'
            };

        } catch (error) {
            console.error('[RSVP] ❌ Ошибка отправки:', error.message);

            return {
                success: false,
                error: error.message || 'Ошибка отправки формы. Пожалуйста, попробуйте позже.'
            };
        }
    };

    /**
     * Fetch с автоматическим retry
     *
     * @private
     */
    async function fetchWithRetry(url, options, attempts = 3) {
        let lastError;

        for (let i = 0; i < attempts; i++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);

                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
                return response;

            } catch (error) {
                lastError = error;

                if (i < attempts - 1) {
                    // Вычисляем задержку: 1s, 2s, 4s
                    const delay = CONFIG.retryDelay * Math.pow(2, i);
                    console.warn(`[RSVP] ⚠️ Попытка ${i + 1} не удалась, переpопробуем через ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        throw lastError || new Error('Fetch failed after all retries');
    }

    /**
     * Клиентская валидация данных формы
     *
     * @private
     */
    function validateFormData(data) {
        if (!data) {
            return 'Данные формы пусты';
        }

        if (!data.name || data.name.trim().length === 0) {
            return 'Имя обязательно';
        }

        if (data.name.length > 100) {
            return 'Имя слишком длинное (макс 100 символов)';
        }

        if (!data.visit || !['Приду', 'Не приду', 'Может быть'].includes(data.visit)) {
            return 'Выберите, придёте ли вы на свадьбу';
        }

        if (data.allergy && data.allergy.length > 200) {
            return 'Информация об аллергии слишком длинная';
        }

        if (data.drinks && !Array.isArray(data.drinks)) {
            return 'Напитки должны быть массивом';
        }

        if (data.comments && data.comments.length > 500) {
            return 'Комментарии слишком длинные (макс 500 символов)';
        }

        return null; // Нет ошибок
    }

    /**
     * Обработчик отправки RSVP формы
     * Используйте эту функцию в атрибуте onsubmit формы
     */
    window.handleRSVPSubmit = async function(event) {
        event.preventDefault();

        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');

        // Отключаем кнопку для предотвращения двойной отправки
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
        }

        try {
            // Собираем данные формы
            const formData = {
                name: form.querySelector('[name="name"]')?.value || '',
                visit: form.querySelector('[name="visit"]')?.value || '',
                allergy: form.querySelector('[name="allergy"]')?.value || '',
                drinks: Array.from(form.querySelectorAll('[name="drinks"]:checked'))
                    .map(el => el.value),
                comments: form.querySelector('[name="comments"]')?.value || ''
            };

            // Отправляем форму
            const result = await window.submitRSVPForm(formData);

            // Показываем результат
            if (result.success) {
                showNotification('success', '✅ ' + result.message);
                form.reset();

                // Опционально: перенаправляем или закрываем форму
                // window.location.href = '/thank-you';
            } else {
                showNotification('error', '❌ ' + result.error);
            }

        } finally {
            // Включаем кнопку обратно
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
            }
        }
    };

    /**
     * Показывает уведомление пользователю
     *
     * @private
     */
    function showNotification(type, message) {
        // Способ 1: alert (простой)
        alert(message);

        // Способ 2: кастомное уведомление (если есть)
        const notificationId = `notification-${Date.now()}`;
        const html = `
            <div id="${notificationId}" class="notification notification-${type}">
                <div class="notification-content">${escapeHtml(message)}</div>
                <button class="notification-close" onclick="this.parentElement.remove()">×</button>
            </div>
        `;

        const container = document.querySelector('.notifications') || document.body;
        container.insertAdjacentHTML('afterbegin', html);

        // Автоматическое удаление через 5 секунд
        setTimeout(() => {
            const notification = document.getElementById(notificationId);
            if (notification) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * Безопасное экранирование HTML
     *
     * @private
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Экспортируем конфигурацию для отладки
     */
    window.RSVPFormConfig = CONFIG;

    // Логируем инициализацию
    console.log('[RSVP Form Handler] ✓ Инициализирован');
    console.log('[RSVP Form Handler] API Endpoint:', CONFIG.apiEndpoint);

})();

// ============================================================
// ИСПОЛЬЗОВАНИЕ
// ============================================================

/*
В HTML форме используйте следующее:

<form id="rsvp-form" onsubmit="window.handleRSVPSubmit(event)">
    <input
        type="text"
        name="name"
        placeholder="Ваше имя"
        required
    >

    <select name="visit" required>
        <option value="">Выберите...</option>
        <option value="Приду">Я буду</option>
        <option value="Не приду">Я не буду</option>
        <option value="Может быть">Может быть</option>
    </select>

    <input
        type="text"
        name="allergy"
        placeholder="Аллергия (если есть)"
    >

    <fieldset>
        <legend>Предпочитаемые напитки:</legend>
        <label>
            <input type="checkbox" name="drinks" value="Вода"> Вода
        </label>
        <label>
            <input type="checkbox" name="drinks" value="Сок"> Сок
        </label>
        <label>
            <input type="checkbox" name="drinks" value="Вино"> Вино
        </label>
        <label>
            <input type="checkbox" name="drinks" value="Пиво"> Пиво
        </label>
        <label>
            <input type="checkbox" name="drinks" value="Коктейль"> Коктейль
        </label>
    </fieldset>

    <textarea
        name="comments"
        placeholder="Дополнительные комментарии"
    ></textarea>

    <button type="submit">Отправить RSVP</button>
</form>

Стили для уведомлений (добавьте в CSS):

.notification {
    padding: 15px;
    margin: 10px;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    animation: slideIn 0.3s ease-in;
}

.notification-success {
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
    color: #155724;
}

.notification-error {
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
}

.notification-close {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    margin-left: 10px;
}

@keyframes slideIn {
    from {
        transform: translateY(-20px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}
*/
