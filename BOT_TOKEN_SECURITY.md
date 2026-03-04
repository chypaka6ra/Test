# 🔒 Руководство по защите Telegram Bot Token

## Проблема

В текущей конфигурации токен Telegram бота может быть передан через фронтенд код:
- В `assets/js/utilities.js` функции `sendTelegramMessage()` и `sendRSVPToTelegram()` ожидают токен как параметр
- Если токен будет передан из JavaScript кода на клиенте, он будет виден в исходном коде страницы
- Любой желающий сможет использовать этот токен для отправки сообщений от вашего имени

## Решение: Backend API прокси

Правильный способ - создать **backend endpoint**, который будет:
1. **Принимать данные формы** от клиента
2. **Хранить токен** на сервере в защищённом виде
3. **Отправлять сообщения** в Telegram от сервера
4. **Возвращать результат** на клиент

### Архитектура

```
┌─────────────────┐
│   Frontend      │  (HTML/JS в браузере)
│   (Client)      │
└────────┬────────┘
         │ POST /api/send-rsvp
         │ {name, visit, allergy, drinks}
         ↓
┌─────────────────┐
│   Backend       │  (Node.js, Python и т.д.)
│   (Server)      │
│                 │  Хранит:
│                 │  - TOKEN (в переменной окружения)
│                 │  - CHAT_ID (в переменной окружения)
└────────┬────────┘
         │ Отправляет сообщение с токеном
         ↓
┌─────────────────┐
│  Telegram API   │  (HTTPS)
└─────────────────┘
```

## Реализация

### Шаг 1: Хранение конфигурации на сервере

Создайте файл `.env` (НЕ коммитьте в Git):

```env
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_CHAT_ID=780759394
NODE_ENV=production
```

Добавьте в `.gitignore`:

```
.env
.env.local
*.local
```

### Шаг 2: Backend endpoint (Node.js + Express)

Файл: `server.js` или `api/send-rsvp.js`

```javascript
const express = require('express');
const axios = require('axios');
require('dotenv').config(); // Загружаем .env

const app = express();
app.use(express.json());

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Проверка конфигурации
if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('❌ ОШИБКА: Токен или ID чата не настроены!');
    process.exit(1);
}

/**
 * POST /api/send-rsvp
 * Получает данные RSVP и отправляет в Telegram
 */
app.post('/api/send-rsvp', async (req, res) => {
    try {
        const { name, visit, allergy, drinks, comments } = req.body;

        // Валидация
        if (!name || !visit) {
            return res.status(400).json({
                success: false,
                error: 'Требуются поля: name, visit'
            });
        }

        // Формируем сообщение
        const drinksList = (drinks && drinks.length > 0)
            ? drinks.join(', ')
            : 'Не указано';

        const message = `
<b>📋 Новая RSVP заявка:</b>

<b>👤 Имя:</b> ${escapeHtml(name)}

<b>✅ Присутствие:</b> ${escapeHtml(visit)}

<b>⚠️ Аллергия:</b> ${escapeHtml(allergy || 'Нет')}

<b>🍷 Предпочтения напитков:</b>
${escapeHtml(drinksList)}

<b>📝 Комментарии:</b> ${escapeHtml(comments || 'Нет')}
        `.trim();

        // Отправляем в Telegram
        const apiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

        const response = await axios.post(apiUrl, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        });

        // Логируем успех (в production используйте нормальный логгер)
        console.log('[✓] RSVP отправлена:', name);

        // Возвращаем успех клиенту
        return res.json({
            success: true,
            message: 'Спасибо! Ваша заявка отправлена.'
        });

    } catch (error) {
        // Логируем ошибку
        console.error('[✗] Ошибка отправки RSVP:', error.message);

        // Возвращаем ошибку (БЕЗ деталей о токене!)
        return res.status(500).json({
            success: false,
            error: 'Ошибка отправки формы. Пожалуйста, попробуйте позже.'
        });
    }
});

/**
 * Безопасное экранирование HTML
 */
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✓ Сервер запущен на http://localhost:${PORT}`);
    console.log('✓ Telegram Bot Token загружен из переменных окружения');
});
```

### Шаг 3: Обновление Frontend кода

Файл: `assets/js/form-handler.js`

```javascript
/**
 * Отправляет RSVP через защищённый backend
 */
