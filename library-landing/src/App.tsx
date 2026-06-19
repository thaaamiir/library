import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from './framer-motion-fallback';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Globe,
  Instagram,
  Library,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Twitter,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Book {
  id: number;
  title: string;
  author: string;
  available: boolean;
}

interface Activity {
  id: number;
  title: string;
  action: 'Borrowed' | 'Returned';
}

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';
const API_URL = `${API_BASE}/books`;

const navItems = ['Dashboard', 'Books', 'Borrowed', 'Search'];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

function CinematicVideo({ className = '' }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fadeFrameRef = useRef<number | null>(null);
  const fadingOutRef = useRef(false);
  const opacityRef = useRef(0);

  const cancelFade = () => {
    if (fadeFrameRef.current !== null) {
      window.cancelAnimationFrame(fadeFrameRef.current);
      fadeFrameRef.current = null;
    }
  };

  const fadeTo = (targetOpacity: number, duration = 500) => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    cancelFade();

    const startOpacity = opacityRef.current;
    const startedAt = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const nextOpacity = startOpacity + (targetOpacity - startOpacity) * progress;

      opacityRef.current = nextOpacity;
      video.style.opacity = String(nextOpacity);

      if (progress < 1) {
        fadeFrameRef.current = window.requestAnimationFrame(animate);
      } else {
        fadeFrameRef.current = null;
      }
    };

    fadeFrameRef.current = window.requestAnimationFrame(animate);
  };

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return undefined;
    }

    video.style.opacity = '0';
    opacityRef.current = 0;

    const handleLoadedData = () => {
      fadingOutRef.current = false;
      fadeTo(1);
    };

    const handleTimeUpdate = () => {
      if (!video.duration || Number.isNaN(video.duration)) {
        return;
      }

      if (video.duration - video.currentTime <= 0.55 && !fadingOutRef.current) {
        fadingOutRef.current = true;
        fadeTo(0);
      }
    };

    const handleEnded = () => {
      cancelFade();
      opacityRef.current = 0;
      video.style.opacity = '0';

      window.setTimeout(() => {
        video.currentTime = 0;
        fadingOutRef.current = false;
        void video.play();
        fadeTo(1);
      }, 100);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      cancelFade();
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className={`absolute inset-0 h-full w-full translate-y-[17%] object-cover ${className}`}
      src={VIDEO_SRC}
      muted
      autoPlay
      playsInline
    />
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      variants={fadeUp}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="mx-auto mb-12 max-w-3xl text-center"
    >
      <p className="mb-3 text-xs font-semibold uppercase text-white/50">{eyebrow}</p>
      <h2
        className="text-5xl text-white md:text-6xl"
        style={{ fontFamily: "'Instrument Serif', serif", letterSpacing: 0 }}
      >
        {title}
      </h2>
    </motion.div>
  );
}

