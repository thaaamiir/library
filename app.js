const bookForm = document.getElementById('bookForm');
const titleInput = document.getElementById('titleInput');
const authorInput = document.getElementById('authorInput');
const searchInput = document.getElementById('searchInput');
const statusBox = document.getElementById('statusBox');
const bookGrid = document.getElementById('bookGrid');

const STORAGE_KEY = 'library-management-books';

let library = loadBooks();

function loadBooks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveBooks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
}

function setStatus(message) {
  statusBox.textContent = message;
}

function renderBooks(items = library) {
  if (!items.length) {
    bookGrid.innerHTML = '<p class="status-box">No books found.</p>';
    return;
  }

  bookGrid.innerHTML = items
    .map((book) => `
      <article class="book-card">
        <h3>${book.title}</h3>
        <div class="book-meta">Author: ${book.author}</div>
        <span class="state ${book.available ? '' : 'borrowed'}">${book.available ? 'Available' : 'Borrowed'}</span>
        <div class="book-actions">
          <button data-action="borrow" data-title="${book.title}">Borrow</button>
          <button data-action="return" data-title="${book.title}">Return</button>
          <button data-action="delete" data-title="${book.title}">Delete</button>
        </div>
      </article>
    `)
    .join('');
}

function addBook(title, author) {
  if (!title.trim() || !author.trim()) {
    setStatus('Please enter both the title and author.');
    return;
  }

  const exists = library.some((book) => book.title.toLowerCase() === title.trim().toLowerCase());
  if (exists) {
    setStatus('This book already exists in the library.');
    return;
  }

  library.unshift({ title: title.trim(), author: author.trim(), available: true });
  saveBooks();
  renderBooks();
  setStatus(`Added “${title.trim()}” by ${author.trim()}.`);
  bookForm.reset();
}

function borrowBook(title) {
  const book = library.find((item) => item.title.toLowerCase() === title.toLowerCase());
  if (!book) {
    setStatus('Book not found.');
    return;
  }

  if (!book.available) {
    setStatus('This book is already borrowed.');
    return;
  }

  book.available = false;
  saveBooks();
  renderBooks();
  setStatus(`Borrowed “${book.title}”.`);
}

function returnBook(title) {
  const book = library.find((item) => item.title.toLowerCase() === title.toLowerCase());
  if (!book) {
    setStatus('Book not found.');
    return;
  }

  book.available = true;
  saveBooks();
  renderBooks();
  setStatus(`Returned “${book.title}”.`);
}

function deleteBook(title) {
  const originalLength = library.length;
  library = library.filter((item) => item.title.toLowerCase() !== title.toLowerCase());
  if (library.length === originalLength) {
    setStatus('Book not found.');
    return;
  }

  saveBooks();
  renderBooks();
  setStatus(`Deleted “${title}”.`);
}

bookForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addBook(titleInput.value, authorInput.value);
});

document.getElementById('viewBtn').addEventListener('click', () => {
  renderBooks();
  setStatus('Showing all books in the library.');
});

document.getElementById('searchBtn').addEventListener('click', () => {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    renderBooks();
    setStatus('Enter a title to search.');
    return;
  }

  const result = library.filter((book) => book.title.toLowerCase().includes(query));
  renderBooks(result);
  setStatus(result.length ? `Found ${result.length} matching book(s).` : 'No books matched your search.');
});

document.getElementById('saveBtn').addEventListener('click', () => {
  saveBooks();
  setStatus('Books saved to local storage.');
});

document.getElementById('loadBtn').addEventListener('click', () => {
  library = loadBooks();
  renderBooks();
  setStatus(library.length ? 'Books loaded from local storage.' : 'No saved books were found.');
});

bookGrid.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const action = button.dataset.action;
  const title = button.dataset.title;

  if (action === 'borrow') borrowBook(title);
  if (action === 'return') returnBook(title);
  if (action === 'delete') deleteBook(title);
});

searchInput.addEventListener('input', (event) => {
  const query = event.target.value.trim().toLowerCase();
  if (!query) {
    renderBooks();
    setStatus('Showing all books in the library.');
  }
});

renderBooks();
setStatus('Library loaded. Add a book to get started.');
