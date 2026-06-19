import os
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from openai import OpenAI

# -------------------
# Load environment
# -------------------
load_dotenv()

API_KEY = os.getenv("OPENAI_API_KEY")
print("OPENAI KEY:", os.getenv("OPENAI_API_KEY"))

if not API_KEY:
    raise Exception("OPENAI_API_KEY not found in .env")

client = OpenAI(api_key=API_KEY)

# -------------------
# FastAPI app
# -------------------
app = FastAPI()

# -------------------
# Dummy Book DB (replace with PostgreSQL later if needed)
# -------------------
books_db = {
    1: {
        "title": "Dune",
        "content": "Dune is a science fiction novel about politics, desert planets, and survival."
    },
    2: {
        "title": "Harry Potter",
        "content": "A young wizard discovers his magical world and fights dark forces."
    }
}

# -------------------
# Request model (optional for AI endpoints)
# -------------------
class ChatRequest(BaseModel):
    message: str


# -------------------
# Root test
# -------------------
@app.get("/")
def home():
    return {"message": "Library API Running 🚀"}


# -------------------
# Get all books
# -------------------
@app.get("/books")
def get_books():
    return books_db


# -------------------
# Get book by ID
# -------------------
@app.get("/books/{book_id}")
def get_book(book_id: int):
    if book_id not in books_db:
        raise HTTPException(status_code=404, detail="Book not found")
    return books_db[book_id]


# -------------------
# AI SUMMARY ENDPOINT (IMPORTANT)
# -------------------
@app.get("/summary/{book_id}")
def summarize_book(book_id: int):
    if book_id not in books_db:
        raise HTTPException(status_code=404, detail="Book not found")

    book = books_db[book_id]

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that summarizes books clearly."
                },
                {
                    "role": "user",
                    "content": f"Summarize this book:\n\nTitle: {book['title']}\nContent: {book['content']}"
                }
            ]
        )

        return {
            "book": book["title"],
            "summary": response.choices[0].message.content
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------------
# SIMPLE CHAT ENDPOINT (optional AI test)
# -------------------
@app.post("/chat")
def chat(req: ChatRequest):
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "user", "content": req.message}
            ]
        )

        return {
            "reply": response.choices[0].message.content
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))