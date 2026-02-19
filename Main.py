import os
import requests
from urllib.parse import urljoin, urlparse
from pathlib import Path
from bs4 import BeautifulSoup
import time
import sys
import random


def check_playwright_installation():
    """Проверяет, установлены ли браузеры Playwright"""
    try:
        from playwright.sync_api import sync_playwright
        return True
    except ImportError:
        print("Playwright не установлен. Установите его: pip install playwright")
        return False


def scroll_to_bottom(page, scroll_pause=2):
    """
    Плавно прокручивает страницу до самого конца для загрузки всего контента

    Args:
        page: объект страницы Playwright
        scroll_pause: пауза между прокрутками в секундах
    """
    print("   📜 Начинаем прокрутку страницы для загрузки контента...")

    # Получаем высоту страницы
    last_height = page.evaluate("document.body.scrollHeight")
    scroll_position = 0
    scroll_step = 500  # шаг прокрутки в пикселях

    while True:
        # Прокручиваем на шаг вниз
        scroll_position += scroll_step
        page.evaluate(f"window.scrollTo(0, {scroll_position})")

        # Ждём загрузки контента
        time.sleep(scroll_pause)

        # Проверяем новые элементы
        new_height = page.evaluate("document.body.scrollHeight")

        # Показываем прогресс
        progress = min(100, int((scroll_position / new_height) * 100))
        print(f"      Прогресс: {progress}% (высота: {scroll_position}/{new_height})", end='\r')

        # Если дошли до конца или высота не меняется
        if scroll_position >= new_height or (new_height == last_height and scroll_position >= last_height):
            break

        last_height = new_height

    # Прокручиваем плавно в самый низ
    page.evaluate("""
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    """)
    time.sleep(scroll_pause)

    # Прокручиваем обратно наверх (для загрузки изображений вверху)
    page.evaluate("""
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    """)
    time.sleep(scroll_pause)

    print("   ✅ Прокрутка завершена                     ")


