import type { Metadata } from 'next';
import WelfareSidebar from '@/components/welfare/WelfareSidebar';

export const metadata: Metadata = {
  title: '삼천리 복리후생 관리',
};

export default function WelfareLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#EEF2F7' }}>
      {/* Banner */}
      <header
        className="text-white px-6 py-3.5 flex items-center gap-3 shadow-lg z-50 shrink-0"
        style={{ backgroundColor: '#003A8C' }}
      >
        <div
          className="shrink-0 rounded px-2 py-0.5 flex items-center justify-center"
          style={{ backgroundColor: '#ffffff' }}
        >
          <span
            className="font-extrabold text-xs leading-none tracking-tighter"
            style={{ color: '#003A8C' }}
          >
            삼천리
          </span>
        </div>
        <div className="flex items-baseline gap-3">
          <h1 className="text-lg font-bold leading-tight tracking-tight">
            사업장 복리후생 관리
          </h1>
          <span className="hidden sm:inline text-xs" style={{ color: '#93C5FD' }}>
            Samchully Welfare Management System
          </span>
        </div>
      </header>

      {/* Sidebar + Main */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
        <WelfareSidebar />
        <main className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: '#EEF2F7' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
