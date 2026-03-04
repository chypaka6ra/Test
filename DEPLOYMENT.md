# 🚀 Развертывание RSVP сервера

## Быстрый старт (локально)

### 1. Установка зависимостей

```bash
npm install
```

### 2. Создание конфигурации

Скопируйте `.env.example` в `.env` и заполните значения:

```bash
cp .env.example .env
```

Отредактируйте `.env`:

```env
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_CHAT_ID=780759394
NODE_ENV=production
PORT=3000
FRONTEND_URL=http://localhost:8000
```

**Как получить токен?**
1. Откройте Telegram и найдите `@BotFather`
2. Отправьте команду `/newbot`
3. Следуйте инструкциям
4. Скопируйте полученный токен

**Как найти Chat ID?**
1. Отправьте сообщение `@userinfobot`
2. Используйте ID из ответа

### 3. Запуск сервера

```bash
# Продакшен
npm start

# Разработка (с автоперезагрузкой)
npm run dev
```

Сервер запустится на `http://localhost:3000`

---

## Развертывание на Heroku

### Шаг 1: Установка Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Linux/Windows
# Загрузите с https://devcenter.heroku.com/articles/heroku-cli
```

### Шаг 2: Создание Heroku приложения

```bash
heroku login
heroku create your-wedding-rsvp
```

### Шаг 3: Установка переменных окружения

```bash
heroku config:set TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
heroku config:set TELEGRAM_CHAT_ID=780759394
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://yourdomain.com
```

### Шаг 4: Deployment

```bash
git push heroku main
```

URL вашего сервера: `https://your-wedding-rsvp.herokuapp.com`

---

## Развертывание на Railway

### Шаг 1: Подключение

1. Откройте https://railway.app
2. Нажмите "New Project"
3. Выберите "GitHub Repo" или загрузите этот репозиторий

### Шаг 2: Переменные окружения

В Railway dashboard → Variables добавьте:

```
TELEGRAM_BOT_TOKEN = 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_CHAT_ID = 780759394
NODE_ENV = production
FRONTEND_URL = https://yourdomain.com
PORT = 8080
```

### Шаг 3: Deployment

Railway автоматически задеплоит при коммите

---

## Развертывание на Vercel

### Шаг 1: Создание API функции

Создайте файл `api/send-rsvp.js`:

```javascript
import axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, visit, allergy, drinks, comments } = req.body;

        // Валидация...
        if (!name || !visit) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Форматируем сообщение...
        const message = `...`;

        // Отправляем в Telegram
        const response = await axios.post(
            `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
                chat_id: process.env.TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            }
        );

        res.json({ success: true, message: 'RSVP received' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send RSVP' });
    }
}
```

### Шаг 2: vercel.json конфигурация

```json
{
  "env": {
    "TELEGRAM_BOT_TOKEN": "@telegram_bot_token",
    "TELEGRAM_CHAT_ID": "@telegram_chat_id",
    "FRONTEND_URL": "@frontend_url"
  }
}
```

### Шаг 3: Deployment

```bash
npm i -g vercel
vercel
```

---

## Развертывание на VPS (Digital Ocean, Linode и т.д.)

### Шаг 1: Подключение по SSH

```bash
ssh root@your-vps-ip
```

### Шаг 2: Установка Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Шаг 3: Клонирование проекта

```bash
cd /var/www
git clone https://github.com/your-repo/wedding-rsvp.git
cd wedding-rsvp
npm install
```

### Шаг 4: Создание .env файла

```bash
nano .env
```

Вставьте конфигурацию и сохраните (Ctrl+X, Y, Enter)

### Шаг 5: PM2 для управления процессом

```bash
sudo npm install -g pm2
pm2 start server.js --name "wedding-rsvp"
pm2 startup
pm2 save
```

### Шаг 6: Nginx как reverse proxy

```bash
sudo apt-get install -y nginx
sudo nano /etc/nginx/sites-available/default
```

Вставьте:

```nginx
upstream wedding_rsvp {
    server localhost:3000;
}

server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://wedding_rsvp;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo systemctl restart nginx
```

### Шаг 7: SSL сертификат (Let's Encrypt)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## Мониторинг и логирование

### PM2 мониторинг

```bash
pm2 monit
pm2 logs wedding-rsvp
pm2 save
```

### Просмотр логов

```bash
# Последние логи
pm2 logs wedding-rsvp --lines 100

# Live логи
pm2 logs wedding-rsvp --follow
```

### Ротация логов

```bash
pm2 install pm2-logrotate
```

---

## Бэкап и восстановление

### Бэкап базы данных (если используется)

```bash
# Ежедневно в 2:00 AM
0 2 * * * mongodump --out /var/backups/mongo-$(date +\%Y\%m\%d)
```

### Бэкап конфигурации

```bash
cp .env .env.backup
```

---

## Обновление кода

### С GitHub

```bash
cd /var/www/wedding-rsvp
git pull origin main
npm install
pm2 restart wedding-rsvp
```

### Автоматическое обновление с вебхуком

1. На GitHub → Settings → Webhooks
2. Добавьте вебхук на ваш сервер
3. Создайте скрипт для обновления

```bash
#!/bin/bash
cd /var/www/wedding-rsvp
git pull origin main
npm install
pm2 restart wedding-rsvp
```

---

## Troubleshooting

### Сервер не запускается

```bash
# Проверьте логи
npm start

# Проверьте портпапа
sudo lsof -i :3000

# Проверьте .env
cat .env | grep TELEGRAM
```

### Telegram ошибки

- `401 Unauthorized` - неправильный токен
- `400 Bad Request` - неправильный chat_id или формат сообщения
- `429 Too Many Requests` - слишком много запросов (rate limiting)

### Проблемы с CORS

Убедитесь что в `server.js` правильно указан `FRONTEND_URL`:

```javascript
const allowedOrigins = [
    'https://yourdomain.com',
    'https://www.yourdomain.com'
];
```

---

## Здоровье сервера

### Health check endpoint

```bash
curl http://localhost:3000/health
```

Ответ должен быть:

```json
{
  "status": "ok",
  "timestamp": "2024-03-04T12:34:56.789Z",
  "environment": "production"
}
```

### Мониторинг uptime

Используйте сервис для мониторинга:
- UptimeRobot (бесплатно)
- Pingdom
- New Relic
- DataDog

Мониторьте `/health` endpoint каждые 5 минут

---

## Безопасность в Продакшене

✅ Используйте HTTPS (обязательно)
✅ Установите правильные CORS headers
✅ Используйте rate limiting
✅ Логируйте все запросы
✅ Регулярно обновляйте зависимости
✅ Используйте firewall
✅ Мониторьте логи на ошибки
✅ Регулярные бэкапы

```bash
# Проверка уязвимостей
npm audit
npm audit fix

# Обновление пакетов
npm update
```

---

## Тестирование API

### Curl

```bash
curl -X POST http://localhost:3000/api/send-rsvp \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Иван Петров",
    "visit": "Приду",
    "allergy": "Нет",
    "drinks": ["Вода", "Вино"],
    "comments": "Спасибо за приглашение!"
  }'
```

### Postman

1. Откройте Postman
2. Создайте новый POST запрос на `http://localhost:3000/api/send-rsvp`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):

```json
{
  "name": "Иван Петров",
  "visit": "Приду",
  "allergy": "Нет",
  "drinks": ["Вода", "Вино"],
  "comments": "Спасибо за приглашение!"
}
```

5. Нажмите Send

---

## Готово! 🎉

Ваш защищённый RSVP сервер готов к работе!

Вопросы? Проверьте логи или создайте issue на GitHub.
