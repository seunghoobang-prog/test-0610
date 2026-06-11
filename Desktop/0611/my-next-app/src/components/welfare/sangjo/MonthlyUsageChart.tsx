'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { WelfareRegion, SangjoMonthUsage } from '@/lib/welfare';

const MONTH_LABELS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
const YEARS = [2024, 2025, 2026];

export default function MonthlyUsageChart({
  data,
  regions,
  currentYear,
  currentRegionId,
}: {
  data: SangjoMonthUsage[];
  regions: WelfareRegion[];
  currentYear: number;
  currentRegionId?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, val: string) {
    const p = new URLSearchParams(searchParams.toString());
    p.set(key, val);
    router.push(`${pathname}?${p.toString()}`);
  }

  const maxCount = Math.max(...data.map(d => d.usage_count), 1);
  const total = data.reduce((s, d) => s + d.usage_count, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold flex items-center gap-2" style={{ color: '#1E293B' }}>
          <span className="w-1 h-4 rounded-full inline-block" style={{ backgroundColor: '#7C3AED' }} />
          월별 상조회 이용현황
          <span className="text-xs font-normal ml-1" style={{ color: '#94A3B8' }}>
            총 {total}건
          </span>
        </h2>
        <div className="flex gap-2">
          <select
            value={currentYear}
            onChange={e => updateParam('year', e.target.value)}
            className="rounded-lg border px-3 py-1.5 text-sm"
            style={{ borderColor: '#E2E8F0', color: '#374151' }}
          >
            {YEARS.map(y => <option key={y} value={y}>{y}년</option>)}
          </select>
          <select
            value={currentRegionId ?? ''}
            onChange={e => {
              const p = new URLSearchParams(searchParams.toString());
              if (e.target.value) p.set('region_id', e.target.value);
              else p.delete('region_id');
              router.push(`${pathname}?${p.toString()}`);
            }}
            className="rounded-lg border px-3 py-1.5 text-sm"
            style={{ borderColor: '#E2E8F0', color: '#374151' }}
          >
            <option value="">전체 지역</option>
            {regions.map(r => (
              <option key={r.id} value={r.id}>{r.province} {r.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-1 pt-4" style={{ height: '160px' }}>
        {data.map(({ month, usage_count }) => {
          const barH = maxCount > 0 ? Math.max(Math.round((usage_count / maxCount) * 112), usage_count > 0 ? 4 : 0) : 0;
          return (
            <div key={month} className="flex-1 flex flex-col items-center gap-1" style={{ height: '160px', justifyContent: 'flex-end' }}>
              {usage_count > 0 && (
                <span className="text-xs font-bold" style={{ color: '#7C3AED' }}>{usage_count}</span>
              )}
              <div
                className="w-full rounded-t-sm transition-all"
                style={{
                  height: `${barH}px`,
                  backgroundColor: usage_count > 0 ? '#7C3AED' : '#E2E8F0',
                  minHeight: '2px',
                }}
                title={`${month}월: ${usage_count}건`}
              />
              <span className="text-xs" style={{ color: '#94A3B8', fontSize: '10px' }}>
                {month}
              </span>
            </div>
          );
        })}
      </div>

      {/* Monthly table */}
      <div className="mt-4 grid grid-cols-6 gap-1.5">
        {data.map(({ month, usage_count }) => (
          <div
            key={month}
            className="rounded-lg p-2 text-center"
            style={{ backgroundColor: usage_count > 0 ? '#FAF5FF' : '#F8FAFC' }}
          >
            <p className="text-xs" style={{ color: '#94A3B8' }}>{month}월</p>
            <p className="text-sm font-bold" style={{ color: usage_count > 0 ? '#7C3AED' : '#CBD5E1' }}>
              {usage_count}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
