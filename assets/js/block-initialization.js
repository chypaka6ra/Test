/**
 * Block Initialization - Optimized
 * Инициализирует все блоки t396 на странице с обработкой ошибок
 */

(function() {
    'use strict';

    // Список ID всех блоков t396 на странице
    const blockIds = [
        '1670038901',
        '1670038921',
        '1670038941',
        '1670038951',
        '1670787751',
        '1681079961',
        '1681106511'
    ];

    // Состояние инициализации
    const initState = {
        initialized: new Set(),
        failed: new Set()
    };

    /**
     * Инициализирует один блок t396
     * С защитой от повторной инициализации и ошибок
     * @param {string} blockId - ID блока для инициализации
     */
    function initializeBlock(blockId) {
        // Проверяем не инициализировали ли уже этот блок
        if (initState.initialized.has(blockId)) {
            return;
        }

        const recElement = document.getElementById('rec' + blockId);
        if (!recElement) {
            // Элемент еще не в DOM, будем ждать
            window.t_onReady(function() {
                initializeBlock(blockId);
            });
            return;
        }

        try {
            // Сначала инициализируем масштабирование
            if (typeof window.t396_initialScale === 'function') {
                window.t396_initialScale(blockId);
            }

            // Затем инициализируем сам блок
            if (typeof window.t396_init === 'function') {
                window.t396_init(blockId);
                initState.initialized.add(blockId);
                console.log('[Block Init] Block initialized:', blockId);
            } else {
                // Функция t396_init еще не загрузилась, ждем
                window.t_onFuncLoad('t396_init', function() {
                    if (!initState.initialized.has(blockId)) {
                        window.t396_init(blockId);
                        initState.initialized.add(blockId);
                    }
                });
            }
        } catch (err) {
            console.warn('[Block Init] Error initializing block:', blockId, err);
            initState.failed.add(blockId);
        }
    }

    /**
     * Инициализирует все блоки на странице
     */
    function initializeAllBlocks() {
        blockIds.forEach(initializeBlock);
    }

    /**
     * Проверяет статус инициализации всех блоков
     */
    function checkInitStatus() {
        const total = blockIds.length;
        const initialized = initState.initialized.size;
        const failed = initState.failed.size;

        if (initialized === total) {
            console.log('[Block Init] All blocks initialized successfully');
        } else if (initialized + failed === total) {
            console.warn('[Block Init] Some blocks failed to initialize:', Array.from(initState.failed));
        }
    }

    // Запускаем инициализацию при загрузке скрипта
    initializeAllBlocks();

    // Проверяем статус через некоторое время
    setTimeout(checkInitStatus, 3000);

    // Экспортируем для отладки
    window.BlockInitDebug = {
        initState: initState,
        initializeBlock: initializeBlock,
        checkStatus: checkInitStatus
    };
})();
