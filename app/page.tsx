'use client'
import { useState } from 'react'
import { SimulatorTab } from '@/components/SimulatorTab'
import { PortfolioTab } from '@/components/PortfolioTab'

export default function Home() {
  const [tab, setTab] = useState<'simulator' | 'portfolio'>('simulator')

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 20px 60px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em' }}>
          DCA Simulator
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
          Simulez et suivez votre stratégie d'investissement progressif sur Bitcoin, Ethereum et Solana.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 28, borderBottom: '1px solid var(--border)' }}>
        {([['simulator', '📊 Simulateur DCA'], ['portfolio', '💼 Mon Portfolio']] as const).map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: '10px 22px', background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: 14, fontWeight: 500, letterSpacing: '-0.01em',
            color: tab === k ? 'var(--text)' : 'var(--text2)',
            borderBottom: tab === k ? '2px solid var(--text)' : '2px solid transparent',
            marginBottom: -1, transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {tab === 'simulator' && <SimulatorTab />}
      {tab === 'portfolio' && <PortfolioTab />}
    </div>
  )
}