function CountCard({
  label,
  value,
  icon: Icon,
  delay = 0,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  delay?: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 22, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
      className="liquid-glass rounded-3xl p-6"
    >
      <div className="mb-8 flex items-center justify-between">
        <div className="liquid-glass rounded-full p-3 text-white/85">
          <Icon size={22} aria-hidden="true" />
        </div>
        <ArrowRight size={18} className="text-white/35" aria-hidden="true" />
      </div>
      <p
        className="text-5xl text-white"
        style={{ fontFamily: "'Instrument Serif', serif", letterSpacing: 0 }}
      >
        {value}
      </p>
      <p className="mt-2 text-sm font-medium text-white/60">{label}</p>
    </motion.article>
  );
}

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [activity, setActivity] = useState<Activity[]>([
    { id: 1, title: 'Machine Learning Basics', action: 'Borrowed' },
  ]);
  const [bookName, setBookName] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [heroSearch, setHeroSearch] = useState('');
  const [error, setError] = useState('');
  const [summaryText, setSummaryText] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [selectedSummaryBookId, setSelectedSummaryBookId] = useState<number | null>(null);
  const [booksLoading, setBooksLoading] = useState(true);
  const [booksError, setBooksError] = useState('');
  const dashboardRef = useRef<HTMLElement | null>(null);
  const dashboardInView = useInView(dashboardRef, { once: true, amount: 0.25 });

  useEffect(() => {
    const controller = new AbortController();

    const loadBooks = async () => {
      try {
        setBooksLoading(true);
        setBooksError('');

        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }

        const data = (await response.json()) as Book[];
        setBooks(data);
      } catch (caughtError) {
        if (caughtError instanceof DOMException && caughtError.name === 'AbortError') {
          return;
        }

        setBooksError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Could not load books from the backend.',
        );
      } finally {
        if (!controller.signal.aborted) {
          setBooksLoading(false);
        }
      }
    };

    void loadBooks();

    return () => controller.abort();
  }, []);

  const stats = useMemo(() => {
    const total = books.length;
    const available = books.filter((book) => book.available).length;

    return {
      total,
      available,
      borrowed: total - available,
    };
  }, [books]);

  const filteredBooks = useMemo(() => {
    const query = catalogSearch.trim().toLowerCase();

    if (!query) {
      return books;
    }

    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query),
    );
  }, [books, catalogSearch]);

  const borrowedActivity = activity.filter((item) => item.action === 'Borrowed');
  const returnedActivity = activity.filter((item) => item.action === 'Returned');

  const handleHeroSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCatalogSearch(heroSearch);
    document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAddBook = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!bookName.trim() || !authorName.trim()) {
      setError('Book name and author are required.');
      return;
    }

    try {
      setError('');
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: bookName.trim(),
          author: authorName.trim(),
          available: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Could not add book. Backend returned ${response.status}`);
      }

      const createdBook = (await response.json()) as Book;
      setBooks((currentBooks) => [...currentBooks, createdBook]);
      setBookName('');
      setAuthorName('');
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Could not add the book. Please try again.',
      );
    }
  };

  const updateAvailability = async (id: number, available: boolean, action: 'Borrowed' | 'Returned') => {
    const book = books.find((item) => item.id === id);
    if (!book) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ available }),
      });

      if (!response.ok) {
        throw new Error(`Could not update book. Backend returned ${response.status}`);
      }

      const updatedBook = (await response.json()) as Book;
      setError('');
      setBooks((currentBooks) =>
        currentBooks.map((item) => (item.id === id ? updatedBook : item)),
      );
      setActivity((currentActivity) => [
        { id: Date.now(), title: updatedBook.title, action },
        ...currentActivity,
      ]);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Could not update book availability. Please try again.',
      );
    }
  };

  const borrowBook = (id: number) => {
    updateAvailability(id, false, 'Borrowed');
  };

  const returnBook = (id: number) => {
    updateAvailability(id, true, 'Returned');
  };

  const deleteBook = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Could not delete book. Backend returned ${response.status}`);
      }

      setError('');
      setBooks((currentBooks) => currentBooks.filter((book) => book.id !== id));
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Could not delete the book. Please try again.',
      );
    }
  };

  const fetchBookSummary = async (bookId: number) => {
    const book = books.find((item) => item.id === bookId);
    if (!book) {
      return;
    }

    setSummaryLoading(true);
    setSummaryError('');
    setSummaryText('');
    setSelectedSummaryBookId(bookId);

    try {
      const response = await fetch(`${API_URL}/${bookId}/summary`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Could not generate summary. Backend returned ${response.status}`);
      }

      const data = await response.json();
      setSummaryText(data.summary ?? 'No summary returned.');
    } catch (caughtError) {
      setSummaryError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Could not generate book summary. Please try again.',
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <section className="relative flex min-h-screen flex-col overflow-hidden">
        <CinematicVideo />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_78%,rgba(255,255,255,0.1),transparent_30%),linear-gradient(180deg,rgba(0,0,0,0.45)_0%,rgba(0,0,0,0.12)_48%,rgba(0,0,0,0.88)_100%)]" />

        <nav className="relative z-20 px-5 py-6">
          <motion.div
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="liquid-glass mx-auto flex max-w-6xl items-center justify-between rounded-full px-5 py-3 md:px-6"
          >
            <a href="#" className="flex items-center gap-2 text-white">
              <Library size={24} aria-hidden="true" />
              <span className="text-lg font-semibold">LibraryHub</span>
            </a>

            <div className="hidden items-center gap-8 md:flex">
              {navItems.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm font-medium text-white/75 transition-colors hover:text-white"
                >
                  {item}
                </a>
              ))}
            </div>

            <a
              href="#books"
              className="liquid-glass rounded-full px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/5"
            >
              Add Book
            </a>
          </motion.div>
        </nav>

        <div className="relative z-10 mx-auto flex flex-1 flex-col items-center justify-center px-5 pb-12 pt-10 text-center">
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="mb-5 text-xs font-semibold uppercase text-white/55"
          >
            Intelligent Library Management
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.22, ease: 'easeOut' }}
            className="max-w-5xl text-5xl text-white md:text-7xl lg:text-8xl"
            style={{ fontFamily: "'Instrument Serif', serif", letterSpacing: 0 }}
          >
            Manage Every Book, Effortlessly
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.34 }}
            className="mt-6 max-w-2xl text-base leading-relaxed text-white/72 md:text-lg"
          >
            Add books, track borrowing activity, manage returns, and monitor library inventory in one
            intelligent system.
          </motion.p>

          <motion.form
            onSubmit={handleHeroSearch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.45 }}
            className="liquid-glass mt-9 flex w-full max-w-2xl flex-col gap-3 rounded-3xl p-2 sm:flex-row sm:rounded-full"
          >
            <div className="flex min-h-[52px] flex-1 items-center gap-3 px-4">
              <Search size={20} className="text-white/45" aria-hidden="true" />
              <input
                value={heroSearch}
                onChange={(event) => setHeroSearch(event.target.value)}
                placeholder="Search for a book..."
                className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/40"
                aria-label="Search for a book"
              />
            </div>
            <button className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.02]">
              Search
            </button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.56 }}
            className="mt-8 grid w-full max-w-4xl gap-4 md:grid-cols-3"
          >
            <CountCard label="Total Books" value={stats.total} icon={BookOpen} />
            <CountCard label="Available Books" value={stats.available} icon={CheckCircle2} delay={0.08} />
            <CountCard label="Borrowed Books" value={stats.borrowed} icon={Clock3} delay={0.16} />
          </motion.div>
        </div>
      </section>

      <section
        id="dashboard"
        ref={dashboardRef}
        className="relative bg-black px-5 py-24 md:py-32"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.07),transparent_28%),radial-gradient(circle_at_82%_68%,rgba(255,255,255,0.06),transparent_30%)]" />
        <div className="relative mx-auto max-w-6xl">
          <motion.div
            animate={dashboardInView ? 'visible' : 'hidden'}
            initial="hidden"
            variants={fadeUp}
            transition={{ duration: 0.7 }}
            className="mb-12 text-center"
          >
            <h2
              className="text-5xl text-white md:text-7xl"
              style={{ fontFamily: "'Instrument Serif', serif", letterSpacing: 0 }}
            >
              Library Overview
            </h2>
          </motion.div>
          <div className="grid gap-5 md:grid-cols-3">
            <CountCard label="Total Books" value={stats.total} icon={BookOpen} />
            <CountCard label="Available Books" value={stats.available} icon={CheckCircle2} delay={0.08} />
            <CountCard label="Borrowed Books" value={stats.borrowed} icon={Clock3} delay={0.16} />
          </div>
        </div>
      </section>

      <section id="books" className="relative overflow-hidden px-5 py-24 md:py-32">
        <CinematicVideo className="scale-110 opacity-70" />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.9),rgba(0,0,0,0.35),rgba(0,0,0,0.92))]" />
        <div className="relative mx-auto max-w-4xl">
          <SectionTitle eyebrow="Book Management" title="Manage Your Collection" />

          <motion.form
            onSubmit={handleAddBook}
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="liquid-glass rounded-3xl p-5 md:p-8"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-white/60">Book Name</span>
                <input
                  value={bookName}
                  onChange={(event) => setBookName(event.target.value)}
                  className="liquid-glass w-full rounded-full px-5 py-3 text-white outline-none placeholder:text-white/35"
                  placeholder="Book Name"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-white/60">Author Name</span>
                <input
                  value={authorName}
                  onChange={(event) => setAuthorName(event.target.value)}
                  className="liquid-glass w-full rounded-full px-5 py-3 text-white outline-none placeholder:text-white/35"
                  placeholder="Author Name"
                />
              </label>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <AnimatePresence>
                {error ? (
                  <motion.p
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="text-sm text-red-200"
                  >
                    {error}
                  </motion.p>
                ) : (
                  <span className="text-sm text-white/45">New books are added as available.</span>
                )}
              </AnimatePresence>
              <button className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.02]">
                <Plus size={18} aria-hidden="true" />
                Add Book
              </button>
            </div>
          </motion.form>
        </div>
      </section>

      <section id="search" className="bg-black px-5 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <SectionTitle eyebrow="Book Catalog" title="Search, Borrow, Return" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65 }}
            className="liquid-glass rounded-3xl p-4 md:p-6"
          >
            <div className="liquid-glass mb-5 flex items-center gap-3 rounded-full px-5 py-3">
              <Search size={19} className="text-white/45" aria-hidden="true" />
              <input
                value={catalogSearch}
                onChange={(event) => setCatalogSearch(event.target.value)}
                placeholder="Search by book or author..."
                className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/40"
                aria-label="Search catalog"
              />
            </div>

            <div className="overflow-x-auto">
              {booksLoading ? (
                <p className="rounded-2xl border border-white/10 px-4 py-5 text-sm text-white/55">
                  Loading books from the backend...
                </p>
              ) : booksError ? (
                <p className="rounded-2xl border border-red-300/25 bg-red-400/10 px-4 py-5 text-sm text-red-100">
                  Could not load books: {booksError}
                </p>
              ) : (
                <>
                  <table className="w-full min-w-[760px] border-separate border-spacing-y-3 text-left">
                    <thead>
                      <tr className="text-sm text-white/45">
                        <th className="px-4 py-2 font-medium">ID</th>
                        <th className="px-4 py-2 font-medium">Book Name</th>
                        <th className="px-4 py-2 font-medium">Author</th>
                        <th className="px-4 py-2 font-medium">Status</th>
                        <th className="px-4 py-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence initial={false}>
                        {filteredBooks.map((book) => (
                          <motion.tr
                            key={book.id}
                            layout
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.3 }}
                            className="liquid-glass rounded-2xl text-sm text-white"
                          >
                            <td className="rounded-l-2xl px-4 py-4 text-white/65">{book.id}</td>
                            <td className="px-4 py-4 font-medium">{book.title}</td>
                            <td className="px-4 py-4 text-white/70">{book.author}</td>
                            <td className="px-4 py-4">
                              <span
                                className={`liquid-glass rounded-full px-3 py-1 text-xs font-semibold ${
                                  book.available
                                    ? 'status-badge-available text-emerald-100'
                                    : 'status-badge-borrowed text-red-100'
                                }`}
                              >
                                {book.available ? 'Available' : 'Borrowed'}
                              </span>
                            </td>
                            <td className="rounded-r-2xl px-4 py-4">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => borrowBook(book.id)}
                                  disabled={!book.available}
                                  className="liquid-glass rounded-full px-3 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-35"
                                >
                                  Borrow
                                </button>
                                <button
                                  onClick={() => returnBook(book.id)}
                                  disabled={book.available}
                                  className="liquid-glass rounded-full px-3 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-35"
                                >
                                  Return
                                </button>
                                <button
                                  onClick={() => fetchBookSummary(book.id)}
                                  className="liquid-glass rounded-full px-3 py-2 text-xs font-medium text-white"
                                  aria-label={`Generate summary for ${book.title}`}
                                >
                                  Summary
                                </button>
                                <button
                                  onClick={() => deleteBook(book.id)}
                                  className="liquid-glass rounded-full p-2 text-red-100 transition-colors hover:text-red-200"
                                  aria-label={`Delete ${book.title}`}
                                >
                                  <Trash2 size={16} aria-hidden="true" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                  {selectedSummaryBookId !== null && (
                    <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/80">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="font-semibold text-white">Book Summary</p>
                        {summaryLoading && (
                          <span className="text-xs text-white/55">Generating summary…</span>
                        )}
                      </div>
                      {summaryError ? (
                        <p className="text-sm text-red-200">{summaryError}</p>
                      ) : summaryText ? (
                        <p>{summaryText}</p>
                      ) : (
                        <p className="text-white/50">Select a book summary to generate it.</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="borrowed" className="relative bg-black px-5 py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(255,255,255,0.075),transparent_28%)]" />
        <div className="relative mx-auto max-w-6xl">
          <SectionTitle eyebrow="Borrowing Activity" title="Library Timeline" />
          <div className="grid gap-5 lg:grid-cols-2">
            {[
              { title: 'Borrowed Books', items: borrowedActivity, icon: BookOpen },
              { title: 'Returned Books', items: returnedActivity, icon: RotateCcw },
            ].map(({ title, items, icon: Icon }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: index === 0 ? -24 : 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="liquid-glass rounded-3xl p-5 md:p-6"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="liquid-glass rounded-full p-3">
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold">{title}</h3>
                </div>
                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {items.length ? (
                      items.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="liquid-glass rounded-2xl px-4 py-3"
                        >
                          <p className="font-medium text-white">{item.title}</p>
                          <p className="mt-1 text-xs text-white/45">{item.action} recently</p>
                        </motion.div>
                      ))
                    ) : (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="rounded-2xl border border-white/10 px-4 py-5 text-sm text-white/45"
                      >
                        No activity yet.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative flex min-h-[78vh] items-center overflow-hidden px-5 py-24">
        <CinematicVideo className="scale-105" />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.86),rgba(0,0,0,0.18),rgba(0,0,0,0.78))]" />
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.75 }}
          className="relative mx-auto w-full max-w-6xl"
        >
          <div className="max-w-2xl">
            <h2
              className="text-5xl text-white md:text-7xl"
              style={{ fontFamily: "'Instrument Serif', serif", letterSpacing: 0 }}
            >
              Knowledge Powers Innovation
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
              A modern digital library system designed to simplify management and improve
              accessibility.
            </p>
          </div>
        </motion.div>
      </section>

      <footer className="bg-black px-5 pb-8 pt-16">
        <div className="liquid-glass mx-auto max-w-6xl rounded-3xl p-6 md:p-8">
          <div className="grid gap-8 md:grid-cols-[1.2fr_1fr_0.8fr] md:items-center">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Library size={24} aria-hidden="true" />
                <span className="text-lg font-semibold">LibraryHub</span>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-white/55">
                Premium tools for organized collections, instant updates, and effortless library
                operations.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-2xl font-semibold">{stats.total}</p>
                <p className="text-xs text-white/45">Total Books</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.available}</p>
                <p className="text-xs text-white/45">Available</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.borrowed}</p>
                <p className="text-xs text-white/45">Borrowed</p>
              </div>
            </div>

            <div className="flex justify-start gap-3 md:justify-end">
              <button className="liquid-glass rounded-full p-4 text-white/80 hover:text-white" aria-label="Instagram">
                <Instagram size={20} aria-hidden="true" />
              </button>
              <button className="liquid-glass rounded-full p-4 text-white/80 hover:text-white" aria-label="Twitter">
                <Twitter size={20} aria-hidden="true" />
              </button>
              <button className="liquid-glass rounded-full p-4 text-white/80 hover:text-white" aria-label="Website">
                <Globe size={20} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
