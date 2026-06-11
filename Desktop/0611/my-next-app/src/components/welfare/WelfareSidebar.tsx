'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const GYEONGGI_CITIES = ['오산', '안양', '평택', '안산', '수원', '부천', '용인'];

const PROGRAMS = [
  { num: 1, label: '콘도 / 하계휴양소', href: '/welfare/condo' },
  { num: 2, label: '상조회', href: '/welfare/sangjo' },
  { num: 3, label: '주택대부금 / 긴급가계안전자금', href: '/welfare/housing-loan' },
  { num: 4, label: '근무복 / 안전장구류', href: '/welfare/uniform' },
];

export default function WelfareSidebar() {
  const pathname = usePathname();
  const [gyeonggiOpen, setGyeonggiOpen] = useState(true);

  const isRegionActive = (city: string) => pathname === `/welfare/dashboard/${city}`;
  const isProgramActive = (href: string) => pathname.startsWith(href);

  return (
    <aside
      className="w-56 shrink-0 overflow-y-auto border-r"
      style={{ backgroundColor: '#ffffff', borderColor: '#E2E8F0' }}
    >
      <nav className="p-3 space-y-4">
        {/* 섹션 헤더 */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider px-2 py-1 mb-2" style={{ color: '#94A3B8' }}>
            운영현황
          </p>

          {/* 지역별 */}
          <div className="mb-3">
            <p className="text-xs font-semibold px-2 py-1 mb-0.5" style={{ color: '#64748B' }}>
              지역별
            </p>

            {/* 경기 (expandable) */}
            <button
              onClick={() => setGyeonggiOpen(o => !o)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm transition-colors hover:bg-slate-50"
              style={{ color: '#374151' }}
            >
              <span className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: '#3B82F6' }}
                />
                경기
              </span>
              <span style={{ color: '#94A3B8', fontSize: '10px' }}>
                {gyeonggiOpen ? '▾' : '▸'}
              </span>
            </button>

            {gyeonggiOpen && (
              <div className="ml-4 mt-0.5 space-y-0.5">
                {GYEONGGI_CITIES.map(city => (
                  <Link
                    key={city}
                    href={`/welfare/dashboard/${city}`}
                    className="flex items-center gap-2 px-3 py-1 rounded-md text-xs transition-colors"
                    style={{
                      color: isRegionActive(city) ? '#1D4ED8' : '#6B7280',
                      backgroundColor: isRegionActive(city) ? '#EFF6FF' : 'transparent',
                      fontWeight: isRegionActive(city) ? 600 : 400,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: isRegionActive(city) ? '#3B82F6' : '#CBD5E1' }}
                    />
                    {city}
                  </Link>
                ))}
              </div>
            )}

            {/* 인천 */}
            <Link
              href="/welfare/dashboard/인천"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors mt-0.5"
              style={{
                color: isRegionActive('인천') ? '#1D4ED8' : '#374151',
                backgroundColor: isRegionActive('인천') ? '#EFF6FF' : 'transparent',
                fontWeight: isRegionActive('인천') ? 600 : 400,
              }}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: isRegionActive('인천') ? '#3B82F6' : '#CBD5E1' }}
              />
              인천
            </Link>

            {/* 광명 */}
            <Link
              href="/welfare/dashboard/광명"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors mt-0.5"
              style={{
                color: isRegionActive('광명') ? '#1D4ED8' : '#374151',
                backgroundColor: isRegionActive('광명') ? '#EFF6FF' : 'transparent',
                fontWeight: isRegionActive('광명') ? 600 : 400,
              }}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: isRegionActive('광명') ? '#3B82F6' : '#CBD5E1' }}
              />
              광명
            </Link>
          </div>

          {/* 프로그램별 */}
          <div>
            <p className="text-xs font-semibold px-2 py-1 mb-0.5" style={{ color: '#64748B' }}>
              프로그램별
            </p>
            <div className="space-y-0.5">
              {PROGRAMS.map(prog => (
                <Link
                  key={prog.href}
                  href={prog.href}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors"
                  style={{
                    color: isProgramActive(prog.href) ? '#1D4ED8' : '#374151',
                    backgroundColor: isProgramActive(prog.href) ? '#EFF6FF' : 'transparent',
                    fontWeight: isProgramActive(prog.href) ? 600 : 400,
                  }}
                >
                  <span
                    className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      backgroundColor: isProgramActive(prog.href) ? '#3B82F6' : '#E2E8F0',
                      color: isProgramActive(prog.href) ? '#ffffff' : '#64748B',
                    }}
                  >
                    {prog.num}
                  </span>
                  <span className="text-xs leading-tight">{prog.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}
