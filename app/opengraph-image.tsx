import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Akyobox'
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 128,
                    background: 'white',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                }}
            >
                <div style={{ fontSize: 64, marginBottom: 20 }}>🎮</div>
                <div style={{ fontWeight: 'bold' }}>Akyobox</div>
            </div>
        ),
        {
            ...size,
        }
    )
}
