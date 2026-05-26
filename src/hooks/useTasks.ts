import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface TaskData {
  id: string
  name: string
  completed: boolean
  date: string // YYYY-MM-DD
  createdAt: string
}

function getTodayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function useTasks() {
  const [tasks, setTasks] = useState<TaskData[]>([])
  const [loaded, setLoaded] = useState(false)
  const todayKey = getTodayKey()

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false })

        if (data && data.length > 0) {
          const mapped = data.map((d: Record<string, string | boolean>) => ({
            id: d.id as string,
            name: d.name as string,
            completed: d.completed as boolean,
            date: d.date as string,
            createdAt: d.created_at as string,
          }))
          setTasks(mapped)
        }
      } catch {
        // Try localStorage
        const stored = localStorage.getItem('elle-tasks')
        if (stored) {
          try {
            setTasks(JSON.parse(stored))
          } catch {
            // ignore
          }
        }
      }
      setLoaded(true)
    }
    load()
  }, [])

  useEffect(() => {
    if (!loaded) return
    localStorage.setItem('elle-tasks', JSON.stringify(tasks))
  }, [tasks, loaded])

  const addTask = useCallback(
    (name: string, date: string) => {
      const task: TaskData = {
        id: generateUUID(),
        name,
        completed: false,
        date,
        createdAt: new Date().toISOString(),
      }
      setTasks((prev) => [task, ...prev])

      // Save to Supabase
      supabase
        .from('tasks')
        .insert({ id: task.id, name: task.name, completed: false, date: task.date, created_at: task.createdAt })
        .then()
    },
    []
  )

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      const task = updated.find((t) => t.id === id)
      if (task) {
        supabase.from('tasks').update({ completed: task.completed }).eq('id', id).then()
      }
      return updated
    })
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    supabase.from('tasks').delete().eq('id', id).then()
  }, [])

  const todayTasks = tasks.filter((t) => t.date === todayKey)
  const upcomingTasks = tasks.filter((t) => t.date > todayKey && !t.completed)

  return { tasks, todayTasks, upcomingTasks, addTask, toggleTask, deleteTask }
}
