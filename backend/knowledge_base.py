import json
from pathlib import Path
from typing import List, Dict

DATA_PATH = Path(__file__).parent / "data" / "books.json"


def load_books() -> List[Dict]:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def search_books(query: str, top_k: int = 3) -> List[Dict]:
    """Oddiy kalit so'z ustma-ustligi bo'yicha qidiruv.

    Vektor bazasi yoki tashqi embedding xizmati talab qilmaydi -
    shu bilan backend eng yengil holatda qoladi.
    """
    books = load_books()
    query_words = {w for w in query.lower().split() if len(w) > 2}
    if not query_words:
        return []

    scored = []
    for book in books:
        haystack = f"{book['title']} {book['author']} {book['genre']} {book['summary']}".lower()
        score = sum(1 for w in query_words if w in haystack)
        if score > 0:
            scored.append((score, book))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [b for _, b in scored[:top_k]]
