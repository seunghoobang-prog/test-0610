'use client';

import { useState } from 'react';

function fmt(n: number) {
  return new Intl.NumberFormat('ko-KR').format(Math.round(n));
}

// 보증보험료 (일회성) 요율 추정 — 선형 보간
// 기준: 10년/1억→280만(2.8%), 20년/1억→500만(5.0%)
// ⇒ rate(y) = 0.22% × y + 0.6%
function calcInsuranceFee(principal: number, years: number): number {
  const ratePercent = 0.22 * years + 0.6;
  return principal * ratePercent / 100;
}

const YEAR_OPTIONS = [1, 2, 3, 5, 7, 10, 15, 20];

export default function LoanCalculator() {
  const [principal, setPrincipal] = useState('30000000');
  const [rate, setRate] = useState('3.5');
  const [years, setYears] = useState('5');

  const P = parseFloat(principal.replace(/,/g, '')) || 0;
  const annualRate = parseFloat(rate) / 100;
  const y = parseInt(years);
  const n = y * 12;
  const r = annualRate / 12;

  const monthlyPayment = (n > 0 && r > 0 && P > 0)
    ? P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
    : 0;

  const insurance = (P > 0 && y > 0) ? calcInsuranceFee(P, y) : 0;
  const insuranceRateDisplay = (0.22 * y + 0.6).toFixed(2);

  return (
    <div className="rounded-xl border p-6" style={{ backgroundColor: '#FFFBEB', borderColor: '#FED7AA' }}>
      <h3 className="text-base font-bold mb-5 flex items-center gap-2" style={{ color: '#92400E' }}>
        🧮 개인 대출 계산기
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 입력 */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#78350F' }}>
              대출금액 (원)
            </label>
            <input
              type="number"
              value={principal}
              onChange={e => setPrincipal(e.target.value)}
              min={0}
              max={50000000}
              step={1000000}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              style={{ borderColor: '#FCD34D' }}
              placeholder="최대 50,000,000"
            />
            <p className="text-xs mt-1" style={{ color: '#D97706' }}>
              {P > 0 ? `${fmt(P)}원` : ''}
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#78350F' }}>
              대출금리 (연 %)
            </label>
            <input
              type="number"
              value={rate}
              onChange={e => setRate(e.target.value)}
              min={0}
              max={20}
              step={0.1}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              style={{ borderColor: '#FCD34D' }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#78350F' }}>
              대출기간 (년)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {YEAR_OPTIONS.map(yy => (
                <button
                  key={yy}
                  onClick={() => setYears(String(yy))}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors border"
                  style={{
                    backgroundColor: years === String(yy) ? '#F59E0B' : '#FFF',
                    color: years === String(yy) ? '#ffffff' : '#92400E',
                    borderColor: years === String(yy) ? '#F59E0B' : '#FCD34D',
                  }}
                >
                  {yy}년
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 결과 */}
        <div className="space-y-3">
          <div className="rounded-xl p-4 border" style={{ backgroundColor: '#ffffff', borderColor: '#FCD34D' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: '#94A3B8' }}>월 상환액 (원리금균등)</p>
            <p className="text-2xl font-bold" style={{ color: '#003A8C' }}>
              {monthlyPayment > 0 ? `${fmt(monthlyPayment)}원` : '-'}
            </p>
            {monthlyPayment > 0 && n > 0 && (
              <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                총 상환액 {fmt(monthlyPayment * n)}원
              </p>
            )}
          </div>

          <div className="rounded-xl p-4 border" style={{ backgroundColor: '#FEF9C3', borderColor: '#FDE047' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: '#713F12' }}>
              예상 보증보험료 <span className="font-normal">(최초 일회성)</span>
            </p>
            <p className="text-2xl font-bold" style={{ color: '#92400E' }}>
              {insurance > 0 ? `${fmt(insurance)}원` : '-'}
            </p>
            {insurance > 0 && (
              <p className="text-xs mt-1" style={{ color: '#A16207' }}>
                적용요율 {insuranceRateDisplay}% · {y}년 기준 추정값
              </p>
            )}
          </div>

          <p className="text-xs" style={{ color: '#D97706' }}>
            ※ 원리금균등상환 기준. 보증보험료는 SGI서울보증 기준 추정이며 실제와 다를 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
