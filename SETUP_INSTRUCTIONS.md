# 🎯 Инструкции по Внедрению Защиты Токена

## Проблема ✗

В текущей конфигурации:
- Telegram bot токен передаётся через браузер
- Любой может увидеть токен в исходном коде
- Любой может использовать токен для отправки сообщений

## Решение ✓

Создан защищённый backend, который:
- Хранит токен на сервере в переменных окружения
- Принимает запросы от клиента БЕЗ передачи токена
- Отправляет сообщения в Telegram от сервера
- Валидирует и логирует все запросы

---

## Файлы Решения

### 📄 Документация

| Файл | Описание |
|------|---------|
| **BOT_TOKEN_SECURITY.md** | Полное руководство по проблеме и решению |
| **DEPLOYMENT.md** | Инструкции по развертыванию на разных платформах |
| **SETUP_INSTRUCTIONS.md** | Этот файл - пошаговая инструкция |

### 🔧 Backend код

| Файл | Описание |
|------|---------|
| **server.js** | Express сервер с API endpoint |
| **.env.example** | Пример конфигурации (скопируйте в .env) |
| **package.json** | Зависимости Node.js |

### 💻 Frontend код

| Файл | Описание |
|------|---------|
| **assets/js/form-handler.js** | Обработчик формы с отправкой на API |
| **assets/js/utilities.js** | Старый код (оставлен для совместимости) |

---

## Пошаговая Инструкция

### Фаза 1: Локальное тестирование (15 минут)

#### 1.1 Установка Node.js

Если ещё не установлен:

```bash
# macOS
brew install node

# Ubuntu/Debian
sudo apt-get update && sudo apt-get install -y nodejs npm

# Windows
# Загрузите с nodejs.org
```

Проверка:

```bash
node --version
npm --version
```

#### 1.2 Установка зависимостей

```bash
npm install
```

#### 1.3 Создание .env файла

```bash
cp .env.example .env
```

Отредактируйте `.env`:

```env
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_CHAT_ID=780759394
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:8000
```

**Как получить токен и ID:**

1. **Токен:**
   - Откройте Telegram → найдите `@BotFather`
   - `/newbot` → следуйте инструкциям → скопируйте токен

2. **Chat ID:**
   - Найдите `@userinfobot` → отправьте сообщение
   - Используйте ID из ответа

#### 1.4 Запуск сервера

```bash
npm start
```

Ожидаемый вывод:

```
╔════════════════════════════════════════════════╗
║         Wedding RSVP Server Started            ║
╚════════════════════════════════════════════════╝

✅ Server running: http://localhost:3000
✅ Environment: development
✅ Telegram Bot: Configured
```

#### 1.5 Тестирование API

**Terminal 1:** Сервер запущен (видите лог выше)

**Terminal 2:** Тестируем API

```bash
curl -X POST http://localhost:3000/api/send-rsvp \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Тестовое Имя",
    "visit": "Приду",
    "allergy": "Нет",
    "drinks": ["Вода"],
    "comments": "Тест"
  }'
```

**Ожидаемый ответ:**

```json
{
  "success": true,
  "message": "Спасибо! Ваша заявка отправлена. Мы увидимся на свадьбе! 🎉",
  "messageId": 12345
}
```

**В Telegram должно придти сообщение:**

```
📋 Новая RSVP заявка:

👤 Имя: Тестовое Имя
✅ Присутствие: Приду
⚠️ Аллергия: Нет
🍷 Предпочтения напитков: Вода
📝 Комментарии: Тест
⏰ Время: 04.03.2024, 15:30:45
```

✅ **Фаза 1 завершена! Backend работает правильно!**

---

### Фаза 2: Обновление Frontend (10 минут)

#### 2.1 Добавление скрипта на страницу

В `index.html` найдите раздел `<head>` и добавьте:

```html
<script src="assets/js/form-handler.js" charset="utf-8"></script>
```

Например, после других скриптов:

```html
<script charset="utf-8" src="assets/js/utilities.js"></script>
<script charset="utf-8" src="assets/js/form-handler.js"></script><!-- ДОБАВЬТЕ ЭТУ СТРОКУ -->
```

#### 2.2 Обновление формы RSVP

В форме на странице найдите атрибут `onsubmit` и замените его:

**Было:**
```html
<form onsubmit="window.sendRSVPToTelegram(...)">
```

**Стало:**
```html
<form id="rsvp-form" onsubmit="window.handleRSVPSubmit(event)">
```

#### 2.3 Убедитесь в наличии полей

Форма должна содержать поля с правильными именами:

```html
<input name="name" type="text" required>
<select name="visit" required>
    <option value="Приду">Я буду</option>
    <option value="Не приду">Я не буду</option>
    <option value="Может быть">Может быть</option>
</select>
<input name="allergy" type="text">
<input name="drinks" type="checkbox" value="Вода">
<input name="drinks" type="checkbox" value="Вино">
<!-- и т.д. -->
<textarea name="comments"></textarea>
<button type="submit">Отправить</button>
```

#### 2.4 Тестирование на локальном сервере

Запустите локальный веб-сервер для фронтенда:

```bash
# Если у вас Python
python -m http.server 8000

# Или используйте Live Server в VS Code
# Или любой другой веб-сервер
```

Откройте в браузере: `http://localhost:8000`

Заполните форму RSVP и нажмите "Отправить"

Проверьте:
- ✅ Форма не выдаёт ошибок в консоли (F12 → Console)
- ✅ Сообщение пришло в Telegram
- ✅ Форма очищена после отправки

