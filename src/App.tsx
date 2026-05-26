import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Movement from './pages/Movement'
import Book from './pages/Book'
import DocumentStudy from './pages/DocumentStudy'
import AdminDashboard from './components/AdminDashboard'
import { supabase } from './lib/supabase'

export default function App() {
  const [showAdmin, setShowAdmin] = useState(false)


  // Sync congrats and secret messages from Supabase on mount
  useEffect(() => {
    async function syncMessages() {
      try {
        const { data, error } = await supabase.from('messages').select('*')
        if (data && !error) {
          data.forEach((row) => {
            if (row.id === 'congrats') {
              localStorage.setItem('elle-congrats-messages', JSON.stringify(row.content))
            } else if (row.id === 'secret') {
              localStorage.setItem('elle-secret-messages', JSON.stringify(row.content))
            }
          })
        }
      } catch {
        // ignore
      }
    }
    syncMessages()
  }, [])

  // Hash-based routing for admin
  useEffect(() => {
    function checkHash() {
      setShowAdmin(window.location.hash === '#admin')
    }
    checkHash()
    window.addEventListener('hashchange', checkHash)
    return () => window.removeEventListener('hashchange', checkHash)
  }, [])

  function handleBackFromAdmin() {
    window.location.hash = ''
    setShowAdmin(false)
  }

  // Show admin dashboard
  if (showAdmin) {
    return <AdminDashboard onBack={handleBackFromAdmin} />
  }

  return (
    <main className="relative w-full min-h-[115vh] overflow-x-hidden flex flex-col items-center font-sans selection:bg-white/20 selection:text-white">
      {/* Background video of the hero section */}
      <video
        className="fixed inset-0 w-full h-full object-cover z-[-1] pointer-events-none"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_114316_1c7889ad-2885-410e-b493-98119fee0ddb.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/movement" element={<Movement />} />
        <Route path="/book" element={<Book />} />
        <Route path="/document-study" element={<DocumentStudy />} />
      </Routes>
    </main>
  )
}
