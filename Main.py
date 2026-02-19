import os
import requests
from urllib.parse import urljoin, urlparse
from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

def download_page(url, output_dir="snapshot"):
    """
    Скачивает страницу по URL со всеми ресурсами (css, js, изображения)
    и сохраняет локальную копию в папку output_dir.
    """
    # Создаём выходную директорию
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)

    # 1. Загружаем страницу через Playwright (с поддержкой JavaScript)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # Ждём, пока сеть успокоится (все запросы завершены)
        page.goto(url, wait_until="networkidle")
        html_content = page.content()
        final_url = page.url  # может измениться после редиректов
        browser.close()

    # Сохраняем исходный HTML (позже заменим ссылки)
    html_file = output_path / "index.html"
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(html_content)

    # Парсим HTML для поиска ресурсов
    soup = BeautifulSoup(html_content, "html.parser")

    # Сессия для скачивания файлов (с заголовком User-Agent)
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    })

    # Множество для хранения абсолютных URL ресурсов
    resources = set()

    # CSS-файлы
    for link in soup.find_all("link", rel="stylesheet"):
        href = link.get("href")
        if href:
            abs_url = urljoin(final_url, href)
            resources.add(abs_url)

    # JS-файлы
    for script in soup.find_all("script", src=True):
        src = script["src"]
        abs_url = urljoin(final_url, src)
        resources.add(abs_url)

    # Изображения (png, jpg, jpeg, svg, gif и др. – можно расширить)
    for img in soup.find_all("img", src=True):
        src = img["src"]
        abs_url = urljoin(final_url, src)
        resources.add(abs_url)

    # Вспомогательная функция: путь для сохранения файла
    def get_local_path(resource_url):
        parsed = urlparse(resource_url)
        if not parsed.scheme or parsed.scheme == "data":  # пропускаем data URI
            return None
        # Формируем путь: папка с именем хоста + путь файла
        path = parsed.path.lstrip("/")
        if not path:  # если путь пустой (например, корень сайта)
            path = "index.html"
        # Заменяем недопустимые символы? Пока оставляем как есть
        full_path = output_path / parsed.netloc / path
        return full_path

    # Словарь для сопоставления URL и локального пути скачанного файла
    downloaded_files = {}

    # Скачиваем все найденные ресурсы
    for res_url in resources:
        local_path = get_local_path(res_url)
        if not local_path:
            continue
        # Создаём недостающие папки
        local_path.parent.mkdir(parents=True, exist_ok=True)
        try:
            response = session.get(res_url, stream=True, timeout=10)
            response.raise_for_status()
            with open(local_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            downloaded_files[res_url] = local_path
            print(f"Downloaded: {res_url} -> {local_path}")
        except Exception as e:
            print(f"Failed to download {res_url}: {e}")

    # 3. Заменяем ссылки в HTML на локальные пути
    for link in soup.find_all("link", rel="stylesheet"):
        href = link.get("href")
        if href:
            abs_url = urljoin(final_url, href)
            if abs_url in downloaded_files:
                # Относительный путь от index.html до файла
                rel_path = os.path.relpath(downloaded_files[abs_url], output_path)
                link["href"] = rel_path.replace(os.sep, "/")  # для веба нужны прямые слеши

    for script in soup.find_all("script", src=True):
        src = script["src"]
        abs_url = urljoin(final_url, src)
        if abs_url in downloaded_files:
            rel_path = os.path.relpath(downloaded_files[abs_url], output_path)
            script["src"] = rel_path.replace(os.sep, "/")

    for img in soup.find_all("img", src=True):
        src = img["src"]
        abs_url = urljoin(final_url, src)
        if abs_url in downloaded_files:
            rel_path = os.path.relpath(downloaded_files[abs_url], output_path)
            img["src"] = rel_path.replace(os.sep, "/")

    # Сохраняем обновлённый HTML
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(str(soup))

    print(f"\nГотово! Локальная копия сохранена в {html_file}")
    print("Откройте index.html в браузере для просмотра.")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        url = sys.argv[1]
    else:
        url = input("Введите URL страницы: ").strip()
    if url:
        download_page(url)
    else:
        print("URL не указан.")
