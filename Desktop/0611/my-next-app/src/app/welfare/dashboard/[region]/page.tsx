import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRegionDashboard } from '@/lib/welfare';

const PROGRAM_CARDS = [
  { num: 1, label: '콘도 / 하계휴양소', href: '/welfare/condo', emoji: '🏖️', bg: '#EFF6FF', border: '#BFDBFE' },
  { num: 2, label: '상조회', href: '/welfare/sangjo', emoji: '🌸', bg: '#FAF5FF', border: '#E9D5FF' },
  { num: 3, label: '주택대부금', href: '/welfare/housing-loan', emoji: '🏠', bg: '#FFF7ED', border: '#FED7AA' },
  { num: 4, label: '근무복 / 안전장구류', href: '/welfare/uniform', emoji: '👷', bg: '#F0F9FF', border: '#BAE6FD' },
  { num: 5, label: '심리상담', href: '/welfare/counseling', emoji: '💬', bg: '#FFF1F2', border: '#FECDD3' },
];

function fmt(n: number) {
  return new Intl.NumberFormat('ko-KR').format(n);
}

export default async function RegionDashboardPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region } = await params;
  const regionName = decodeURIComponent(region);
  const data = await getRegionDashboard(regionName);

  if (!data) notFound();

  const { region: regionInfo, teams, employeeCount, totalLoan, totalLimit, waitlistCount, annualSangjo, usedQuota, totalQuota, uniformPending, uniformDelivered } = data;

  const loanRate = totalLimit > 0 ? Math.round((totalLoan / totalLimit) * 100) : 0;
  const quotaRate = totalQuota > 0 ? Math.round((usedQuota / totalQuota) * 100) : 0;

  const programStats = [
    { ...PROGRAM_CARDS[0], stat: '이용현황 확인', sub: '예약 가능' },
    { ...PROGRAM_CARDS[1], stat: `올해 ${annualSangjo}건`, sub: `이용횟수 ${usedQuota}/${totalQuota} (${quotaRate}%)` },
    { ...PROGRAM_CARDS[2], stat: `${fmt(totalLoan)}원`, sub: `이용률 ${loanRate}% | 대기 ${waitlistCount}명` },
    { ...PROGRAM_CARDS[3], stat: `신청 ${uniformPending}건 대기`, sub: `지급완료 ${uniformDelivered}건` },
    { ...PROGRAM_CARDS[4], stat: '상담 예약 가능', sub: '심리상담 신청' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Region header */}
      <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E2E8F0' }}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: '#003A8C' }}
          >
            {regionInfo.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#1E293B' }}>
              {regionInfo.province} {regionInfo.name} 사업장
            </h1>
            <p className="text-sm" style={{ color: '#94A3B8' }}>복리후생 운영현황 대시보드</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg p-3 text-center" style={{ backgroundColor: '#F8FAFC' }}>
            <p className="text-2xl font-bold" style={{ color: '#003A8C' }}>{teams.length}</p>
            <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>팀 수</p>
          </div>
          <div className="rounded-lg p-3 text-center" style={{ backgroundColor: '#F8FAFC' }}>
            <p className="text-2xl font-bold" style={{ color: '#003A8C' }}>{employeeCount}</p>
            <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>직원 수</p>
          </div>
          <div className="rounded-lg p-3 text-center" style={{ backgroundColor: '#F8FAFC' }}>
            <p className="text-2xl font-bold" style={{ color: '#003A8C' }}>5</p>
            <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>복리후생 프로그램</p>
          </div>
        </div>

        {teams.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {teams.map(t => (
              <span
                key={t.id}
                className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8' }}
              >
                {t.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Program cards */}
      <div>
        <h2 className="text-sm font-bold mb-3" style={{ color: '#64748B' }}>
          프로그램별 현황
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {programStats.map(prog => (
            <Link
              key={prog.href}
              href={prog.href}
              className="rounded-xl border p-4 transition-all hover:shadow-md flex flex-col gap-2"
              style={{ backgroundColor: prog.bg, borderColor: prog.border }}
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold" style={{ color: '#94A3B8' }}>
                  No. {prog.num}
                </span>
                <span className="text-xl">{prog.emoji}</span>
              </div>
              <p className="text-sm font-semibold leading-tight" style={{ color: '#1E293B' }}>
                {prog.label}
              </p>
              <div>
                <p className="text-sm font-bold" style={{ color: '#003A8C' }}>{prog.stat}</p>
                <p className="text-xs" style={{ color: '#94A3B8' }}>{prog.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
