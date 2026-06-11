import { getUniformTypes, getUniformDistributionPlan, getUniformApplications } from '@/lib/welfare';
import UniformFilter from '@/components/welfare/uniform/UniformFilter';

const SEASON_EMOJI = { summer: '☀️', winter: '❄️', both: '🔄' };
const SEASON_LABEL = { summer: '하계', winter: '동계', both: '사계절' };
const STATUS_LABEL: Record<string, string> = { planned: '예정', in_progress: '진행 중', completed: '완료' };
const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  planned: { bg: '#F1F5F9', color: '#64748B' },
  in_progress: { bg: '#FEF3C7', color: '#D97706' },
  completed: { bg: '#DCFCE7', color: '#16A34A' },
};
const APP_STATUS_LABEL: Record<string, string> = { pending: '신청', approved: '승인', delivered: '지급완료' };
const APP_STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  pending: { bg: '#EFF6FF', color: '#1D4ED8' },
  approved: { bg: '#FEF3C7', color: '#D97706' },
  delivered: { bg: '#DCFCE7', color: '#16A34A' },
};

export default async function UniformPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; season?: string }>;
}) {
  const { year: yearStr, season = 'summer' } = await searchParams;
  const year = parseInt(yearStr ?? String(new Date().getFullYear()));

  const [types, plans, applications] = await Promise.all([
    getUniformTypes(),
    getUniformDistributionPlan(year),
    getUniformApplications(year, season),
  ]);

  // Pivot: region → status counts
  const regionMap = new Map<string, Record<string, number>>();
  applications.forEach(app => {
    const region = app.welfare_employees?.welfare_teams?.welfare_regions?.name ?? '미분류';
    if (!regionMap.has(region)) regionMap.set(region, { pending: 0, approved: 0, delivered: 0 });
    regionMap.get(region)![app.status] = (regionMap.get(region)![app.status] ?? 0) + 1;
  });
  const regionStats = Array.from(regionMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  const totalPending = applications.filter(a => a.status === 'pending').length;
  const totalApproved = applications.filter(a => a.status === 'approved').length;
  const totalDelivered = applications.filter(a => a.status === 'delivered').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👷</span>
          <h1 className="text-xl font-bold" style={{ color: '#1E293B' }}>근무복 / 안전장구류</h1>
        </div>
        <UniformFilter currentYear={year} currentSeason={season} />
      </div>

      {/* 1. 근무복 갤러리 */}
      <section className="bg-white rounded-xl border p-6" style={{ borderColor: '#E2E8F0' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold flex items-center gap-2" style={{ color: '#1E293B' }}>
            <span className="w-1 h-4 rounded-full inline-block" style={{ backgroundColor: '#0284C7' }} />
            근무복 종류
          </h2>
          {types.length > 0 && (() => {
            const latest = types
              .map(t => t.updated_at)
              .filter(Boolean)
              .sort()
              .at(-1);
            return latest ? (
              <span className="text-xs" style={{ color: '#94A3B8' }}>
                최종 업데이트: {new Date(latest).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
              </span>
            ) : null;
          })()}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {types.map(t => (
            <div
              key={t.id}
              className="rounded-xl border p-4"
              style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}
            >
              {/* Image placeholder */}
              <div
                className="w-full rounded-lg mb-3 flex items-center justify-center"
                style={{ height: '100px', backgroundColor: '#E2E8F0' }}
              >
                <span className="text-4xl">
                  {(SEASON_EMOJI as Record<string, string>)[t.season] ?? '👔'}
                </span>
              </div>
              <p className="text-sm font-bold mb-1" style={{ color: '#1E293B' }}>{t.name}</p>
              <div className="flex items-center gap-1.5 mb-2">
                <span
                  className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8' }}
                >
                  {(SEASON_LABEL as Record<string, string>)[t.season]}
                </span>
                {t.updated_at && (
                  <span className="text-xs" style={{ color: '#CBD5E1' }}>
                    {new Date(t.updated_at).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })} 수정
                  </span>
                )}
              </div>
              {Array.isArray(t.composition) && t.composition.length > 0 && (
                <ul className="space-y-0.5">
                  {t.composition.map((item: string, i: number) => (
                    <li key={i} className="text-xs flex items-start gap-1" style={{ color: '#64748B' }}>
                      <span className="mt-0.5" style={{ color: '#94A3B8' }}>•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 2. 연도별 지급계획 */}
      <section className="bg-white rounded-xl border p-6" style={{ borderColor: '#E2E8F0' }}>
        <h2 className="text-base font-bold flex items-center gap-2 mb-4" style={{ color: '#1E293B' }}>
          <span className="w-1 h-4 rounded-full inline-block" style={{ backgroundColor: '#0284C7' }} />
          {year}년도 지급계획
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                <th className="text-left py-2 px-3 font-semibold" style={{ color: '#64748B' }}>사업장</th>
                <th className="text-left py-2 px-3 font-semibold" style={{ color: '#64748B' }}>시즌</th>
                <th className="text-left py-2 px-3 font-semibold" style={{ color: '#64748B' }}>지급 예정일</th>
                <th className="text-left py-2 px-3 font-semibold" style={{ color: '#64748B' }}>상태</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan, idx) => {
                const sc = STATUS_COLOR[plan.status] ?? STATUS_COLOR.planned;
                return (
                  <tr
                    key={plan.id}
                    style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: idx % 2 === 0 ? '#FAFAFA' : '#ffffff' }}
                  >
                    <td className="py-2.5 px-3 font-medium" style={{ color: '#1E293B' }}>
                      {plan.welfare_regions?.name ?? '-'}
                    </td>
                    <td className="py-2.5 px-3" style={{ color: '#374151' }}>
                      {plan.season === 'summer' ? '하계' : '동계'}
                    </td>
                    <td className="py-2.5 px-3" style={{ color: '#374151' }}>
                      {plan.planned_date ? new Date(plan.planned_date).toLocaleDateString('ko-KR') : '-'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{ backgroundColor: sc.bg, color: sc.color }}
                      >
                        {STATUS_LABEL[plan.status] ?? plan.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {plans.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm" style={{ color: '#94A3B8' }}>
                    해당 연도의 지급계획이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. 사업장별 신청현황 */}
      <section className="bg-white rounded-xl border p-6" style={{ borderColor: '#E2E8F0' }}>
        <h2 className="text-base font-bold flex items-center gap-2 mb-1" style={{ color: '#1E293B' }}>
          <span className="w-1 h-4 rounded-full inline-block" style={{ backgroundColor: '#0284C7' }} />
          사업장별 신청현황
          <span className="text-xs font-normal ml-1" style={{ color: '#94A3B8' }}>
            {year}년 {season === 'summer' ? '하계' : '동계'}
          </span>
        </h2>

        {/* Summary */}
        <div className="flex gap-3 mb-4">
          {(['pending', 'approved', 'delivered'] as const).map(s => (
            <div key={s} className="rounded-lg px-3 py-2" style={{ backgroundColor: APP_STATUS_COLOR[s].bg }}>
              <span className="text-xs font-semibold" style={{ color: APP_STATUS_COLOR[s].color }}>
                {APP_STATUS_LABEL[s]}: {s === 'pending' ? totalPending : s === 'approved' ? totalApproved : totalDelivered}건
              </span>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                <th className="text-left py-2 px-3 font-semibold" style={{ color: '#64748B' }}>사업장</th>
                <th className="text-center py-2 px-3 font-semibold" style={{ color: '#1D4ED8' }}>신청</th>
                <th className="text-center py-2 px-3 font-semibold" style={{ color: '#D97706' }}>승인</th>
                <th className="text-center py-2 px-3 font-semibold" style={{ color: '#16A34A' }}>지급완료</th>
                <th className="text-center py-2 px-3 font-semibold" style={{ color: '#64748B' }}>합계</th>
              </tr>
            </thead>
            <tbody>
              {regionStats.map(([region, counts], idx) => {
                const total = (counts.pending ?? 0) + (counts.approved ?? 0) + (counts.delivered ?? 0);
                return (
                  <tr
                    key={region}
                    style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: idx % 2 === 0 ? '#FAFAFA' : '#ffffff' }}
                  >
                    <td className="py-2.5 px-3 font-medium" style={{ color: '#1E293B' }}>{region}</td>
                    <td className="py-2.5 px-3 text-center font-bold" style={{ color: '#1D4ED8' }}>{counts.pending ?? 0}</td>
                    <td className="py-2.5 px-3 text-center font-bold" style={{ color: '#D97706' }}>{counts.approved ?? 0}</td>
                    <td className="py-2.5 px-3 text-center font-bold" style={{ color: '#16A34A' }}>{counts.delivered ?? 0}</td>
                    <td className="py-2.5 px-3 text-center font-semibold" style={{ color: '#374151' }}>{total}</td>
                  </tr>
                );
              })}
              {regionStats.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm" style={{ color: '#94A3B8' }}>
                    해당 기간의 신청 데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
