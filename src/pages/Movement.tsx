import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, Play, Square, CheckCircle2, Video, Plus, Clock, Dumbbell, Compass, RefreshCw } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

interface ActivityData {
  id: string
  type: 'Run' | 'Walk'
  date: string
  distance: string // km
  time: string // MM:SS
  pace: string // min/km
}

const maneeshMessages = [
  "You went out and did it. I'm so proud.",
  "Your pace doesn't matter. Showing up does. And you showed up.",
  "Look at those numbers! You're literally unstoppable.",
  "Every step makes you stronger. I see the difference.",
  "I don't know anyone as consistent as you.",
  "You're a machine, baby.",
]

const yogaPoses = [
  { id: 'y1', name: "Child's Pose", detail: 'Rest and breathe — 2 mins' },
  { id: 'y2', name: 'Cat-Cow Flow', detail: 'Warm up the spine — 10 rounds' },
  { id: 'y3', name: 'Downward Dog', detail: 'Hold for 5 deep breaths' },
  { id: 'y4', name: 'Low Lunge', detail: 'Open the hips — 5 breaths each side' },
  { id: 'y5', name: 'Warrior II', detail: 'Build strength — 5 breaths each side' },
  { id: 'y6', name: 'Tree Pose', detail: 'Find balance — 5 breaths each side' },
  { id: 'y7', name: 'Seated Forward Fold', detail: 'Stretch hamstrings — 10 breaths' },
  { id: 'y8', name: 'Savasana', detail: 'Total relaxation — 5 mins' },
]

const workoutPlans = {
  legs: [
    { id: 'e1', name: 'Squats', detail: '3 × 15 reps' },
    { id: 'e2', name: 'Forward Lunges', detail: '3 × 12 each leg' },
    { id: 'e3', name: 'Wall Sits', detail: '3 × 30 seconds' },
    { id: 'e4', name: 'Calf Raises', detail: '3 × 20 reps' },
    { id: 'e5', name: 'Sumo Squats', detail: '3 × 15 reps' },
    { id: 'e6', name: 'Step-ups', detail: '3 × 12 each leg (use a chair)' },
  ],
  glutes: [
    { id: 'e7', name: 'Glute Bridges', detail: '3 × 15 reps' },
    { id: 'e8', name: 'Donkey Kicks', detail: '3 × 15 each leg' },
    { id: 'e9', name: 'Fire Hydrants', detail: '3 × 15 each leg' },
    { id: 'e10', name: 'Single-Leg Bridges', detail: '3 × 10 each leg' },
    { id: 'e11', name: 'Elevated Hip Thrusts', detail: '3 × 12 reps' },
    { id: 'e12', name: 'Squat Pulses', detail: '3 × 20 reps' },
  ],
  abs: [
    { id: 'e13', name: 'Crunches', detail: '3 × 20 reps' },
    { id: 'e14', name: 'Bicycle Crunches', detail: '3 × 15 each side' },
    { id: 'e15', name: 'Leg Raises', detail: '3 × 12 reps' },
    { id: 'e16', name: 'Plank', detail: '3 × 30 seconds' },
    { id: 'e17', name: 'Mountain Climbers', detail: '3 × 20 reps' },
    { id: 'e18', name: 'Dead Bug', detail: '3 × 10 each side' },
  ],
}

function getTodayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getFormattedDate(): string {
  const d = new Date()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()]} ${d.getDate()}`
}

function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export default function Movement() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const todayKey = getTodayKey()

  // Tabs: yoga, exercises, running, walking
  const activeTab = (searchParams.get('tab') || 'yoga') as 'yoga' | 'exercises' | 'running' | 'walking'

  // Sub-tabs for exercises
  const [exerciseDay, setExerciseDay] = useState<'legs' | 'glutes' | 'abs'>('legs')

  // --- COMMON LOGGED/LOADED STATES ---
  const [completedPoses, setCompletedPoses] = useState<string[]>([])
  const [completedExercises, setCompletedExercises] = useState<string[]>([])
  const [activities, setActivities] = useState<ActivityData[]>([])

  // Logger states
  const [distance, setDistance] = useState('')
  const [time, setTime] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  // --- TIMER STATES ---
  // Yoga Timers
  const [yogaSessionTime, setYogaSessionTime] = useState(0)
  const [yogaSessionRunning, setYogaSessionRunning] = useState(false)
  const [yogaHoldTime, setYogaHoldTime] = useState(0)
  const [yogaHoldRunning, setYogaHoldRunning] = useState(false)

  // Exercise Timers
  const [exRestTime, setExRestTime] = useState(60)
  const [exRestRunning, setExRestRunning] = useState(false)
  const [exStopwatchTime, setExStopwatchTime] = useState(0)
  const [exStopwatchRunning, setExStopwatchRunning] = useState(false)

  // Interval references
  const yogaSessionRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const yogaHoldRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const exRestRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const exStopwatchRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // --- LOAD INITIAL DATA ---
  useEffect(() => {
    async function loadData() {
      // 1. Local Cache Load
      const storedYoga = localStorage.getItem(`elle-yoga-${todayKey}`)
      const storedEx = localStorage.getItem(`elle-exercises-${todayKey}`)
      const storedAct = localStorage.getItem('elle-activities')

      if (storedYoga) {
        try { setCompletedPoses(JSON.parse(storedYoga)) } catch { /* ignore */ }
      }
      if (storedEx) {
        try { setCompletedExercises(JSON.parse(storedEx)) } catch { /* ignore */ }
      }
      if (storedAct) {
        try { setActivities(JSON.parse(storedAct)) } catch { /* ignore */ }
      }

      // 2. Supabase DB Load
      try {
        const { data: yogaData } = await supabase
          .from('yoga_logs')
          .select('completed_poses')
          .eq('date', todayKey)
          .single()
        if (yogaData?.completed_poses) {
          setCompletedPoses(yogaData.completed_poses)
          localStorage.setItem(`elle-yoga-${todayKey}`, JSON.stringify(yogaData.completed_poses))
        }

        const { data: exData } = await supabase
          .from('exercise_logs')
          .select('completed_exercises')
          .eq('date', todayKey)
          .single()
        if (exData?.completed_exercises) {
          setCompletedExercises(exData.completed_exercises)
          localStorage.setItem(`elle-exercises-${todayKey}`, JSON.stringify(exData.completed_exercises))
        }

        const { data: actData } = await supabase
          .from('running_logs')
          .select('*')
          .order('created_at', { ascending: false })
        if (actData && actData.length > 0) {
          const mapped: ActivityData[] = actData.map((d: Record<string, string>) => ({
            id: d.id,
            type: d.type as 'Run' | 'Walk',
            date: d.date,
            distance: d.distance,
            time: d.time,
            pace: d.pace,
          }))
          setActivities(mapped)
          localStorage.setItem('elle-activities', JSON.stringify(mapped))
        }
      } catch {
        // ignore connection issues
      }
    }
    loadData()
  }, [todayKey])

  // --- SAVE SYNC ACTIONS ---
  async function saveYoga(updatedPoses: string[]) {
    setCompletedPoses(updatedPoses)
    localStorage.setItem(`elle-yoga-${todayKey}`, JSON.stringify(updatedPoses))
    try {
      await supabase
        .from('yoga_logs')
        .upsert({
          date: todayKey,
          completed_poses: updatedPoses,
          updated_at: new Date().toISOString()
        }, { onConflict: 'date' })
    } catch { /* ignore */ }
  }

  async function saveExercises(updatedEx: string[]) {
    setCompletedExercises(updatedEx)
    localStorage.setItem(`elle-exercises-${todayKey}`, JSON.stringify(updatedEx))
    try {
      await supabase
        .from('exercise_logs')
        .upsert({
          date: todayKey,
          completed_exercises: updatedEx,
          updated_at: new Date().toISOString()
        }, { onConflict: 'date' })
    } catch { /* ignore */ }
  }

  // --- RUN/WALK LOGGING SUBMIT ---
  async function handleLogActivity(e: React.FormEvent, type: 'Run' | 'Walk') {
    e.preventDefault()
    if (!distance || !time) return

    const distNum = parseFloat(distance)
    const timeParts = time.split(':')
    const totalMins = parseInt(timeParts[0] || '0') + parseInt(timeParts[1] || '0') / 60

    const paceDecimal = totalMins / distNum
    const paceMins = Math.floor(paceDecimal)
    const paceSecs = Math.floor((paceDecimal - paceMins) * 60)
    const paceStr = `${paceMins}:${String(paceSecs).padStart(2, '0')}`

    const newActivity: ActivityData = {
      id: generateUUID(),
      type,
      date: getFormattedDate(),
      distance: distNum.toFixed(2),
      time,
      pace: paceStr,
    }

    const updated = [newActivity, ...activities]
    setActivities(updated)
    localStorage.setItem('elle-activities', JSON.stringify(updated))

    setDistance('')
    setTime('')

    // Show feedback alert
    setFeedback(maneeshMessages[Math.floor(Math.random() * maneeshMessages.length)])
    setTimeout(() => setFeedback(null), 8000)

    try {
      await supabase.from('running_logs').insert({
        id: newActivity.id,
        type: newActivity.type,
        date: newActivity.date,
        distance: newActivity.distance,
        time: newActivity.time,
        pace: newActivity.pace,
        created_at: new Date().toISOString()
      })
    } catch { /* ignore */ }
  }

  // --- TIMERS INTERACTION ---
  // Yoga session timer
  useEffect(() => {
    if (yogaSessionRunning) {
      yogaSessionRef.current = setInterval(() => setYogaSessionTime((prev) => prev + 1), 1000)
    } else {
      if (yogaSessionRef.current) clearInterval(yogaSessionRef.current)
    }
    return () => { if (yogaSessionRef.current) clearInterval(yogaSessionRef.current) }
  }, [yogaSessionRunning])

  // Yoga pose hold timer
  useEffect(() => {
    if (yogaHoldRunning) {
      yogaHoldRef.current = setInterval(() => setYogaHoldTime((prev) => prev + 1), 1000)
    } else {
      if (yogaHoldRef.current) clearInterval(yogaHoldRef.current)
    }
    return () => { if (yogaHoldRef.current) clearInterval(yogaHoldRef.current) }
  }, [yogaHoldRunning])

  // Exercise rest timer
  useEffect(() => {
    if (exRestRunning) {
      exRestRef.current = setInterval(() => {
        setExRestTime((prev) => {
          if (prev <= 1) {
            setExRestRunning(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (exRestRef.current) clearInterval(exRestRef.current)
    }
    return () => { if (exRestRef.current) clearInterval(exRestRef.current) }
  }, [exRestRunning])

  // Exercise stopwatch
  useEffect(() => {
    if (exStopwatchRunning) {
      exStopwatchRef.current = setInterval(() => setExStopwatchTime((prev) => prev + 1), 1000)
    } else {
      if (exStopwatchRef.current) clearInterval(exStopwatchRef.current)
    }
    return () => { if (exStopwatchRef.current) clearInterval(exStopwatchRef.current) }
  }, [exStopwatchRunning])

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  // Filters
  const yogaProgress = Math.round((completedPoses.length / yogaPoses.length) * 100) || 0
  const runningActivities = activities.filter(a => a.type === 'Run')
  const walkingActivities = activities.filter(a => a.type === 'Walk')

  return (
    <div className="relative w-full min-h-[100vh] flex flex-col items-center pb-20 px-6 pt-10 z-10">
      <div className="w-full max-w-4xl">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold tracking-wide">Back to Elle</span>
        </button>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-white mb-8 text-readable tracking-tight"
        >
          Movement Workspace
        </motion.h1>

        {/* Tab Selection */}
        <div className="flex gap-2.5 mb-8">
          {(['yoga', 'exercises', 'running', 'walking'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSearchParams({ tab })}
              className={`flex-1 py-3 rounded-xl font-bold capitalize flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === tab ? 'bg-white text-black' : 'liquid-glass text-white/70 hover:bg-white/10'
              }`}
            >
              {tab === 'yoga' && <Compass size={16} />}
              {tab === 'exercises' && <Dumbbell size={16} />}
              {tab === 'running' && <Clock size={16} />}
              {tab === 'walking' && <Compass size={16} />}
              {tab}
            </button>
          ))}
        </div>

        {/* Feedback Messages */}
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="mb-8 liquid-glass rounded-xl p-4 border border-pink-500/30"
          >
            <p className="text-white font-semibold text-lg text-readable">"{feedback}"</p>
            <p className="text-white/50 text-sm mt-1">— Maneesh</p>
          </motion.div>
        )}

        {/* Grid Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main workspace (Left 8 Columns) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            {/* YOGA TAB */}
            {activeTab === 'yoga' && (
              <div className="flex flex-col gap-3">
                {yogaPoses.map((pose, i) => {
                  const isCompleted = completedPoses.includes(pose.id)
                  return (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={pose.id}
                      className={`liquid-glass rounded-xl p-4.5 flex items-center justify-between transition-all ${
                        isCompleted ? 'opacity-55' : 'hover:bg-white/8'
                      }`}
                    >
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => {
                          const updated = isCompleted 
                            ? completedPoses.filter(id => id !== pose.id) 
                            : [...completedPoses, pose.id]
                          saveYoga(updated)
                        }}
                      >
                        <p className={`text-white font-bold ${isCompleted ? 'line-through text-white/50' : ''}`}>
                          {pose.name}
                        </p>
                        <p className="text-white/50 text-xs mt-0.5">{pose.detail}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <a 
                          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(pose.name + ' yoga pose tutorial')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/40 hover:text-red-400 transition-colors"
                          title="Watch tutorial on YouTube"
                        >
                          <Video size={18} />
                        </a>
                        <div
                          onClick={() => {
                            const updated = isCompleted 
                              ? completedPoses.filter(id => id !== pose.id) 
                              : [...completedPoses, pose.id]
                            saveYoga(updated)
                          }}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
                            isCompleted ? 'bg-white border-white text-black' : 'border-white/30'
                          }`}
                        >
                          {isCompleted && <CheckCircle2 size={15} strokeWidth={3} />}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* EXERCISES TAB */}
            {activeTab === 'exercises' && (
              <div className="flex flex-col gap-4">
                {/* Exercises Inner Subtabs */}
                <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
                  {(['legs', 'glutes', 'abs'] as const).map((day) => (
                    <button
                      key={day}
                      onClick={() => setExerciseDay(day)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-colors ${
                        exerciseDay === day ? 'bg-white text-black' : 'text-white/60 hover:text-white cursor-pointer'
                      }`}
                    >
                      {day} Day
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  {workoutPlans[exerciseDay].map((ex, i) => {
                    const isCompleted = completedExercises.includes(ex.id)
                    return (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={ex.id}
                        className={`liquid-glass rounded-xl p-4.5 flex items-center justify-between transition-all ${
                          isCompleted ? 'opacity-55' : 'hover:bg-white/8'
                        }`}
                      >
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => {
                            const updated = isCompleted 
                              ? completedExercises.filter(id => id !== ex.id) 
                              : [...completedExercises, ex.id]
                            saveExercises(updated)
                          }}
                        >
                          <p className={`text-white font-bold ${isCompleted ? 'line-through text-white/50' : ''}`}>
                            {ex.name}
                          </p>
                          <p className="text-white/50 text-xs mt-0.5">{ex.detail}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <a 
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' exercise tutorial')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/40 hover:text-red-400 transition-colors"
                            title="Watch tutorial on YouTube"
                          >
                            <Video size={18} />
                          </a>
                          <div
                            onClick={() => {
                              const updated = isCompleted 
                                ? completedExercises.filter(id => id !== ex.id) 
                                : [...completedExercises, ex.id]
                              saveExercises(updated)
                            }}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
                              isCompleted ? 'bg-white border-white text-black' : 'border-white/30'
                            }`}
                          >
                            {isCompleted && <CheckCircle2 size={15} strokeWidth={3} />}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* RUNNING TAB */}
            {activeTab === 'running' && (
              <div className="flex flex-col gap-4">
                <h3 className="text-white font-bold text-sm uppercase tracking-wider">Run logs history</h3>
                {runningActivities.length === 0 ? (
                  <div className="liquid-glass rounded-2xl p-8 text-center text-white/40 font-bold text-xs">
                    No runs logged yet. Get out there and track your first run!
                  </div>
                ) : (
                  runningActivities.map((act, i) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={act.id}
                      className="liquid-glass rounded-xl p-5 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-white font-bold text-lg">{act.distance} km</p>
                        <p className="text-white/50 text-xs mt-0.5">{act.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold text-sm">{act.time}</p>
                        <p className="text-white/40 text-xs mt-0.5">{act.pace} /km</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* WALKING TAB */}
            {activeTab === 'walking' && (
              <div className="flex flex-col gap-4">
                <h3 className="text-white font-bold text-sm uppercase tracking-wider">Walk logs history</h3>
                {walkingActivities.length === 0 ? (
                  <div className="liquid-glass rounded-2xl p-8 text-center text-white/40 font-bold text-xs">
                    No walks logged yet. Step outside and log your first walk!
                  </div>
                ) : (
                  walkingActivities.map((act, i) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={act.id}
                      className="liquid-glass rounded-xl p-5 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-white font-bold text-lg">{act.distance} km</p>
                        <p className="text-white/50 text-xs mt-0.5">{act.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold text-sm">{act.time}</p>
                        <p className="text-white/40 text-xs mt-0.5">{act.pace} /km</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

          </div>

          {/* Controls / Log Forms Panel (Right 4 Columns) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* YOGA CONTROLS */}
            {activeTab === 'yoga' && (
              <>
                <div className="liquid-glass rounded-2xl p-6 flex flex-col gap-5">
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Clock size={16} />
                    Yoga Timers
                  </h3>

                  {/* Session Timer */}
                  <div className="flex flex-col items-center p-3 bg-white/4 rounded-xl">
                    <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1.5">Session duration</span>
                    <span className="text-3xl font-light text-white tabular-nums tracking-tight mb-3">
                      {formatTime(yogaSessionTime)}
                    </span>
                    <button
                      onClick={() => setYogaSessionRunning(!yogaSessionRunning)}
                      className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex justify-center items-center gap-1.5 cursor-pointer transition-all"
                    >
                      {yogaSessionRunning ? <Square size={12} fill="white" /> : <Play size={12} fill="white" />}
                      {yogaSessionRunning ? 'Pause' : 'Start Timer'}
                    </button>
                  </div>

                  {/* Hold Timer */}
                  <div className="flex flex-col items-center p-3 bg-white/4 rounded-xl">
                    <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1.5">Pose Hold stopwatch</span>
                    <span className="text-3xl font-light text-white tabular-nums tracking-tight mb-3">
                      {formatTime(yogaHoldTime)}
                    </span>
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => setYogaHoldRunning(!yogaHoldRunning)}
                        className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex justify-center items-center gap-1.5 cursor-pointer transition-all"
                      >
                        {yogaHoldRunning ? <Square size={12} fill="white" /> : <Play size={12} fill="white" />}
                        {yogaHoldRunning ? 'Stop' : 'Hold'}
                      </button>
                      <button
                        onClick={() => {
                          setYogaHoldRunning(false)
                          setYogaHoldTime(0)
                        }}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Yoga stats */}
                <div className="liquid-glass rounded-2xl p-6 text-white/80">
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Yoga Progress</h3>
                  <div className="flex justify-between items-center mb-2.5 text-xs font-semibold">
                    <span className="text-white/50">Completed:</span>
                    <span className="text-white">{completedPoses.length} / {yogaPoses.length} Poses</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-white/85 h-full rounded-full transition-all duration-500"
                      style={{ width: `${yogaProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider text-right mt-2">{yogaProgress}% done</p>
                </div>
              </>
            )}

            {/* EXERCISES CONTROLS */}
            {activeTab === 'exercises' && (
              <div className="liquid-glass rounded-2xl p-6 flex flex-col gap-5">
                <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Clock size={16} />
                  Workout Timers
                </h3>

                {/* Rest Timer */}
                <div className="flex flex-col items-center p-3 bg-white/4 rounded-xl">
                  <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1.5">Rest Interval</span>
                  <span className="text-3xl font-light text-white tabular-nums tracking-tight mb-3">
                    {formatTime(exRestTime)}
                  </span>
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => setExRestRunning(!exRestRunning)}
                      className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex justify-center items-center gap-1.5 cursor-pointer transition-all"
                    >
                      {exRestRunning ? <Square size={12} fill="white" /> : <Play size={12} fill="white" />}
                      {exRestRunning ? 'Pause' : 'Start Rest'}
                    </button>
                    <button
                      onClick={() => {
                        setExRestRunning(false)
                        setExRestTime(60)
                      }}
                      className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-bold text-xs cursor-pointer transition-all"
                    >
                      60s
                    </button>
                  </div>
                </div>

                {/* Stopwatch */}
                <div className="flex flex-col items-center p-3 bg-white/4 rounded-xl">
                  <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1.5">Active Session duration</span>
                  <span className="text-3xl font-light text-white tabular-nums tracking-tight mb-3">
                    {formatTime(exStopwatchTime)}
                  </span>
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => setExStopwatchRunning(!exStopwatchRunning)}
                      className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex justify-center items-center gap-1.5 cursor-pointer transition-all"
                    >
                      {exStopwatchRunning ? <Square size={12} fill="white" /> : <Play size={12} fill="white" />}
                      {exStopwatchRunning ? 'Pause' : 'Start'}
                    </button>
                    <button
                      onClick={() => {
                        setExStopwatchRunning(false)
                        setExStopwatchTime(0)
                      }}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* RUNNING LOG INPUT */}
            {activeTab === 'running' && (
              <div className="liquid-glass rounded-2xl p-6">
                <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Plus size={16} />
                  Log a Run
                </h3>
                <form onSubmit={(e) => handleLogActivity(e, 'Run')} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-white/60 text-[10px] font-bold uppercase tracking-wider mb-2">
                      Distance (km)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      placeholder="e.g. 5.0"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-semibold outline-none focus:border-white/20 transition-colors text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-[10px] font-bold uppercase tracking-wider mb-2">
                      Time (MM:SS)
                    </label>
                    <input
                      type="text"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="e.g. 30:00"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-semibold outline-none focus:border-white/20 transition-colors text-xs"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-white text-black font-bold py-2.5 rounded-xl hover:bg-white/90 transition-colors cursor-pointer text-xs mt-2"
                  >
                    Save Run Session
                  </button>
                </form>
              </div>
            )}

            {/* WALKING LOG INPUT */}
            {activeTab === 'walking' && (
              <div className="liquid-glass rounded-2xl p-6">
                <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Plus size={16} />
                  Log a Walk
                </h3>
                <form onSubmit={(e) => handleLogActivity(e, 'Walk')} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-white/60 text-[10px] font-bold uppercase tracking-wider mb-2">
                      Distance (km)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      placeholder="e.g. 3.2"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-semibold outline-none focus:border-white/20 transition-colors text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-[10px] font-bold uppercase tracking-wider mb-2">
                      Time (MM:SS)
                    </label>
                    <input
                      type="text"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="e.g. 45:00"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-semibold outline-none focus:border-white/20 transition-colors text-xs"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-white text-black font-bold py-2.5 rounded-xl hover:bg-white/90 transition-colors cursor-pointer text-xs mt-2"
                  >
                    Save Walk Session
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}
