'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const YEARS = [2024, 2025, 2026];

export default function UniformFilter({
  currentYear,
  currentSeason,
}: {
  currentYear: number;
  currentSeason: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, val: string) {
    const p = new URLSearchParams(searchParams.toString());
    p.set(key, val);
    router.push(`${pathname}?${p.toString()}`);
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={currentYear}
        onChange={e => updateParam('year', e.target.value)}
        className="rounded-lg border px-3 py-1.5 text-sm"
        style={{ borderColor: '#E2E8F0', color: '#374151' }}
      >
        {YEARS.map(y => <option key={y} value={y}>{y}년</option>)}
      </select>
      <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        {(['summer', 'winter'] as const).map(s => (
          <button
            key={s}
            onClick={() => updateParam('season', s)}
            className="px-4 py-1.5 text-sm font-medium transition-colors"
            style={{
              backgroundColor: currentSeason === s ? '#003A8C' : '#ffffff',
              color: currentSeason === s ? '#ffffff' : '#64748B',
            }}
          >
            {s === 'summer' ? '하계' : '동계'}
          </button>
        ))}
      </div>
    </div>
  );
}
