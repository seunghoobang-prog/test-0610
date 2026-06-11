import GradeBadge from '@/components/GradeBadge';
import { gradeInfo, type Grade, type Member } from '@/data/members';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMember(row: any): Member {
  return {
    id: row.id,
    name: row.name,
    grade: row.grade,
    joinDate: row.join_date,
    visitCount: row.visit_count,
    postCount: row.post_count,
    bio: row.bio ?? '',
    speciality: row.speciality ?? '',
    job: row.job ?? '',
  };
}

export default async function MembersPage() {
  const { data } = await supabase.from('members').select('*');
  const members = (data ?? []).map(mapMember);

  const gradeOrder: Grade[] = ['마스터임장단', '시니어임장단', '정예단원', '새싹단원'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-stone-800 mb-1">🏅 멤버 등급 시스템</h1>
        <p className="text-stone-500">임장 횟수에 따라 자동으로 올라가는 하노이 임장단 등급</p>
      </div>

      {/* Grade system explanation */}
      <section className="mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {gradeOrder.map((grade) => {
            const info = gradeInfo[grade];
            return (
              <div key={grade} className={`rounded-2xl p-6 border-2 ${info.bgClass} border-opacity-50`}>
                <div className="text-5xl mb-3">{info.emoji}</div>
                <GradeBadge grade={grade} size="md" />
                <div className="mt-2 text-sm font-semibold text-stone-600">
                  {info.maxVisits >= 9999
                    ? `임장 ${info.minVisits}회 이상`
                    : `임장 ${info.minVisits}~${info.maxVisits}회`}
                </div>
                <p className="text-sm text-stone-500 mt-1 mb-3">{info.description}</p>
                <ul className="space-y-1">
                  {info.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-1.5 text-xs text-stone-600">
                      <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Members by grade */}
      {gradeOrder.map((grade) => {
        const gradeMembers = members.filter((m) => m.grade === grade);
        if (gradeMembers.length === 0) return null;
        const info = gradeInfo[grade];

        return (
          <section key={grade} className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">{info.emoji}</span>
              <h2 className="text-xl font-bold text-stone-800">{grade}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-sm font-semibold ${info.bgClass} ${info.colorClass}`}>
                {gradeMembers.length}명
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gradeMembers.map((member) => (
                <div key={member.id} className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 hover:border-green-200 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl ${info.bgClass}`}>
                      {info.emoji}
                    </div>
                    <div>
                      <div className="font-bold text-stone-800 text-lg">{member.name}</div>
                      <div className="text-xs text-stone-400">{member.job}</div>
                    </div>
                  </div>

                  <p className="text-sm text-stone-500 mb-4 leading-relaxed">{member.bio}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                    <div className="bg-stone-50 rounded-lg p-2">
                      <div className="text-lg font-bold text-stone-800">{member.visitCount}</div>
                      <div className="text-xs text-stone-400">임장 횟수</div>
                    </div>
                    <div className="bg-stone-50 rounded-lg p-2">
                      <div className="text-lg font-bold text-stone-800">{member.postCount}</div>
                      <div className="text-xs text-stone-400">게시글</div>
                    </div>
                    <div className="bg-stone-50 rounded-lg p-2">
                      <div className="text-xs font-bold text-stone-700 leading-tight mt-1">{member.joinDate.slice(0, 7)}</div>
                      <div className="text-xs text-stone-400">가입일</div>
                    </div>
                  </div>

                  {/* Speciality */}
                  <div className="flex items-center gap-1.5 bg-green-50 rounded-lg px-3 py-2">
                    <span className="text-green-500">🎯</span>
                    <span className="text-sm font-semibold text-green-700">{member.speciality}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* Join CTA */}
      <section className="bg-hero-gradient rounded-2xl p-10 text-white text-center mt-4">
        <div className="text-4xl mb-3">🌱</div>
        <h2 className="text-2xl font-extrabold mb-2">새싹단원으로 시작하세요</h2>
        <p className="text-green-100 text-sm mb-6 leading-relaxed">
          첫 임장부터 함께합니다. 정기 모임 참가 신청은 게시판에서 확인하세요.
        </p>
        <a
          href="/board"
          className="inline-block px-8 py-3 bg-white text-green-800 font-bold rounded-full hover:bg-green-50 transition-colors"
        >
          게시판 바로가기 →
        </a>
      </section>
    </div>
  );
}
