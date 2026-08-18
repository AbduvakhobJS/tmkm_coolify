# Free Library Agent - Backendni ishga tushirish
# Talab: avval .\setup.ps1 bir marta bajarilgan bo'lishi kerak.

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
Set-Location $root

& "$root\venv\Scripts\Activate.ps1"

Write-Host "Ollama serverini fon rejimida ishga tushirishga harakat qilinmoqda..." -ForegroundColor Cyan
$ollama = Get-Command ollama -ErrorAction SilentlyContinue
if ($ollama) {
    Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden -ErrorAction SilentlyContinue
} else {
    Write-Host "Ollama topilmadi - LLM javoblari ishlamaydi. https://ollama.com/download" -ForegroundColor Yellow
}

Write-Host "FastAPI backend http://localhost:8000 manzilida ishga tushmoqda..." -ForegroundColor Green
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
