import React, { useEffect, useState, useCallback } from 'react'
import { supabase, supabaseEnabled } from './lib/supabase.js'

const REPO = 'https://github.com/maticaos/club-cannabico-planner'

const VERSIONS = ['general', 'v3', 'v2', 'v1']
const CATS = [
  { id: 'idea', label: 'Idea', color: '#7dd181' },
  { id: 'bug', label: 'Bug', color: '#e2725b' },
  { id: 'costo', label: 'Costo', color: '#d8a64a' },
  { id: 'legal', label: 'Legal', color: '#6fb7e0' },
  { id: 'otro', label: 'Otro', color: '#8ea394' },
]
const catOf = (id) => CATS.find((c) => c.id === id) || CATS[4]

const C = {
  bg: '#0c1110', panel: '#141d18', panel2: '#1a261e', line: '#2a3a30',
  text: '#e9efe8', muted: '#8ea394', accent: '#7dd181', blue: '#6fb7e0', danger: '#e2725b',
}
const mono = "'Spline Sans Mono', monospace"

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'recién'
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`
  return `hace ${Math.floor(s / 86400)} d`
}

export default function Feedback({ onClose }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [author, setAuthor] = useState('')
  const [version, setVersion] = useState('general')
  const [category, setCategory] = useState('idea')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState('')

  const load = useCallback(async () => {
    if (!supabaseEnabled) { setLoading(false); return }
    setLoading(true)
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('votes', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) setErr(error.message)
    else setList(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    if (!supabaseEnabled) return
    const ch = supabase
      .channel('feedback-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback' }, load)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [load])

  const submit = async () => {
    if (!message.trim()) return
    setSending(true); setErr('')
    const { error } = await supabase.from('feedback').insert({
      author: author.trim() || 'Anónimo',
      version, category, message: message.trim(),
    })
    if (error) setErr(error.message)
    else { setMessage(''); await load() }
    setSending(false)
  }

  const vote = async (id) => {
    if (!supabaseEnabled) return
    setList((p) => p.map((f) => (f.id === id ? { ...f, votes: f.votes + 1 } : f)))
    const { error } = await supabase.rpc('bump_feedback_vote', { fb_id: id })
    if (error) { setErr(error.message); load() }
  }

  const inp = {
    background: C.bg, border: `1px solid ${C.line}`, color: C.text, borderRadius: 8,
    padding: '8px 10px', fontSize: 13, fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '5vh 14px', overflowY: 'auto' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 560, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 20, fontFamily: "'Spline Sans', system-ui, sans-serif", color: C.text }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Spline+Sans:wght@400;500;600;700&family=Spline+Sans+Mono:wght@400;500&display=swap');`}</style>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 800, margin: 0 }}>💬 Feedback del equipo</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: `1px solid ${C.line}`, color: C.muted, borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontSize: 15 }}>✕</button>
        </div>
        <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 16 }}>Compartido y en vivo: todos ven los mismos comentarios y pueden votar los más importantes.</div>

        {!supabaseEnabled ? (
          <div style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 10, padding: 14, fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
            El feedback compartido todavía no está configurado (faltan las variables de Supabase). Mientras tanto, dejá tu comentario como Issue:
            <div style={{ marginTop: 10 }}>
              <a href={`${REPO}/issues/new`} target="_blank" rel="noreferrer" style={{ color: C.blue }}>Abrir un Issue en GitHub →</a>
            </div>
          </div>
        ) : (
          <>
            {/* Formulario */}
            <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 12, padding: 14, marginBottom: 18 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 9 }}>
                <input style={{ ...inp, flex: '2 1 160px' }} placeholder="Tu nombre" value={author} onChange={(e) => setAuthor(e.target.value)} />
                <select style={{ ...inp, flex: '1 1 90px' }} value={version} onChange={(e) => setVersion(e.target.value)}>
                  {VERSIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 9 }}>
                {CATS.map((c) => (
                  <button key={c.id} onClick={() => setCategory(c.id)} style={{ cursor: 'pointer', fontSize: 11.5, fontFamily: mono, padding: '5px 11px', borderRadius: 20, border: `1px solid ${category === c.id ? c.color : C.line}`, background: category === c.id ? c.color + '22' : 'transparent', color: category === c.id ? c.color : C.muted }}>{c.label}</button>
                ))}
              </div>
              <textarea style={{ ...inp, minHeight: 64, resize: 'vertical' }} placeholder="Tu comentario, idea o problema…" value={message} onChange={(e) => setMessage(e.target.value)} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 9 }}>
                <button onClick={submit} disabled={sending || !message.trim()} style={{ cursor: message.trim() ? 'pointer' : 'default', fontSize: 13, fontWeight: 600, padding: '8px 18px', borderRadius: 9, border: 'none', background: message.trim() ? C.accent : C.line, color: '#0c1110' }}>{sending ? 'Enviando…' : 'Enviar'}</button>
              </div>
            </div>

            {err && <div style={{ color: C.danger, fontSize: 12, marginBottom: 10, fontFamily: mono }}>⚠ {err}</div>}

            {/* Lista */}
            {loading ? (
              <div style={{ color: C.muted, fontSize: 13, textAlign: 'center', padding: 20 }}>Cargando…</div>
            ) : list.length === 0 ? (
              <div style={{ color: C.muted, fontSize: 13, textAlign: 'center', padding: 20 }}>Todavía no hay comentarios. ¡Estrenalo!</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {list.map((f) => {
                  const c = catOf(f.category)
                  return (
                    <div key={f.id} style={{ display: 'flex', gap: 12, background: C.bg, border: `1px solid ${C.line}`, borderRadius: 11, padding: '11px 13px' }}>
                      <button onClick={() => vote(f.id)} title="Votar" style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, background: 'transparent', border: `1px solid ${C.line}`, borderRadius: 8, padding: '4px 8px', cursor: 'pointer', color: C.accent, minWidth: 38 }}>
                        <span style={{ fontSize: 12 }}>▲</span>
                        <span style={{ fontSize: 13, fontFamily: mono, fontWeight: 600 }}>{f.votes}</span>
                      </button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{f.author}</span>
                          <span style={{ fontSize: 10.5, fontFamily: mono, color: c.color, border: `1px solid ${c.color}55`, borderRadius: 5, padding: '0 6px' }}>{c.label}</span>
                          <span style={{ fontSize: 10.5, fontFamily: mono, color: C.muted, border: `1px solid ${C.line}`, borderRadius: 5, padding: '0 6px' }}>{f.version}</span>
                          {f.status && f.status !== 'abierto' && <span style={{ fontSize: 10.5, fontFamily: mono, color: C.accent }}>✓ {f.status}</span>}
                          <span style={{ fontSize: 11, color: C.muted, marginLeft: 'auto', fontFamily: mono }}>{timeAgo(f.created_at)}</span>
                        </div>
                        <div style={{ fontSize: 13.5, color: C.text, lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>{f.message}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
