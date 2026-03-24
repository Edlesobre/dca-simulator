export function Spinner({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '2rem', justifyContent: 'center', color: 'var(--text2)', fontSize: 13 }}>
      <div style={{ width: 16, height: 16, border: '2px solid #333', borderTop: '2px solid #888', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
      {text}
    </div>
  )
}
