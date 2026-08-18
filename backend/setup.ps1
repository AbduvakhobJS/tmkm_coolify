# Free Library Agent - Backend Setup
# Bu skript butun backendni bir marta ishga tushirish uchun tayyorlaydi:
#   1) Python virtual environment yaratadi
#   2) Kerakli Python kutubxonalarini o'rnatadi (Whisper, FastAPI)
#   3) Piper TTS binary'sini yuklab oladi (Windows uchun rasmiy release)
#   4) Piper uchun ovoz modelini avtomatik yuklab oladi
#   5) Ollama borligini tekshiradi va tavsiya etilgan LLM modelini yuklaydi
#
# Ishga tushirish: PowerShell'da backend papkasida
#   .\setup.ps1

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
Set-Location $root

Write-Host "== 1/5: Python virtual environment ==" -ForegroundColor Cyan
if (-not (Test-Path "$root\venv")) {
    python -m venv venv
} else {
    Write-Host "venv allaqachon mavjud, o'tkazib yuborildi." -ForegroundColor Yellow
}

& "$root\venv\Scripts\Activate.ps1"

Write-Host "== 2/5: Python kutubxonalarini o'rnatish ==" -ForegroundColor Cyan
python -m pip install --upgrade pip
pip install -r requirements.txt

Write-Host "== 3/5: Piper TTS binary'sini yuklab olish ==" -ForegroundColor Cyan
# piper-tts pip paketi Windows uchun wheel'ga ega emas (piper-phonemize),
# shu sabab rasmiy standalone Windows binary ishlatiladi.
$piperDir = "$root\piper"
if (-not (Test-Path "$piperDir\piper.exe")) {
    New-Item -ItemType Directory -Force -Path $piperDir | Out-Null
    $zipPath = "$root\piper_windows_amd64.zip"
    Write-Host "Piper binary yuklanmoqda (~90MB)..."
    Invoke-WebRequest -Uri "https://github.com/rhasspy/piper/releases/latest/download/piper_windows_amd64.zip" -OutFile $zipPath
    Expand-Archive -Path $zipPath -DestinationPath "$root\_piper_extract" -Force
    # Arxiv ichida "piper" papkasi bo'ladi - tarkibini piper/ ga ko'chiramiz
    $extracted = Get-ChildItem "$root\_piper_extract" -Directory | Select-Object -First 1
    Copy-Item "$($extracted.FullName)\*" $piperDir -Recurse -Force
    Remove-Item "$root\_piper_extract" -Recurse -Force
    Remove-Item $zipPath -Force
} else {
    Write-Host "Piper binary allaqachon mavjud, o'tkazib yuborildi." -ForegroundColor Yellow
}

Write-Host "== 4/5: Piper ovoz modelini yuklab olish (ru_RU-irina-medium) ==" -ForegroundColor Cyan
$voicesDir = "$root\voices"
New-Item -ItemType Directory -Force -Path $voicesDir | Out-Null

$onnxPath = "$voicesDir\ru_RU-irina-medium.onnx"
$jsonPath = "$voicesDir\ru_RU-irina-medium.onnx.json"
$baseUrl = "https://huggingface.co/rhasspy/piper-voices/resolve/main/ru/ru_RU/irina/medium"

if (-not (Test-Path $onnxPath)) {
    Write-Host "Ovoz modeli yuklanmoqda (~60MB)..."
    Invoke-WebRequest -Uri "$baseUrl/ru_RU-irina-medium.onnx" -OutFile $onnxPath
} else {
    Write-Host "Ovoz modeli allaqachon mavjud, o'tkazib yuborildi." -ForegroundColor Yellow
}

if (-not (Test-Path $jsonPath)) {
    Invoke-WebRequest -Uri "$baseUrl/ru_RU-irina-medium.onnx.json" -OutFile $jsonPath
}

Write-Host "== 5/5: Ollama va LLM modelini tekshirish ==" -ForegroundColor Cyan
$ollama = Get-Command ollama -ErrorAction SilentlyContinue
if ($ollama) {
    Write-Host "Ollama topildi. 'qwen2.5:1.5b' modelini yuklab olish (agar mavjud bo'lmasa)..."
    ollama pull qwen2.5:1.5b
} else {
    Write-Host ""
    Write-Host "DIQQAT: Ollama topilmadi!" -ForegroundColor Red
    Write-Host "Iltimos https://ollama.com/download saytidan Ollama'ni o'rnating," -ForegroundColor Red
    Write-Host "so'ngra quyidagi buyruqni bajaring:" -ForegroundColor Red
    Write-Host "    ollama pull qwen2.5:1.5b" -ForegroundColor Red
    Write-Host ""
}

Write-Host ""
Write-Host "Setup tugadi! Backendni ishga tushirish uchun: .\start.ps1" -ForegroundColor Green
