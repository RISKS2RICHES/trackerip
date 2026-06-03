import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'BBC News';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#000',
      }}
    >
      {/* Red header band */}
      <div style={{ background: '#bb1919', height: 12, width: '100%', display: 'flex' }} />

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '52px 72px' }}>

        {/* BBC logo blocks */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
          {['B', 'B', 'C'].map((letter, i) => (
            <div key={i} style={{
              width: 52, height: 52,
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Arial Black, Arial, sans-serif',
              fontWeight: 900,
              fontSize: 30,
              color: '#000',
            }}>{letter}</div>
          ))}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            borderLeft: '3px solid #bb1919',
            paddingLeft: 16,
            marginLeft: 8,
            color: '#fff',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 700,
            fontSize: 36,
            letterSpacing: 1,
          }}>NEWS</div>
        </div>

        {/* Headline */}
        <div style={{
          color: '#fff',
          fontFamily: 'Georgia, serif',
          fontWeight: 700,
          fontSize: 52,
          lineHeight: 1.2,
          maxWidth: 900,
          marginBottom: 24,
        }}>
          Breaking News, Video, Radio and Learning
        </div>

        {/* Subline */}
        <div style={{
          color: '#aaa',
          fontFamily: 'Arial, sans-serif',
          fontSize: 26,
          lineHeight: 1.5,
          maxWidth: 840,
        }}>
          Visit BBC News for up-to-the-minute news, breaking news, video, audio and feature stories. BBC News provides trusted World and UK news.
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        background: '#111',
        height: 70,
        display: 'flex',
        alignItems: 'center',
        padding: '0 72px',
        borderTop: '1px solid #222',
      }}>
        <div style={{ color: '#666', fontFamily: 'Arial, sans-serif', fontSize: 18 }}>
          bbc.co.uk/news
        </div>
        <div style={{ marginLeft: 'auto', color: '#555', fontFamily: 'Arial, sans-serif', fontSize: 16 }}>
          © {new Date().getFullYear()} BBC
        </div>
      </div>
    </div>,
    { ...size },
  );
}
