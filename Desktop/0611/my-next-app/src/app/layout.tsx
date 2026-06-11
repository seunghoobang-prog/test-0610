import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '삼천리 복리후생 관리',
  description: '삼천리 사업장 복리후생 관리 시스템',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col" style={{ backgroundColor: '#EEF2F7' }}>
        {children}
      </body>
    </html>
  );
}
