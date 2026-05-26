import { motion } from 'motion/react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useWeeklyData } from '../hooks/useHabits'

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
        <p className="text-white/70 text-xs font-semibold">{label}</p>
        <p className="text-white text-sm font-bold mt-0.5">{payload[0].value}%</p>
      </div>
    )
  }
  return null
}

export default function WeeklyAnalytics() {
  const weekData = useWeeklyData()

  // Compute streak stats
  let currentStreak = 0
  for (let i = weekData.length - 1; i >= 0; i--) {
    if (weekData[i].pct > 0) currentStreak++
    else break
  }

  const bestDayIndex = weekData.reduce(
    (best, d, i) => (d.pct > (weekData[best]?.pct ?? 0) ? i : best),
    0
  )
  const bestDay = weekData[bestDayIndex]?.day || '—'

  const avgRate =
    weekData.length > 0
      ? Math.round(weekData.reduce((sum, d) => sum + d.pct, 0) / weekData.length)
      : 0

  return (
    <motion.section
      id="weekly-analytics"
      className="w-full max-w-7xl mx-auto px-6 md:px-10 mt-20 md:mt-32"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <p className="text-white/60 text-sm uppercase tracking-widest mb-6 font-bold text-readable">
        This week
      </p>

      <div className="liquid-glass rounded-2xl p-6 md:p-8">
        {/* Chart */}
        <div className="h-48 md:h-56 mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData} barCategoryGap="25%">
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600 }}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="pct" radius={[4, 4, 0, 0]} animationDuration={1200}>
                {weekData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill="rgba(255,255,255,0.55)"
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-3">
          <div className="bg-white/8 rounded-xl px-5 py-3">
            <span className="text-white/60 text-xs font-bold">🔥 Current streak</span>
            <p className="text-white text-sm font-bold mt-1">
              {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
            </p>
          </div>
          <div className="bg-white/8 rounded-xl px-5 py-3">
            <span className="text-white/60 text-xs font-bold">Best day</span>
            <p className="text-white text-sm font-bold mt-1">{bestDay}</p>
          </div>
          <div className="bg-white/8 rounded-xl px-5 py-3">
            <span className="text-white/60 text-xs font-bold">Completion rate</span>
            <p className="text-white text-sm font-bold mt-1">{avgRate}%</p>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
