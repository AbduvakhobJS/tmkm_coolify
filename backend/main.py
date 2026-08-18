import io
from typing import List, Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from knowledge_base import search_books
from llm import ask_llm
from piper_tts import synthesize_speech
from whisper_stt import transcribe_audio

app = FastAPI(title="Free Library Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatTurn(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatTurn]] = None


class ChatResponse(BaseModel):
    reply: str
    books: List[dict] = []


class TtsRequest(BaseModel):
    text: str


class TranscribeResponse(BaseModel):
    text: str


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/transcribe", response_model=TranscribeResponse)
async def transcribe(file: UploadFile = File(...)):
    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Bo'sh audio fayl yuborildi")
    try:
        text = transcribe_audio(audio_bytes)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return TranscribeResponse(text=text)


@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Xabar bo'sh bo'lishi mumkin emas")

    history = [turn.dict() for turn in req.history] if req.history else []
    relevant_books = search_books(req.message)

    try:
        reply = ask_llm(req.message, relevant_books, history)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    return ChatResponse(reply=reply, books=relevant_books)


@app.post("/api/tts")
def tts(req: TtsRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Matn bo'sh bo'lishi mumkin emas")
    try:
        wav_bytes = synthesize_speech(req.text)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    return StreamingResponse(io.BytesIO(wav_bytes), media_type="audio/wav")
