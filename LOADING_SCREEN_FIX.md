# Loading Screen - исправления и отладка

## Проблемы которые были найдены и исправлены

### 1. **Асинхронная загрузка скрипта (async attribute)**
   - **Проблема**: Script тег имел атрибут `async`, что позволял браузеру загружать скрипт параллельно с парсингом HTML
   - **Последствие**: Скрипт мог быть выполнен слишком поздно, после того как страница уже загружалась
   - **Решение**: Убрал атрибут `async`, теперь скрипт загружается синхронно

### 2. **Ожидание события load**
   - **Проблема**: Скрипт ждал события `window.addEventListener('load', ...)`, что срабатывает только после загрузки ВСЕХ ресурсов страницы
   - **Последствие**: Если страница загружается быстро, событие load может произойти до выполнения скрипта
   - **Решение**: Теперь проверяем `document.readyState` и инициализируем сразу после DOMContentLoaded

### 3. **Дублирующийся скрипт в body**
   - **Проблема**: Было два тега `<script src="assets/js/loading-screen.js">` - один в `<head>` и один в `<body>`
   - **Последствие**: Скрипт мог быть выполнен дважды
   - **Решение**: Удалил дубликат из body, оставил только в head

### 4. **Класс hide не удалялся у .number**
   - **Проблема**: Элемент `.number` содержал класс `hide` с `display: none !important`, который не удалялся
   - **Последствие**: Счетчик не отображался
   - **Решение**: Явно удаляю класс `hide` у `.number` при инициализации

## Новый порядок инициализации

```javascript
// 1. Проверяем есть ли элементы в DOM
if (document.querySelector('.uc-preloader')) {
    setupLoadingScreen();
} else {
    // 2. Если нет, ждем DOMContentLoaded
    document.addEventListener('DOMContentLoaded', setupLoadingScreen);
}

function setupLoadingScreen() {
    // 3. Если DOM еще загружается, ждем DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLoadingScreen);
    } else {
        // 4. Если DOM готов, инициализируем сразу
        initLoadingScreen();
    }
}
```

## Таймлайн загрузки экрана

| Время | Действие |
|-------|----------|
| 0ms | Скрипт выполняется, прелоадер показывается |
| 0ms | Счетчик начинает считать от 0 |
| 2100ms | Счетчик достигает 100% |
| 2500ms | Прелоадер начинает скользить вверх (+ 400ms задержка) |
| 3500ms | Страница становится скролируемой (overflow: auto) |
| 4200ms | Прелоадер полностью скрывается (слайд 1700ms + 400ms) |
| 5300ms | Финальное скрытие элементов (класс hide) |

## Как тестировать

### Тест 1: Простой тест в изолированной HTML странице

Открыть файл `test-loading-screen.html`:
```bash
# Открыть в браузере
open test-loading-screen.html
# или
firefox test-loading-screen.html
```

Проверить:
1. ✅ Белый экран появляется сразу
2. ✅ Счетчик показывает цифры от 0 до 100
3. ✅ Экран плавно скользит вверх
4. ✅ Вся страница становится видимой через ~5 секунд

### Тест 2: На главной странице index.html

1. Открыть `index.html` в браузере
2. Нажать F12 чтобы открыть Developer Tools
3. Перейти на вкладку Console
4. Обновить страницу (Ctrl+R)

Проверить в консоли:
- `[Loading Screen] Initializing...` - инициализация начата
- `[Loading Screen] Preloader shown, starting counter animation` - прелоадер показан
- `[Loading Screen] Counter animation started` - счетчик начался
- `[Loading Screen] Counter animation completed (100%)` - счетчик завершен

### Тест 3: Проверка CSS

1. Открыть DevTools (F12)
2. Найти элемент `.uc-preloader`
3. Проверить computed styles:
   - `position: fixed`
   - `width: 100%`
   - `height: 100%`
   - `background: #FBF7EE`
   - `display: flex`
   - `z-index: 9998`

## Файлы которые были изменены

- `assets/js/loading-screen.js` - основная логика экрана загрузки
- `index.html` - исправлены подключения скриптов
- Добавлены логи для отладки

## CSS файл

Стили находятся в: `assets/css/loading-screen.css`

Ключевые стили:
- `.uc-preloader` - основной контейнер (fixed, full-screen, flex)
- `.preloader-shape` - белый фон который скользит вверх
- `.number` - счетчик проценов
- `.slide-up-smooth` - анимация скольжения вверх (cubic-bezier)
- `.hide` - скрытие элемента (display: none !important)

## Дополнительные временные параметры

Все тайминги определены в одном месте в `loading-screen.js`:

```javascript
const TIMING = {
    COUNTER_DURATION: 2100,      // 2.1 сек - анимация счетчика
    SHAPE_DELAY: 400,            // 0.4 сек - задержка перед началом slide-up
    SCROLL_ENABLE_DELAY: 3500,   // 3.5 сек - когда включить скролл
    HIDE_DELAY: 5300,            // 5.3 сек - полное скрытие элементов
    FALLBACK_HIDE_DELAY: 5300    // 5.3 сек - резервное скрытие
};
```

Можно легко изменить эти значения для настройки анимации.
