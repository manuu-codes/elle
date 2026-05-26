import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import HeroSection from '../components/HeroSection'
import HabitGrid from '../components/HabitGrid'
import CustomTasks from '../components/CustomTasks'
import WeeklyAnalytics from '../components/WeeklyAnalytics'
import Footer from '../components/Footer'
import CongratsToast from '../components/CongratsToast'
import RandomLoveMessages from '../components/RandomLoveMessages'
import { useHabits } from '../hooks/useHabits'
import { useTasks } from '../hooks/useTasks'
import { getRandomStoredMessage } from '../lib/congrats'

export default function Dashboard() {
  const navigate = useNavigate()
  const { habits, completedCount, toggleHabit, selectSub, setNote, updateTimer } =
    useHabits()
  const { todayTasks, upcomingTasks, addTask, toggleTask, deleteTask } = useTasks()
  const [congratsMessage, setCongratsMessage] = useState<string | null>(null)

  const handleHabitComplete = useCallback(() => {
    setCongratsMessage(getRandomStoredMessage())
  }, [])

  const handleSelectSub = useCallback((id: string, sub: string) => {
    selectSub(id, sub)
    if (id === 'movement') {
      const lower = sub.toLowerCase()
      if (lower === 'yoga') navigate('/movement?tab=yoga')
      else if (lower === 'running') navigate('/movement?tab=running')
      else if (lower === 'walking') navigate('/movement?tab=walking')
      else if (lower === 'exercises') navigate('/movement?tab=exercises')
    } else if (id === 'book') {
      const lower = sub.toLowerCase()
      if (lower === 'log reading') navigate('/book?tab=log')
      else if (lower === 'reading list') navigate('/book?tab=list')
    }
  }, [selectSub, navigate])

  return (
    <div className="relative w-full flex flex-col items-center pb-20 z-10">
      <HeroSection />

      <HabitGrid
        habits={habits}
        completedCount={completedCount}
        onToggle={toggleHabit}
        onSelectSub={handleSelectSub}
        onSetNote={setNote}
        onUpdateTimer={updateTimer}
        onHabitComplete={handleHabitComplete}
      />

      <CustomTasks
        todayTasks={todayTasks}
        upcomingTasks={upcomingTasks}
        onAddTask={addTask}
        onToggleTask={toggleTask}
        onDeleteTask={deleteTask}
      />

      <WeeklyAnalytics />

      <div className="w-full max-w-7xl mx-auto px-6 md:px-10">
        <Footer />
      </div>

      <CongratsToast
        message={congratsMessage}
        onDismiss={() => setCongratsMessage(null)}
      />

      {/* Random love messages — appear at random intervals */}
      <RandomLoveMessages />
    </div>
  )
}
