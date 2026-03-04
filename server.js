/**
 * Wedding RSVP Server
 *
 * Защищённый backend для обработки RSVP формы
 * Токен Telegram бота хранится в переменных окружения
 *
 * Установка:
 * 1. npm install express axios dotenv
 * 2. Создайте .env файл с TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID
 * 3. node server.js
 *
 * API:
 * POST /api/send-rsvp - отправить RSVP
 */

const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ============================================================
// КОНФИГУРАЦИЯ
// ============================================================

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8000';

// Проверка конфигурации при запуске
if (!TELEGRAM_BOT_TOKEN) {
    console.error('❌ ОШИБКА: TELEGRAM_BOT_TOKEN не установлен в .env');
    process.exit(1);
}

if (!TELEGRAM_CHAT_ID) {
    console.error('❌ ОШИБКА: TELEGRAM_CHAT_ID не установлен в .env');
    process.exit(1);
}

// ============================================================
// MIDDLEWARE
// ============================================================

// CORS конфигурация
const corsOptions = {
    origin: function (origin, callback) {
        // В продакшене только разрешённые домены
        const allowedOrigins = [
            'http://localhost:8000',
            'http://localhost:3000',
            FRONTEND_URL,
            'https://lumivite.online', // Ваш домен
        ];

        if (NODE_ENV === 'development' || !origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS не разрешён'));
        }
    },
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// Логирование запросов
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Безопасное экранирование HTML
 */
function escapeHtml(text) {
    if (!text) return '';
    const htmlEscapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, char => htmlEscapeMap[char]);
}

/**
 * Валидация данных формы
 */
function validateFormData(data) {
    const errors = [];

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
        errors.push('Имя обязательно');
    } else if (data.name.length > 100) {
        errors.push('Имя слишком длинное (макс 100 символов)');
    }

    if (!data.visit || !['Приду', 'Не приду', 'Может быть'].includes(data.visit)) {
        errors.push('Выберите, придёте ли вы на свадьбу');
    }

    if (data.allergy && data.allergy.length > 200) {
        errors.push('Информация об аллергии слишком длинная');
    }

    if (data.drinks && !Array.isArray(data.drinks)) {
        errors.push('Напитки должны быть массивом');
    } else if (data.drinks && data.drinks.length > 10) {
        errors.push('Выбрано слишком много напитков');
    }

    if (data.comments && data.comments.length > 500) {
        errors.push('Комментарии слишком длинные (макс 500 символов)');
    }

    return errors;
}

/**
 * Форматирование RSVP сообщения для Telegram
 */
function formatRSVPMessage(data) {
    const drinksList = (data.drinks && data.drinks.length > 0)
        ? data.drinks.join(', ')
        : 'Не указано';

    const message = `
<b>📋 Новая RSVP заявка:</b>

<b>👤 Имя:</b> ${escapeHtml(data.name)}

<b>✅ Присутствие:</b> ${escapeHtml(data.visit)}

<b>⚠️ Аллергия:</b> ${escapeHtml(data.allergy || 'Нет')}

<b>🍷 Предпочтения напитков:</b>
${escapeHtml(drinksList)}

<b>📝 Комментарии:</b> ${escapeHtml(data.comments || 'Нет')}

<b>⏰ Время:</b> ${new Date().toLocaleString('ru-RU')}`.trim();

    return message;
}

/**
 * Отправка сообщения в Telegram
 */
async function sendTelegramMessage(message) {
    const apiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const response = await axios.post(apiUrl, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
    }, {
        timeout: 10000 // 10 секунд таймаут
    });

    return response.data;
}

// ============================================================
// ROUTES
// ============================================================

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV
    });
});

/**
 * Получить CSRF токен (если используется CSRF защита)
 */
app.get('/api/csrf-token', (req, res) => {
    res.json({
        token: req.headers['x-csrf-token'] || 'not-required'
    });
});

/**
 * POST /api/send-rsvp
 * Отправить RSVP заявку
 *
 * Body:
 * {
 *   "name": "Иван Петров",
 *   "visit": "Приду",
 *   "allergy": "Нет",
 *   "drinks": ["Вода", "Вино"],
 *   "comments": "Спасибо за приглашение!"
 * }
 */
