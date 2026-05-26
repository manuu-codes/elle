import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  Pill,
  Zap,
  TrendingUp,
  FileText,
  Brain,
  BookOpen,
  Sparkles,
  Check,
  Undo2,
} from 'lucide-react'
import type { HabitData } from '../hooks/useHabits'
import { getTodaysAITopic } from '../lib/content'

const iconMap: Record<string, React.ElementType> = {
  Pill,
  Zap,
  TrendingUp,
  FileText,
  Brain,
  BookOpen,
  Sparkles,
}

interface HabitCardProps {
  habit: HabitData
  index: number
  onToggle: (id: string) => void
  onSelectSub: (id: string, sub: string) => void
  onSetNote: (id: string, note: string) => void
  onUpdateTimer: (id: string, updates: Partial<HabitData>) => void
  onComplete?: () => void // fires congrats message
  onUncomplete?: () => void
}

function TimerRing({
  remaining,
  duration,
}: {
  remaining: number
  duration: number
}) {
  const size = 56
  const strokeWidth = 3
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = remaining / duration
  const offset = circumference - progress * circumference

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1s linear',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white/80 text-[10px] font-bold tabular-nums">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>
    </div>
  )
}

export default function HabitCard({
  habit,
  index,
  onToggle,
  onSelectSub,
  onSetNote,
  onUpdateTimer,
  onComplete,
  onUncomplete,
}: HabitCardProps) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)
  const [noteValue, setNoteValue] = useState(habit.note || '')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const Icon = iconMap[habit.icon] || Sparkles

  // Timer logic for Investing card
  useEffect(() => {
    if (habit.timerRunning && habit.timerRemaining && habit.timerRemaining > 0) {
      intervalRef.current = setInterval(() => {
        onUpdateTimer(habit.id, {
          timerRemaining: Math.max(0, (habit.timerRemaining || 0) - 1),
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (habit.timerRunning && habit.timerRemaining === 0) {
        onUpdateTimer(habit.id, { timerRunning: false, completed: true })
        onComplete?.()
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [habit.timerRunning, habit.timerRemaining, habit.id, onUpdateTimer, onComplete])

  function handleCardClick() {
    if (habit.subOptions || habit.hasNote || habit.hasTimer) {
      setExpanded(!expanded)
    } else {
      const wasCompleted = habit.completed
      onToggle(habit.id)
      if (!wasCompleted) {
        onComplete?.()
      } else {
        onUncomplete?.()
      }
    }
  }

  function handleUndo(e: React.MouseEvent) {
    e.stopPropagation()
    onToggle(habit.id)
    onUncomplete?.()
  }

  function handleStartTimer() {
    onUpdateTimer(habit.id, { timerRunning: true })
  }

  function handleStopTimer() {
    onUpdateTimer(habit.id, { timerRunning: false, completed: true })
    onComplete?.()
  }

  const notePrompt =
    habit.id === 'ai-skill'
      ? 'What did you learn today?'
      : habit.id === 'book'
        ? 'What are you reading?'
        : habit.id === 'reading'
          ? 'What document did you study?'
          : 'Add a note...'

  return (
    <motion.div
      className={`cursor-pointer transition-all duration-300 ${
        habit.completed
          ? 'opacity-100'
          : 'opacity-70 hover:opacity-100'
      }`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: habit.completed ? 1 : 0.7, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: 'easeOut' }}
      onClick={handleCardClick}
      whileTap={{
        scale: 0.97,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      }}
      layout
    >
      <div className={`liquid-glass rounded-2xl p-5 md:p-6 w-full h-full ${
        habit.completed
          ? 'shadow-[0_0_0_1px_rgba(255,255,255,0.3)]'
          : ''
      }`}>
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-white/80">
            <Icon size={20} />
          </div>
          <div>
            <p className="text-white text-sm font-bold text-readable">{habit.name}</p>
            {habit.selectedSub && (
              <p className="text-white/60 text-xs font-semibold mt-0.5">{habit.selectedSub}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Timer ring for investing */}
          {habit.hasTimer && habit.timerRunning && (
            <TimerRing
              remaining={habit.timerRemaining || 0}
              duration={habit.timerDuration || 3600}
            />
          )}

          {/* Undo button — only on completed cards */}
          <AnimatePresence>
            {habit.completed && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                onClick={handleUndo}
                className="p-1.5 rounded-full text-white/25 hover:text-white/60 hover:bg-white/10 transition-all cursor-pointer"
                title="Undo"
              >
                <Undo2 size={14} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Checkmark */}
          <AnimatePresence>
            {habit.completed && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 22 22"
                  fill="none"
                  className="text-white"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <motion.path
                    d="M7 11l3 3 5-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pt-4 mt-4 border-t border-white/8">
              {/* Sub-options as pills */}
              {habit.subOptions && (
                <div className="flex flex-wrap gap-2">
                  {habit.subOptions.map((sub) => (
                    <button
                      key={sub}
                      onClick={(e) => {
                        e.stopPropagation()
                        const wasCompleted = habit.completed
                        onSelectSub(habit.id, sub)
                        setExpanded(false)
                        if (!wasCompleted) onComplete?.()
                      }}
                      className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        habit.selectedSub === sub
                          ? 'bg-white/25 text-white'
                          : 'bg-white/8 text-white/60 hover:bg-white/15 hover:text-white/80'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}

              {/* Timer controls */}
              {habit.hasTimer && (
                <div className="mt-3 flex items-center gap-3">
                  {!habit.timerRunning ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStartTimer()
                      }}
                      className="px-4 py-2 rounded-full text-xs font-bold bg-white/10 text-white/70 hover:bg-white/15 hover:text-white transition-all cursor-pointer"
                    >
                      Start 60-min timer
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStopTimer()
                      }}
                      className="px-4 py-2 rounded-full text-xs font-bold bg-white/10 text-white/70 hover:bg-white/15 hover:text-white transition-all cursor-pointer"
                    >
                      Complete early
                    </button>
                  )}
                </div>
              )}

              {/* Note input */}
              {habit.hasNote && (
                <div className="mt-3 flex flex-col gap-2">
                  {habit.id === 'ai-skill' && (
                    <p className="text-white/60 text-xs italic mb-1">
                      Suggestion: Learn about <span className="text-white/90 font-semibold">{getTodaysAITopic()}</span>
                    </p>
                  )}
                  <div className="flex gap-2">
                  <input
                    type="text"
                    value={noteValue}
                    onChange={(e) => setNoteValue(e.target.value)}
                    onBlur={() => onSetNote(habit.id, noteValue)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onSetNote(habit.id, noteValue)
                        if (!habit.completed) {
                          onToggle(habit.id)
                          onComplete?.()
                        }
                        setExpanded(false)
                      }
                    }}
                    placeholder={notePrompt}
                    className="flex-1 bg-white/8 border border-white/15 rounded-lg px-3 py-2.5 text-white text-xs font-semibold placeholder:text-white/30 outline-none focus:border-white/25 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!habit.completed) {
                        onToggle(habit.id)
                        onComplete?.()
                      }
                      setExpanded(false)
                    }}
                    className="p-2.5 rounded-lg bg-white/10 text-white/70 hover:bg-white/15 hover:text-white transition-all cursor-pointer"
                  >
                    <Check size={14} />
                  </button>
                  </div>
                </div>
              )}

              {/* Study, Reading & Movement Shortcuts */}
              {habit.id === 'reading' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate('/document-study')
                  }}
                  className="mt-3 w-full text-center py-2.5 rounded-xl bg-white/8 text-white/80 hover:bg-white/12 hover:text-white font-bold text-xs cursor-pointer transition-all border border-white/10"
                >
                  Open Proofing Workspace
                </button>
              )}

              {habit.id === 'book' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate('/book?tab=list')
                  }}
                  className="mt-3 w-full text-center py-2.5 rounded-xl bg-white/8 text-white/80 hover:bg-white/12 hover:text-white font-bold text-xs cursor-pointer transition-all border border-white/10"
                >
                  Open Reading Workspace
                </button>
              )}

              {habit.id === 'movement' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate('/movement?tab=yoga')
                  }}
                  className="mt-3 w-full text-center py-2.5 rounded-xl bg-white/8 text-white/80 hover:bg-white/12 hover:text-white font-bold text-xs cursor-pointer transition-all border border-white/10"
                >
                  Open Movement Workspace
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </motion.div>
  )
}
