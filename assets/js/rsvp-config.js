/**
 * RSVP Configuration
 *
 * Telegram bot credentials and settings
 * For production, load these from environment variables
 */

window.RSVP_CONFIG = {
    telegram: {
        // Load from environment or use defaults
        botToken: window.TELEGRAM_BOT_TOKEN || '8546114994:AAETuYT8Afu_4VWjXAmfWEDeUu7jnop8cjU',
        chatId: window.TELEGRAM_CHAT_ID || '780759394',
        enabled: true
    },

    messages: {
        success: 'Спасибо! Ваша заявка отправлена.',
        error: 'Ошибка при отправке: ',
        loading: 'Отправка данных...'
    },

    form: {
        selectors: {
            form: '.t-form, form',
            submitBtn: 'button[type="submit"], input[type="submit"]',
            drinkField: '[data-field-name="drink"]',
            hotDishField: '[data-field-name="hotDish"]'
        },
        fields: {
            name: 'name',
            visit: 'visit',
            allergy: 'allergy',
            comments: 'comment',
            drinks: 'drink',
            hotDishes: 'hotDish'
        }
    },

    validation: {
        required: ['name', 'visit'],
        patterns: {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            phone: /^[0-9\-\+\(\)\s]{10,}$/
        }
    }
};