✅ **Фаза 2 завершена! Frontend работает!**

---

### Фаза 3: Развертывание на Production (30 минут)

Выберите один из вариантов:

#### Вариант A: Heroku (рекомендуется для начинающих)

```bash
# 1. Установка Heroku CLI
npm install -g heroku

# 2. Вход
heroku login

# 3. Создание приложения
heroku create my-wedding-rsvp

# 4. Установка переменных
heroku config:set TELEGRAM_BOT_TOKEN=123456:ABC...
heroku config:set TELEGRAM_CHAT_ID=780759394

# 5. Deploy
git push heroku main

# 6. Проверка логов
heroku logs --tail
```

Ваш сервер: `https://my-wedding-rsvp.herokuapp.com`

#### Вариант B: Railway (современный и удобный)

1. Откройте https://railway.app
2. Нажмите "New Project"
3. Выберите "GitHub Repo"
4. Разрешите доступ к репозиторию
5. Railway автоматически задеплоит
6. Добавьте переменные в Variables → Environment
7. Готово! Railway выдаст вам URL

#### Вариант C: Собственный VPS (Digital Ocean и т.д.)

Смотрите подробно в `DEPLOYMENT.md` → раздел "VPS"

#### 3.1 Обновление FRONTEND_URL

После развертывания обновите переменную FRONTEND_URL на сервере:

```bash
# Если Heroku
heroku config:set FRONTEND_URL=https://lumivite.online/weddingmaket5

# Если Railway
# В Dashboard → Variables
```

#### 3.2 Обновление адреса API в фронтенде

Если API находится на другом домене, обновите в `assets/js/form-handler.js`:

```javascript
const CONFIG = {
    // Если на том же домене
    apiEndpoint: '/api/send-rsvp',

    // Если на другом домене
    apiEndpoint: 'https://my-wedding-rsvp.herokuapp.com/api/send-rsvp'
};
```

#### 3.3 Финальное тестирование

1. Откройте свадебный сайт в браузере
2. Заполните RSVP форму
3. Нажмите "Отправить"
4. Проверьте, пришло ли сообщение в Telegram

✅ **Фаза 3 завершена! Всё работает в продакшене!**

---

## Перечень Проверок

### ✅ Безопасность

- [ ] `.env` добавлен в `.gitignore`
- [ ] Токен НЕ коммитется в GitHub
- [ ] Используется HTTPS (если на продакшене)
- [ ] CORS настроен правильно
- [ ] Backend валидирует все входные данные

### ✅ Функциональность

- [ ] API endpoint работает локально
- [ ] Форма отправляет данные на сервер
- [ ] Сообщение пришло в Telegram
- [ ] Форма очищается после отправки
- [ ] Ошибки обрабатываются красиво

### ✅ Развертывание

- [ ] Сервер задеплоен на production
- [ ] Переменные окружения установлены
- [ ] FRONTEND_URL правильно настроен
- [ ] API доступен с фронтенда
- [ ] Нет CORS ошибок в консоли браузера

---

## Troubleshooting

### Проблема: "Cannot find module 'express'"

**Решение:**
```bash
npm install
```

### Проблема: "TELEGRAM_BOT_TOKEN не установлен"

**Решение:** Убедитесь что `.env` файл существует и содержит:
```env
TELEGRAM_BOT_TOKEN=123456:ABC...
```

Не используйте кавычки!

### Проблема: "401 Unauthorized от Telegram"

**Решение:** Токен неправильный. Получите новый у @BotFather

### Проблема: "CORS error: The value of the 'Access-Control-Allow-Origin' header"

**Решение:** Обновите `FRONTEND_URL` на сервере на правильный домен:

```bash
# Heroku
heroku config:set FRONTEND_URL=https://yourdomain.com
```

### Проблема: Форма не отправляется, нет ошибок

**Решение:**
1. Откройте DevTools (F12)
2. Вкладка "Network"
3. Заполните форму и отправьте
4. Найдите запрос к `/api/send-rsvp`
5. Посмотрите статус и ответ

---

## Поддержка и Помощь

### Если что-то не работает:

1. **Проверьте логи сервера:**
   ```bash
   npm start
   ```

2. **Проверьте консоль браузера:**
   - F12 → Console
   - Ищите красные ошибки

3. **Проверьте Network tab:**
   - F12 → Network
   - Смотрите запрос к API и ответ

4. **Проверьте переменные окружения:**
   ```bash
   cat .env | grep TELEGRAM
   ```

5. **Прочитайте документацию:**
   - `BOT_TOKEN_SECURITY.md` - подробно о проблеме
   - `DEPLOYMENT.md` - развертывание
   - `server.js` - комментарии в коде

---

## Следующие Шаги

После успешного развертывания:

1. **Мониторинг** - настройте UptimeRobot для мониторинга `/health`
2. **Логирование** - добавьте сохранение логов в файл или сервис
3. **Бэкап** - настройте регулярные бэкапы (если используется БД)
4. **Масштабирование** - если будет много запросов, добавьте rate limiting
5. **Улучшения** - добавьте SMS, Email, или другие каналы уведомления

---

## Успешно! 🎉

Ваш сайт теперь защищён! Токен бота в полной безопасности на сервере.

**Потреходит:**
- Клиент отправляет данные форма → Backend
- Backend отправляет в Telegram с токеном → Telegram
- Никто не видит токен в браузере ✅

**Спасибо что используете этот гайд!**

Если были вопросы - смотрите файлы с документацией или создавайте issue.

Поздравляем с предстоящей свадьбой! 💍🎊
