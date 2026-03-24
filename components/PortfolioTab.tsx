'use client'
import { useState, useEffect } from 'react'
import { COINS, CoinId, Entry, fmtEur, fmtPct, fetchCurrentPrices } from '@/lib/utils'
import { usePortfolio } from '@/lib/usePortfolio'
import { MetricCard } from './MetricCard'
import { Spinner } from './Spinner'

export function PortfolioTab() {
  const { entries, addEntry, updateEntry, deleteEntry } = usePortfolio()
  const [currentPrices, setCurrentPrices] = useState<Record<string, { eur: number }>>({})
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState({ coin: 'bitcoin' as CoinId, date: new Date().toISOString().slice(0, 10), amount: '', price: '' })

  useEffect(() => {
    setLoading(true)
    fetchCurrentPrices().then(setCurrentPrices).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const portfolioSummary = (Object.entries(COINS) as [CoinId, typeof COINS[CoinId]][]).map(([id, coin]) => {
    const coinEntries = entries.filter(e => e.coin === id)
    if (!coinEntries.length) return null
    const totalEur = coinEntries.reduce((s, e) => s + e.totalEur, 0)
    const totalCoins = coinEntries.reduce((s, e) => s + e.coins, 0)
    const curPrice = currentPrices[id]?.eur
    const curValue = curPrice ? totalCoins * curPrice : null
    const pnl = curValue != null ? curValue - totalEur : null
    const pct = pnl != null ? (pnl / totalEur) * 100 : null
    return { id, coin, totalEur, totalCoins, avgBuy: totalEur / totalCoins, curPrice, curValue, pnl, pct, count: coinEntries.length }
  }).filter(Boolean) as NonNullable<ReturnType<typeof portfolioSummary[0]>>[]

  const grandTotal = portfolioSummary.reduce((s, p) => ({ invested: s.invested + p.totalEur, value: s.value + (p.curValue ?? 0) }), { invested: 0, value: 0 })
  const grandPnl = grandTotal.value - grandTotal.invested
  const grandPct = grandTotal.invested ? (grandPnl / grandTotal.invested) * 100 : 0

  function openAdd() { setForm({ coin: 'bitcoin', date: new Date().toISOString().slice(0, 10), amount: '', price: '' }); setEditId(null); setShowForm(true) }
  function openEdit(e: Entry) { setForm({ coin: e.coin, date: e.date, amount: String(e.totalEur), price: String(e.price) }); setEditId(e.id); setShowForm(true) }

  function submit() {
    const totalEur = parseFloat(form.amount), price = parseFloat(form.price)
    if (!totalEur || !price || !form.date) return
    const entry = { coin: form.coin, date: form.date, totalEur, price, coins: totalEur / price }
    if (editId) updateEntry(editId, entry); else addEntry(entry)
    setShowForm(false)
  }

  const coinsPreview = form.amount && form.price && parseFloat(form.price) > 0
    ? (parseFloat(form.amount) / parseFloat(form.price)).toFixed(6)
    : null

  return (
    <div>
      {entries.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
          <MetricCard label="Total investi" val={fmtEur(grandTotal.invested)} />
          <MetricCard label="Valeur actuelle" val={grandTotal.value ? fmtEur(grandTotal.value) : '—'} />
          <MetricCard label="P&L global" val={grandTotal.value ? fmtEur(grandPnl) : '—'} pos={grandPnl >= 0} />
          <MetricCard label="Performance" val={grandTotal.value ? fmtPct(grandPct) : '—'} pos={grandPct >= 0} big />
        </div>
      )}

      {loading && <Spinner text="Chargement des prix actuels..." />}

      {portfolioSummary.map(p => (
        <div key={p.id} style={{ background: 'var(--bg2)', border: `1px solid ${p.coin.color}33`, borderLeft: `3px solid ${p.coin.color}`, borderRadius: 'var(--radius)', padding: '16px', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontWeight: 600, fontSize: 15, color: p.coin.color }}>{p.coin.icon} {p.coin.label} <span style={{ color: 'var(--text2)', fontWeight: 400, fontSize: 13 }}>({p.coin.symbol})</span></span>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>{p.count} achat{p.count > 1 ? 's' : ''}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 10 }}>
            {[
              ['Investi', fmtEur(p.totalEur), null],
              ['Valeur', p.curValue != null ? fmtEur(p.curValue) : '—', null],
              ['P&L', p.pnl != null ? fmtEur(p.pnl) : '—', p.pnl != null ? p.pnl >= 0 : null],
              ['Perf.', p.pct != null ? fmtPct(p.pct) : '—', p.pct != null ? p.pct >= 0 : null],
              ['Prix moy.', fmtEur(p.avgBuy, 0), null],
              ['Prix actuel', p.curPrice ? fmtEur(p.curPrice, 0) : '—', null],
            ].map(([lbl, val, pos], i) => (
              <div key={i}>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>{lbl as string}</div>
                <div style={{ fontWeight: 500, fontSize: 13, fontFamily: 'DM Mono, monospace', color: pos != null ? (pos ? 'var(--green)' : 'var(--red)') : 'var(--text)' }}>{val as string}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button onClick={openAdd} style={{
        width: '100%', padding: '12px', borderRadius: 'var(--radius)',
        border: '1px dashed var(--border2)', background: 'transparent',
        color: 'var(--text2)', cursor: 'pointer', fontSize: 13,
        marginBottom: showForm ? 16 : 0, transition: 'all 0.15s',
      }}>+ Ajouter un investissement</button>

      {showForm && (
        <div style={{ background: 'var(--bg2)', borderRadius: 'var(--radius)', padding: '20px', border: '1px solid var(--border2)', animation: 'fadeIn 0.2s ease' }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>{editId ? 'Modifier' : 'Nouvel'} investissement</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 14, marginBottom: 16 }}>
            {[
              { label: 'Crypto', el: (
                <select value={form.coin} onChange={e => setForm(f => ({ ...f, coin: e.target.value as CoinId }))}>
                  {(Object.entries(COINS) as [CoinId, typeof COINS[CoinId]][]).map(([id, c]) => <option key={id} value={id}>{c.icon} {c.label}</option>)}
                </select>
              )},
              { label: 'Date', el: <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /> },
              { label: 'Montant investi (€)', el: <input type="number" placeholder="ex: 100" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} /> },
              { label: "Prix d'achat (€)", el: <input type="number" placeholder="ex: 45000" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /> },
            ].map(({ label, el }, i) => (
              <div key={i}>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>{label}</div>
                {el}
              </div>
            ))}
          </div>
          {coinsPreview && (
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16, fontFamily: 'DM Mono, monospace' }}>
              → {coinsPreview} {COINS[form.coin].symbol} achetés
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={submit} style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: 'var(--text)', color: 'var(--bg)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              {editId ? 'Mettre à jour' : 'Enregistrer'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid var(--border2)', background: 'transparent', cursor: 'pointer', fontSize: 13, color: 'var(--text2)' }}>Annuler</button>
          </div>
        </div>
      )}

      {entries.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>Historique des achats</div>
          {[...entries].reverse().map(e => {
            const coin = COINS[e.coin]
            const curP = currentPrices[e.coin]?.eur
            const curVal = curP ? e.coins * curP : null
            const pnl = curVal != null ? curVal - e.totalEur : null
            const pct = pnl != null ? (pnl / e.totalEur) * 100 : null
            return (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 6, background: 'var(--bg2)' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: coin.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: coin.color, flexShrink: 0 }}>{coin.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{coin.symbol} — {new Date(e.date + 'T12:00:00').toLocaleDateString('fr-FR')}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'DM Mono, monospace' }}>{fmtEur(e.totalEur)} à {fmtEur(e.price, 0)} / {coin.symbol}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {curVal != null && <div style={{ fontSize: 13, fontWeight: 500, fontFamily: 'DM Mono, monospace' }}>{fmtEur(curVal)}</div>}
                  {pct != null && <div style={{ fontSize: 12, color: pct >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmtPct(pct)}</div>}
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button onClick={() => openEdit(e)} style={{ padding: '5px 9px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 12 }}>✏️</button>
                  <button onClick={() => deleteEntry(e.id)} style={{ padding: '5px 9px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 12 }}>🗑️</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {entries.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text3)', fontSize: 14 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>💼</div>
          <div style={{ fontWeight: 500, color: 'var(--text2)' }}>Aucun investissement enregistré</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Ajoutez vos achats pour suivre votre performance réelle.</div>
        </div>
      )}
    </div>
  )
}
