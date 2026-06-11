export type Grade = '새싹단원' | '정예단원' | '시니어임장단' | '마스터임장단';

export interface Member {
  id: number;
  name: string;
  grade: Grade;
  joinDate: string;
  visitCount: number;
  postCount: number;
  bio: string;
  speciality: string;
  job: string;
}

export interface GradeInfo {
  minVisits: number;
  maxVisits: number;
  colorClass: string;
  bgClass: string;
  emoji: string;
  description: string;
  perks: string[];
}

export const gradeInfo: Record<Grade, GradeInfo> = {
  '새싹단원': {
    minVisits: 1, maxVisits: 3,
    colorClass: 'text-green-700', bgClass: 'bg-green-100',
    emoji: '🌱',
    description: '첫 임장을 시작한 초보 단원',
    perks: ['정기 모임 참가 가능', '임장 기초 자료 제공', '단체 오픈 채팅 입장'],
  },
  '정예단원': {
    minVisits: 4, maxVisits: 9,
    colorClass: 'text-blue-700', bgClass: 'bg-blue-100',
    emoji: '⚡',
    description: '임장 경험이 쌓인 활동 단원',
    perks: ['새싹단원 혜택 포함', '현지 중개사 연결 서비스', '임장 보고서 공유', '소그룹 스터디 참가'],
  },
  '시니어임장단': {
    minVisits: 10, maxVisits: 19,
    colorClass: 'text-purple-700', bgClass: 'bg-purple-100',
    emoji: '🏆',
    description: '베트남 부동산 전문가급 단원',
    perks: ['정예단원 혜택 포함', '현지 세무사/법무사 연결', 'VIP 임장 투어 우선 신청', '멘토링 프로그램'],
  },
  '마스터임장단': {
    minVisits: 20, maxVisits: 9999,
    colorClass: 'text-yellow-700', bgClass: 'bg-yellow-100',
    emoji: '👑',
    description: '임장단 최고 등급 전문가',
    perks: ['전 혜택 포함', '단장단 회의 참가 권한', '신규 단원 멘토 배정', '연간 하노이 투자 리포트 제공', '현지 투자 자문 서비스'],
  },
};

export const members: Member[] = [
  {
    id: 1, name: '최단장', grade: '마스터임장단',
    joinDate: '2023-01-15', visitCount: 28, postCount: 89,
    bio: '하노이 부동산 투자 7년차. 현지 중개 네트워크 다수 보유.',
    speciality: '떠이호 지역 전문', job: '금융투자업',
  },
  {
    id: 2, name: '박투자', grade: '마스터임장단',
    joinDate: '2023-03-22', visitCount: 22, postCount: 67,
    bio: '금융권 종사. 수익률 분석과 엑셀 모델링이 특기.',
    speciality: '수익률 정량 분석', job: '증권사 PB',
  },
  {
    id: 3, name: '김하노이', grade: '시니어임장단',
    joinDate: '2023-07-10', visitCount: 15, postCount: 43,
    bio: '현지 베트남어 가능. 법률 이슈 파악과 계약 검토 강점.',
    speciality: '법률 & 계약', job: '법무팀 직장인',
  },
  {
    id: 4, name: '이여행', grade: '정예단원',
    joinDate: '2024-01-05', visitCount: 7, postCount: 28,
    bio: '여행 + 투자 겸업. 맛집 & 카페 정보 최다 보유. 라이프스타일 이민 준비 중.',
    speciality: '라이프스타일 임장', job: 'IT 기획자',
  },
  {
    id: 5, name: '장서울', grade: '정예단원',
    joinDate: '2024-04-15', visitCount: 5, postCount: 19,
    bio: 'IT 스타트업 종사. 디지털 노마드 베이스캠프로 하노이 검토 중.',
    speciality: '미딘 지역 전문', job: '스타트업 개발자',
  },
  {
    id: 6, name: '정카페', grade: '새싹단원',
    joinDate: '2025-08-20', visitCount: 2, postCount: 12,
    bio: '카페 창업 준비 중. 하노이 상권과 임대 시장 조사에 관심.',
    speciality: '상권 분석', job: '마케터',
  },
  {
    id: 7, name: '오부동', grade: '시니어임장단',
    joinDate: '2023-09-01', visitCount: 13, postCount: 35,
    bio: '국내 부동산 10년차 후 해외 시장으로 확장. 빈홈즈 시리즈 전문.',
    speciality: '빈그룹 단지 분석', job: '공인중개사',
  },
  {
    id: 8, name: '한투어', grade: '정예단원',
    joinDate: '2024-07-20', visitCount: 6, postCount: 22,
    bio: '여행사 근무 경험으로 현지 이동 루트 & 숙소 정보 풍부.',
    speciality: '여행 + 임장 루트', job: '여행사 직원',
  },
];
