import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BBC News | Home',
  description:
    'Visit BBC News for up-to-the-minute news, breaking news, video, audio and feature stories. BBC News provides trusted World and UK news as well as local and regional perspectives.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    siteName: 'BBC News',
    title: 'BBC News | Home',
    description:
      'Visit BBC News for up-to-the-minute news, breaking news, video, audio and feature stories. BBC News provides trusted World and UK news.',
    url: 'https://www.bbc.co.uk/news',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@BBCNews',
    title: 'BBC News | Home',
    description:
      'Visit BBC News for up-to-the-minute news, breaking news, video, audio and feature stories.',
  },
  other: {
    'theme-color': '#bb1919',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
