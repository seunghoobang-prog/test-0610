'use client';

import { useState, useMemo } from 'react';
import type { SangjoEmployeeQuota } from '@/lib/welfare';

export default function EmployeeQuotaTable({
  quotas,
  year,
}: {
  quotas: SangjoEmployeeQuota[];
  year: number;
}) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return quotas;
    return quotas.filter(r => {
      const emp = r.welfare_employees;
      if (!emp) return false;
      return (
        emp.name.toLowerCase().includes(q) ||
        (emp.welfare_teams?.name ?? '').toLowerCase().includes(q) ||
        (emp.welfare_teams?.welfare_regions?.name ?? '').toLowerCase().includes(q) ||
        emp.employee_number.toLowerCase().includes(q)
      );
    });
  }, [quotas, search]);

  const exhausted = filtered.filter(r => (r.total_quota - r.used_count) <= 0).length;
  const available = filtered.length - exhausted;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold flex items-center gap-2" style={{ color: '#1E293B' }}>
            <span className="w-1 h-4 rounded-full inline-block" style={{ backgroundColor: '#7C3AED' }} />
            인원별 상조회 잔여 이용횟수
            <span className="text-xs font-normal ml-1" style={{ color: '#94A3B8' }}>{year}년도</span>
          </h2>
          <div className="flex gap-2 text-xs">
            <span className="rounded-full px-2.5 py-0.5 font-medium" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
              잔여 있음 {available}명
            </span>
            <span className="rounded-full px-2.5 py-0.5 font-medium" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
              소진 {exhausted}명
            </span>
          </div>
        </div>
        <input
          type="text"
          placeholder="이름 / 팀명 검색"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="rounded-lg border px-3 py-1.5 text-sm"
          style={{ borderColor: '#E2E8F0', color: '#374151', width: '160px' }}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
              <th className="text-left py-2 px-3 font-semibold" style={{ color: '#64748B' }}>사번</th>
              <th className="text-left py-2 px-3 font-semibold" style={{ color: '#64748B' }}>이름</th>
              <th className="text-left py-2 px-3 font-semibold" style={{ color: '#64748B' }}>소속 팀</th>
              <th className="text-left py-2 px-3 font-semibold" style={{ color: '#64748B' }}>사업장</th>
              <th className="text-center py-2 px-3 font-semibold" style={{ color: '#64748B' }}>총 한도</th>
              <th className="text-center py-2 px-3 font-semibold" style={{ color: '#64748B' }}>사용</th>
              <th className="text-center py-2 px-3 font-semibold" style={{ color: '#64748B' }}>잔여</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, idx) => {
              const emp = row.welfare_employees;
              const remaining = row.total_quota - row.used_count;
              return (
                <tr
                  key={row.id}
                  style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: idx % 2 === 0 ? '#FAFAFA' : '#ffffff' }}
                >
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#94A3B8' }}>
                    {emp?.employee_number ?? '-'}
                  </td>
                  <td className="py-2.5 px-3 font-medium" style={{ color: '#1E293B' }}>
                    {emp?.name ?? '-'}
                  </td>
                  <td className="py-2.5 px-3" style={{ color: '#374151' }}>
                    {emp?.welfare_teams?.name ?? '-'}
                  </td>
                  <td className="py-2.5 px-3" style={{ color: '#374151' }}>
                    {emp?.welfare_teams?.welfare_regions?.name ?? '-'}
                  </td>
                  <td className="py-2.5 px-3 text-center font-medium" style={{ color: '#64748B' }}>
                    {row.total_quota}
                  </td>
                  <td className="py-2.5 px-3 text-center" style={{ color: '#94A3B8' }}>
                    {row.used_count}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold"
                      style={{
                        backgroundColor: remaining <= 0 ? '#FEF2F2' : remaining === 1 ? '#FFF7ED' : '#F0FDF4',
                        color: remaining <= 0 ? '#DC2626' : remaining === 1 ? '#D97706' : '#16A34A',
                      }}
                    >
                      {remaining}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center py-8 text-sm" style={{ color: '#94A3B8' }}>검색 결과가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
