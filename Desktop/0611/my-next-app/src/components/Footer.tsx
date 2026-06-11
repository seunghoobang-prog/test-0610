import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🗺️</span>
              <span className="text-white font-bold text-lg">하노이 임장단</span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              하노이를 투자의 눈으로 여행한다.<br />
              서울 직장인 2030을 위한 베트남 하노이<br />
              여행 & 부동산 임장 커뮤니티
            </p>
            <div className="flex gap-3 mt-4">
              <span className="px-3 py-1 bg-stone-700 rounded-full text-xs text-stone-300">🇻🇳 하노이</span>
              <span className="px-3 py-1 bg-stone-700 rounded-full text-xs text-stone-300">📍 서울 2030</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-3">바로가기</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/board?category=임장기" className="hover:text-green-400 transition-colors">임장기 게시판</Link></li>
              <li><Link href="/board?category=여행기" className="hover:text-green-400 transition-colors">여행기 게시판</Link></li>
              <li><Link href="/map" className="hover:text-green-400 transition-colors">하노이 핫플 지도</Link></li>
              <li><Link href="/members" className="hover:text-green-400 transition-colors">멤버 등급 안내</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-white font-semibold mb-3">임장단 정보</h3>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>📅 정기 모임: 매월 마지막 주 토요일</li>
              <li>✈️ 정기 임장: 연 4회 (분기별)</li>
              <li>💬 오픈 채팅: 카카오톡 운영</li>
              <li>📍 서울 강남구 중심 활동</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-700 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-stone-500">
          <p>© 2026 하노이 임장단. 커뮤니티 정보는 투자 권유가 아닙니다.</p>
          <p>Made with ❤️ for 서울 직장인 2030</p>
        </div>
      </div>
    </footer>
  );
}
