# Гайд по отладке экрана загрузки

## Быстрая проверка

### Шаг 1: Проверить CSS загружается ли
1. Откройте DevTools (F12)
2. Перейти на вкладку Network
3. Обновить страницу (Ctrl+R)
4. Найти `loading-screen.css` в списке загруженных файлов
5. Проверить что статус 200 (успешная загрузка)

### Шаг 2: Проверить JS загружается ли
1. В той же вкладке Network
2. Найти `loading-screen.js` в списке
3. Проверить что статус 200

### Шаг 3: Проверить консоль на ошибки
1. Перейти на вкладку Console
2. Обновить страницу (Ctrl+R)
3. Посмотреть есть ли красные ошибки (Errors)

## Отладка проблем

### Проблема: "Экран загрузки не появляется вообще"

**Шаги диагностики:**

1. Откройте Console и проверьте ошибки:
```javascript
// Введите в консоль и нажмите Enter:
document.querySelector('.uc-preloader')
```
- Если вывод `null`, значит HTML элемента нет на странице
- Если вывод `<div class="uc-preloader...">`, элемент есть

2. Проверьте CSS загружается ли:
```javascript
// Введите в консоль:
const link = document.querySelector('link[href*="loading-screen.css"]');
console.log('CSS link found:', !!link);
```

3. Проверьте JS загружается ли:
```javascript
// Введите в консоль:
window.addEventListener('load', function() {
    console.log('Load event triggered');
    console.log('Preloader visible:', !document.querySelector('.uc-preloader').classList.contains('hide'));
});
```

### Проблема: "Счетчик не появляется"

```javascript
// Введите в консоль:
document.querySelector('.number').classList.remove('hide');
```

Если счетчик теперь виден, значит скрипт не удаляет класс `hide`.

### Проблема: "Экран загрузки не исчезает"

```javascript
// Введите в консоль чтобы вручную скрыть:
document.querySelector('.uc-preloader').classList.add('hide');
document.querySelector('.number').classList.add('hide');
document.querySelector('.t-body').classList.add('overflow');
```

Если после этого экран исчезает, значит стили работают но логика инициализации не срабатывает.

## Проверка порядка загрузки скриптов

Откройте DevTools и перейдите на вкладку **Sources**:

1. Нажмите кнопку воспроизведения или обновите страницу
2. Посмотрите на список скриптов слева:
   - `utilities.js` - должен загрузиться первым
   - `analytics.js`
   - `visibility-optimization.js`
   - `background-images.js` (async)
   - `loading-screen.js` - должен быть БЕЗ async!

## Проверка события DOMContentLoaded

```javascript
// Введите в консоль:
console.log('Document readyState:', document.readyState);

// Если "complete" - DOM уже готов
// Если "loading" - DOM еще загружается
// Если "interactive" - DOM почти готов
```

## Проверка CSS вычисленных стилей

1. Откройте DevTools (F12)
2. Найдите элемент: `Ctrl+Shift+C` и кликните на белый экран (если видите)
3. Или в консоли:
```javascript
const preloader = document.querySelector('.uc-preloader');
const styles = window.getComputedStyle(preloader);
console.log({
    display: styles.display,
    position: styles.position,
    zIndex: styles.zIndex,
    backgroundColor: styles.backgroundColor,
    width: styles.width,
    height: styles.height
});
```

4. Проверьте значения:
   - `display: flex` ✅
   - `position: fixed` ✅
   - `zIndex: 9998` ✅
   - `backgroundColor: rgb(251, 247, 238)` ✅
   - `width: 100vw` или `100%` ✅
   - `height: 100vh` или `100%` ✅

## Проверка класса hide

```javascript
// Проверить есть ли класс hide:
console.log('Has hide class:', document.querySelector('.uc-preloader').classList.contains('hide'));

// Проверить какие классы вообще есть:
console.log('Classes:', document.querySelector('.uc-preloader').classList);
```

## Принудительная инициализация

Если ничего не помогло, вы можете вручную инициализировать в консоли:

```javascript
// Показать прелоадер
document.querySelector('.uc-preloader').classList.remove('hide');
document.querySelector('.number').classList.remove('hide');

// Запустить счетчик
const numberElement = document.querySelector('.number .tn-atom');
const startTime = performance.now();
const duration = 2100;

function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    numberElement.textContent = Math.floor(progress * 100);
    if (progress < 1) requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

## Проверка Performance

1. Откройте DevTools
2. Перейти на вкладку Performance
3. Нажать кнопку Record (красный кружок)
4. Обновить страницу (Ctrl+R)
5. Нажать кнопку Stop когда экран загрузки исчезнет

Посмотрите когда срабатывают события:
- `DOMContentLoaded` - должно быть раньше показа прелоадера
- `load` - полная загрузка страницы

## Запись видео отладки

Если хотите показать проблему разработчику:

1. Откройте DevTools (F12)
2. Перейти на Console
3. Обновить страницу (Ctrl+R)
4. Скопировать весь вывод консоли (скриншот или текст)
5. Приложить скриншоты вкладок:
   - Network (все ли файлы загружены)
   - Console (есть ли ошибки)
   - Elements (HTML структура)

## Чек-лист отладки

- [ ] CSS файл `loading-screen.css` загружается (Network вкладка)
- [ ] JS файл `loading-screen.js` загружается без `async` атрибута
- [ ] Нет красных ошибок в Console
- [ ] Элемент `.uc-preloader` существует в DOM
- [ ] Элемент `.number` существует в DOM
- [ ] CSS стили применяются корректно (вычисленные стили)
- [ ] Скрипт выполняется (логи в console)
- [ ] Счетчик считает от 0 до 100
- [ ] Экран скользит вверх после 2.5 сек
- [ ] Страница становится скролируемой после 3.5 сек
- [ ] Экран полностью исчезает после 5.3 сек
