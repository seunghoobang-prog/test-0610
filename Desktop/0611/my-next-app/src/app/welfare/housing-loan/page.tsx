import LoanCalculator from '@/components/welfare/housing/LoanCalculator';

export default function HousingLoanPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🏠</span>
        <h1 className="text-xl font-bold" style={{ color: '#1E293B' }}>
          주택대부금 / 긴급가계안전자금
        </h1>
      </div>

      <section>
        <LoanCalculator />
      </section>
    </div>
  );
}
