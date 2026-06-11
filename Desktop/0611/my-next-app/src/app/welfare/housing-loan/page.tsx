import { getHousingLoans, getHousingWaitlist } from '@/lib/welfare';
import LoanCalculator from '@/components/welfare/housing/LoanCalculator';

function fmt(n: number) {
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억`;
  if (n >= 10000) return `${Math.round(n / 10000).toLocaleString()}만`;
  return n.toLocaleString();
}

export default async function HousingLoanPage() {
  const [loans, waitlist] = await Promise.all([getHousingLoans(), getHousingWaitlist()]);

  const totalLoan = loans.reduce((s, l) => s + Number(l.loan_amount), 0);
  const totalLimit = loans.reduce((s, l) => s + Number(l.limit_amount), 0);
  const utilizationRate = totalLimit > 0 ? Math.round((totalLoan / totalLimit) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🏠</span>
        <h1 className="text-xl font-bold" style={{ color: '#1E293B' }}>
          주택대부금 / 긴급가계안전자금
        </h1>
      </div>

      {/* 전체 현황 카드 */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E2E8F0' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: '#94A3B8' }}>이용 인원</p>
          <p className="text-3xl font-bold" style={{ color: '#003A8C' }}>{loans.length}명</p>
        </div>
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E2E8F0' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: '#94A3B8' }}>현재 이용액 합계</p>
          <p className="text-3xl font-bold" style={{ color: '#1D4ED8' }}>{fmt(totalLoan)}</p>
          <p className="text-xs mt-0.5" style={{ color: '#CBD5E1' }}>/ 한도 {fmt(totalLimit)}</p>
        </div>
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E2E8F0' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: '#94A3B8' }}>이용률</p>
          <p className="text-3xl font-bold" style={{ color: utilizationRate > 80 ? '#EF4444' : '#16A34A' }}>
            {utilizationRate}%
          </p>
          <div className="mt-2 rounded-full overflow-hidden" style={{ height: '6px', backgroundColor: '#E2E8F0' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${utilizationRate}%`, backgroundColor: utilizationRate > 80 ? '#EF4444' : '#003A8C' }}
            />
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E2E8F0' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: '#94A3B8' }}>대기 인원</p>
          <p className="text-3xl font-bold" style={{ color: '#D97706' }}>{waitlist.length}명</p>
        </div>
      </section>

      {/* 계산기 */}
      <section>
        <LoanCalculator />
      </section>
    </div>
  );
}
