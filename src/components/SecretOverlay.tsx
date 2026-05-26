import { AnimatePresence, motion } from 'motion/react'
import { useState, useEffect, useMemo } from 'react'
import { secretMessages } from '../lib/messages'
import { X } from 'lucide-react'

interface SecretOverlayProps {
  isOpen: boolean
  onClose: () => void
}

interface HeartParticle {
  id: string
  left: number
  size: number
  duration: number
  delay: number
  opacity: number
  targetX1: number
  targetX2: number
}

function getMessages(): string[] {
  try {
    const stored = localStorage.getItem('elle-secret-messages')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // ignore
  }
  return secretMessages
}

/* A single floating heart particle - now entirely pure */
function FloatingHeart({ heart }: { heart: HeartParticle }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${heart.left}%`,
        bottom: '-20px',
        fontSize: `${heart.size}px`,
        opacity: heart.opacity,
      }}
      initial={{ y: 0, opacity: heart.opacity, scale: 1, rotate: 0 }}
      animate={{
        y: [0, -window.innerHeight * 0.4, -window.innerHeight * 0.8, -window.innerHeight * 1.2],
        opacity: [heart.opacity, heart.opacity * 0.9, heart.opacity * 0.5, 0],
        scale: [1, 1.1, 0.8, 0.3],
        rotate: [0, -10, 15, 25],
        x: [0, heart.targetX1, heart.targetX2],
      }}
      transition={{
        duration: heart.duration,
        delay: heart.delay,
        ease: 'easeOut',
      }}
    >
      ♥
    </motion.div>
  )
}

/* Sub-component that only mounts when the overlay is open, keeping logic simple and clean */
function SecretOverlayContent({
  onClose,
  currentMessage,
  onNextMessage,
}: {
  onClose: () => void
  currentMessage: string
  onNextMessage: () => void
}) {
  const [displayedText, setDisplayedText] = useState('')
  const [showSignoff, setShowSignoff] = useState(false)
  const [isTyping, setIsTyping] = useState(true)

  // Initialize hearts using lazy state initializer (avoids updates inside effect)
  const [hearts] = useState<HeartParticle[]>(() => {
    const count = 8 + Math.floor(Math.random() * 6)
    return Array.from({ length: count }, (_, i) => ({
      id: `${Date.now()}-${i}-${Math.random()}`,
      left: Math.random() * 100,
      size: 12 + Math.random() * 20,
      duration: 4 + Math.random() * 5,
      delay: Math.random() * 2,
      opacity: 0.15 + Math.random() * 0.25,
      targetX1: (Math.random() - 0.5) * 80,
      targetX2: (Math.random() - 0.5) * 120,
    }))
  })

  // Typewriter effect (pure interval typing, no sync state modifications)
  useEffect(() => {
    let index = 0
    const interval = setInterval(() => {
      if (index < currentMessage.length) {
        setDisplayedText(currentMessage.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
        setIsTyping(false)
        const timeout = setTimeout(() => setShowSignoff(true), 500)
        return () => clearTimeout(timeout)
      }
    }, 40)

    return () => clearInterval(interval)
  }, [currentMessage])

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center px-8 overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(60, 10, 30, 0.97) 0%, rgba(0, 0, 0, 0.98) 70%)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Floating hearts */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none text-pink-400/40">
        {hearts.map((heart) => (
          <FloatingHeart key={heart.id} heart={heart} />
        ))}
      </div>

      {/* Soft ambient glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '500px',
          height: '500px',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(200, 80, 120, 0.08) 0%, transparent 70%)',
        }}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 text-white opacity-20 hover:opacity-60 transition-opacity cursor-pointer z-10"
      >
        <X size={20} />
      </button>

      {/* Message container — click to cycle */}
      <div
        className="text-center max-w-lg cursor-pointer relative z-10"
        onClick={onNextMessage}
      >
        {/* Small heart icon above message */}
        <motion.div
          className="mb-6 text-pink-300/30"
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="mx-auto">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>

        {/* Message with transition */}
        <AnimatePresence mode="wait">
          <motion.p
            key={currentMessage}
            className="text-white text-2xl md:text-3xl font-medium tracking-tight leading-relaxed"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            {displayedText}
            {isTyping && <span className="text-pink-300/60 animate-pulse">|</span>}
          </motion.p>
        </AnimatePresence>

        {/* Sign-off */}
        <AnimatePresence>
          {showSignoff && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-pink-200/30 text-sm tracking-widest mt-8 font-medium">
                — from me, always ♥
              </p>
              <p className="text-white/15 text-[10px] tracking-widest mt-6 uppercase">
                tap for another
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function SecretOverlay({ isOpen, onClose }: SecretOverlayProps) {
  const messages = useMemo(() => {
    if (!isOpen) return []
    return shuffleArray(getMessages())
  }, [isOpen])
  const [messageIndex, setMessageIndex] = useState(0)
  const currentMessage = messages[messageIndex % messages.length] || ''

  function handleNextMessage() {
    setMessageIndex((i) => i + 1)
  }

  // Reset index when overlay closes/opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setMessageIndex(0)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && currentMessage && (
        <SecretOverlayContent
          key={currentMessage}
          onClose={onClose}
          currentMessage={currentMessage}
          onNextMessage={handleNextMessage}
        />
      )}
    </AnimatePresence>
  )
}
