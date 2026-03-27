@echo off
REM Morabaraba Icon Generator - Creates PNG icons from SVG
REM Requires: Node.js with sharp package or manual PNG creation

echo.
echo =====================================
echo   Morabaraba PWA Icon Generator
echo =====================================
echo.
echo Option 1: Using Node.js with sharp
echo -----------------------------------
echo Run: npm install -D sharp
echo Then: node generate-icons-sharp.js
echo.
echo Option 2: Manual PNG creation
echo -----------------------------------
echo 1. Open generate-icons.html in your browser
echo 2. Click the download buttons
echo 3. Save files to public/icons/
echo.
echo Option 3: Use online converter
echo -----------------------------------
echo Convert public/icons/icon.svg to PNG at:
echo - https://cloudconvert.com/svg-to-png
echo - Set size to 192x192 and 512x512
echo.
echo For now, copying SVG as fallback PNG placeholder...
echo.

REM Create placeholder files (these should be replaced with real PNGs)
copy /Y "public\icons\icon.svg" "public\icons\icon-192.png" >nul 2>&1
copy /Y "public\icons\icon.svg" "public\icons\icon-512.png" >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo [WARN] SVG files copied as PNG placeholders
    echo [INFO] Please replace with actual PNG files for production
) else (
    echo [ERROR] Failed to create placeholder files
)

echo.
echo =====================================
echo   See README-ICONS.md for details
echo =====================================
echo.
