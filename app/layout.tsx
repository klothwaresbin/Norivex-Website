import type { Metadata } from 'next';
import './globals.css';

const siteUrl = 'https://norivexcyber.date';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Norivex Cyber | Practical security for growing businesses',
    template: '%s | Norivex Cyber',
  },
  description: 'Permission-based cybersecurity assessments and practical recommendations for local businesses.',
  applicationName: 'Norivex Cyber',
  keywords: ['cybersecurity', 'security assessment', 'small business security', 'Virginia cybersecurity', 'Martinsville Virginia'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'Norivex Cyber',
    title: 'Norivex Cyber | Practical security for growing businesses',
    description: 'Permission-based cybersecurity assessments and practical recommendations for local businesses.',
  },
  twitter: {
    card: 'summary',
    title: 'Norivex Cyber | Practical security for growing businesses',
    description: 'Permission-based cybersecurity assessments and practical recommendations for local businesses.',
  },
  icons: {
    icon: '/favicon.svg',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
