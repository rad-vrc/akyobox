import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Akyobox',
        short_name: 'Akyobox',
        description: 'A portal for Akyo themed Unity WebGL games.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
            {
                src: '/icon.png',
                sizes: 'any',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/apple-icon.png',
                sizes: 'any',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
    }
}
