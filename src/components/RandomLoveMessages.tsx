import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Heart, X, AlertTriangle, MessageCircle, Cloud, Sparkles, Star } from 'lucide-react'
import { getRandomStoredMessage } from '../lib/congrats'

/* ── Message style variants ── */
type MessageStyle = 'bubble' | 'cloud' | 'errorbox' | 'notification' | 'sticky' | 'whisper' | 'sparkle'

const ALL_STYLES: MessageStyle[] = ['bubble', 'cloud', 'errorbox', 'notification', 'sticky', 'whisper', 'sparkle']

type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center-left' | 'center-right'

const ALL_POSITIONS: Position[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center-left', 'center-right']

function getPositionClasses(pos: Position): string {
  switch (pos) {
    case 'top-left': return 'top-6 left-6'
    case 'top-right': return 'top-6 right-6'
    case 'bottom-left': return 'bottom-24 left-6'
    case 'bottom-right': return 'bottom-24 right-6'
    case 'center-left': return 'top-1/2 left-6 -translate-y-1/2'
    case 'center-right': return 'top-1/2 right-6 -translate-y-1/2'
  }
}

function getEntrance(pos: Position) {
  if (pos.includes('left')) return { x: -60, opacity: 0 }
  if (pos.includes('right')) return { x: 60, opacity: 0 }
  return { y: -30, opacity: 0 }
}

/* ── Individual style renderers ── */

function BubbleMessage({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="relative max-w-[280px]" onClick={onClose}>
      <div className="bg-white/10 backdrop-blur-xl rounded-[20px] rounded-bl-[4px] px-5 py-4 border border-white/15 cursor-pointer">
        <div className="flex items-start gap-2.5">
          <Heart size={14} className="text-pink-300/60 mt-0.5 shrink-0" fill="currentColor" />
          <p className="text-white text-xs font-semibold leading-relaxed">{message}</p>
        </div>
        <p className="text-white/30 text-[9px] font-bold mt-2 text-right tracking-wide">MANEESH</p>
      </div>
    </div>
  )
}

function CloudMessage({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="relative max-w-[300px] cursor-pointer" onClick={onClose}>
      <div
        className="px-6 py-5 text-center"
        style={{
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
      >
        <Cloud size={16} className="text-white/30 mx-auto mb-2" />
        <p className="text-white text-xs font-semibold leading-relaxed">{message}</p>
        <p className="text-white/25 text-[9px] font-bold mt-2 tracking-widest">— M ♥</p>
      </div>
    </div>
  )
}

function ErrorBoxMessage({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="max-w-[320px] cursor-pointer" onClick={onClose}>
      <div className="bg-black/80 backdrop-blur-xl rounded-xl border border-white/15 overflow-hidden shadow-2xl">
        {/* Title bar */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-white/5 border-b border-white/8">
          <div className="flex items-center gap-2">
            <AlertTriangle size={12} className="text-pink-300/70" />
            <span className="text-white/70 text-[10px] font-bold uppercase tracking-wider">System Alert</span>
          </div>
          <button onClick={onClose} className="text-white/25 hover:text-white/60 transition-colors cursor-pointer">
            <X size={12} />
          </button>
        </div>
        {/* Body */}
        <div className="px-4 py-3.5">
          <p className="text-white text-xs font-semibold leading-relaxed">{message}</p>
          <div className="mt-3 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-white/10 rounded-md text-white/60 text-[10px] font-bold hover:bg-white/15 hover:text-white transition-all cursor-pointer"
            >
              I know ♥
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function NotificationMessage({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="max-w-[300px] cursor-pointer" onClick={onClose}>
      <div className="bg-white/8 backdrop-blur-2xl rounded-2xl px-5 py-4 border border-white/12 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-pink-400/20 flex items-center justify-center">
            <MessageCircle size={10} className="text-pink-300" />
          </div>
          <span className="text-white/50 text-[10px] font-bold uppercase tracking-wider">Maneesh</span>
          <span className="text-white/20 text-[9px] font-semibold ml-auto">now</span>
        </div>
        <p className="text-white text-xs font-semibold leading-relaxed">{message}</p>
      </div>
    </div>
  )
}

function StickyMessage({ message, rotation, onClose }: { message: string; rotation: number; onClose: () => void }) {
  return (
    <div className="max-w-[240px] cursor-pointer" onClick={onClose}>
      <div
        className="px-5 py-4 rounded-sm"
        style={{
          background: 'rgba(255, 240, 200, 0.12)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 240, 200, 0.15)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          transform: `rotate(${rotation}deg)`,
        }}
      >
        <p className="text-white/90 text-xs font-semibold leading-relaxed italic">{message}</p>
        <p className="text-amber-200/30 text-[9px] font-bold mt-2.5 text-right">— M</p>
      </div>
    </div>
  )
}

function WhisperMessage({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="max-w-[260px] cursor-pointer text-center" onClick={onClose}>
      <motion.div
        animate={{ opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <p className="text-white/60 text-sm font-medium italic leading-relaxed tracking-wide">
          "{message}"
        </p>
        <p className="text-white/20 text-[9px] mt-2 tracking-widest font-bold">whispered by maneesh</p>
      </motion.div>
    </div>
  )
}

function SparkleMessage({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="max-w-[280px] cursor-pointer" onClick={onClose}>
      <div className="relative bg-white/6 backdrop-blur-xl rounded-2xl px-5 py-4 border border-white/10">
        <div className="absolute -top-2 -right-2">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles size={16} className="text-yellow-200/40" />
          </motion.div>
        </div>
        <div className="absolute -bottom-1 -left-1">
          <motion.div
            animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          >
            <Star size={12} className="text-pink-200/30" fill="currentColor" />
          </motion.div>
        </div>
        <p className="text-white text-xs font-semibold leading-relaxed">{message}</p>
        <p className="text-pink-200/30 text-[9px] font-bold mt-2 tracking-widest">MANEESH ✦</p>
      </div>
    </div>
  )
}

/* ── Main component ── */

export default function RandomLoveMessages() {
  const [activeMessage, setActiveMessage] = useState<{
    text: string
    style: MessageStyle
    position: Position
    rotation: number
    id: number
  } | null>(null)

  const dismiss = useCallback(() => setActiveMessage(null), [])

  // Show a random message
  const showRandomMessage = useCallback(() => {
    const text = getRandomStoredMessage()
    const style = ALL_STYLES[Math.floor(Math.random() * ALL_STYLES.length)]
    const position = ALL_POSITIONS[Math.floor(Math.random() * ALL_POSITIONS.length)]
    const rotation = -2 + Math.random() * 4
    setActiveMessage({ text, style, position, rotation, id: Date.now() })
  }, [])

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (!activeMessage) return
    const timer = setTimeout(dismiss, 8000)
    return () => clearTimeout(timer)
  }, [activeMessage, dismiss])

  // Random interval system — shows a message every 3–8 minutes
  useEffect(() => {
    function scheduleNext() {
      const delay = 10 * 60 * 1000  // 10 minutes exactly
      return setTimeout(() => {
        showRandomMessage()
        timerRef = scheduleNext()
      }, delay)
    }

    // Show the first one after 30–90 seconds
    const initialDelay = 30000 + Math.random() * 60000
    let timerRef: ReturnType<typeof setTimeout> = setTimeout(() => {
      showRandomMessage()
      timerRef = scheduleNext()
    }, initialDelay)

    return () => clearTimeout(timerRef)
  }, [showRandomMessage])

  function renderMessage(style: MessageStyle, text: string, rotation: number) {
    switch (style) {
      case 'bubble': return <BubbleMessage message={text} onClose={dismiss} />
      case 'cloud': return <CloudMessage message={text} onClose={dismiss} />
      case 'errorbox': return <ErrorBoxMessage message={text} onClose={dismiss} />
      case 'notification': return <NotificationMessage message={text} onClose={dismiss} />
      case 'sticky': return <StickyMessage message={text} rotation={rotation} onClose={dismiss} />
      case 'whisper': return <WhisperMessage message={text} onClose={dismiss} />
      case 'sparkle': return <SparkleMessage message={text} onClose={dismiss} />
    }
  }

  return (
    <AnimatePresence>
      {activeMessage && (
        <motion.div
          key={activeMessage.id}
          className={`fixed z-[70] ${getPositionClasses(activeMessage.position)}`}
          initial={getEntrance(activeMessage.position)}
          animate={{ x: 0, y: 0, opacity: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 250, damping: 22 }}
        >
          {renderMessage(activeMessage.style, activeMessage.text, activeMessage.rotation)}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
