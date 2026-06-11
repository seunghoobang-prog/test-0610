export default function CondoPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">🏖️</span>
        <h1 className="text-xl font-bold" style={{ color: '#1E293B' }}>콘도 / 하계휴양소</h1>
      </div>
      <div
        className="bg-white rounded-xl border p-12 text-center"
        style={{ borderColor: '#E2E8F0' }}
      >
        <p className="text-4xl mb-4">🏗️</p>
        <p className="text-lg font-semibold mb-2" style={{ color: '#1E293B' }}>준비 중입니다</p>
        <p className="text-sm" style={{ color: '#94A3B8' }}>콘도 및 하계휴양소 이용현황 페이지가 곧 제공됩니다.</p>
      </div>
    </div>
  );
}