app.post('/api/send-rsvp', async (req, res) => {
    const requestId = Math.random().toString(36).substring(7);

    try {
        console.log(`[${requestId}] RSVP запрос получен`);

        const { name, visit, allergy, drinks, comments } = req.body;

        // Валидация
        const validationErrors = validateFormData({
            name,
            visit,
            allergy,
            drinks,
            comments
        });

        if (validationErrors.length > 0) {
            console.log(`[${requestId}] Ошибка валидации:`, validationErrors);
            return res.status(400).json({
                success: false,
                error: 'Ошибка в заполнении формы',
                details: validationErrors
            });
        }

        // Форматируем сообщение
        const message = formatRSVPMessage({
            name,
            visit,
            allergy,
            drinks,
            comments
        });

        // Отправляем в Telegram
        console.log(`[${requestId}] Отправляем в Telegram для ${name}...`);
        const telegramResponse = await sendTelegramMessage(message);

        if (!telegramResponse.ok) {
            throw new Error(`Telegram API error: ${telegramResponse.description}`);
        }

        console.log(`[${requestId}] ✅ RSVP успешно отправлена для ${name}`);

        // Успешный ответ
        return res.json({
            success: true,
            message: 'Спасибо! Ваша заявка отправлена. Мы увидимся на свадьбе! 🎉',
            messageId: telegramResponse.result.message_id
        });

    } catch (error) {
        console.error(`[${requestId}] ❌ Ошибка:`, error.message);

        // Логируем детали ошибки (но не отправляем в response)
        if (error.response) {
            console.error(`[${requestId}] Response status:`, error.response.status);
            console.error(`[${requestId}] Response data:`, error.response.data);
        }

        // Скрываем детали ошибки от клиента (безопасность)
        return res.status(500).json({
            success: false,
            error: 'Ошибка отправки формы. Пожалуйста, попробуйте позже или свяжитесь с организаторами.',
            requestId: requestId // Для отладки на клиенте
        });
    }
});

/**
 * POST /api/send-telegram-message
 * Отправить произвольное сообщение (с ограничениями)
 */
app.post('/api/send-telegram-message', async (req, res) => {
    try {
        const { message, messageType = 'info' } = req.body;

        if (!message || typeof message !== 'string' || message.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Сообщение обязательно'
            });
        }

        if (message.length > 4096) {
            return res.status(400).json({
                success: false,
                error: 'Сообщение слишком длинное (макс 4096 символов)'
            });
        }

        const prefix = {
            info: 'ℹ️',
            warning: '⚠️',
            error: '❌',
            success: '✅'
        }[messageType] || '';

        const formattedMessage = `${prefix} ${escapeHtml(message)}`;

        const response = await sendTelegramMessage(formattedMessage);

        return res.json({
            success: true,
            message: 'Сообщение отправлено'
        });

    } catch (error) {
        console.error('Ошибка отправки сообщения:', error.message);

        return res.status(500).json({
            success: false,
            error: 'Ошибка отправки сообщения'
        });
    }
});

// ============================================================
// ERROR HANDLING
// ============================================================

/**
 * 404 Not Found
 */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint не найден',
        path: req.path
    });
});

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
    console.error('Global error:', err);

    const status = err.status || 500;
    const message = NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message;

    res.status(status).json({
        success: false,
        error: message,
        ...(NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ============================================================
// SERVER START
// ============================================================

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════╗
║         Wedding RSVP Server Started            ║
╚════════════════════════════════════════════════╝

✅ Server running: http://localhost:${PORT}
✅ Environment: ${NODE_ENV}
✅ Telegram Bot: Configured
✅ CORS: Enabled

📝 Endpoints:
  GET  /health                 - Health check
  POST /api/send-rsvp          - Send RSVP
  POST /api/send-telegram-message - Send custom message

⚠️  ВАЖНО:
  - Никогда не логируйте токен в production
  - Используйте .env для конфиденциальных данных
  - Убедитесь что .env добавлен в .gitignore
  - Используйте HTTPS в production

═════════════════════════════════════════════════
    `);

    if (!process.env.TELEGRAM_BOT_TOKEN) {
        console.warn('⚠️  Внимание: TELEGRAM_BOT_TOKEN не установлен!');
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    process.exit(0);
});
