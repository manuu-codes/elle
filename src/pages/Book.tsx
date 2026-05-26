import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, BookOpen, Plus, ClipboardList, CheckCircle, Clock, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface BookData {
  id: string
  title: string
  total_pages: number
  current_page: number
  status: 'reading' | 'completed'
  start_date: string
  end_date?: string
}

interface ReadingLog {
  id: string
  book_id: string
  pages_read: number
  duration_minutes: number
  notes: string
  date: string
}

function getTodayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export default function Book() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'log' ? 'log' : 'list'

  const [activeTab, setActiveTab] = useState<'list' | 'log' | 'history'>(
    initialTab === 'log' ? 'log' : 'list'
  )

  const [books, setBooks] = useState<BookData[]>([])
  const [logs, setLogs] = useState<ReadingLog[]>([])

  // Form states
  const [newTitle, setNewTitle] = useState('')
  const [newTotalPages, setNewTotalPages] = useState('')
  
  // Log reading states
  const [selectedBookId, setSelectedBookId] = useState('')
  const [pagesRead, setPagesRead] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [logNotes, setLogNotes] = useState('')

  // Inline progress update state
  const [editingBookId, setEditingBookId] = useState<string | null>(null)
  const [updatePageNum, setUpdatePageNum] = useState('')

  // Load books and logs from Supabase & LocalStorage
  useEffect(() => {
    async function loadData() {
      // Try local storage first as fast cache
      const storedBooks = localStorage.getItem('elle-books')
      const storedLogs = localStorage.getItem('elle-reading-logs')
      if (storedBooks) {
        try { setBooks(JSON.parse(storedBooks)) } catch { /* ignore cache parse errors */ }
      }
      if (storedLogs) {
        try { setLogs(JSON.parse(storedLogs)) } catch { /* ignore cache parse errors */ }
      }

      try {
        // Load books
        const { data: dbBooks, error: booksError } = await supabase
          .from('books')
          .select('*')
          .order('created_at', { ascending: false })

        if (dbBooks && !booksError) {
          setBooks(dbBooks)
          localStorage.setItem('elle-books', JSON.stringify(dbBooks))
        }

        // Load logs
        const { data: dbLogs, error: logsError } = await supabase
          .from('reading_logs')
          .select('*')
          .order('created_at', { ascending: false })

        if (dbLogs && !logsError) {
          setLogs(dbLogs)
          localStorage.setItem('elle-reading-logs', JSON.stringify(dbLogs))
        }
      } catch {
        /* ignore connection errors and rely on cached storage */
      }
    }
    loadData()
  }, [])

  // Add a book
  async function handleAddBook(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim() || !newTotalPages) return

    const total = parseInt(newTotalPages)
    if (isNaN(total) || total <= 0) return

    const newBook: BookData = {
      id: generateUUID(),
      title: newTitle.trim(),
      total_pages: total,
      current_page: 0,
      status: 'reading',
      start_date: new Date().toISOString(),
    }

    const updatedBooks = [newBook, ...books]
    setBooks(updatedBooks)
    localStorage.setItem('elle-books', JSON.stringify(updatedBooks))

    setNewTitle('')
    setNewTotalPages('')

    // Sync database
    try {
      await supabase.from('books').insert({
        id: newBook.id,
        title: newBook.title,
        total_pages: newBook.total_pages,
        current_page: newBook.current_page,
        status: newBook.status,
        start_date: newBook.start_date
      })
    } catch {
      /* ignore offline errors */
    }
  }

  // Delete a book
  async function handleDeleteBook(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    const updated = books.filter(b => b.id !== id)
    setBooks(updated)
    localStorage.setItem('elle-books', JSON.stringify(updated))

    try {
      await supabase.from('books').delete().eq('id', id)
    } catch {
      /* ignore offline errors */
    }
  }

  // Inline current page update
  async function handleUpdatePage(bookId: string) {
    const pageNum = parseInt(updatePageNum)
    const book = books.find(b => b.id === bookId)
    if (!book || isNaN(pageNum) || pageNum < 0 || pageNum > book.total_pages) return

    const isCompleted = pageNum === book.total_pages
    const updatedBooks = books.map(b => {
      if (b.id === bookId) {
        return {
          ...b,
          current_page: pageNum,
          status: isCompleted ? ('completed' as const) : b.status,
          end_date: isCompleted ? new Date().toISOString() : b.end_date
        }
      }
      return b
    })

    setBooks(updatedBooks)
    localStorage.setItem('elle-books', JSON.stringify(updatedBooks))
    setEditingBookId(null)
    setUpdatePageNum('')

    try {
      await supabase
        .from('books')
        .update({
          current_page: pageNum,
          status: isCompleted ? 'completed' : book.status,
          end_date: isCompleted ? new Date().toISOString() : null
        })
        .eq('id', bookId)
    } catch {
      /* ignore offline errors */
    }
  }

  // Log a reading session
  async function handleLogReading(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedBookId || !pagesRead || !durationMinutes) return

    const pages = parseInt(pagesRead)
    const minutes = parseInt(durationMinutes)
    const book = books.find(b => b.id === selectedBookId)

    if (!book || isNaN(pages) || pages <= 0 || isNaN(minutes) || minutes <= 0) return

    // Calculate new current page
    const newPage = Math.min(book.total_pages, book.current_page + pages)
    const isCompleted = newPage === book.total_pages

    const newLog: ReadingLog = {
      id: generateUUID(),
      book_id: selectedBookId,
      pages_read: pages,
      duration_minutes: minutes,
      notes: logNotes.trim(),
      date: getTodayKey(),
    }

    // Update book status/pages
    const updatedBooks = books.map(b => {
      if (b.id === selectedBookId) {
        return {
          ...b,
          current_page: newPage,
          status: isCompleted ? ('completed' as const) : b.status,
          end_date: isCompleted ? new Date().toISOString() : b.end_date
        }
      }
      return b
    })

    const updatedLogs = [newLog, ...logs]

    setBooks(updatedBooks)
    setLogs(updatedLogs)
    localStorage.setItem('elle-books', JSON.stringify(updatedBooks))
    localStorage.setItem('elle-reading-logs', JSON.stringify(updatedLogs))

    // Reset log form
    setPagesRead('')
    setDurationMinutes('')
    setLogNotes('')

    // Switch tab to list or history
    setActiveTab(isCompleted ? 'history' : 'list')

    // Sync database
    try {
      await supabase.from('reading_logs').insert({
        id: newLog.id,
        book_id: newLog.book_id,
        pages_read: newLog.pages_read,
        duration_minutes: newLog.duration_minutes,
        notes: newLog.notes,
        date: newLog.date,
        created_at: new Date().toISOString()
      })

      await supabase
        .from('books')
        .update({
          current_page: newPage,
          status: isCompleted ? 'completed' : book.status,
          end_date: isCompleted ? new Date().toISOString() : null
        })
        .eq('id', selectedBookId)
    } catch {
      /* ignore offline errors */
    }
  }

  // Calculate total reading duration for a book
  function getBookReadingDuration(bookId: string) {
    const bookLogs = logs.filter(l => l.book_id === bookId)
    const totalMinutes = bookLogs.reduce((sum, l) => sum + l.duration_minutes, 0)
    
    if (totalMinutes === 0) return 'no logs'
    
    const hrs = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`
  }

  const activeBooks = books.filter(b => b.status === 'reading')
  const completedBooks = books.filter(b => b.status === 'completed')

  return (
    <div className="relative w-full min-h-[100vh] flex flex-col items-center pb-20 px-6 pt-10 z-10">
      <div className="w-full max-w-4xl">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold tracking-wide">Back to Elle</span>
        </button>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-white mb-8 text-readable tracking-tight"
        >
          Reading Workspace
        </motion.h1>

        {/* Tab Selection */}
        <div className="flex gap-2.5 mb-8">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'list' ? 'bg-white text-black' : 'liquid-glass text-white/70 hover:bg-white/10'
            }`}
          >
            <ClipboardList size={16} />
            Reading List
          </button>
          <button
            onClick={() => {
              setActiveTab('log')
              if (activeBooks.length > 0 && !selectedBookId) {
                setSelectedBookId(activeBooks[0].id)
              }
            }}
            className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'log' ? 'bg-white text-black' : 'liquid-glass text-white/70 hover:bg-white/10'
            }`}
          >
            <BookOpen size={16} />
            Log Reading
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'history' ? 'bg-white text-black' : 'liquid-glass text-white/70 hover:bg-white/10'
            }`}
          >
            <CheckCircle size={16} />
            Finished Books
          </button>
        </div>

        {/* Tab contents */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main workspace area */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            {/* Reading List Tab */}
            {activeTab === 'list' && (
              <>
                <div className="flex flex-col gap-4">
                  {activeBooks.length === 0 ? (
                    <div className="liquid-glass rounded-2xl p-8 text-center text-white/40 font-bold text-sm">
                      Your reading list is empty. Add a new book to start tracking!
                    </div>
                  ) : (
                    activeBooks.map(book => {
                      const progressPct = Math.round((book.current_page / book.total_pages) * 100)
                      return (
                        <div key={book.id} className="liquid-glass rounded-2xl p-6 relative group transition-all hover:bg-white/8">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-white text-lg font-bold text-readable">{book.title}</h3>
                              <p className="text-white/40 text-xs font-semibold mt-1">
                                Started: {new Date(book.start_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => handleDeleteBook(book.id, e)}
                                className="text-white/20 hover:text-red-400 p-1.5 rounded transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                                title="Delete book"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-xs text-white/60 font-bold mb-2">
                              <span>Progress</span>
                              <span>{book.current_page} / {book.total_pages} pages ({progressPct}%)</span>
                            </div>
                            <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                              <div
                                className="bg-white/80 h-full rounded-full transition-all duration-500"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>

                          {/* inline progress update */}
                          {editingBookId === book.id ? (
                            <div className="flex gap-2 items-center bg-white/5 p-3 rounded-xl">
                              <input
                                type="number"
                                value={updatePageNum}
                                onChange={(e) => setUpdatePageNum(e.target.value)}
                                placeholder="Enter current page..."
                                className="flex-1 bg-white/8 border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-semibold outline-none"
                              />
                              <button
                                onClick={() => handleUpdatePage(book.id)}
                                className="px-4 py-2 rounded-lg bg-white text-black font-bold text-xs cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingBookId(null)}
                                className="px-3 py-2 rounded-lg bg-white/10 text-white/75 font-semibold text-xs cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingBookId(book.id)
                                setUpdatePageNum(book.current_page.toString())
                              }}
                              className="text-xs font-bold text-white/70 hover:text-white transition-colors cursor-pointer"
                            >
                              Update page progress
                            </button>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </>
            )}

            {/* Log Reading Tab */}
            {activeTab === 'log' && (
              <div className="liquid-glass rounded-2xl p-6">
                <h2 className="text-white font-bold text-lg mb-6">Log Reading Session</h2>
                {activeBooks.length === 0 ? (
                  <p className="text-white/40 text-sm font-bold text-center py-6">
                    You have no active books to log progress for. Add a book first!
                  </p>
                ) : (
                  <form onSubmit={handleLogReading} className="flex flex-col gap-5">
                    <div>
                      <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2">
                        Select Book
                      </label>
                      <select
                        value={selectedBookId}
                        onChange={(e) => setSelectedBookId(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-white/30 transition-colors cursor-pointer text-sm"
                      >
                        {activeBooks.map(b => (
                          <option key={b.id} value={b.id} className="bg-neutral-900 text-white">
                            {b.title} (pg. {b.current_page}/{b.total_pages})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2">
                          Pages Read
                        </label>
                        <input
                          type="number"
                          value={pagesRead}
                          onChange={(e) => setPagesRead(e.target.value)}
                          placeholder="e.g. 20"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-white/30 transition-colors text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2">
                          Time Spent (minutes)
                        </label>
                        <input
                          type="number"
                          value={durationMinutes}
                          onChange={(e) => setDurationMinutes(e.target.value)}
                          placeholder="e.g. 45"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-white/30 transition-colors text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2">
                        Session Notes
                      </label>
                      <textarea
                        value={logNotes}
                        onChange={(e) => setLogNotes(e.target.value)}
                        placeholder="Key takeaways, thoughts, or favourite quotes..."
                        className="w-full h-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-semibold outline-none focus:border-white/30 transition-colors resize-none text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-white text-black font-bold py-3.5 rounded-xl hover:bg-white/90 transition-colors cursor-pointer text-sm"
                    >
                      Save Reading Session
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Finished Books Tab */}
            {activeTab === 'history' && (
              <div className="flex flex-col gap-4">
                {completedBooks.length === 0 ? (
                  <div className="liquid-glass rounded-2xl p-8 text-center text-white/40 font-bold text-sm">
                    No completed books on record yet. Finish a book to see it here!
                  </div>
                ) : (
                  completedBooks.map(book => (
                    <div key={book.id} className="liquid-glass rounded-2xl p-6 relative group transition-all hover:bg-white/8">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-white text-lg font-bold text-readable flex items-center gap-2">
                            <span>{book.title}</span>
                            <span className="bg-pink-500/20 text-pink-300 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md">
                              Completed
                            </span>
                          </h3>
                          <div className="flex flex-wrap gap-4 text-white/50 text-xs font-semibold mt-2.5">
                            <span>Pages: {book.total_pages}</span>
                            <span>Finished: {book.end_date ? new Date(book.end_date).toLocaleDateString() : '—'}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-white/60 text-xs font-bold flex items-center justify-end gap-1.5 mb-1">
                            <Clock size={12} />
                            Read Time
                          </span>
                          <span className="text-white font-bold text-sm">{getBookReadingDuration(book.id)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Right Column: Book Adder Panel */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Add Book Form */}
            <div className="liquid-glass rounded-2xl p-6">
              <h2 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <Plus size={16} />
                Add to Reading List
              </h2>
              <form onSubmit={handleAddBook} className="flex flex-col gap-4">
                <div>
                  <label className="block text-white/60 text-[10px] font-bold uppercase tracking-wider mb-2">
                    Book Title
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Atomic Habits"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-semibold outline-none focus:border-white/20 transition-colors text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-[10px] font-bold uppercase tracking-wider mb-2">
                    Total Pages
                  </label>
                  <input
                    type="number"
                    value={newTotalPages}
                    onChange={(e) => setNewTotalPages(e.target.value)}
                    placeholder="e.g. 320"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-semibold outline-none focus:border-white/20 transition-colors text-xs"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-white text-black font-bold py-2.5 rounded-xl hover:bg-white/90 transition-colors cursor-pointer text-xs mt-2"
                >
                  Add Book
                </button>
              </form>
            </div>

            {/* Quick reading stats */}
            <div className="liquid-glass rounded-2xl p-6 text-white/80">
              <h2 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                Stats Overview
              </h2>
              <div className="flex flex-col gap-3 text-xs font-semibold">
                <div className="flex justify-between">
                  <span className="text-white/50">Active books:</span>
                  <span className="text-white">{activeBooks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Finished books:</span>
                  <span className="text-white">{completedBooks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Total sessions logged:</span>
                  <span className="text-white">{logs.length}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
