# Free Library Agent — Backend

`LibraryAgent.tsx` (D-ID) o'rniga ishlaydigan, **100% bepul va local** AI kutubxona
konsultanti. API key kerak emas, barcha komponentlar sizning kompyuteringizda ishlaydi.

## Arxitektura

```
Mikrofon → Whisper (STT) → Ollama LLM (+ kitoblar bazasi) → Piper (TTS) → Avatar lip-sync → Foydalanuvchi
```

| Qism | Texnologiya | Nega shu tanlandi |
|---|---|---|
| Backend | Python + FastAPI | Yengil, tez, kam dependency |
| STT (nutqni matnga) | `faster-whisper` (CPU, `small` model) | GPU shart emas, API key shart emas |
| LLM | Ollama + `qwen2.5:1.5b` | Kichik va tez model, oddiy noutbukda ham ishlaydi |
| TTS (matnni ovozga) | Piper (rasmiy Windows binary) | `piper-tts` pip paketi Windows uchun wheel'ga ega emas (`piper-phonemize`), shu sabab rasmiy standalone binary ishlatiladi |
| Bilim bazasi | `data/books.json` + kalit so'z qidiruvi | Vektor DB/embedding server shart emas — eng yengil variant |
| Avatar lip-sync | Frontendda SVG + Web Audio amplitudasi | MuseTalk/LiveTalking GPU va og'ir video-generatsiya talab qiladi — "eng yengil" talabiga zid. Shu sabab ovoz balandligiga qarab og'iz animatsiyasi ishlatildi (real vaqtli, 0 qo'shimcha dependency) |

> **Eslatma (Piper ovozi haqida):** Piper'da rasmiy o'zbekcha ovoz mavjud emas.
> Shuning uchun standart sifatida o'zbek tilida ham keng tushuniladigan
> **ruscha** ovoz (`ru_RU-irina-medium`) ishlatilgan. Agentning matnli/LLM javoblari
> to'liq o'zbek tilida bo'ladi — faqat TTS ovozi ruscha talaffuzda eshitiladi.
> Xohlasangiz `backend/piper_tts.py` dagi `PIPER_VOICE` orqali boshqa ovozga
> (masalan inglizcha) almashtirishingiz mumkin — voices ro'yxati:
> https://rhasspy.github.io/piper-samples/

## O'rnatish (bir marta)

Talablar: [Python 3.10+](https://www.python.org/downloads/) va
[Ollama](https://ollama.com/download) kompyuterda o'rnatilgan bo'lishi kerak.

```powershell
cd backend
.\setup.ps1
```

Bu skript avtomatik ravishda:
1. Python virtual environment (`venv`) yaratadi
2. `requirements.txt` dagi barcha kutubxonalarni o'rnatadi (Whisper, FastAPI)
3. Piper TTS binary'sini (`piper/piper.exe`, ~90MB, rasmiy GitHub release) yuklab oladi
4. Piper uchun ovoz modelini (`voices/ru_RU-irina-medium.onnx`, ~60MB) yuklab oladi
5. Ollama mavjudligini tekshiradi va `qwen2.5:1.5b` modelini yuklaydi (~1GB)

Agar Ollama o'rnatilmagan bo'lsa, skript ogohlantiradi — avval
https://ollama.com/download dan o'rnating, so'ng `setup.ps1` ni qayta ishga tushiring.

## Ishga tushirish

```powershell
cd backend
.\start.ps1
```

Bu Ollama serverini (agar ishlamayotgan bo'lsa) fonda ishga tushiradi va
FastAPI backendni `http://localhost:8000` da ochadi.

Tekshirish uchun brauzerda oching: http://localhost:8000/api/health — `{"status": "ok"}` ko'rinishi kerak.

## Frontendni ishga tushirish

Backend ishga tushgandan so'ng, alohida terminalda loyihaning tub papkasida:

```bash
npm install --legacy-peer-deps
npm start
```

So'ng brauzerda: `http://localhost:3000/main/free-agent`

Frontend standart holda `http://localhost:8000` backendga ulanadi. Agar backend
boshqa manzilda ishlasa, `.env` faylida quyidagini belgilang:

```
REACT_APP_FREE_AGENT_API=http://localhost:8000
```

## Kitoblar bazasini kengaytirish

`backend/data/books.json` faylini oching va shu formatda yangi kitoblar qo'shing:

```json
{
  "title": "Kitob nomi",
  "author": "Muallif",
  "genre": "janr",
  "summary": "Qisqa mazmuni"
}
```

Fayl saqlangach, backendni qayta ishga tushirish shart emas — har bir so'rovda
qayta o'qiladi.

## Modelni almashtirish (kuchliroq/tezroq javob uchun)

Standart `qwen2.5:1.5b` eng yengil va tez variant. Agar kompyuteringiz kuchliroq
bo'lsa, sifatliroq javoblar uchun:

```powershell
ollama pull qwen2.5:3b
```

va `backend/llm.py` dagi `MODEL_NAME` ni yoki `OLLAMA_MODEL` environment
o'zgaruvchisini `qwen2.5:3b` ga o'zgartiring.

## Muammolarni bartaraf etish

- **"Ollama serveriga ulanib bo'lmadi"** — `ollama serve` alohida terminalda
  ishga tushirilganini tekshiring.
- **"Ovoz modeli topilmadi"** — `.\setup.ps1` ni qayta ishga tushiring yoki
  `backend/voices/` papkasida `.onnx` va `.onnx.json` fayllar borligini tekshiring.
- **Mikrofon ishlamayapti** — brauzer HTTPS yoki `localhost` orqali ochilganini
  tekshiring (boshqa domenlarda mikrofonga ruxsat berilmaydi).
- **Birinchi javob sekin keladi** — Whisper va Ollama modellari birinchi
  so'rovda xotiraga yuklanadi, keyingi so'rovlar tezroq bo'ladi.
