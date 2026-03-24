interface MetricCardProps {
  label: string
  val: string
  sub?: string
  pos?: boolean | null
  big?: boolean
}

export function MetricCard({ label, val, sub, pos, big }: MetricCardProps) {
  const valColor = (big || pos != null) ? (pos ? 'var(--green)' : 'var(--red)') : 'var(--text)'
  return (
    <div style={{ background: 'var(--bg2)', borderRadius: 'var(--radius)', padding: '14px 16px', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4, color: valColor, fontFamily: 'DM Mono, monospace' }}>{val}</div>
      {sub && <div style={{ fontSize: 12, marginTop: 3, color: pos != null ? valColor : 'var(--text2)' }}>{sub}</div>}
    </div>
  )
}
