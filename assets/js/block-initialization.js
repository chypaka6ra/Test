/**
 * Block Initialization
 * Инициализирует все блоки t396 на странице
 */

(function() {
    'use strict';

    // Список ID всех блоков t396 на странице
    var blockIds = [
        '1670038901',
        '1670038921',
        '1670038941',
        '1670038951',
        '1670787751',
        '1681079961',
        '1681106511'
    ];

    /**
     * Инициализирует один блок t396
     * @param {string} blockId - ID блока для инициализации
     */
    function initializeBlock(blockId) {
        // Сначала инициализируем масштабирование
        window.t_onFuncLoad('t396_initialScale', function() {
            window.t396_initialScale(blockId);
        });

        // Затем инициализируем сам блок после загрузки DOM
        window.t_onReady(function() {
            window.t_onFuncLoad('t396_init', function() {
                window.t396_init(blockId);
            });
        });
    }

    /**
     * Инициализирует все блоки на странице
     */
    function initializeAllBlocks() {
        blockIds.forEach(initializeBlock);
    }

    // Запускаем инициализацию при загрузке скрипта
    // (блоки должны быть уже в DOM)
    initializeAllBlocks();
})();
