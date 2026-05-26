import { AnimatePresence, motion } from 'motion/react'
import { useEffect } from 'react'
import { Heart } from 'lucide-react'

interface CongratsToastProps {
  message: string | null
  onDismiss: () => void
}

export default function CongratsToast({ message, onDismiss }: CongratsToastProps) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onDismiss, 3500)
      return () => clearTimeout(timer)
    }
  }, [message, onDismiss])

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className="fixed bottom-8 left-1/2 z-[80] max-w-md w-[90vw]"
          initial={{ opacity: 0, y: 40, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <div
            className="liquid-glass rounded-2xl px-6 py-5 cursor-pointer"
            onClick={onDismiss}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-white/60">
                <Heart size={16} fill="currentColor" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold leading-relaxed text-readable">
                  {message}
                </p>
                <p className="text-white/40 text-xs font-medium mt-1.5 tracking-wide">
                  — Maneesh
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
