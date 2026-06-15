import React, { useEffect, useState } from 'react'
import { supabase, supabaseEnabled } from './lib/supabase.js'

const C = {
  bg: '#0c1110', panel: '#141d18', panel2: '#1a261e', line: '#2a3a30',
  text: '#e9efe8', muted: '#8ea394', accent: '#7dd181', blue: '#6fb7e0', danger: '#e2725b',
}
const mono = "'Spline Sans Mono', monospace"

const fonts = `@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Spline+Sans:wght@400;500;600;700&family=Spline+Sans+Mono:wght@400;500&display=swap');`

function Shell({ children }) {
  return (
    <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '6vh 16px', fontFamily: "'Spline Sans', system-ui, sans-serif", color: C.text }}>
      <style>{fonts}</style>
      <div style={{ width: '100%', maxWidth: 400, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 26 }}>
        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 4, color: C.accent }}>🌿 Club Planner</div>
        {children}
      </div>
    </div>
  )
}

export default function AuthGate({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // formulario
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [info, setInfo] = useState('')

  // Sesión
  useEffect(() => {
    if (!supabaseEnabled) { setLoading(false); return }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  // Perfil (estado de aprobación) cuando hay sesión
  useEffect(() => {
    if (!session) { setProfile(null); return }
    let active = true
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('approved, email')
        .eq('id', session.user.id)
        .maybeSingle()
      if (active) setProfile(data || { approved: false, email: session.user.email })
    }
    fetchProfile()
    // re-chequea la aprobación cada 20s (por si lo aprueban con la sesión abierta)
    const t = setInterval(fetchProfile, 20000)
    return () => { active = false; clearInterval(t) }
  }, [session])

  const signOut = async () => { await supabase.auth.signOut(); setProfile(null) }

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setInfo(''); setBusy(true)
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password })
        if (error) throw error
        if (!data.session) {
          setInfo('Cuenta creada. Si pide confirmación, revisá tu email. Luego un administrador debe aprobar tu acceso.')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (error) throw error
      }
    } catch (e2) {
      setErr(e2.message || 'Error de autenticación')
    } finally {
      setBusy(false)
    }
  }

  // ── Estados de render ──────────────────────────────────────

  if (!supabaseEnabled) {
    return (
      <Shell>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, marginTop: 10 }}>
          El acceso no está configurado (faltan las variables de Supabase).
        </div>
      </Shell>
    )
  }

  if (loading) {
    return <Shell><div style={{ color: C.muted, fontSize: 13, marginTop: 12 }}>Cargando…</div></Shell>
  }

  // Logueado y aprobado → app, con barra de sesión
  if (session && profile?.approved) {
    return (
      <div style={{ background: C.bg, minHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px', background: '#0a0f0d', borderBottom: `1px solid ${C.line}`, fontFamily: mono, fontSize: 11.5 }}>
          <span style={{ color: C.muted, marginLeft: 'auto' }}>{session.user.email}</span>
          <button onClick={signOut} style={{ cursor: 'pointer', fontSize: 11.5, padding: '4px 10px', borderRadius: 7, border: `1px solid ${C.line}`, background: 'transparent', color: C.muted, fontFamily: mono }}>
            Salir
          </button>
        </div>
        {children}
      </div>
    )
  }

  // Logueado pero NO aprobado → pantalla de espera
  if (session && profile && !profile.approved) {
    return (
      <Shell>
        <div style={{ fontSize: 14, fontWeight: 600, marginTop: 14, marginBottom: 8 }}>⏳ Acceso pendiente de aprobación</div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.55 }}>
          Tu cuenta (<span style={{ color: C.text }}>{session.user.email}</span>) fue registrada. Un administrador tiene que autorizarte antes de que puedas entrar. Esta pantalla se actualiza sola cuando te aprueben.
        </div>
        <button onClick={signOut} style={{ marginTop: 18, cursor: 'pointer', fontSize: 12.5, padding: '8px 14px', borderRadius: 9, border: `1px solid ${C.line}`, background: 'transparent', color: C.muted, fontFamily: mono }}>
          Cerrar sesión
        </button>
      </Shell>
    )
  }

  // Sin sesión → login / registro
  const inp = {
    background: C.bg, border: `1px solid ${C.line}`, color: C.text, borderRadius: 9,
    padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', width: '100%', boxSizing: 'border-box', marginTop: 10,
  }
  return (
    <Shell>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 6 }}>
        {mode === 'login' ? 'Ingresá con tu cuenta autorizada.' : 'Creá una cuenta. Luego un administrador debe aprobar tu acceso.'}
      </div>
      <form onSubmit={submit}>
        <input style={inp} type="email" autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input style={inp} type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        <button type="submit" disabled={busy} style={{ marginTop: 14, width: '100%', cursor: busy ? 'default' : 'pointer', fontSize: 14, fontWeight: 600, padding: '10px', borderRadius: 9, border: 'none', background: C.accent, color: C.bg }}>
          {busy ? '…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
        </button>
      </form>
      {err && <div style={{ color: C.danger, fontSize: 12, marginTop: 12, fontFamily: mono }}>⚠ {err}</div>}
      {info && <div style={{ color: C.accent, fontSize: 12.5, marginTop: 12, lineHeight: 1.5 }}>{info}</div>}
      <button
        onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErr(''); setInfo('') }}
        style={{ marginTop: 16, background: 'transparent', border: 'none', color: C.blue, fontSize: 12.5, cursor: 'pointer', padding: 0, fontFamily: mono }}
      >
        {mode === 'login' ? '¿No tenés cuenta? Registrate →' : '← Ya tengo cuenta'}
      </button>
    </Shell>
  )
}
