@echo off
chcp 65001 > nul
echo Список файлов в папке %cd% и её подпапках:
echo ========================================
echo.

dir /s /b /a-d > filelist.txt

echo.
echo Список сохранен в filelist.txt
pause