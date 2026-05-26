import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, ChevronDown, Check, Calendar, Trash2 } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import type { TaskData } from '../hooks/useTasks'

interface CustomTasksProps {
  todayTasks: TaskData[]
  upcomingTasks: TaskData[]
  onAddTask: (name: string, date: string) => void
  onToggleTask: (id: string) => void
  onDeleteTask: (id: string) => void
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function CustomTasks({
  todayTasks,
  upcomingTasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}: CustomTasksProps) {
  const [showForm, setShowForm] = useState(false)
  const [taskName, setTaskName] = useState('')
  const [taskDate, setTaskDate] = useState<Date>(new Date())
  const [showUpcoming, setShowUpcoming] = useState(false)

  function handleSubmit() {
    if (!taskName.trim()) return
    onAddTask(taskName.trim(), formatDate(taskDate))
    setTaskName('')
    setTaskDate(new Date())
    setShowForm(false)
  }

  return (
    <section
      id="tasks"
      className="w-full max-w-7xl mx-auto px-6 md:px-10 mt-20 md:mt-32"
    >
      <p className="text-white/60 text-sm uppercase tracking-widest mb-6 font-bold text-readable">
        Today's extras
      </p>

      {/* Add task button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="liquid-glass rounded-xl px-5 py-3.5 flex items-center gap-2.5 text-white/70 text-sm font-bold hover:text-white transition-colors mb-4 cursor-pointer"
      >
        <Plus size={16} />
        <span>Add task</span>
      </button>

      {/* Inline form — NO overflow:hidden so calendar can render */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mb-4"
          >
            <div className="liquid-glass rounded-xl p-5 flex flex-col gap-3" style={{ overflow: 'visible' }}>
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="What needs to happen?"
                className="bg-white/8 border border-white/15 rounded-lg px-4 py-3 text-white text-sm font-semibold placeholder:text-white/30 outline-none focus:border-white/25 transition-colors w-full"
                autoFocus
              />
              <div className="flex items-center gap-3">
                <div className="relative">
                  <DatePicker
                    selected={taskDate}
                    onChange={(date: Date | null) => date && setTaskDate(date)}
                    minDate={new Date()}
                    dateFormat="MMM d, yyyy"
                    portalId="datepicker-portal"
                    className="bg-white/8 border border-white/15 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm font-semibold outline-none focus:border-white/25 transition-colors w-44 cursor-pointer"
                  />
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                </div>
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2.5 rounded-lg bg-white/10 text-white/80 text-sm font-bold hover:bg-white/15 hover:text-white transition-all cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today's tasks */}
      <div className="space-y-2">
        {todayTasks.map((task) => (
          <motion.div
            key={task.id}
            className="cursor-pointer group"
            onClick={() => onToggleTask(task.id)}
            whileTap={{
              scale: 0.98,
              transition: { type: 'spring', stiffness: 300, damping: 20 },
            }}
            layout
          >
            <div className="liquid-glass rounded-xl px-5 py-3.5 flex items-center justify-between w-full h-full">
              <span
                className={`text-sm font-semibold transition-all duration-300 ${
                  task.completed
                    ? 'text-white/40 line-through'
                    : 'text-white/90'
                }`}
              >
                {task.name}
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteTask(task.id)
                  }}
                  className="text-white/20 hover:text-red-400 p-1 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Delete task"
                >
                  <Trash2 size={14} />
                </button>
                <AnimatePresence>
                  {task.completed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="text-white/50"
                    >
                      <Check size={16} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Upcoming tasks */}
      {upcomingTasks.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowUpcoming(!showUpcoming)}
            className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-widest mb-3 cursor-pointer hover:text-white/70 transition-colors font-bold"
          >
            <span>Upcoming</span>
            <motion.span
              animate={{ rotate: showUpcoming ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={12} />
            </motion.span>
          </button>

          <AnimatePresence>
            {showUpcoming && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2 overflow-hidden"
              >
                {upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="liquid-glass rounded-xl px-5 py-3.5 flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-white/70 text-sm font-semibold">{task.name}</span>
                      <span className="text-white/30 text-xs font-semibold ml-3">{task.date}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteTask(task.id)
                      }}
                      className="text-white/20 hover:text-red-400 p-1 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </section>
  )
}
