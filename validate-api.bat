@echo off
chcp 65001 >nul
cls

echo ===============================================================
echo         ⚡ EVENTPULSE - VALIDADOR DE API BACKEND ⚡
echo ===============================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] Node.js não foi encontrado no sistema.
    echo Por favor, instale o Node.js para executar este script de validação.
    echo.
    pause
    exit /b 1
)

set /p API_URL="Informe a URL base da API a testar [Padrão: http://localhost:3333]: "
if "%API_URL%"=="" set API_URL=http://localhost:3333

echo.
echo Iniciando testes em: %API_URL%
echo.

node scripts\validate-api.mjs %API_URL%

echo.
pause
