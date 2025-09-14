@echo off
echo ======================================
echo    Installation du Bot Discord
echo ======================================
echo.

echo Verification de Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Node.js n'est pas installe ou pas dans le PATH
    echo.
    echo Veuillez installer Node.js depuis https://nodejs.org/
    echo Assurez-vous de cocher "Add to PATH" pendant l'installation
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js est installe !
echo.

echo Verification de npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] npm n'est pas disponible
    echo.
    pause
    exit /b 1
)

echo [OK] npm est disponible !
echo.

echo Installation des dependances...
npm install

if errorlevel 1 (
    echo.
    echo [ERREUR] Echec de l'installation des dependances
    echo.
    pause
    exit /b 1
)

echo.
echo ======================================
echo    Installation terminee avec succes !
echo ======================================
echo.
echo Prochaines etapes :
echo 1. Creez un fichier .env avec votre token Discord
echo 2. Lancez le bot avec : npm start
echo.
pause