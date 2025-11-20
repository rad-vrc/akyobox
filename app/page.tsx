export default function Home() {
  return (
    <main style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '1rem', background: '#202020', color: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Akyobox</h1>
        <span style={{ opacity: 0.7, fontSize: '0.9rem' }}>Whack-a-Akyo Preview</span>
      </header>
      <div style={{ flex: 1, background: '#000' }}>
        <iframe
          src="/games/whack-a-devilyagiakyo/index.html"
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          title="Whack-a-Akyo"
          allow="autoplay; fullscreen; vr"
        />
      </div>
    </main>
  )
}
