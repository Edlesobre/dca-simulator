'use client'
import { useState, useEffect } from 'react'
import type { Entry } from '@/lib/utils'

export function usePortfolio() {
  const [entries, setEntries] = useState<Entry[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dca:entries')
      if (saved) setEntries(JSON.parse(saved))
    } catch {}
  }, [])

  const save = (updated: Entry[]) => {
    setEntries(updated)
    try { localStorage.setItem('dca:entries', JSON.stringify(updated)) } catch {}
  }

  const addEntry = (entry: Omit<Entry, 'id'>) => {
    const updated = [...entries, { ...entry, id: Date.now() }]
      .sort((a, b) => a.date.localeCompare(b.date))
    save(updated)
  }

  const updateEntry = (id: number, entry: Omit<Entry, 'id'>) => {
    save(entries.map(e => e.id === id ? { ...entry, id } : e))
  }

  const deleteEntry = (id: number) => {
    save(entries.filter(e => e.id !== id))
  }

  return { entries, addEntry, updateEntry, deleteEntry }
}
