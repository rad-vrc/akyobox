export default function Home() {
  return (
    <main style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Background Video */}
      <video
        src="https://akyobox-uploader.dorado1031.workers.dev/ending.mp4"
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -1,
          opacity: 0.5, // Adjust opacity for readability/visibility
        }}
      />

      <header style={{ padding: '1rem', background: 'rgba(32, 32, 32, 0.8)', color: 'white', display: 'flex', alignItems: 'center', gap: '1rem', backdropFilter: 'blur(5px)' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Akyobox</h1>
        <span style={{ opacity: 0.7, fontSize: '0.9rem' }}>Whack-a-Akyo Preview</span>
      </header>
      <div style={{ flex: 1, background: 'transparent' }}>
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
