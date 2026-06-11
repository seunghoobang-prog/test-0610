import type { Grade } from '@/data/members';

interface GradeBadgeProps {
  grade: Grade;
  size?: 'sm' | 'md' | 'lg';
}

const gradeEmoji: Record<Grade, string> = {
  '새싹단원': '🌱',
  '정예단원': '⚡',
  '시니어임장단': '🏆',
  '마스터임장단': '👑',
};

export default function GradeBadge({ grade, size = 'md' }: GradeBadgeProps) {
  const sizeClass = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  }[size];

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold grade-${grade} ${sizeClass}`}>
      {gradeEmoji[grade]} {grade}
    </span>
  );
}
