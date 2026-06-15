import React, { useState } from 'react'
import PlannerV1 from './planners/PlannerV1.jsx'
import PlannerV2 from './planners/PlannerV2.jsx'
import PlannerV3 from './planners/PlannerV3.jsx'
import Feedback from './Feedback.jsx'

const TABS = [
  { id: 'v3', label: 'v3 · datos completos', C: PlannerV3 },
  { id: 'v2', label: 'v2 · datos reales', C: PlannerV2 },
  { id: 'v1', label: 'v1 · estimación', C: PlannerV1 },
]

export default function App() {
  const [tab, setTab] = useState('v3')
  const [fbOpen, setFbOpen] = useState(false)
  const Active = (TABS.find((t) => t.id === tab) || TABS[0]).C

  const btn = (active) => ({
    cursor: 'pointer',
    fontSize: 12,
    padding: '6px 12px',
    borderRadius: 8,
    border: '1px solid ' + (active ? '#7dd181' : '#2a3a30'),
    background: active ? '#16241b' : 'transparent',
    color: active ? '#e9efe8' : '#8ea394',
    fontFamily: "'Spline Sans Mono', monospace",
  })

  return (
    <div style={{ background: '#0c1110', minHeight: '100vh' }}>
      <div
        style={{
          position: 'sticky', top: 0, zIndex: 50, background: '#0a0f0d',
          borderBottom: '1px solid #2a3a30', display: 'flex', alignItems: 'center',
          gap: 8, padding: '10px 14px', flexWrap: 'wrap',
        }}
      >
        <span style={{ color: '#7dd181', fontWeight: 700, fontSize: 13, marginRight: 6, fontFamily: "'Spline Sans Mono', monospace" }}>
          🌿 Club Planner
        </span>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={btn(tab === t.id)}>
            {t.label}
          </button>
        ))}
        <button
          onClick={() => setFbOpen(true)}
          style={{
            marginLeft: 'auto', cursor: 'pointer', fontSize: 12, padding: '6px 12px',
            borderRadius: 8, border: '1px solid #6fb7e0', background: 'transparent',
            color: '#6fb7e0', fontFamily: "'Spline Sans Mono', monospace",
          }}
        >
          💬 Feedback
        </button>
      </div>

      <Active />
      {fbOpen && <Feedback onClose={() => setFbOpen(false)} />}
    </div>
  )
}
