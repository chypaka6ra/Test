# Convert TTF font file to base64
# Usage: powershell -ExecutionPolicy Bypass -File .\ttf-to-base64.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TTF to Base64 Converter" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Ask user for TTF file path
Write-Host "Enter path to your TTF file (e.g., C:\fonts\myfont.ttf):" -ForegroundColor Yellow
$fontPath = Read-Host "TTF file path"

# Check if file exists
if (-not (Test-Path $fontPath)) {
    Write-Host "[ERROR] File not found: $fontPath" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if file is TTF
if (-not ($fontPath -like "*.ttf")) {
    Write-Host "[WARNING] File does not have .ttf extension" -ForegroundColor Yellow
    Write-Host "Continuing anyway..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[INFO] Reading file: $fontPath" -ForegroundColor Cyan

try {
    # Read file as bytes
    $fontBytes = [System.IO.File]::ReadAllBytes($fontPath)
    Write-Host "[OK] File read successfully" -ForegroundColor Green
    Write-Host "[INFO] File size: $([math]::Round($fontBytes.Length / 1024, 2)) KB" -ForegroundColor Yellow
    
    # Convert to base64
    Write-Host ""
    Write-Host "Converting to base64..." -ForegroundColor Cyan
    $base64String = [Convert]::ToBase64String($fontBytes)
    Write-Host "[OK] Conversion complete" -ForegroundColor Green
    Write-Host "[INFO] Base64 length: $($base64String.Length) characters" -ForegroundColor Yellow
    
    # Get output filename
    $fontName = [System.IO.Path]::GetFileNameWithoutExtension($fontPath)
    $outputFile = "$fontName-base64.txt"
    
    # Save to file
    Write-Host ""
    Write-Host "Saving to file: $outputFile" -ForegroundColor Cyan
    Set-Content -Path $outputFile -Value $base64String -Encoding UTF8
    Write-Host "[OK] Base64 saved to: $outputFile" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   Success!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "You can now use this base64 code in your SVG files:" -ForegroundColor Green
    Write-Host "src: url('data:font/woff2;base64,YOUR_BASE64_HERE')" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or use FINAL-replace-base64.ps1 to replace YOUR_BASE64_HERE" -ForegroundColor Green
    Write-Host ""
}
catch {
    Write-Host "[ERROR] Conversion failed: $_" -ForegroundColor Red
    Write-Host ""
}

Read-Host "Press Enter to exit"