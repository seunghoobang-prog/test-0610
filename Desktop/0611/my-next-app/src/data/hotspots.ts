export type HotspotCategory = '부동산' | '맛집' | '카페' | '관광지' | '쇼핑' | '숙소';

export interface Hotspot {
  id: number;
  name: string;
  nameKo: string;
  category: HotspotCategory;
  lat: number;
  lng: number;
  description: string;
  tip: string;
  rating: number;
  priceRange: string;
}

export const hotspots: Hotspot[] = [
  {
    id: 1, name: 'Hoan Kiem Lake', nameKo: '호안끼엠 호수', category: '관광지',
    lat: 21.0285, lng: 105.8542,
    description: '하노이의 상징적인 호수. 주변에 카페와 레스토랑이 즐비합니다.',
    tip: '주말 저녁에는 보행자 전용도로로 야시장이 열립니다.', rating: 5, priceRange: '무료',
  },
  {
    id: 2, name: 'Tay Ho', nameKo: '떠이호 (서호)', category: '부동산',
    lat: 21.0535, lng: 105.8198,
    description: '외국인 선호 거주지. 고급 콘도와 빌라가 밀집해 있습니다.',
    tip: '임대수익률 4~6% 예상. 한국 교민 커뮤니티 활성화 지역.', rating: 5, priceRange: '$1,500~3,000/월',
  },
  {
    id: 3, name: 'Bun Cha Huong Lien', nameKo: '분짜 흐엉리엔', category: '맛집',
    lat: 21.0227, lng: 105.8447,
    description: '오바마 전 대통령이 방문해 유명해진 분짜 맛집.',
    tip: '점심시간에 줄이 깁니다. 11시 30분 이전 방문 추천.', rating: 5, priceRange: '₩8,000~12,000',
  },
  {
    id: 4, name: 'My Dinh', nameKo: '미딘 신도시', category: '부동산',
    lat: 21.0222, lng: 105.7788,
    description: '한국 교민 최다 거주 지역. 한국 식당, 마트, 학원 밀집.',
    tip: '임대 수요 안정적. 한국 세입자 구하기 용이.', rating: 4, priceRange: '$800~1,500/월',
  },
  {
    id: 5, name: 'Cafe Giang', nameKo: '카페 지앙 (에그커피)', category: '카페',
    lat: 21.0340, lng: 105.8510,
    description: '하노이 명물 에그 커피의 원조. 좁은 골목 안 아늑한 카페.',
    tip: '뜨거운 에그 커피를 꼭 드셔보세요. 인스타 필수 코스.', rating: 5, priceRange: '₩4,000~7,000',
  },
  {
    id: 6, name: 'Vinhomes Metropolis', nameKo: '빈홈즈 메트로폴리스', category: '부동산',
    lat: 21.0356, lng: 105.8178,
    description: '하노이 최고급 주거 단지. 빈그룹 프리미엄 브랜드.',
    tip: '2베드룸 $180,000~250,000 수준. 임대수익률 4~5%.', rating: 5, priceRange: '$150,000~300,000',
  },
  {
    id: 7, name: 'Dong Xuan Market', nameKo: '동쑤언 시장', category: '쇼핑',
    lat: 21.0387, lng: 105.8498,
    description: '하노이 최대 재래시장. 의류, 식품, 생활용품 총집결.',
    tip: '가격 흥정 필수. 도매가로 구매하면 매우 저렴합니다.', rating: 4, priceRange: '다양',
  },
  {
    id: 8, name: 'Sofitel Legend Metropole', nameKo: '소피텔 레전드 메트로폴', category: '숙소',
    lat: 21.0268, lng: 105.8566,
    description: '하노이 최고급 식민지풍 호텔. 역사와 럭셔리의 조화.',
    tip: '비싸지만 특별한 경험 원한다면 강력 추천.', rating: 5, priceRange: '$200~500/박',
  },
  {
    id: 9, name: 'Pho Thin', nameKo: '퍼 띤 (쌀국수)', category: '맛집',
    lat: 21.0312, lng: 105.8454,
    description: '하노이 현지인이 인정하는 쌀국수 맛집. 진한 육수가 일품.',
    tip: '아침 6시~12시만 영업. 일찍 방문해야 맛볼 수 있습니다.', rating: 5, priceRange: '₩5,000~8,000',
  },
  {
    id: 10, name: 'Long Bien Bridge', nameKo: '롱비엔 다리', category: '관광지',
    lat: 21.0451, lng: 105.8614,
    description: '프랑스 식민지 시대에 건설된 철교. 일출 명소.',
    tip: '새벽 5~6시 방문 시 홍강의 환상적인 안개를 볼 수 있습니다.', rating: 4, priceRange: '무료',
  },
  {
    id: 11, name: 'Old Quarter 36 Streets', nameKo: '구시가지 36거리', category: '관광지',
    lat: 21.0355, lng: 105.8498,
    description: '하노이 구시가지의 전통 상점 거리. 400년 역사를 자랑합니다.',
    tip: '각 거리마다 특정 상품 전문점이 모여있습니다. 걷기 여행 추천.', rating: 5, priceRange: '무료',
  },
  {
    id: 12, name: 'Cong Caphe', nameKo: '콩 카페', category: '카페',
    lat: 21.0285, lng: 105.8526,
    description: '베트남 군복 컨셉의 개성있는 카페 체인. 코코넛 커피가 유명.',
    tip: '코코넛 스무디 커피(Cà Phê Cốt Dừa)를 꼭 주문하세요.', rating: 4, priceRange: '₩5,000~9,000',
  },
];

export const categoryColors: Record<HotspotCategory, string> = {
  '부동산': '#16a34a',
  '맛집': '#dc2626',
  '카페': '#d97706',
  '관광지': '#2563eb',
  '쇼핑': '#9333ea',
  '숙소': '#0891b2',
};