def download_page(url, output_dir="snapshot", timeout=30000, wait_time=60):
    """
    Скачивает страницу по URL со всеми ресурсами (css, js, изображения)
    и сохраняет локальную копию в папку output_dir.

    Args:
        url: URL страницы для скачивания
        output_dir: директория для сохранения
        timeout: таймаут ожидания загрузки страницы в миллисекундах
        wait_time: время ожидания после загрузки для динамического контента (в секундах)
    """
    if not check_playwright_installation():
        return False

    from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

    # Создаём выходную директорию
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)

    print(f"🌐 Загружаем страницу {url}...")

    # 1. Загружаем страницу через Playwright (с поддержкой JavaScript)
    try:
        with sync_playwright() as p:
            # Запускаем браузер с параметрами для обхода защиты
            browser = p.chromium.launch(
                headless=True,  # Можно попробовать False, если сайт блокирует headless
                args=[
                    '--disable-blink-features=AutomationControlled',
                    '--disable-dev-shm-usage',
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-web-security',
                    '--disable-features=IsolateOrigins,site-per-process',
                    '--start-maximized'
                ]
            )

            # Создаём контекст с расширенными настройками
            context = browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                extra_http_headers={
                    'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                }
            )

            page = context.new_page()

            # Добавляем скрипт для маскировки автоматизации
            page.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined
                });

                Object.defineProperty(navigator, 'plugins', {
                    get: () => [1, 2, 3, 4, 5]
                });

                Object.defineProperty(navigator, 'languages', {
                    get: () => ['ru-RU', 'ru', 'en-US', 'en']
                });

                // Дополнительная маскировка
                window.chrome = {
                    runtime: {}
                };

                Object.defineProperty(navigator, 'pdfViewerEnabled', {
                    get: () => true
                });
            """)

            # Устанавливаем таймаут
            page.set_default_timeout(timeout)

            # Перехватываем ошибки консоли
            page.on("pageerror", lambda err: print(f"⚠️ Ошибка страницы: {err}"))
            page.on("console", lambda msg: print(f"📋 Консоль: {msg.text}") if msg.type != 'debug' else None)

            # Ждём загрузки страницы
            print("🚀 Переходим на страницу...")
            response = page.goto(url, wait_until="networkidle", timeout=timeout)

            if not response:
                print("❌ Не удалось загрузить страницу")
                browser.close()
                return False

            print(f"📊 Статус загрузки: {response.status}")

            if response.status >= 400:
                print(f"❌ Ошибка HTTP: {response.status}")
                browser.close()
                return False

            print(f"🔗 Финальный URL: {page.url}")

            # ===== ИСКУССТВЕННАЯ ЗАДЕРЖКА ДЛЯ ЗАЩИТЫ ОТ ПАРСИНГА =====
            print(f"\n⏰ Ожидание {wait_time} секунд для полной загрузки динамического контента...")
            print("   (Это необходимо для обхода защиты от парсинга)")

            # Разбиваем ожидание на этапы
            remaining_time = wait_time

            # Этап 1: Первичная загрузка (первые 10 секунд)
            print("\n   Этап 1: Первичная загрузка...")
            for second in range(min(10, remaining_time)):
                if second % 2 == 0:
                    loaded_resources = len(page.evaluate("() => performance.getEntriesByType('resource')"))
                    print(f"      Загружено ресурсов: {loaded_resources}", end='\r')
                time.sleep(1)
            remaining_time -= 10

            # Этап 2: Скролл до конца страницы
            if remaining_time > 0:
                print("\n   Этап 2: Прокрутка страницы...")
                scroll_to_bottom(page)
                remaining_time -= 10  # отнимаем время на скролл

                # Проверяем новые ресурсы после скролла
                loaded_resources = len(page.evaluate("() => performance.getEntriesByType('resource')"))
                print(f"      После скролла ресурсов: {loaded_resources}")

            # Этап 3: Оставшееся время ожидания
            if remaining_time > 0:
                print(f"\n   Этап 3: Ожидание {remaining_time} секунд для полной загрузки...")
                for second in range(remaining_time):
                    if second % 5 == 0:
                        # Проверяем, загрузились ли новые ресурсы
                        resources_count = len(page.evaluate("() => performance.getEntriesByType('resource')"))
                        dom_elements = len(page.evaluate("() => document.querySelectorAll('*')"))
                        print(f"      Ресурсов: {resources_count} | DOM элементов: {dom_elements}", end='\r')

                    # Каждые 15 секунд делаем небольшой скролл
                    if second % 15 == 0 and second > 0:
                        page.evaluate("window.scrollBy(0, 300)")

                    time.sleep(1)

            print("\n   ✅ Все этапы завершены")

            # Финальная проверка
            final_resources = len(page.evaluate("() => performance.getEntriesByType('resource')"))
            final_elements = len(page.evaluate("() => document.querySelectorAll('*')"))
            print(f"   📊 Итог: {final_resources} ресурсов, {final_elements} DOM элементов")

            # Получаем HTML после полной загрузки
            html_content = page.content()
            final_url = page.url

            # Сохраняем скриншот для отладки
            screenshot_path = output_path / "screenshot.png"
            page.screenshot(path=str(screenshot_path), full_page=True)
            print(f"📸 Полноразмерный скриншот сохранён в {screenshot_path}")

            # Сохраняем информацию о загруженных ресурсах
            browser.close()

    except PlaywrightTimeoutError:
        print(f"❌ Таймаут при загрузке страницы {url}")
        return False
    except Exception as e:
        print(f"❌ Ошибка при загрузке страницы: {e}")
        import traceback
        traceback.print_exc()
        return False

    # Сохраняем исходный HTML
    html_file = output_path / "index.html"
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"📄 HTML сохранён в {html_file} (размер: {len(html_content)} символов)")

    # Парсим HTML для поиска ресурсов
    soup = BeautifulSoup(html_content, "html.parser")

    # Сессия для скачивания файлов
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1"
    })

    # Множество для хранения абсолютных URL ресурсов
    resources = set()

    # CSS-файлы
    for link in soup.find_all("link", rel="stylesheet"):
        href = link.get("href")
        if href and not href.startswith('data:'):
            abs_url = urljoin(final_url, href)
            resources.add(abs_url)

    # JS-файлы
    for script in soup.find_all("script", src=True):
        src = script["src"]
        if src and not src.startswith('data:'):
            abs_url = urljoin(final_url, src)
            resources.add(abs_url)

    # Изображения
    for img in soup.find_all("img", src=True):
        src = img.get("src")
        if src and not src.startswith('data:'):
            abs_url = urljoin(final_url, src)
            resources.add(abs_url)

    # Изображения в srcset
    for img in soup.find_all("img", srcset=True):
        srcset = img.get("srcset")
        if srcset:
            # Парсим srcset
            parts = srcset.split(',')
            for part in parts:
                src_candidate = part.strip().split(' ')[0]
                if src_candidate and not src_candidate.startswith('data:'):
                    abs_url = urljoin(final_url, src_candidate)
                    resources.add(abs_url)

    # Дополнительные ресурсы
    for source in soup.find_all("source", src=True):
        src = source.get("src")
        if src and not src.startswith('data:'):
            abs_url = urljoin(final_url, src)
            resources.add(abs_url)

    # Source с srcset
    for source in soup.find_all("source", srcset=True):
        srcset = source.get("srcset")
        if srcset:
            parts = srcset.split(',')
            for part in parts:
                src_candidate = part.strip().split(' ')[0]
                if src_candidate and not src_candidate.startswith('data:'):
                    abs_url = urljoin(final_url, src_candidate)
                    resources.add(abs_url)

    # Favicon
    for link in soup.find_all("link", rel=["icon", "shortcut icon", "apple-touch-icon"]):
        href = link.get("href")
        if href and not href.startswith('data:'):
            abs_url = urljoin(final_url, href)
            resources.add(abs_url)

    # Фоновые изображения в стилях (базовый поиск)
    for tag in soup.find_all(style=True):
        style = tag.get("style")
        if 'url(' in style:
            import re
            urls = re.findall(r'url\([\'"]?([^\'")]+)[\'"]?\)', style)
            for url_match in urls:
                if url_match and not url_match.startswith('data:'):
                    abs_url = urljoin(final_url, url_match)
                    resources.add(abs_url)

    print(f"🔍 Найдено уникальных ресурсов для скачивания: {len(resources)}")

    # Вспомогательная функция: безопасное имя файла
    def safe_filename(filename, max_length=200):
        """Заменяет недопустимые символы в имени файла"""
        invalid_chars = '<>:"/\\|?*'
        for char in invalid_chars:
            filename = filename.replace(char, '_')
        # Обрезаем слишком длинные имена
        if len(filename) > max_length:
            name, ext = os.path.splitext(filename)
            filename = name[:max_length - len(ext)] + ext
        return filename

    # Вспомогательная функция: путь для сохранения файла
    def get_local_path(resource_url):
        parsed = urlparse(resource_url)
        if not parsed.scheme or parsed.scheme in ['data', 'javascript', 'about', 'blob']:
            return None

        # Получаем путь файла
        path = parsed.path
        if not path or path.endswith('/'):
            path = path + 'index.html'

        # Убираем начальный слеш
        path = path.lstrip('/')

        # Создаём путь с доменом
        domain = parsed.netloc.replace(':', '_')

        # Разделяем путь на части и применяем safe_filename к каждой части
        path_parts = path.split('/')
        safe_parts = [safe_filename(part) for part in path_parts]
        safe_path = '/'.join(safe_parts)

        full_path = output_path / domain / safe_path
        return full_path

    # Словарь для сопоставления URL и локального пути скачанного файла
    downloaded_files = {}

    # Скачиваем все найденные ресурсы
    print("\n📥 Начинаем скачивание ресурсов...")

    for i, res_url in enumerate(resources, 1):
        local_path = get_local_path(res_url)
        if not local_path:
            print(f"[{i}/{len(resources)}] ⏭️ Пропускаем (невалидный URL): {res_url[:100]}...")
            continue

        # Создаём недостающие папки
        local_path.parent.mkdir(parents=True, exist_ok=True)

        # Пропускаем, если файл уже существует
        if local_path.exists():
            print(f"[{i}/{len(resources)}] ⏭️ Уже есть: {res_url[:80]}...")
            downloaded_files[res_url] = local_path
            continue

        try:
            print(f"[{i}/{len(resources)}] ⬇️ Скачиваем: {res_url[:80]}...")

            # Добавляем случайную задержку между запросами
            time.sleep(random.uniform(0.5, 2.0))

            response = session.get(res_url, stream=True, timeout=30, allow_redirects=True)
            response.raise_for_status()

            # Определяем расширение файла по Content-Type, если нужно
            content_type = response.headers.get('content-type', '').lower()
            if 'html' in content_type and not local_path.suffix:
                local_path = local_path.with_suffix('.html')
            elif 'javascript' in content_type and not local_path.suffix:
                local_path = local_path.with_suffix('.js')
            elif 'css' in content_type and not local_path.suffix:
                local_path = local_path.with_suffix('.css')
            elif 'image' in content_type:
                if 'png' in content_type:
                    local_path = local_path.with_suffix('.png')
                elif 'jpeg' in content_type or 'jpg' in content_type:
                    local_path = local_path.with_suffix('.jpg')
                elif 'svg' in content_type:
                    local_path = local_path.with_suffix('.svg')
                elif 'gif' in content_type:
                    local_path = local_path.with_suffix('.gif')
                elif 'webp' in content_type:
                    local_path = local_path.with_suffix('.webp')

            # Скачиваем файл
            file_size = 0
            with open(local_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        file_size += len(chunk)

            downloaded_files[res_url] = local_path
            print(f"   ✅ Сохранено ({file_size / 1024:.1f} KB)")

        except requests.exceptions.Timeout:
            print(f"   ⚠️ Таймаут при скачивании")
        except requests.exceptions.HTTPError as e:
            print(f"   ⚠️ HTTP ошибка {e.response.status_code}")
        except Exception as e:
            print(f"   ⚠️ Ошибка: {e}")

    # 3. Заменяем ссылки в HTML на локальные пути
    print("\n🔗 Обновляем ссылки в HTML...")

    # Функция для получения относительного пути
    def get_relative_path(downloaded_path):
        try:
            rel_path = os.path.relpath(downloaded_path, output_path)
            return rel_path.replace(os.sep, '/')
        except:
            return None

    # Обновляем ссылки
    link_count = 0

    # CSS
    for link in soup.find_all("link", rel="stylesheet"):
        href = link.get("href")
        if href and not href.startswith('data:'):
            abs_url = urljoin(final_url, href)
            if abs_url in downloaded_files:
                rel_path = get_relative_path(downloaded_files[abs_url])
                if rel_path:
                    link["href"] = rel_path
                    link_count += 1

    # JS
    for script in soup.find_all("script", src=True):
        src = script.get("src")
        if src and not src.startswith('data:'):
            abs_url = urljoin(final_url, src)
            if abs_url in downloaded_files:
                rel_path = get_relative_path(downloaded_files[abs_url])
                if rel_path:
                    script["src"] = rel_path
                    link_count += 1

    # Изображения
    for img in soup.find_all("img", src=True):
        src = img.get("src")
        if src and not src.startswith('data:'):
            abs_url = urljoin(final_url, src)
            if abs_url in downloaded_files:
                rel_path = get_relative_path(downloaded_files[abs_url])
                if rel_path:
                    img["src"] = rel_path
                    link_count += 1

    # Source
    for source in soup.find_all("source", src=True):
        src = source.get("src")
        if src and not src.startswith('data:'):
            abs_url = urljoin(final_url, src)
            if abs_url in downloaded_files:
                rel_path = get_relative_path(downloaded_files[abs_url])
                if rel_path:
                    source["src"] = rel_path
                    link_count += 1

    # Favicon
    for link in soup.find_all("link", rel=["icon", "shortcut icon", "apple-touch-icon"]):
        href = link.get("href")
        if href and not href.startswith('data:'):
            abs_url = urljoin(final_url, href)
            if abs_url in downloaded_files:
                rel_path = get_relative_path(downloaded_files[abs_url])
                if rel_path:
                    link["href"] = rel_path
                    link_count += 1

    print(f"✅ Обновлено {link_count} ссылок")

    # Сохраняем обновлённый HTML
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(str(soup))

    # Подсчитываем статистику
    total_size = sum(f.stat().st_size for f in output_path.rglob('*') if f.is_file())
    total_files = len(list(output_path.rglob('*')))

    print(f"\n{'=' * 60}")
    print(f"✅ ГОТОВО! Локальная копия создана в папке: {output_path}")
    print(f"{'=' * 60}")
    print(f"📄 HTML файл: {html_file}")
    print(f"📸 Скриншот: {screenshot_path}")
    print(f"📦 Всего скачано файлов: {len(downloaded_files)}")
    print(f"📁 Всего файлов в папке: {total_files}")
    print(f"💾 Общий размер: {total_size / (1024 * 1024):.2f} МБ")
    print(f"🔗 Обновлено ссылок: {link_count}")
    print(f"\n🌍 Откройте {html_file} в браузере для просмотра локальной копии.")

    return True


def main():
    """Основная функция"""
    print("=" * 60)
    print("🕸️  Утилита для создания локальной копии веб-страницы")
    print("   (с защитой от парсинга - ожидание и скролл до конца)")
    print("=" * 60)

    # Проверяем установку Playwright
    try:
        import playwright
    except ImportError:
        print("❌ Playwright не установлен!")
        print("\nУстановите его командой:")
        print("  pip install playwright")
        print("  playwright install chromium")
        return

    # Получаем URL
    if len(sys.argv) > 1:
        url = sys.argv[1]
    else:
        url = input("🌐 Введите URL страницы: ").strip()

    if not url:
        print("❌ URL не указан.")
        return

    # Добавляем протокол, если его нет
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
        print(f"🔧 Используем: {url}")

    # Запрашиваем имя папки для сохранения
    default_dir = "snapshot"
    output_dir = input(f"📁 Имя папки для сохранения (Enter для '{default_dir}'): ").strip()
    if not output_dir:
        output_dir = default_dir

    # Запрашиваем время ожидания
    wait_time_input = input(f"⏱️  Время ожидания после загрузки в секундах (Enter для 60): ").strip()
    try:
        wait_time = int(wait_time_input) if wait_time_input else 60
    except ValueError:
        print("⚠️  Неверное значение, используем 60 секунд")
        wait_time = 60

    print(f"\n🔄 Начинаем процесс с ожиданием {wait_time} секунд и прокруткой до конца...\n")

    # Запускаем скачивание
    success = download_page(url, output_dir, wait_time=wait_time)

    if success:
        print("\n✅ Процесс завершён успешно!")
    else:
        print("\n❌ Произошла ошибка при создании копии.")

    input("\nНажмите Enter для выхода...")


if __name__ == "__main__":
    main()