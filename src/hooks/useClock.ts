import { useState, useEffect } from 'react'
import { getAlternatingGreeting, getTodaysQuote } from '../lib/content'

export function useClock() {
  const [now, setNow] = useState(new Date())
  const [greeting, setGreeting] = useState(getAlternatingGreeting())
  const quote = getTodaysQuote()

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Update greeting every 20 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getAlternatingGreeting())
    }, 60 * 1000) // check every minute
    return () => clearInterval(interval)
  }, [])

  const dateString = now
    .toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .toUpperCase()

  const timeString = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  return { now, greeting, dateString, timeString, quote }
}
