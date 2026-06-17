'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Loader2, CheckCircle, AlertCircle, Globe } from 'lucide-react'
import type { Feed, Source } from '@/lib/types'

const COLORS = [
  { hex: '#2563eb', label: 'Синій' },
  { hex: '#16a34a', label: 'Зелений' },
  { hex: '#9333ea', label: 'Фіолетовий' },
  { hex: '#ea580c', label: 'Помаранчевий' },
  { hex: '#db2777', label: 'Рожевий' },
  { hex: '#0891b2', label: 'Блакитний' },
  { hex: '#b45309', label: 'Коричневий' },
  { hex: '#dc2626', label: 'Червоний' },
]

const INTERVALS = [
  { value: 15, label: 'Кожні 15 хвилин' },
  { value: 30, label: 'Кожні 30 хвилин' },
  { value: 60, label: 'Щогодини' },
  { value: 360, label: 'Кожні 6 годин' },
  { value: 1440, label: 'Раз на день' },
]

interface Props {
  feed: Feed | null
  onSave: (feed: Feed) => void
  onClose: () => void
}

type ValidateState = 'idle' | 'loading' | 'ok' | 'error'

export default function FeedModal({ feed, onSave, onClose }: Props) {
  const [name, setName] = useState(feed?.name || '')
  const [color, setColor] = useState(feed?.color || COLORS[0].hex)
  const [interval, setInterval] = useState(feed?.interval || 60)
  const [sources, setSources] = useState<Source[]>(feed?.sources || [])
  const [urlInput, setUrlInput] = useState('')
  const [validateState, setValidateState] = useState<ValidateState>('idle')
  const [validateTitle, setValidateTitle] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = "Вкажіть назву стрічки"
    return e
  }

  const handleAddSource = async () => {
    const url = urlInput.trim()
    if (!url) return

    setValidateState('loading')
    setValidateTitle('')

    try {
      const res = await fetch('/api/feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()

      if (data.valid) {
        const newSource: Source = {
          id: 's' + Date.now(),
          name: data.title || new URL(url).hostname.replace('www.', ''),
          url,
        }
        setSources(prev => [...prev, newSource])
        setUrlInput('')
        setValidateState('ok')
        setValidateTitle(data.title || '')
        setTimeout(() => setValidateState('idle'), 2000)
      } else {
        setValidateState('error')
      }
    } catch {
      setValidateState('error')
    }
  }

  const handleRemoveSource = (id: string) => {
    setSources(prev => prev.filter(s => s.id !== id))
  }

  const handleSave = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    const savedFeed: Feed = {
      id: feed?.id || 'f' + Date.now(),
      name: name.trim(),
      color,
      interval,
      sources,
      createdAt: feed?.createdAt || new Date().toISOString(),
      lastFetched: feed?.lastFetched,
    }
    onSave(savedFeed)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-[480px] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8e7e3]">
          <h2 className="text-[16px] font-semibold text-[#1a1918]">
            {feed ? 'Редагувати стрічку' : 'Нова стрічка'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#9e9b97] hover:bg-[#f8f7f4]">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-[12px] font-medium text-[#6b6966] mb-1.5">Назва стрічки</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Наприклад: Технології, Новини..."
              className={`w-full px-3 py-2.5 text-[14px] border rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 ${
                errors.name ? 'border-red-300' : 'border-[#e0ded8]'
              }`}
              autoFocus
            />
            {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Color */}
          <div>
            <label className="block text-[12px] font-medium text-[#6b6966] mb-1.5">Колір</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c.hex}
                  onClick={() => setColor(c.hex)}
                  className={`w-7 h-7 rounded-full transition-transform ${color === c.hex ? 'scale-125 ring-2 ring-offset-2' : 'hover:scale-110'}`}
                  style={{ background: c.hex, ringColor: c.hex }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Interval */}
          <div>
            <label className="block text-[12px] font-medium text-[#6b6966] mb-1.5">Частота оновлення</label>
            <select
              value={interval}
              onChange={e => setInterval(Number(e.target.value))}
              className="w-full px-3 py-2.5 text-[14px] border border-[#e0ded8] rounded-lg outline-none focus:ring-2 focus:ring-blue-100 bg-white"
            >
              {INTERVALS.map(i => (
                <option key={i.value} value={i.value}>{i.label}</option>
              ))}
            </select>
          </div>

          {/* Sources */}
          <div>
            <label className="block text-[12px] font-medium text-[#6b6966] mb-1.5">
              Джерела RSS ({sources.length})
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={urlInput}
                onChange={e => { setUrlInput(e.target.value); setValidateState('idle') }}
                onKeyDown={e => e.key === 'Enter' && handleAddSource()}
                placeholder="https://example.com/rss.xml"
                className="flex-1 px-3 py-2.5 text-[13px] border border-[#e0ded8] rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
              />
              <button
                onClick={handleAddSource}
                disabled={validateState === 'loading' || !urlInput.trim()}
                className="px-3 py-2.5 bg-[#1a1918] text-white rounded-lg text-[13px] font-medium hover:bg-[#333] disabled:opacity-40 transition-colors flex items-center gap-1.5"
              >
                {validateState === 'loading'
                  ? <Loader2 size={13} className="animate-spin" />
                  : <Plus size={13} />}
                Додати
              </button>
            </div>

            {/* Validate feedback */}
            {validateState === 'ok' && (
              <div className="flex items-center gap-1.5 text-[12px] text-green-600 mb-2">
                <CheckCircle size={12} />
                Додано: {validateTitle || 'джерело'}
              </div>
            )}
            {validateState === 'error' && (
              <div className="flex items-center gap-1.5 text-[12px] text-red-500 mb-2">
                <AlertCircle size={12} />
                Не вдалося прочитати RSS-стрічку. Перевірте URL.
              </div>
            )}

            {/* Sources list */}
            {sources.length > 0 && (
              <div className="border border-[#e8e7e3] rounded-xl overflow-hidden">
                {sources.map((source, i) => (
                  <div
                    key={source.id}
                    className={`flex items-center gap-3 px-3 py-2.5 ${i > 0 ? 'border-t border-[#e8e7e3]' : ''}`}
                  >
                    <Globe size={13} className="text-[#9e9b97] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[#1a1918] truncate">{source.name}</p>
                      <p className="text-[10px] text-[#9e9b97] truncate">{source.url}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveSource(source.id)}
                      className="p-1.5 rounded-lg text-[#c0beba] hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {sources.length === 0 && (
              <div className="text-center py-6 text-[12px] text-[#9e9b97] border border-dashed border-[#d8d6d0] rounded-xl">
                Додайте хоча б одне RSS джерело
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-[#e8e7e3]">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-[13px] font-medium border border-[#e0ded8] rounded-xl hover:bg-[#f8f7f4] transition-colors"
          >
            Скасувати
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 text-[13px] font-medium bg-[#1a1918] text-white rounded-xl hover:bg-[#333] transition-colors"
          >
            {feed ? 'Зберегти зміни' : 'Створити стрічку'}
          </button>
        </div>
      </div>
    </div>
  )
}
