import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class BookCreate(BaseModel):
    title: str
    author: str
    available: bool = True


class BookUpdate(BaseModel):
    title: str | None = None
    author: str | None = None
    available: bool | None = None


books_db = {
    1: {"id": 1, "title": "Dune", "author": "Frank Herbert", "available": True},
    2: {"id": 2, "title": "Harry Potter", "author": "J. K. Rowling", "available": True},
    3: {"id": 3, "title": "Machine Learning Basics", "author": "A. Sharma", "available": False},
}
next_book_id = 4


@app.get("/")
def home():
    return {"message": "Library API running"}


@app.get("/books")
def get_books():
    return list(books_db.values())


@app.post("/books")
def create_book(book: BookCreate):
    global next_book_id

    created_book = {
        "id": next_book_id,
        "title": book.title,
        "author": book.author,
        "available": book.available,
    }
    books_db[next_book_id] = created_book
    next_book_id += 1

    return created_book


@app.patch("/books/{book_id}")
def update_book(book_id: int, book_update: BookUpdate):
    if book_id not in books_db:
        raise HTTPException(status_code=404, detail="Book not found")

    book = books_db[book_id]
    updates = book_update.model_dump(exclude_unset=True)
    book.update(updates)

    return book


@app.delete("/books/{book_id}")
def delete_book(book_id: int):
    if book_id not in books_db:
        raise HTTPException(status_code=404, detail="Book not found")

    del books_db[book_id]
    return {"message": "Book deleted"}


@app.post("/books/{book_id}/summary")
def summarize_book(book_id: int):
    if book_id not in books_db:
        raise HTTPException(status_code=404, detail="Book not found")

    book = books_db[book_id]
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        return {
            "summary": (
                f"{book['title']} by {book['author']} is marked as "
                f"{'available' if book['available'] else 'borrowed'} in the library."
            )
        }

    try:
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Summarize library books clearly in two short sentences.",
                },
                {
                    "role": "user",
                    "content": f"Summarize this book: {book['title']} by {book['author']}.",
                },
            ],
        )

        return {"summary": response.choices[0].message.content}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
