# ⚡ Быстрый Старт (5 минут)

## Что было сделано?

✅ Создан защищённый backend для обработки RSVP
✅ Токен бота теперь на сервере, не в браузере
✅ Написана полная документация
✅ Готово к развертыванию

---

## 1️⃣ Локальное Тестирование (3 минуты)

```bash
# Установка зависимостей
npm install

# Копирование конфигурации
cp .env.example .env

# Редактируем .env и добавляем свои значения:
# TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
# TELEGRAM_CHAT_ID=780759394

# Запуск сервера
npm start
```

Откройте в другом терминале и тестируйте:

```bash
curl -X POST http://localhost:3000/api/send-rsvp \
  -H "Content-Type: application/json" \
  -d '{"name":"Тест","visit":"Приду","allergy":"Нет","drinks":[],"comments":""}'
```

**Должна быть ошибка 401 или сообщение в Telegram!** ✅

---

## 2️⃣ Добавить на сайт (2 минуты)

В `index.html` добавьте эту строку:

```html
<!-- После других скриптов добавьте: -->
<script src="assets/js/form-handler.js" charset="utf-8"></script>
```

В форме RSVP измените `onsubmit`:

```html
<!-- Было: -->
<!-- <form onsubmit="..."> -->

<!-- Стало: -->
<form id="rsvp-form" onsubmit="window.handleRSVPSubmit(event)">
```

Готово! ✅

---

## 📚 Полная Документация

| Файл | Для Кого | Содержит |
|------|----------|---------|
| **SETUP_INSTRUCTIONS.md** | Все | Пошаговая инструкция (рекомендуется читать) |
| **BOT_TOKEN_SECURITY.md** | Разработчикам | Подробное объяснение проблемы и решения |
| **DEPLOYMENT.md** | DevOps | Развертывание на Heroku, Railway, VPS |
| **QUICK_START.md** | Нетерпеливым | Этот файл 😄 |

---

## 🚀 Развертывание (выбери один вариант)

### Вариант 1: Heroku (самый простой)

```bash
npm install -g heroku
heroku login
heroku create my-wedding-rsvp
heroku config:set TELEGRAM_BOT_TOKEN=123456:ABC...
heroku config:set TELEGRAM_CHAT_ID=780759394
git push heroku main
```

URL: `https://my-wedding-rsvp.herokuapp.com`

### Вариант 2: Railway (современный)

1. Откройте https://railway.app
2. Нажмите "New Project"
3. Выберите "GitHub Repo"
4. Railway сам всё задеплоит

### Вариант 3: Свой VPS

Смотрите подробно в `DEPLOYMENT.md`

---

## ✨ Архитектура Решения

```
БРАУЗЕР (Frontend)              СЕРВЕР (Backend)           TELEGRAM
┌─────────────────┐             ┌──────────────┐          ┌─────────┐
│ RSVP Форма      │             │ server.js    │          │ Telegram│
│ {name, visit}   │ ──POST──→ │ /api/send-rsvp │ ──→ │ API     │
└─────────────────┘             │ Токен в .env │          └─────────┘
                                 └──────────────┘
```

**Важно:** Токен НИКОГДА не передаётся в браузер! ✅

---

## 🔒 Безопасность

### ✅ Что защищено

- Токен хранится в `.env` на сервере
- `.env` добавлен в `.gitignore` (не коммитится)
- Браузер отправляет только данные формы
- Сервер валидирует все входные данные
- Поддерживается HTTPS в production

### ⚠️ Не забудьте

```bash
# Убедитесь что .env НЕ в Git
git status
# Должно быть "modified:   .gitignore" но НЕ .env файла

# Сделайте .env файл
cp .env.example .env
nano .env  # Заполните реальные значения
```

---

## 🐛 Если что-то не работает

### Сервер не запускается?

```bash
npm install
node server.js  # Запустите напрямую для ошибок
```

### Форма не отправляется?

```javascript
// Откройте DevTools (F12) → Console
// Должны быть логи:
// [RSVP] 📤 Отправляем форму на сервер...
// [RSVP] ✅ Форма успешно отправлена
```

### Сообщение не приходит в Telegram?

```bash
# Проверьте токен и ID чата в .env
cat .env | grep TELEGRAM

# Проверьте логи сервера
# Должно быть: [✓] RSVP отправлена: Имя
```

---

## 📞 Где Получить Токен и ID?

### Telegram Bot Token

1. Откройте Telegram → поиск `@BotFather`
2. Отправьте `/newbot`
3. Ответьте на вопросы
4. Скопируйте токен вида: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`

### Chat ID

1. Откройте Telegram → поиск `@userinfobot`
2. Отправьте любое сообщение
3. Скопируйте ID из ответа

---

## ✅ Checklist

Перед запуском на production:

- [ ] Локально тестировал и работает
- [ ] Скопировал `.env.example` в `.env`
- [ ] Заполнил TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в `.env`
- [ ] `.env` добавлен в `.gitignore`
- [ ] `npm install` выполнен
- [ ] Фронтенд подключен (`form-handler.js` в HTML)
- [ ] Выбрал способ развертывания (Heroku/Railway/VPS)
- [ ] Задеплоил на production
- [ ] Обновил FRONTEND_URL на сервере
- [ ] Тестировал на production
- [ ] Форма работает и сообщения приходят

---

## 🎉 Готово!

Ваш сайт теперь защищён! Токен бота хранится безопасно на сервере.

**Принцип работы:**
```
Клиент → Отправляет данные → Backend → Telegram (с токеном) ✅
Токен видно только на сервере, не в браузере! 🔒
```

Вопросы? Читайте:
1. `SETUP_INSTRUCTIONS.md` - полная пошаговая инструкция
2. `BOT_TOKEN_SECURITY.md` - подробное объяснение
3. `DEPLOYMENT.md` - развертывание

**Спасибо что используете это решение! Поздравляем с предстоящей свадьбой! 💍🎊**
