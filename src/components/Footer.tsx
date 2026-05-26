import { motion } from 'motion/react'
import { Link } from 'react-router-dom'

export default function Footer() {
  function handleResetDay(e: React.MouseEvent) {
    e.preventDefault()
    if (confirm("Are you sure you want to reset all habits and progress for today? This will clear today's completed items.")) {
      const d = new Date()
      const todayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      localStorage.removeItem(`elle-habits-${todayKey}`)
      localStorage.removeItem(`elle-exercises-${todayKey}`)
      localStorage.removeItem(`elle-yoga-${todayKey}`)
      window.location.href = '/'
    }
  }

  function handlePrivacy(e: React.MouseEvent) {
    e.preventDefault()
    alert("Your privacy is absolute. All your habit data is stored securely on your local device and private Supabase instance. Maneesh doesn't track any of your entries. ♥")
  }

  function handleSupport(e: React.MouseEvent) {
    e.preventDefault()
    alert("Need help? Reach out to Maneesh — he's your lifetime technical support (and number one fan). ♥")
  }

  return (
    <motion.footer
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
      className="liquid-glass w-full rounded-3xl p-6 md:p-10 text-white/80 mt-32 md:mt-64"
    >
      {/* Footer Top Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 mb-10">
        {/* Brand column */}
        <div className="md:col-span-5">
          <div className="flex items-center gap-3 mb-4">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              className="text-pink-200"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="text-xl font-bold text-white">Elle</span>
          </div>
          <p className="text-sm font-semibold leading-relaxed max-w-sm text-white/60">
            Elle is Manushree's personal system — built to help her grow, stay
            sharp, and move with intention every day.
          </p>
        </div>

        {/* Links columns */}
        <div className="md:col-span-7 grid grid-cols-3 gap-8">
          {/* Focus */}
          <div>
            <h4 className="text-sm uppercase tracking-wider text-white font-bold mb-4">
              Focus
            </h4>
            <ul className="text-xs font-semibold space-y-2.5">
              <li>
                <a href="/#habits" className="text-white/60 hover:text-white transition-colors">
                  Daily Habits
                </a>
              </li>
              <li>
                <a href="/#tasks" className="text-white/60 hover:text-white transition-colors">
                  Custom Tasks
                </a>
              </li>
              <li>
                <a href="/#weekly-analytics" className="text-white/60 hover:text-white transition-colors">
                  Weekly Review
                </a>
              </li>
              <li>
                <a href="/#habits" className="text-white/60 hover:text-white transition-colors">
                  Investing Timer
                </a>
              </li>
              <li>
                <Link to="/book?tab=log" className="text-white/60 hover:text-white transition-colors">
                  Reading Log
                </Link>
              </li>
            </ul>
          </div>

          {/* Progress */}
          <div>
            <h4 className="text-sm uppercase tracking-wider text-white font-bold mb-4">
              Progress
            </h4>
            <ul className="text-xs font-semibold space-y-2.5">
              <li>
                <a href="/#weekly-analytics" className="text-white/60 hover:text-white transition-colors">
                  Streak Tracker
                </a>
              </li>
              <li>
                <a href="/#weekly-analytics" className="text-white/60 hover:text-white transition-colors">
                  Completion Stats
                </a>
              </li>
              <li>
                <a href="/#weekly-analytics" className="text-white/60 hover:text-white transition-colors">
                  Monthly View
                </a>
              </li>
              <li>
                <a href="/#weekly-analytics" className="text-white/60 hover:text-white transition-colors">
                  Habit History
                </a>
              </li>
            </ul>
          </div>

          {/* System */}
          <div>
            <h4 className="text-sm uppercase tracking-wider text-white font-bold mb-4">
              System
            </h4>
            <ul className="text-xs font-semibold space-y-2.5">
              <li>
                <a href="/#hero" className="text-white/60 hover:text-white transition-colors">
                  About Elle
                </a>
              </li>
              <li>
                <a href="#" onClick={handleResetDay} className="text-white/60 hover:text-white transition-colors">
                  Reset Day
                </a>
              </li>
              <li>
                <a href="#" onClick={handlePrivacy} className="text-white/60 hover:text-white transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" onClick={handleSupport} className="text-white/60 hover:text-white transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="pt-6 border-t border-white/10 flex items-center justify-center">
        <p className="text-[11px] uppercase tracking-widest opacity-60 font-bold">
          Built for Manushree. With love.
        </p>
      </div>
    </motion.footer>
  )
}
