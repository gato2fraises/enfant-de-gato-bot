@echo off
echo ======================================
echo      Demarrage du Bot Discord
echo ======================================
echo.

echo Verification de l'environnement...

if not exist .env (
    echo [ATTENTION] Fichier .env manquant !
    echo.
    echo Creez un fichier .env avec votre token Discord :
    echo DISCORD_TOKEN=votre_token_ici
    echo.
    echo Vous pouvez copier .env.example vers .env et modifier les valeurs.
    echo.
    pause
    exit /b 1
)

echo [OK] Fichier .env trouve !
echo.

echo Demarrage du bot...
node index.js

echo.
echo Le bot s'est arrete.
pause