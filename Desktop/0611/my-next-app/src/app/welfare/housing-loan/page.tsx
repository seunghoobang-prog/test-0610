import { getHousingLoans, getHousingWaitlist } from '@/lib/welfare';
import LoanCalculator from '@/components/welfare/housing/LoanCalculator';

function fmt(n: number) {
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억`;
  if (n >= 10000) return `${(n / 10000).toFixed(0)}만`;
  return new Intl.NumberFormat('ko-KR').format(n);
}

function fmtFull(n: number) {
  return new Intl.NumberFormat('ko-KR').format(n) + '원';
}

export default async function HousingLoanPage() {
  const [loans, waitlist] = await Promise.all([getHousingLoans(), getHousingWaitlist()]);

  const totalLoan = loans.reduce((s, l) => s + Number(l.loan_amount), 0);
  const totalLimit = loans.reduce((s, l) => s + Number(l.limit_amount), 0);
  const utilizationRate = totalLimit > 0 ? Math.round((totalLoan / totalLimit) * 100) : 0;

  const LIMIT_PER_PERSON = 50_000_000;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🏠</span>
        <h1 className="text-xl font-bold" style={{ color: '#1E293B' }}>
          주택대부금 / 긴급가계안전자금
        </h1>
      </div>

      {/* 1. 전체 현황 카드 */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E2E8F0' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: '#94A3B8' }}>이용 인원</p>
          <p className="text-3xl font-bold" style={{ color: '#003A8C' }}>{loans.length}명</p>
        </div>
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E2E8F0' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: '#94A3B8' }}>현재 이용액 합계</p>
          <p className="text-3xl font-bold" style={{ color: '#1D4ED8' }}>{fmt(totalLoan)}</p>
          <p className="text-xs mt-0.5" style={{ color: '#CBD5E1' }}>원</p>
        </div>
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E2E8F0' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: '#94A3B8' }}>이용률</p>
          <p className="text-3xl font-bold" style={{ color: utilizationRate > 80 ? '#EF4444' : '#16A34A' }}>
            {utilizationRate}%
          </p>
          <div className="mt-2 rounded-full overflow-hidden" style={{ height: '6px', backgroundColor: '#E2E8F0' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${utilizationRate}%`,
                backgroundColor: utilizationRate > 80 ? '#EF4444' : '#003A8C',
              }}
            />
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E2E8F0' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: '#94A3B8' }}>대기 인원</p>
          <p className="text-3xl font-bold" style={{ color: '#D97706' }}>{waitlist.length}명</p>
        </div>
      </section>

      {/* 2. 이용 현황 테이블 */}
      <section className="bg-white rounded-xl border p-6" style={{ borderColor: '#E2E8F0' }}>
        <h2 className="text-base font-bold flex items-center gap-2 mb-4" style={{ color: '#1E293B' }}>
          <span className="w-1 h-4 rounded-full inline-block" style={{ backgroundColor: '#003A8C' }} />
          현재 이용 현황
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                {['사번', '이름', '소속', '사업장', '이용액', '한도', '이용률', '승인일'].map(h => (
                  <th key={h} className="text-left py-2 px-3 font-semibold" style={{ color: '#64748B' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loans.map((loan, idx) => {
                const emp = loan.welfare_employees;
                const amount = Number(loan.loan_amount);
                const limit = Number(loan.limit_amount);
                const rate = Math.round((amount / limit) * 100);
                return (
                  <tr
                    key={loan.id}
                    style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: idx % 2 === 0 ? '#FAFAFA' : '#ffffff' }}
                  >
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#94A3B8' }}>{emp?.employee_number ?? '-'}</td>
                    <td className="py-2.5 px-3 font-medium" style={{ color: '#1E293B' }}>{emp?.name ?? '-'}</td>
                    <td className="py-2.5 px-3" style={{ color: '#374151' }}>{emp?.welfare_teams?.name ?? '-'}</td>
                    <td className="py-2.5 px-3" style={{ color: '#374151' }}>{emp?.welfare_teams?.welfare_regions?.name ?? '-'}</td>
                    <td className="py-2.5 px-3 font-semibold" style={{ color: '#1D4ED8' }}>{fmtFull(amount)}</td>
                    <td className="py-2.5 px-3" style={{ color: '#64748B' }}>{fmtFull(limit)}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 rounded-full overflow-hidden" style={{ height: '4px', backgroundColor: '#E2E8F0', minWidth: '40px' }}>
                          <div className="h-full rounded-full" style={{ width: `${rate}%`, backgroundColor: rate >= 100 ? '#EF4444' : '#3B82F6' }} />
                        </div>
                        <span className="text-xs" style={{ color: rate >= 100 ? '#EF4444' : '#64748B' }}>{rate}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#94A3B8' }}>
                      {loan.approved_at ? new Date(loan.approved_at).toLocaleDateString('ko-KR') : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. 대기인원 현황 */}
      <section className="bg-white rounded-xl border p-6" style={{ borderColor: '#E2E8F0' }}>
        <h2 className="text-base font-bold flex items-center gap-2 mb-4" style={{ color: '#1E293B' }}>
          <span className="w-1 h-4 rounded-full inline-block" style={{ backgroundColor: '#F59E0B' }} />
          대기인원 현황
          <span className="text-xs font-normal ml-1" style={{ color: '#94A3B8' }}>
            총 {waitlist.length}명
          </span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                {['순번', '이름', '소속 팀', '사업장', '신청금액', '신청일'].map(h => (
                  <th key={h} className="text-left py-2 px-3 font-semibold" style={{ color: '#64748B' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {waitlist.map((item, idx) => {
                const emp = item.welfare_employees;
                return (
                  <tr
                    key={item.id}
                    style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: idx % 2 === 0 ? '#FAFAFA' : '#ffffff' }}
                  >
                    <td className="py-2.5 px-3">
                      <span
                        className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: '#F59E0B' }}
                      >
                        {item.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium" style={{ color: '#1E293B' }}>{emp?.name ?? '-'}</td>
                    <td className="py-2.5 px-3" style={{ color: '#374151' }}>{emp?.welfare_teams?.name ?? '-'}</td>
                    <td className="py-2.5 px-3" style={{ color: '#374151' }}>{emp?.welfare_teams?.welfare_regions?.name ?? '-'}</td>
                    <td className="py-2.5 px-3 font-semibold" style={{ color: '#D97706' }}>
                      {fmtFull(Number(item.requested_amount))}
                    </td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#94A3B8' }}>
                      {item.applied_at ? new Date(item.applied_at).toLocaleDateString('ko-KR') : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. 계산기 */}
      <section>
        <LoanCalculator />
      </section>
    </div>
  );
}
