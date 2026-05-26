import HabitCard from './HabitCard'
import CompletionRing from './CompletionRing'
import type { HabitData } from '../hooks/useHabits'

interface HabitGridProps {
  habits: HabitData[]
  completedCount: number
  onToggle: (id: string) => void
  onSelectSub: (id: string, sub: string) => void
  onSetNote: (id: string, note: string) => void
  onUpdateTimer: (id: string, updates: Partial<HabitData>) => void
  onHabitComplete?: () => void
}

export default function HabitGrid({
  habits,
  completedCount,
  onToggle,
  onSelectSub,
  onSetNote,
  onUpdateTimer,
  onHabitComplete,
}: HabitGridProps) {
  return (
    <section
      id="habits"
      className="w-full max-w-7xl mx-auto px-6 md:px-10"
    >
      <CompletionRing completed={completedCount} total={habits.length} />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onToggle={onToggle}
            onSelectSub={onSelectSub}
            onSetNote={onSetNote}
            onUpdateTimer={onUpdateTimer}
            onComplete={onHabitComplete}
          />
        ))}
      </div>
    </section>
  )
}
