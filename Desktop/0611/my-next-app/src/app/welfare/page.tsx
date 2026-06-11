import Link from 'next/link';

const REGIONS = [
  { province: '경기', cities: ['오산', '안양', '평택', '안산', '수원', '부천', '용인'] },
  { province: '인천', cities: ['인천'] },
  { province: '광명', cities: ['광명'] },
];

const PROGRAMS = [
  { num: 1, label: '콘도 / 하계휴양소', href: '/welfare/condo', emoji: '🏖️', bg: '#EFF6FF', border: '#BFDBFE' },
  { num: 2, label: '상조회', href: '/welfare/sangjo', emoji: '🌸', bg: '#FAF5FF', border: '#E9D5FF' },
  { num: 3, label: '주택대부금 / 긴급가계안전자금', href: '/welfare/housing-loan', emoji: '🏠', bg: '#FFF7ED', border: '#FED7AA' },
  { num: 4, label: '근무복 / 안전장구류', href: '/welfare/uniform', emoji: '👷', bg: '#F0F9FF', border: '#BAE6FD' },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-bold flex items-center gap-2 mb-4" style={{ color: '#1E3A5F' }}>
      <span className="w-1 h-5 rounded-full inline-block" style={{ backgroundColor: '#003A8C' }} />
      {children}
    </h2>
  );
}

export default function WelfarePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* 지역별 */}
      <section className="bg-white rounded-xl border p-6" style={{ borderColor: '#E2E8F0' }}>
        <SectionTitle>지역별 운영현황</SectionTitle>
        <div className="space-y-4">
          {REGIONS.map(({ province, cities }) => (
            <div key={province}>
              <p className="text-xs font-semibold mb-2 px-1" style={{ color: '#94A3B8' }}>
                {province}
              </p>
              <div className="flex flex-wrap gap-2">
                {cities.map(city => (
                  <Link
                    key={city}
                    href={`/welfare/dashboard/${city}`}
                    className="rounded-lg px-4 py-3 text-center border transition-all hover:shadow-md group"
                    style={{
                      backgroundColor: '#F8FAFC',
                      borderColor: '#E2E8F0',
                      minWidth: '80px',
                    }}
                  >
                    <p className="text-sm font-semibold" style={{ color: '#1E293B' }}>
                      {city}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                      대시보드 →
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 프로그램별 */}
      <section className="bg-white rounded-xl border p-6" style={{ borderColor: '#E2E8F0' }}>
        <SectionTitle>프로그램별 운영현황</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {PROGRAMS.map(prog => (
            <Link
              key={prog.href}
              href={prog.href}
              className="rounded-xl border p-4 transition-all hover:shadow-md flex flex-col gap-3"
              style={{ backgroundColor: prog.bg, borderColor: prog.border }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold" style={{ color: '#94A3B8' }}>
                    No. {prog.num}
                  </span>
                  <p className="text-sm font-semibold leading-tight mt-0.5" style={{ color: '#1E293B' }}>
                    {prog.label}
                  </p>
                </div>
                <span className="text-2xl leading-none">{prog.emoji}</span>
              </div>
              <p className="text-xs" style={{ color: '#94A3B8' }}>
                페이지로 이동 →
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
