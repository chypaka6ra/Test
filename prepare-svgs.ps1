# Replace embedded base64 with YOUR_BASE64_HERE placeholder
# Run: powershell -ExecutionPolicy Bypass -File .\prepare-svgs.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Prepare SVG Files" -ForegroundColor Cyan
Write-Host "   (Replace base64 with placeholder)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Searching for SVG files..." -ForegroundColor Cyan

# Find all SVG files
$svgFiles = Get-ChildItem -Path "." -Filter "*.svg" -Recurse
$count = 0

if ($svgFiles.Count -eq 0) {
    Write-Host "[ERROR] No SVG files found!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Found $($svgFiles.Count) SVG file(s)" -ForegroundColor Cyan
Write-Host ""

foreach ($file in $svgFiles) {
    $filePath = $file.FullName
    
    try {
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        # Check if file has base64 in data:font
        if ($content -like "*data:font/woff2;base64,*" -and $content -notlike "*YOUR_BASE64_HERE*") {
            Write-Host "[UPDATING] $filePath" -ForegroundColor Yellow
            
            # Replace base64 string with YOUR_BASE64_HERE
            # Match pattern: data:font/woff2;base64,<long base64 string>
            $newContent = $content -replace 'data:font/woff2;base64,[A-Za-z0-9+/=]+', 'data:font/woff2;base64,YOUR_BASE64_HERE'
            
            Set-Content -Path $filePath -Value $newContent -Encoding UTF8
            $count++
            Write-Host "             OK - Done" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "[ERROR] Failed to process file: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Results" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Files prepared: $count" -ForegroundColor Green
Write-Host ""

if ($count -eq 0) {
    Write-Host "[INFO] No files needed updating" -ForegroundColor Yellow
}
else {
    Write-Host "[SUCCESS] SVG files are now ready!" -ForegroundColor Green
    Write-Host "Now you can use FINAL-replace-base64.ps1" -ForegroundColor Green
}

Write-Host ""
Read-Host "Press Enter to exit"