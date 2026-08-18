import os
import subprocess
import sys
import tempfile
from pathlib import Path

BACKEND_DIR = Path(__file__).parent
PIPER_DIR = BACKEND_DIR / "piper"
PIPER_BIN = PIPER_DIR / ("piper.exe" if sys.platform == "win32" else "piper")

VOICES_DIR = BACKEND_DIR / "voices"
VOICE_NAME = os.environ.get("PIPER_VOICE", "ru_RU-irina-medium")
VOICE_MODEL = VOICES_DIR / f"{VOICE_NAME}.onnx"


def synthesize_speech(text: str) -> bytes:
    if not PIPER_BIN.exists():
        raise RuntimeError(
            f"Piper topilmadi: {PIPER_BIN}. Avval backend/setup.ps1 skriptini "
            "ishga tushiring - u Piper binary'sini avtomatik yuklab oladi."
        )
    if not VOICE_MODEL.exists():
        raise RuntimeError(
            f"Ovoz modeli topilmadi: {VOICE_MODEL}. Avval backend/setup.ps1 skriptini "
            "ishga tushiring - u ovoz modelini avtomatik yuklab oladi."
        )

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        out_path = f.name

    try:
        result = subprocess.run(
            [str(PIPER_BIN), "--model", str(VOICE_MODEL), "--output_file", out_path],
            input=text.encode("utf-8"),
            capture_output=True,
        )
        if result.returncode != 0:
            raise RuntimeError(
                f"Piper TTS xatosi: {result.stderr.decode(errors='ignore')}"
            )
        with open(out_path, "rb") as wav_file:
            return wav_file.read()
    finally:
        os.unlink(out_path)
