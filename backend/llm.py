import os
from typing import List, Dict

import requests

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434/api/generate")
MODEL_NAME = os.environ.get("OLLAMA_MODEL", "qwen2.5:1.5b")

SYSTEM_PROMPT = (
    "Sen kutubxonadagi do'stona va bilimdon ayol konsultantsan. "
    "Foydalanuvchilarga kitoblar haqida yordam berasan. "
    "Javoblaring qisqa, samimiy va 2-3 gapdan oshmasin, chunki javob ovozga aylantiriladi. "
    "Agar quyida tegishli kitoblar ro'yxati berilgan bo'lsa, javobingda ulardan foydalan. "
    "Agar mos kitob topilmasa, umumiy bilimingdan foydalanib qisqa javob ber."
)


def _build_prompt(message: str, context_books: List[Dict], history: List[Dict]) -> str:
    parts = [SYSTEM_PROMPT]

    if context_books:
        lines = [
            f"- \"{b['title']}\" ({b['author']}): {b['summary']}"
            for b in context_books
        ]
        parts.append("Kutubxona katalogidan tegishli kitoblar:\n" + "\n".join(lines))

    if history:
        convo = []
        for turn in history[-6:]:
            role = "Foydalanuvchi" if turn.get("role") == "user" else "Konsultant"
            convo.append(f"{role}: {turn.get('content', '')}")
        parts.append("Suhbat tarixi:\n" + "\n".join(convo))

    parts.append(f"Foydalanuvchi savoli: {message}\nKonsultant javobi:")
    return "\n\n".join(parts)


def ask_llm(message: str, context_books: List[Dict], history: List[Dict]) -> str:
    prompt = _build_prompt(message, context_books, history)

    try:
        response = requests.post(
            OLLAMA_URL,
            json={"model": MODEL_NAME, "prompt": prompt, "stream": False},
            timeout=120,
        )
        response.raise_for_status()
    except requests.exceptions.ConnectionError as exc:
        raise RuntimeError(
            "Ollama serveriga ulanib bo'lmadi. Ollama ishga tushirilganligiga "
            "ishonch hosil qiling ('ollama serve') va '{}' modeli yuklab olinganligini "
            "tekshiring.".format(MODEL_NAME)
        ) from exc

    data = response.json()
    return data.get("response", "").strip()
