import Link from 'next/link';
import Image from 'next/image';
import type { Post } from '@/data/posts';

interface PostCardProps {
  post: Post;
  size?: 'default' | 'compact';
}

export default function PostCard({ post, size = 'default' }: PostCardProps) {
  return (
    <Link href={`/board/${post.id}`} className="block">
      <article className="post-card bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 h-full">
        {size === 'default' && (
          <div className="relative h-44 bg-stone-100 overflow-hidden">
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold badge-${post.category}`}>
              {post.category}
            </span>
          </div>
        )}

        <div className="p-4">
          {size === 'compact' && (
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold mb-2 badge-${post.category}`}>
              {post.category}
            </span>
          )}

          <h3 className="font-bold text-stone-800 leading-snug mb-2 line-clamp-2 text-sm md:text-base">
            {post.title}
          </h3>

          {size === 'default' && (
            <p className="text-stone-500 text-sm line-clamp-2 mb-3">
              {post.excerpt}
            </p>
          )}

          {/* Author & grade */}
          <div className="flex items-center gap-1.5 mb-3">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold grade-${post.authorGrade}`}>
              {post.authorGrade === '마스터임장단' ? '👑' :
               post.authorGrade === '시니어임장단' ? '🏆' :
               post.authorGrade === '정예단원' ? '⚡' : '🌱'} {post.authorGrade}
            </span>
            <span className="text-stone-500 text-xs">{post.author}</span>
          </div>

          {/* Tags */}
          {size === 'default' && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-stone-400">
            <span>👁 {post.views.toLocaleString()}</span>
            <span>❤️ {post.likes}</span>
            <span>💬 {post.comments}</span>
            <span className="ml-auto">{post.date}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
