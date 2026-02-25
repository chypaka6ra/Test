# SVG Font Base64 Replacer
# Replace YOUR_BASE64_HERE with actual base64 code from new_base64_code.txt
# Usage: powershell -ExecutionPolicy Bypass -File replace-base64-final.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   SVG Font Base64 Replacer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if new_base64_code.txt exists
if (-not (Test-Path "new_base64_code.txt")) {
    Write-Host "[ERROR] File 'new_base64_code.txt' not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create file 'new_base64_code.txt' with your base64 code" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Read base64 from file (remove all whitespace and line breaks)
$base64Code = (Get-Content "new_base64_code.txt" -Raw).Trim()
$base64Code = $base64Code -replace '\s+', ''

if ([string]::IsNullOrEmpty($base64Code)) {
    Write-Host "[ERROR] File 'new_base64_code.txt' is empty!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Add your base64 code to the file and try again" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[OK] Base64 code loaded successfully" -ForegroundColor Green
Write-Host "[INFO] Code length: $($base64Code.Length) characters" -ForegroundColor Yellow
Write-Host ""
Write-Host "Searching for SVG files in current directory and subdirectories..." -ForegroundColor Cyan
Write-Host ""

# Find all SVG files recursively
$svgFiles = Get-ChildItem -Path "." -Filter "*.svg" -Recurse
$count = 0
$notFound = 0

if ($svgFiles.Count -eq 0) {
    Write-Host "[ERROR] No SVG files found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure SVG files are in current directory or subdirectories" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Found $($svgFiles.Count) SVG file(s)" -ForegroundColor Cyan
Write-Host ""

foreach ($file in $svgFiles) {
    $filePath = $file.FullName
    
    try {
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        # Check if file has YOUR_BASE64_HERE placeholder
        if ($content -like "*YOUR_BASE64_HERE*") {
            Write-Host "[UPDATING] $filePath" -ForegroundColor Yellow
            
            # Replace YOUR_BASE64_HERE with actual base64 code
            $newContent = $content -replace "YOUR_BASE64_HERE", $base64Code
            
            # Write updated content back to file
            Set-Content -Path $filePath -Value $newContent -Encoding UTF8
            $count++
            Write-Host "             OK - Successfully updated" -ForegroundColor Green
        }
        else {
            $notFound++
        }
    }
    catch {
        Write-Host "[ERROR] Failed to process file: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Completion Report" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Files updated: $count" -ForegroundColor Green
Write-Host "Files skipped: $notFound" -ForegroundColor Gray
Write-Host ""

if ($count -eq 0) {
    Write-Host "[WARNING] No SVG files with 'YOUR_BASE64_HERE' placeholder found" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Make sure your SVG files contain the text: YOUR_BASE64_HERE" -ForegroundColor Yellow
}
else {
    Write-Host "[SUCCESS] All SVG files updated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your SVG files now contain the base64 font code" -ForegroundColor Green
}

Write-Host ""
Read-Host "Press Enter to exit"