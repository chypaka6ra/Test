# SVG Font Processing Tool - All in One
# 1. Convert TTF to base64
# 2. Prepare SVG files
# 3. Replace base64 and font-family in SVG files
# Backups organized by font name: backups\FontName\files.txt
# Usage: powershell -ExecutionPolicy Bypass -File .\svg-font-processor.ps1

$scriptVersion = "1.0"

function Show-Menu {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   SVG Font Processor v$scriptVersion" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Select operation:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  [1] Step 1: Convert TTF to Base64" -ForegroundColor Green
    Write-Host "  [2] Step 2: Prepare SVG Files" -ForegroundColor Green
    Write-Host "  [3] Step 3: Replace Base64 & Font-Family" -ForegroundColor Green
    Write-Host ""
    Write-Host "  [4] Run All Steps (1->2->3)" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "  [0] Exit" -ForegroundColor Red
    Write-Host ""
}

function Convert-TTFtoBase64 {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   Step 1: TTF to Base64 Converter" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Get current directory
    $currentDir = Get-Location
    Write-Host "Working directory: $currentDir" -ForegroundColor Yellow
    Write-Host ""
    
    # Find all TTF files
    $ttfFiles = Get-ChildItem -Path "." -Filter "*.ttf" -File
    $ttfCount = $ttfFiles.Count
    
    if ($ttfCount -eq 0) {
        Write-Host "[ERROR] No TTF files found in current directory!" -ForegroundColor Red
        Write-Host ""
        return
    }
    
    Write-Host "Found $ttfCount TTF file(s):" -ForegroundColor Green
    Write-Host ""
    
    $i = 1
    foreach ($file in $ttfFiles) {
        Write-Host "  [$i] $($file.Name)" -ForegroundColor Cyan
        $i++
    }
    
    Write-Host ""
    
    # Select file
    if ($ttfCount -eq 1) {
        Write-Host "Only one TTF file found. Using it..." -ForegroundColor Green
        $selectedIndex = 0
    }
    else {
        Write-Host "Enter file number (1-$ttfCount):" -ForegroundColor Yellow
        $userInput = Read-Host "Select file"
        
        if (-not [int]::TryParse($userInput, [ref]0)) {
            Write-Host "[ERROR] Invalid input!" -ForegroundColor Red
            return
        }
        
        $selectedNumber = [int]$userInput
        if ($selectedNumber -lt 1 -or $selectedNumber -gt $ttfCount) {
            Write-Host "[ERROR] Number must be between 1 and $ttfCount" -ForegroundColor Red
            return
        }
        
        $selectedIndex = $selectedNumber - 1
    }
    
    $selectedFile = $ttfFiles[$selectedIndex]
    $fontPath = $selectedFile.FullName
    $fontNameRaw = $selectedFile.BaseName
    
    Write-Host ""
    Write-Host "[OK] Selected: $($selectedFile.Name)" -ForegroundColor Green
    
    # Extract font-family from filename
    $fontFamily = $fontNameRaw
    $fontFamily = $fontFamily -replace '-VariableFont.*', ''
    $fontFamily = $fontFamily -replace '-Regular$', ''
    $fontFamily = $fontFamily -replace '-Bold$', ''
    $fontFamily = $fontFamily -replace '-Italic$', ''
    $fontFamily = $fontFamily -replace '_', ' '
    $fontFamily = $fontFamily.Trim()
    
    Write-Host "[INFO] Auto-detected font-family: '$fontFamily'" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "Press Enter to accept, or type new name:" -ForegroundColor Yellow
    $userFontFamily = Read-Host "Font-family name"
    
    if (-not [string]::IsNullOrWhiteSpace($userFontFamily)) {
        $fontFamily = $userFontFamily.Trim()
    }
    
    Write-Host "[OK] Font-family: '$fontFamily'" -ForegroundColor Green
    Write-Host ""
    
    # Convert TTF to base64
    Write-Host "Reading file: $fontPath" -ForegroundColor Cyan
    
    try {
        $fontBytes = [System.IO.File]::ReadAllBytes($fontPath)
        Write-Host "[OK] File read successfully" -ForegroundColor Green
        Write-Host "[INFO] File size: $([math]::Round($fontBytes.Length / 1024, 2)) KB" -ForegroundColor Yellow
        
        Write-Host ""
        Write-Host "Converting to base64..." -ForegroundColor Cyan
        $base64String = [Convert]::ToBase64String($fontBytes)
        Write-Host "[OK] Conversion complete" -ForegroundColor Green
        Write-Host "[INFO] Base64 length: $($base64String.Length) characters" -ForegroundColor Yellow
        
        # Create backup directory structure: backups\FontName\
        Write-Host ""
        Write-Host "Creating backups..." -ForegroundColor Cyan
        
        $backupDir = "backups\$fontFamily"
        if (-not (Test-Path $backupDir)) {
            New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
            Write-Host "[OK] Backup directory created: $backupDir" -ForegroundColor Green
        }
        else {
            Write-Host "[OK] Backup directory exists: $backupDir" -ForegroundColor Green
        }
        
        $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
        
        # Backup existing files
        $base64File = "new_base64_code.txt"
        $fontFamilyFile = "font-family.txt"
        
        $base64BackupFile = "$backupDir\new_base64_code_$timestamp.txt"
        $fontFamilyBackupFile = "$backupDir\font-family_$timestamp.txt"
        
        if (Test-Path $base64File) {
            Copy-Item -Path $base64File -Destination $base64BackupFile -Force
            Write-Host "[OK] Backup: $base64File → $backupDir\new_base64_code_$timestamp.txt" -ForegroundColor Green
        }
        
        if (Test-Path $fontFamilyFile) {
            Copy-Item -Path $fontFamilyFile -Destination $fontFamilyBackupFile -Force
            Write-Host "[OK] Backup: $fontFamilyFile → $backupDir\font-family_$timestamp.txt" -ForegroundColor Green
        }
        
        # Save new files
        Write-Host ""
        Write-Host "Updating files..." -ForegroundColor Cyan
        
        Set-Content -Path $base64File -Value $base64String -Encoding UTF8
        Write-Host "[OK] Updated: $base64File" -ForegroundColor Green
        
        Set-Content -Path $fontFamilyFile -Value $fontFamily -Encoding UTF8
        Write-Host "[OK] Updated: $fontFamilyFile" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "   Step 1 Complete!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Font-family: '$fontFamily'" -ForegroundColor Cyan
        Write-Host "Backups location: $backupDir" -ForegroundColor Cyan
        
    }
    catch {
        Write-Host "[ERROR] Conversion failed: $_" -ForegroundColor Red
    }
}

