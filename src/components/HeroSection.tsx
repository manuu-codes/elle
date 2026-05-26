import { motion } from 'motion/react'
import { useClock } from '../hooks/useClock'
import { useState } from 'react'
import SecretOverlay from './SecretOverlay'

export default function HeroSection() {
  const { greeting, dateString, timeString, quote } = useClock()
  const [tapCount, setTapCount] = useState(0)
  const [showSecret, setShowSecret] = useState(false)
  const [tapTimer, setTapTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  function handleLogoClick() {
    const newCount = tapCount + 1
    setTapCount(newCount)

    if (tapTimer) clearTimeout(tapTimer)
    const timer = setTimeout(() => setTapCount(0), 800)
    setTapTimer(timer)

    if (newCount >= 3) {
      setShowSecret(true)
      setTapCount(0)
      if (tapTimer) clearTimeout(tapTimer)
    }
  }

  return (
    <>
      <div id="hero" className="w-full max-w-7xl mx-auto px-6 md:px-10 pt-10 pb-16 md:pt-16 md:pb-24 flex flex-col items-center text-center">
        {/* Floating heart — triple-click opens secret overlay */}
        <motion.div
          className="mb-8 cursor-pointer select-none"
          onClick={handleLogoClick}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -6, 0],
          }}
          transition={{
            opacity: { duration: 0.6 },
            scale: { duration: 0.6 },
            y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          }}
          whileTap={{ scale: 0.85, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
          style={{
            filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.25))',
          }}
        >
          <svg
            width="42"
            height="42"
            viewBox="0 0 24 24"
            fill="white"
            fillOpacity="0.85"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>

        {/* Greeting */}
        <motion.h1
          className="text-white text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-[1.1] text-readable"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {greeting}, Manushree.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-white/80 text-base font-semibold tracking-wide mt-5 text-readable"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
        >
          Here's your day.
        </motion.p>

        {/* Quote of the Day */}
        <motion.p
          className="text-white/50 text-sm italic tracking-wide mt-6 max-w-xl text-readable leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.25 }}
        >
          {quote}
        </motion.p>

        {/* Live date + time */}
        <motion.p
          className="text-white/60 text-sm font-semibold tracking-widest uppercase mt-8 text-readable"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.35 }}
        >
          {dateString} · {timeString}
        </motion.p>
      </div>

      <SecretOverlay isOpen={showSecret} onClose={() => setShowSecret(false)} />
    </>
  )
}
