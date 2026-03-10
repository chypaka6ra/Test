/**
 * RSVP Form Handler
 *
 * Manages form submission, data extraction, and Telegram integration
 * Optimized for performance and maintainability
 */

(function() {
    'use strict';

    // Ensure config is loaded
    if (typeof window.RSVP_CONFIG === 'undefined') {
        console.error('[RSVP] Configuration not loaded. Load rsvp-config.js first.');
        return;
    }

    const CONFIG = window.RSVP_CONFIG;

    /**
     * Extract form data from inputs
     * @param {HTMLFormElement} form - The form element
     * @returns {Object} Extracted data
     */
    function extractFormData(form) {
        const data = {
            name: '',
            visit: '',
            allergy: '',
            drinks: [],
            hotDishes: [],
            comments: ''
        };

        const inputs = form.querySelectorAll('input, textarea');

        inputs.forEach(function(input) {
            const fieldName = input.name.toLowerCase();
            const value = input.value.trim();

            // Skip non-form fields
            if (fieldName.includes('tildaspec') || fieldName.includes('ссылка_event')) {
                return;
            }

            // Map form fields to data object
            switch (fieldName) {
                case CONFIG.form.fields.name:
                    data.name = value;
                    break;
                case CONFIG.form.fields.visit:
                    if (input.checked) {
                        data.visit = value;
                    }
                    break;
                case CONFIG.form.fields.allergy:
                    data.allergy = value;
                    break;
                case CONFIG.form.fields.comments:
                    data.comments = value;
                    break;
            }

            console.log('[RSVP] Field:', fieldName, '=', value, '(checked:', input.checked, ')');
        });

        // Extract checkbox lists (drinks and hot dishes)
        extractCheckboxGroups(form, data);

        return data;
    }

    /**
     * Extract checkbox groups from form
     * @param {HTMLFormElement} form - The form element
     * @param {Object} data - Data object to populate
     */
    function extractCheckboxGroups(form, data) {
        // Extract drinks
        const drinkField = form.querySelector(CONFIG.form.selectors.drinkField);
        if (drinkField) {
            const drinkCheckboxes = drinkField.querySelectorAll('input[type="checkbox"]:checked');
            drinkCheckboxes.forEach(function(checkbox) {
                const value = checkbox.value.trim();
                if (value && !data.drinks.includes(value)) {
                    data.drinks.push(value);
                    console.log('[RSVP] Drink:', value);
                }
            });
        }

        // Extract hot dishes
        const hotDishField = form.querySelector(CONFIG.form.selectors.hotDishField);
        if (hotDishField) {
            const hotDishCheckboxes = hotDishField.querySelectorAll('input[type="checkbox"]:checked');
            hotDishCheckboxes.forEach(function(checkbox) {
                const value = checkbox.value.trim();
                if (value && !data.hotDishes.includes(value)) {
                    data.hotDishes.push(value);
                    console.log('[RSVP] Hot dish:', value);
                }
            });
        }
    }

    /**
     * Validate extracted data
     * @param {Object} data - Data to validate
     * @returns {Object} Validation result { valid: boolean, errors: [] }
     */
    function validateData(data) {
        const errors = [];

        CONFIG.validation.required.forEach(function(field) {
            if (!data[field] || data[field].trim() === '') {
                errors.push(field + ' is required');
            }
        });

        if (errors.length > 0) {
            return { valid: false, errors: errors };
        }

        return { valid: true, errors: [] };
    }

    /**
     * Send data to Telegram
     * @param {Object} data - Data to send
     * @returns {Promise} Promise that resolves when data is sent
     */
    function sendToTelegram(data) {
        if (!CONFIG.telegram.enabled || !window.sendRSVPToTelegram) {
            console.warn('[RSVP] Telegram integration not available');
            return Promise.resolve();
        }

        console.log('[RSVP] Extracted data:', data);

        return window.sendRSVPToTelegram(
            data,
            CONFIG.telegram.botToken,
            CONFIG.telegram.chatId
        );
    }

    /**
     * Handle form submission
     * @param {Event} e - Submit event
     */
    function handleSubmit(e) {
        e.preventDefault();
        e.stopPropagation();

        const form = e.target.closest(CONFIG.form.selectors.form);
        if (!form) {
            console.warn('[RSVP] Form not found');
            return;
        }

        console.log('[RSVP] Form submission detected');

        const data = extractFormData(form);
        const validation = validateData(data);

        if (!validation.valid) {
            console.error('[RSVP] Validation failed:', validation.errors);
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector(CONFIG.form.selectors.submitBtn);
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = CONFIG.messages.loading;
        }

        // Send data
        sendToTelegram(data)
            .then(function(result) {
                console.log('[RSVP] ✓ Successfully sent to Telegram');
                alert(CONFIG.messages.success);
                form.reset();
            })
            .catch(function(error) {
                console.error('[RSVP] ✗ Failed to send:', error);
                alert(CONFIG.messages.error + error.message);
            })
            .finally(function() {
                // Restore button state
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Отправить';
                }
            });
    }

    /**
     * Initialize RSVP form handlers
     * Attaches to document and uses event delegation
     */
    function init() {
        console.log('[RSVP] Initializing form handlers...');

        // Single delegated submit event listener for all forms
        document.addEventListener('submit', handleSubmit, true);

        console.log('[RSVP] ✓ Form handlers initialized');
        console.log('[RSVP] Telegram bot:', CONFIG.telegram.botToken.slice(0, 10) + '...');
        console.log('[RSVP] Chat ID:', CONFIG.telegram.chatId);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else if (window.t_onReady) {
        window.t_onReady(init);
    } else {
        init();
    }

    // Export for testing
    window.RSVPHandler = {
        extractFormData: extractFormData,
        validateData: validateData,
        sendToTelegram: sendToTelegram
    };
})();
