import { Suspense } from 'react';
import { getSangjoItems, getSangjoUsage, getSangjoEmployeeQuota, getRegions } from '@/lib/welfare';
import SangjoInventoryTable from '@/components/welfare/sangjo/SangjoInventoryTable';
import MonthlyUsageChart from '@/components/welfare/sangjo/MonthlyUsageChart';
import EmployeeQuotaTable from '@/components/welfare/sangjo/EmployeeQuotaTable';

export default async function SangjoPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; region_id?: string }>;
}) {
  const { year: yearStr, region_id } = await searchParams;
  const year = parseInt(yearStr ?? String(new Date().getFullYear()));
  const regionId = region_id ? parseInt(region_id) : undefined;

  const [items, monthlyUsage, quotas, regions] = await Promise.all([
    getSangjoItems(),
    getSangjoUsage(year, regionId),
    getSangjoEmployeeQuota(year),
    getRegions(),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🌸</span>
        <h1 className="text-xl font-bold" style={{ color: '#1E293B' }}>상조회 운영현황</h1>
      </div>

      {/* 1. 재고 현황 */}
      <section className="bg-white rounded-xl border p-6" style={{ borderColor: '#E2E8F0' }}>
        <h2 className="text-base font-bold flex items-center gap-2 mb-4" style={{ color: '#1E293B' }}>
          <span className="w-1 h-4 rounded-full inline-block" style={{ backgroundColor: '#7C3AED' }} />
          현재 상조물품 재고
        </h2>
        <Suspense fallback={<p className="text-sm py-4 text-center" style={{ color: '#94A3B8' }}>로딩 중...</p>}>
          <SangjoInventoryTable items={items} />
        </Suspense>
      </section>

      {/* 2. 월별 이용현황 */}
      <section className="bg-white rounded-xl border p-6" style={{ borderColor: '#E2E8F0' }}>
        <MonthlyUsageChart
          data={monthlyUsage}
          regions={regions}
          currentYear={year}
          currentRegionId={regionId}
        />
      </section>

      {/* 3. 인원별 잔여 이용횟수 */}
      <section className="bg-white rounded-xl border p-6" style={{ borderColor: '#E2E8F0' }}>
        <EmployeeQuotaTable quotas={quotas} year={year} />
      </section>
    </div>
  );
}
