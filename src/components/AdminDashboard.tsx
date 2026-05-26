import { useState } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, Plus, Trash2, Save, Heart, MessageSquare, Lock } from 'lucide-react'
import {
  getStoredCongratsMessages,
  saveCongratsMessages,
  defaultCongratsMessages,
} from '../lib/congrats'
import { secretMessages } from '../lib/messages'
import { supabase } from '../lib/supabase'

interface AdminDashboardProps {
  onBack: () => void
}

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('elle-admin-auth') === 'true'
  })
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const [congratsMessages, setCongratsMessages] = useState<string[]>(() => getStoredCongratsMessages())
  const [newMessage, setNewMessage] = useState('')
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'congrats' | 'secret'>('congrats')

  // Custom secret messages from localStorage with lazy initializer
  const [customSecretMessages, setCustomSecretMessages] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('elle-secret-messages')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch {
      // ignore
    }
    return [...secretMessages]
  })
  const [newSecretMessage, setNewSecretMessage] = useState('')

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const targetPasscode = import.meta.env.VITE_ADMIN_PASSCODE || 'maneesh'
    if (password === targetPasscode) {
      setIsAuthenticated(true)
      sessionStorage.setItem('elle-admin-auth', 'true')
      setError(false)
    } else {
      setError(true)
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="relative w-full min-h-screen bg-black flex flex-col items-center justify-center font-sans px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="liquid-glass max-w-sm w-full p-8 rounded-3xl border border-white/10 text-center shadow-2xl"
        >
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-pink-300">
            <Lock size={20} />
          </div>
          
          <h1 className="text-white text-xl font-bold mb-2">Maneesh's Dashboard</h1>
          <p className="text-white/40 text-xs font-semibold mb-6">
            Enter passcode to unlock admin controls
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter passcode..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-sm font-semibold outline-none focus:border-white/20 transition-colors"
              autoFocus
            />
            {error && (
              <p className="text-red-400 text-xs font-semibold">Incorrect passcode. Try again.</p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-white text-black font-bold py-2.5 rounded-xl text-xs hover:bg-white/90 transition-colors cursor-pointer"
              >
                Unlock
              </button>
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2.5 bg-white/10 text-white font-bold rounded-xl text-xs hover:bg-white/15 transition-colors cursor-pointer"
              >
                Back
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    )
  }



  async function handleSaveCongrats() {
    const filtered = congratsMessages.filter((m) => m.trim() !== '')
    saveCongratsMessages(filtered)
    setCongratsMessages(filtered)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)

    try {
      await supabase.from('messages').upsert({
        id: 'congrats',
        content: filtered,
        updated_at: new Date().toISOString()
      })
    } catch {
      // ignore
    }
  }

  async function handleSaveSecrets() {
    const filtered = customSecretMessages.filter((m) => m.trim() !== '')
    localStorage.setItem('elle-secret-messages', JSON.stringify(filtered))
    setCustomSecretMessages(filtered)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)

    try {
      await supabase.from('messages').upsert({
        id: 'secret',
        content: filtered,
        updated_at: new Date().toISOString()
      })
    } catch {
      // ignore
    }
  }

  function addCongratsMessage() {
    if (!newMessage.trim()) return
    setCongratsMessages((prev) => [...prev, newMessage.trim()])
    setNewMessage('')
  }

  // Fix typo if any in resetting secret input
  function addSecretMessage() {
    if (!newSecretMessage.trim()) return
    setCustomSecretMessages((prev) => [...prev, newSecretMessage.trim()])
    setNewSecretMessage('')
  }

  function removeCongratsMessage(index: number) {
    setCongratsMessages((prev) => prev.filter((_, i) => i !== index))
  }

  function removeSecretMessage(index: number) {
    setCustomSecretMessages((prev) => prev.filter((_, i) => i !== index))
  }

  function updateCongratsMessage(index: number, value: string) {
    setCongratsMessages((prev) => prev.map((m, i) => (i === index ? value : m)))
  }

  // Correctly update secret message
  function updateSecretMessage(index: number, value: string) {
    setCustomSecretMessages((prev) => prev.map((m, i) => (i === index ? value : m)))
  }

  function resetCongrats() {
    setCongratsMessages([...defaultCongratsMessages])
  }

  function resetSecrets() {
    setCustomSecretMessages([...secretMessages])
  }

  return (
    <main className="relative w-full min-h-screen bg-black flex flex-col items-center font-sans">
      <div className="w-full max-w-3xl mx-auto px-6 md:px-10 py-10">
        {/* Header */}
        <motion.div
          className="flex items-center gap-4 mb-12"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={onBack}
            className="text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-white text-2xl font-bold tracking-tight">
              Maneesh's Dashboard
            </h1>
            <p className="text-white/40 text-sm font-medium mt-1">
              Manage the messages Manushree sees
            </p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('congrats')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'congrats'
                ? 'bg-white/15 text-white'
                : 'bg-white/5 text-white/40 hover:text-white/60'
            }`}
          >
            <Heart size={14} />
            Completion Messages
          </button>
          <button
            onClick={() => setActiveTab('secret')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'secret'
                ? 'bg-white/15 text-white'
                : 'bg-white/5 text-white/40 hover:text-white/60'
            }`}
          >
            <MessageSquare size={14} />
            Secret Messages
          </button>
        </div>

        {/* Congrats Tab */}
        {activeTab === 'congrats' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-white/50 text-xs uppercase tracking-widest font-semibold">
                Messages when she completes a habit
              </p>
              <button
                onClick={resetCongrats}
                className="text-white/30 text-xs hover:text-white/50 transition-colors cursor-pointer"
              >
                Reset to defaults
              </button>
            </div>

            <div className="space-y-2 mb-6">
              {congratsMessages.map((msg, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={msg}
                    onChange={(e) => updateCongratsMessage(i, e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium outline-none focus:border-white/25 transition-colors"
                  />
                  <button
                    onClick={() => removeCongratsMessage(i)}
                    className="p-2.5 text-white/20 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new */}
            <div className="flex items-center gap-2 mb-8">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCongratsMessage()}
                placeholder="Write a new message for her..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium placeholder:text-white/20 outline-none focus:border-white/25 transition-colors"
              />
              <button
                onClick={addCongratsMessage}
                className="p-3 bg-white/10 rounded-xl text-white/50 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              onClick={handleSaveCongrats}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-xl text-white text-sm font-semibold hover:bg-white/15 transition-all cursor-pointer"
            >
              <Save size={16} />
              {saved ? 'Saved ✓' : 'Save Messages'}
            </button>
          </motion.div>
        )}

        {/* Secret Messages Tab */}
        {activeTab === 'secret' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/50 text-xs uppercase tracking-widest font-semibold">
                Hidden messages (triple-click "Elle")
              </p>
              <button
                onClick={resetSecrets}
                className="text-white/30 text-xs hover:text-white/50 transition-colors cursor-pointer"
              >
                Reset to defaults
              </button>
            </div>
            <p className="text-white/25 text-xs mb-6 font-medium">
              One message shown per day, cycling through the list. She'll never know
              you can change these.
            </p>

            <div className="space-y-2 mb-6">
              {customSecretMessages.map((msg, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-white/15 text-xs font-semibold w-6 text-right shrink-0">
                    {i + 1}
                  </span>
                  <input
                    type="text"
                    value={msg}
                    onChange={(e) => updateSecretMessage(i, e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium outline-none focus:border-white/25 transition-colors"
                  />
                  <button
                    onClick={() => removeSecretMessage(i)}
                    className="p-2.5 text-white/20 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new */}
            <div className="flex items-center gap-2 mb-8">
              <span className="text-white/15 text-xs font-semibold w-6 text-right shrink-0">
                +
              </span>
              <input
                type="text"
                value={newSecretMessage}
                onChange={(e) => setNewSecretMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSecretMessage()}
                placeholder="Write a secret message..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium placeholder:text-white/20 outline-none focus:border-white/25 transition-colors"
              />
              <button
                onClick={addSecretMessage}
                className="p-3 bg-white/10 rounded-xl text-white/50 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              onClick={handleSaveSecrets}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-xl text-white text-sm font-semibold hover:bg-white/15 transition-all cursor-pointer"
            >
              <Save size={16} />
              {saved ? 'Saved ✓' : 'Save Secret Messages'}
            </button>
          </motion.div>
        )}
      </div>
    </main>
  )
}
