import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface HabitData {
  id: string
  name: string
  icon: string
  completed: boolean
  subOptions?: string[]
  selectedSub?: string
  hasNote?: boolean
  note?: string
  hasTimer?: boolean
  timerDuration?: number // in seconds
  timerRemaining?: number
  timerRunning?: boolean
}

const defaultHabits: HabitData[] = [
  { id: 'vitamins', name: 'Vitamins + Juice', icon: 'Pill', completed: false },
  {
    id: 'movement',
    name: 'Movement',
    icon: 'Zap',
    completed: false,
    subOptions: ['Yoga', 'Running', 'Walking', 'Exercises'],
  },
  {
    id: 'investing',
    name: 'Investing',
    icon: 'TrendingUp',
    completed: false,
    subOptions: ['Study', 'Active Investing'],
    hasTimer: true,
    timerDuration: 3600,
    timerRemaining: 3600,
    timerRunning: false,
  },
  {
    id: 'reading',
    name: 'Document Study',
    icon: 'FileText',
    completed: false,
    hasNote: true,
  },
  {
    id: 'ai-skill',
    name: 'AI Skill',
    icon: 'Brain',
    completed: false,
    hasNote: true,
    note: '',
  },
  {
    id: 'book',
    name: 'Book',
    icon: 'BookOpen',
    completed: false,
    subOptions: ['Log Reading', 'Reading List'],
    hasNote: true,
    note: '',
  },
  {
    id: 'self-care',
    name: 'Self Care',
    icon: 'Sparkles',
    completed: false,
    subOptions: ['Shaving', 'Face pack', 'Hair wash', 'Nails', 'Other'],
  },
]

function getTodayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function useHabits() {
  const todayKey = getTodayKey()
  const [habits, setHabits] = useState<HabitData[]>(() => {
    const stored = localStorage.getItem(`elle-habits-${todayKey}`)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        // ignore
      }
    }
    return defaultHabits
  })
  const [loaded, setLoaded] = useState(false)

  // Load from Supabase on mount
  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('habits')
          .select('*')
          .eq('date', todayKey)
          .single()

        if (data?.habit_data) {
          setHabits(data.habit_data)
        }
      } catch {
        // No data for today yet — use defaults
      }
      setLoaded(true)
    }
    load()
  }, [todayKey])

  // Save to Supabase whenever habits change
  useEffect(() => {
    if (!loaded) return
    async function save() {
      try {
        await supabase.from('habits').upsert(
          { date: todayKey, habit_data: habits, updated_at: new Date().toISOString() },
          { onConflict: 'date' }
        )
      } catch {
        // Silently fail — local state is still valid
      }
    }
    save()
  }, [habits, loaded, todayKey])

  // Also persist to localStorage as fallback
  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(`elle-habits-${todayKey}`, JSON.stringify(habits))
  }, [habits, loaded, todayKey])

  const toggleHabit = useCallback((id: string) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h))
    )
  }, [])

  const selectSub = useCallback((id: string, sub: string) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, selectedSub: sub, completed: true } : h))
    )
  }, [])

  const setNote = useCallback((id: string, note: string) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, note } : h)))
  }, [])

  const updateTimer = useCallback((id: string, updates: Partial<HabitData>) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)))
  }, [])

  const completedCount = habits.filter((h) => h.completed).length

  return { habits, completedCount, toggleHabit, selectSub, setNote, updateTimer }
}

export function useWeeklyData(weekOffset: number = 0) {
  const [weekData, setWeekData] = useState<{ day: string; pct: number; label: string }[]>([])

  useEffect(() => {
    async function loadWeek() {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const daysInfo: { dateKey: string; dayName: string; label: string }[] = []
      const keys: string[] = []

      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i - (weekOffset * 7))
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        daysInfo.push({ dateKey: key, dayName: dayNames[d.getDay()], label })
        keys.push(key)
      }

      // Query all 7 days from Supabase in a single batch request
      const dbDataMap: Record<string, HabitData[]> = {}
      try {
        const { data, error } = await supabase
          .from('habits')
          .select('date, habit_data')
          .in('date', keys)

        if (data && !error) {
          data.forEach((row: { date: string; habit_data: HabitData[] }) => {
            if (row.habit_data) {
              dbDataMap[row.date] = row.habit_data
            }
          })
        }
      } catch {
        // Fall back to local storage
      }

      const weekResults = daysInfo.map(({ dateKey, dayName, label }) => {
        let pct = 0
        let habitsList: HabitData[] | null = null

        // Try DB first
        if (dbDataMap[dateKey]) {
          habitsList = dbDataMap[dateKey]
        } else {
          // Try local storage
          const stored = localStorage.getItem(`elle-habits-${dateKey}`)
          if (stored) {
            try {
              habitsList = JSON.parse(stored) as HabitData[]
            } catch {
              // ignore
            }
          }
        }

        if (habitsList && habitsList.length > 0) {
          const completed = habitsList.filter((h) => h.completed).length
          pct = Math.round((completed / habitsList.length) * 100)
        }

        return { day: dayName, pct, label }
      })

      setWeekData(weekResults)
    }
    loadWeek()
  }, [weekOffset])

  return weekData
}
