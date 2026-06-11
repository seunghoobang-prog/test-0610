'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

const navLinks = [
  { href: '/', label: '홈' },
  { href: '/board?category=임장기', label: '임장기' },
  { href: '/board?category=여행기', label: '여행기' },
  { href: '/map', label: '🗺️ 핫플 지도' },
  { href: '/members', label: '멤버 등급' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <header className="bg-green-800 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <span className="text-2xl">🗺️</span>
          <span className="text-white">하노이 임장단</span>
          <span className="hidden sm:inline text-green-300 text-sm font-normal ml-1">Hanoi 임장단</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = link.href === '/'
              ? pathname === '/'
              : pathname.startsWith(link.href.split('?')[0]);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-green-600 text-white'
                    : 'text-green-100 hover:bg-green-700 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Auth buttons */}
          {user ? (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-green-200 text-xs max-w-32 truncate">{user.email}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white rounded-full text-sm font-semibold transition-colors border border-green-500"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="ml-2 px-4 py-1.5 bg-white text-green-800 hover:bg-green-50 rounded-full text-sm font-semibold transition-colors"
            >
              로그인
            </Link>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-md hover:bg-green-700 transition-colors"
          aria-label="메뉴 열기"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-green-700 bg-green-800 px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2 rounded-md text-sm text-green-100 hover:bg-green-700 transition-colors"
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <>
              <div className="px-3 py-1 text-xs text-green-300 truncate">{user.email}</div>
              <button
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="mt-1 px-4 py-2 bg-green-700 border border-green-500 text-white rounded-full text-sm font-semibold text-center"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="mt-1 px-4 py-2 bg-white text-green-800 rounded-full text-sm font-semibold text-center"
            >
              로그인
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
