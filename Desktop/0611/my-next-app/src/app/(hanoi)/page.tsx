import Link from 'next/link';
import PostCard from '@/components/PostCard';
import { posts } from '@/data/posts';
import { hotspots, categoryColors } from '@/data/hotspots';
import { members, gradeInfo } from '@/data/members';

export default function HomePage() {
  const recentPosts = posts.slice(0, 6);
  const featuredHotspots = hotspots.slice(0, 4);
  const topMembers = members
    .filter((m) => m.grade === '마스터임장단' || m.grade === '시니어임장단')
    .slice(0, 3);

  const stats = [
    { label: '총 임장 횟수', value: '127회', icon: '🏠' },
    { label: '등록 단원', value: '48명', icon: '👥' },
    { label: '방문 핫플', value: '63곳', icon: '📍' },
    { label: '누적 게시글', value: '312개', icon: '📝' },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-hero-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-orange-300 blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28">
          <div className="flex flex-col md:flex-row md:items-center gap-10">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-sm mb-4 backdrop-blur">
                🇻🇳 하노이 현지 임장 커뮤니티
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
                하노이를<br />
                <span className="text-yellow-300">투자의 눈</span>으로<br />
                여행한다
              </h1>
              <p className="text-green-100 text-lg mb-8 leading-relaxed">
                서울 직장인 2030을 위한 베트남 하노이<br />
                여행 + 부동산 임장 커뮤니티
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/board?category=임장기"
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-full transition-colors shadow-lg"
                >
                  임장기 보러가기 →
                </Link>
                <Link
                  href="/map"
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full transition-colors backdrop-blur border border-white/20"
                >
                  🗺️ 핫플 지도 보기
                </Link>
              </div>
            </div>

            {/* Stats card */}
            <div className="md:w-80 bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
              <h3 className="text-sm font-semibold text-green-200 mb-4 uppercase tracking-wide">임장단 현황</h3>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-3xl mb-1">{s.icon}</div>
                    <div className="text-2xl font-extrabold text-white">{s.value}</div>
                    <div className="text-xs text-green-200 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Concept Banner */}
      <section className="bg-orange-500 text-white py-4">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-medium">
          <span>🏠 현장 임장으로 배우는 해외 부동산</span>
          <span>✈️ 분기별 정기 하노이 투어</span>
          <span>💼 서울 2030 직장인 네트워킹</span>
          <span>📊 실전 수익률 분석 공유</span>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">

        {/* Recent Posts */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-stone-800">최신 게시글</h2>
              <p className="text-stone-500 text-sm mt-1">단원들의 생생한 임장기 &amp; 여행기</p>
            </div>
            <Link href="/board" className="text-green-600 hover:text-green-700 font-semibold text-sm">
              전체보기 →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>

        {/* Featured Hotspots */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-stone-800">🗺️ 하노이 핫플</h2>
              <p className="text-stone-500 text-sm mt-1">임장단이 엄선한 하노이 핵심 스팟</p>
            </div>
            <Link href="/map" className="text-green-600 hover:text-green-700 font-semibold text-sm">
              지도 보기 →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredHotspots.map((spot) => (
              <Link key={spot.id} href="/map">
                <div className="post-card bg-white rounded-2xl p-4 shadow-sm border border-stone-100 h-full">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: categoryColors[spot.category] }}
                    >
                      {spot.id}
                    </span>
                    <span className="text-xs font-semibold text-stone-500">{spot.category}</span>
                  </div>
                  <h3 className="font-bold text-stone-800 text-sm mb-1">{spot.nameKo}</h3>
                  <p className="text-xs text-stone-500 line-clamp-2">{spot.description}</p>
                  <div className="mt-2 text-xs text-stone-400">
                    ⭐ {spot.rating}/5 · {spot.priceRange}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Grade System */}
        <section className="bg-tropical-card rounded-2xl p-8 border border-green-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-stone-800">🏅 멤버 등급 시스템</h2>
              <p className="text-stone-500 text-sm mt-1">임장 횟수로 올라가는 단원 등급</p>
            </div>
            <Link href="/members" className="text-green-600 hover:text-green-700 font-semibold text-sm">
              전체보기 →
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.entries(gradeInfo) as [string, (typeof gradeInfo)[keyof typeof gradeInfo]][]).map(
              ([grade, info]) => (
                <div key={grade} className={`rounded-xl p-4 ${info.bgClass}`}>
                  <div className="text-3xl mb-2">{info.emoji}</div>
                  <div className={`font-bold text-sm mb-1 ${info.colorClass}`}>{grade}</div>
                  <div className="text-xs text-stone-500">
                    {info.maxVisits >= 9999
                      ? `${info.minVisits}회+`
                      : `${info.minVisits}~${info.maxVisits}회`}
                  </div>
                  <div className="text-xs text-stone-600 mt-1">{info.description}</div>
                </div>
              )
            )}
          </div>
        </section>

        {/* Top Members */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-stone-800">👑 핵심 단원</h2>
              <p className="text-stone-500 text-sm mt-1">임장단을 이끄는 마스터 &amp; 시니어 단원</p>
            </div>
            <Link href="/members" className="text-green-600 hover:text-green-700 font-semibold text-sm">
              전체보기 →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topMembers.map((member) => (
              <div key={member.id} className="post-card bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">
                    {member.grade === '마스터임장단' ? '👑' : '🏆'}
                  </div>
                  <div>
                    <div className="font-bold text-stone-800">{member.name}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold grade-${member.grade}`}>
                      {member.grade}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-stone-500 mb-3">{member.bio}</p>
                <div className="flex gap-3 text-xs text-stone-400">
                  <span>✈️ 임장 {member.visitCount}회</span>
                  <span>📝 글 {member.postCount}개</span>
                </div>
                <div className="mt-2 text-xs text-green-600 font-medium">🎯 {member.speciality}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Join CTA */}
        <section className="bg-hero-gradient rounded-2xl p-10 text-white text-center">
          <div className="text-4xl mb-3">🇻🇳</div>
          <h2 className="text-2xl font-extrabold mb-2">하노이 임장단에 합류하세요</h2>
          <p className="text-green-100 mb-6 text-sm leading-relaxed">
            분기별 정기 임장, 현지 중개사 연결, 투자 스터디까지
            <br />
            서울 직장인 2030의 해외 부동산 첫걸음을 함께합니다
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/board"
              className="px-8 py-3 bg-white text-green-800 font-bold rounded-full hover:bg-green-50 transition-colors"
            >
              게시판 둘러보기
            </Link>
            <Link
              href="/members"
              className="px-8 py-3 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-full transition-colors"
            >
              등급 확인하기
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