function Prepare-SVGFiles {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   Step 2: Prepare SVG Files" -ForegroundColor Cyan
    Write-Host "   - Replace base64 with placeholder" -ForegroundColor Cyan
    Write-Host "   - Standardize font-family" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Searching for SVG files..." -ForegroundColor Cyan
    
    $svgFiles = Get-ChildItem -Path "." -Filter "*.svg" -Recurse
    $count = 0
    
    if ($svgFiles.Count -eq 0) {
        Write-Host "[ERROR] No SVG files found!" -ForegroundColor Red
        return
    }
    
    Write-Host "Found $($svgFiles.Count) SVG file(s)" -ForegroundColor Cyan
    Write-Host ""
    
    foreach ($file in $svgFiles) {
        $filePath = $file.FullName
        
        try {
            $content = Get-Content $filePath -Raw -Encoding UTF8
            $updated = $false
            $newContent = $content
            
            # Replace base64
            if ($newContent -like "*data:font/woff2;base64,*" -and $newContent -notlike "*YOUR_BASE64_HERE*") {
                Write-Host "[UPDATING] $filePath" -ForegroundColor Yellow
                
                $newContent = $newContent -replace 'data:font/woff2;base64,[A-Za-z0-9+/=]+', 'data:font/woff2;base64,YOUR_BASE64_HERE'
                $updated = $true
            }
            
            # Update font-family
            if ($newContent -like "*font-family*") {
                if ($newContent -notlike "*YOUR_FONT_FAMILY*") {
                    if (-not $updated) {
                        Write-Host "[UPDATING] $filePath" -ForegroundColor Yellow
                    }
                    
                    $newContent = $newContent -replace 'font-family="[^"]*"', 'font-family="YOUR_FONT_FAMILY"'
                    $newContent = $newContent -replace "font-family='[^']*'", "font-family='YOUR_FONT_FAMILY'"
                    $newContent = $newContent -replace "font-family\s*:\s*'[^']*'", "font-family: 'YOUR_FONT_FAMILY'"
                    $newContent = $newContent -replace 'font-family\s*:\s*"[^"]*"', 'font-family: "YOUR_FONT_FAMILY"'
                    
                    $updated = $true
                }
            }
            
            if ($updated) {
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
    Write-Host "   Step 2 Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Files prepared: $count" -ForegroundColor Green
}

function Replace-BaseAndFamily {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   Step 3: Replace Base64 & Font-Family" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Check files exist
    if (-not (Test-Path "new_base64_code.txt")) {
        Write-Host "[ERROR] File 'new_base64_code.txt' not found!" -ForegroundColor Red
        Write-Host "Run Step 1 first!" -ForegroundColor Yellow
        return
    }
    
    # Read base64
    $base64Content = Get-Content "new_base64_code.txt" -Raw
    $base64Code = $base64Content.Trim()
    $base64Code = $base64Code -replace '\s+', ''
    
    if ([string]::IsNullOrEmpty($base64Code)) {
        Write-Host "[ERROR] File 'new_base64_code.txt' is empty!" -ForegroundColor Red
        return
    }
    
    Write-Host "[OK] Base64 code loaded" -ForegroundColor Green
    Write-Host "[INFO] Code length: $($base64Code.Length) characters" -ForegroundColor Yellow
    
    # Read font-family
    $fontFamily = "Marck Script"
    
    if (Test-Path "font-family.txt") {
        $fontFamilyContent = Get-Content "font-family.txt" -Raw
        $fontFamily = $fontFamilyContent.Trim()
        
        if ([string]::IsNullOrEmpty($fontFamily)) {
            $fontFamily = "Marck Script"
        }
        else {
            Write-Host "[OK] Font family loaded: '$fontFamily'" -ForegroundColor Green
        }
    }
    else {
        Write-Host "[WARNING] File 'font-family.txt' not found, using default: '$fontFamily'" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Searching for SVG files..." -ForegroundColor Cyan
    Write-Host ""
    
    # Find SVG files
    $svgFiles = Get-ChildItem -Path "." -Filter "*.svg" -Recurse
    $count = 0
    $notFound = 0
    
    if ($svgFiles.Count -eq 0) {
        Write-Host "[ERROR] No SVG files found!" -ForegroundColor Red
        return
    }
    
    Write-Host "Found $($svgFiles.Count) SVG file(s)" -ForegroundColor Cyan
    Write-Host ""
    
    foreach ($file in $svgFiles) {
        $filePath = $file.FullName
        
        try {
            $content = Get-Content $filePath -Raw -Encoding UTF8
            
            if ($content -like "*YOUR_BASE64_HERE*") {
                Write-Host "[UPDATING] $filePath" -ForegroundColor Yellow
                
                $newContent = $content
                
                # Replace base64
                $newContent = $newContent -replace "YOUR_BASE64_HERE", $base64Code
                
                # Replace font-family
                $newContent = $newContent -replace 'font-family="YOUR_FONT_FAMILY"', "font-family=""$fontFamily"""
                $newContent = $newContent -replace "font-family='YOUR_FONT_FAMILY'", "font-family='$fontFamily'"
                $newContent = $newContent -replace "font-family:\s*'YOUR_FONT_FAMILY'", "font-family: '$fontFamily'"
                $newContent = $newContent -replace 'font-family:\s*"YOUR_FONT_FAMILY"', "font-family: ""$fontFamily"""
                
                Set-Content -Path $filePath -Value $newContent -Encoding UTF8 -Force
                $count++
                Write-Host "             OK - Updated" -ForegroundColor Green
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
    Write-Host "   Step 3 Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Files updated: $count" -ForegroundColor Green
    Write-Host "Files skipped: $notFound" -ForegroundColor Gray
}

function Run-AllSteps {
    Convert-TTFtoBase64
    Read-Host "Press Enter to continue to Step 2"
    
    Prepare-SVGFiles
    Read-Host "Press Enter to continue to Step 3"
    
    Replace-BaseAndFamily
}

# Main loop
do {
    Show-Menu
    $choice = Read-Host "Enter your choice (0-4)"
    
    switch ($choice) {
        "1" {
            Convert-TTFtoBase64
            Read-Host "Press Enter to continue"
        }
        "2" {
            Prepare-SVGFiles
            Read-Host "Press Enter to continue"
        }
        "3" {
            Replace-BaseAndFamily
            Read-Host "Press Enter to continue"
        }
        "4" {
            Run-AllSteps
            Read-Host "Press Enter to continue"
        }
        "0" {
            Write-Host ""
            Write-Host "Goodbye!" -ForegroundColor Green
            exit 0
        }
        default {
            Write-Host "[ERROR] Invalid choice!" -ForegroundColor Red
            Read-Host "Press Enter to continue"
        }
    }
} while ($true)