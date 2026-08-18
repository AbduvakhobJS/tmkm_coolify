import os
import tempfile
from typing import Optional

from faster_whisper import WhisperModel

_model: Optional[WhisperModel] = None

MODEL_SIZE = os.environ.get("WHISPER_MODEL", "small")


def get_model() -> WhisperModel:
    global _model
    if _model is None:
        # CPU + int8 - qo'shimcha GPU/CUDA talab qilmaydi, oddiy kompyuterda ishlaydi.
        _model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")
    return _model


def transcribe_audio(audio_bytes: bytes) -> str:
    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as f:
        f.write(audio_bytes)
        path = f.name

    try:
        model = get_model()
        segments, _info = model.transcribe(path, vad_filter=True)
        text = " ".join(segment.text.strip() for segment in segments)
        return text.strip()
    finally:
        os.unlink(path)
