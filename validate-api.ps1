# ===============================================================
#         ⚡ EVENTPULSE - VALIDADOR DE API BACKEND ⚡
# ===============================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Clear-Host

Write-Host "===============================================================" -ForegroundColor Magenta
Write-Host "        ⚡ EVENTPULSE - VALIDADOR DE API BACKEND ⚡            " -ForegroundColor Magenta
Write-Host "===============================================================" -ForegroundColor Magenta
Write-Host ""

# Verifica se o Node.js está instalado
$nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeInstalled) {
    Write-Host "[ERRO] Node.js não foi encontrado no PATH do sistema." -ForegroundColor Red
    Write-Host "Instale o Node.js para executar os testes automatizados da API." -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair..."
    exit 1
}

# Solicita a URL da API
$inputUrl = Read-Host "Informe a URL base da API a testar [Padrão: http://localhost:3333]"
if ([string]::IsNullOrWhiteSpace($inputUrl)) {
    $apiUrl = "http://localhost:3333"
} else {
    $apiUrl = $inputUrl.Trim()
}

Write-Host ""
Write-Host "Iniciando bateria de validação em: $apiUrl" -ForegroundColor Cyan
Write-Host ""

# Executa o runner
node "$PSScriptRoot\scripts\validate-api.mjs" "$apiUrl"

Write-Host ""
Read-Host "Pressione Enter para encerrar..."