window.submitRSVPForm = async function(formData) {
    try {
        console.log('[RSVP] Отправляем форму на сервер...');

        // Отправляем на backend (БЕЗ токена!)
        const response = await fetch('/api/send-rsvp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Опционально: добавьте CSRF токен для дополнительной защиты
                // 'X-CSRF-Token': getCsrfToken()
            },
            body: JSON.stringify({
                name: formData.name,
                visit: formData.visit,
                allergy: formData.allergy,
                drinks: formData.drinks,
                comments: formData.comments
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Ошибка сервера');
        }

        console.log('[✓] RSVP успешно отправлена');
        return {
            success: true,
            message: data.message
        };

    } catch (error) {
        console.error('[✗] Ошибка отправки RSVP:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Старые функции (оставляем для совместимости, но они не используют токен)
 */
window.sendRSVPToTelegram = function(formData) {
    // Перенаправляем на новую функцию
    return window.submitRSVPForm(formData);
};
```

### Шаг 4: Обновление обработчика формы в HTML

```html
<!-- В форме RSVP -->
<form id="rsvp-form" onsubmit="handleRSVPSubmit(event)">
    <input type="text" name="name" placeholder="Ваше имя" required>
    <select name="visit" required>
        <option value="">Выберите...</option>
        <option value="Приду">Я буду</option>
        <option value="Не приду">Я не буду</option>
    </select>
    <!-- Другие поля формы -->
    <button type="submit">Отправить</button>
</form>

<script>
async function handleRSVPSubmit(event) {
    event.preventDefault();

    // Собираем данные формы
    const form = event.target;
    const formData = {
        name: form.querySelector('[name="name"]').value,
        visit: form.querySelector('[name="visit"]').value,
        allergy: form.querySelector('[name="allergy"]')?.value || '',
        drinks: Array.from(form.querySelectorAll('[name="drinks"]:checked'))
            .map(el => el.value),
        comments: form.querySelector('[name="comments"]')?.value || ''
    };

    // Отправляем через API
    const result = await window.submitRSVPForm(formData);

    if (result.success) {
        alert('✅ ' + result.message);
        form.reset();
    } else {
        alert('❌ ' + result.error);
    }
}
</script>
```

## Альтернатива: Используйте Netlify Functions или AWS Lambda

Если вы хостите на Netlify/Vercel, создайте function вместо собственного сервера:

```javascript
// netlify/functions/send-rsvp.js

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { name, visit, allergy, drinks, comments } = JSON.parse(event.body);

        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

        // ... остальной код отправки в Telegram

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server error' })
        };
    }
};
```

Затем в Netlify Dashboard → Site settings → Build & deploy → Environment → добавьте:
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

## Безопасность: Checklist

✅ **Токен хранится на сервере** - в переменной окружения `.env`
✅ **Токен НЕ видно в исходном коде** - клиент не видит токен
✅ **Токен НЕ отправляется по сети** от клиента - только данные формы
✅ **Backend валидирует данные** - защита от инъекций
✅ **HTTPS используется** - шифрование при передаче
✅ **Rate limiting** - добавьте защиту от spam
✅ **Логирование** - отслеживайте подозрительную активность

## Дополнительная защита

### 1. Rate limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 5 // максимум 5 запросов в окне
});

app.post('/api/send-rsvp', limiter, async (req, res) => {
    // ...
});
```

### 2. CSRF Protection

```javascript
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(csrf({ cookie: true }));

app.get('/api/csrf-token', (req, res) => {
    res.json({ token: req.csrfToken() });
});
```

### 3. Логирование попыток

```javascript
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// В обработчике формы
logger.info(`RSVP submitted: ${name} from IP ${req.ip}`);
```

## Миграция текущего кода

1. **Сохраните текущий код** - создайте бэкап
2. **Установите зависимости**: `npm install express axios dotenv`
3. **Создайте `.env`** с токеном и ID чата
4. **Разверните backend** на сервере
5. **Обновите фронтенд** на новый API
6. **Тестируйте** перед продакшеном

## Заключение

Безопасное хранение токена - это **обязательный стандарт**, а не опция. Никогда не коммитьте токены в Git и не передавайте их в браузер!
