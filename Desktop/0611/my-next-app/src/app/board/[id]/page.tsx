import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import type { Post } from '@/data/posts';
import GradeBadge from '@/components/GradeBadge';
import type { Grade } from '@/data/members';
import PostCard from '@/components/PostCard';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPost(row: any): Post {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    author: row.author,
    authorGrade: row.author_grade,
    date: row.date,
    views: row.views,
    likes: row.likes,
    comments: row.comments,
    excerpt: row.excerpt ?? '',
    thumbnail: row.thumbnail ?? '',
    tags: row.tags ?? [],
    content: row.content ?? '',
  };
}

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params;

  const { data: row } = await supabase
    .from('posts')
    .select('*')
    .eq('id', Number(id))
    .single();

  if (!row) notFound();
  const post = mapPost(row);

  const { data: relatedRows } = await supabase
    .from('posts')
    .select('*')
    .eq('category', post.category)
    .neq('id', post.id)
    .limit(3);

  const related = (relatedRows ?? []).map(mapPost);

  const contentLines = post.content.split('\n').map((line, i) => {
    if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-stone-800 mt-6 mb-2">{line.slice(3)}</h2>;
    if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-stone-700 mt-4 mb-1">{line.slice(4)}</h3>;
    if (line.startsWith('- ')) return <li key={i} className="text-stone-600 text-sm list-disc ml-4">{line.slice(2)}</li>;
    if (line.trim() === '') return <br key={i} />;
    return <p key={i} className="text-stone-600 text-sm leading-relaxed">{line}</p>;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-stone-400 mb-6">
        <Link href="/" className="hover:text-green-600">홈</Link>
        <span>/</span>
        <Link href="/board" className="hover:text-green-600">게시판</Link>
        <span>/</span>
        <span className="text-stone-600">{post.category}</span>
      </nav>

      {/* Article header */}
      <article>
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-3 badge-${post.category}`}>
          {post.category}
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-stone-800 leading-tight mb-4">
          {post.title}
        </h1>

        {/* Author info */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-stone-100">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl">
            {post.authorGrade === '마스터임장단' ? '👑' :
             post.authorGrade === '시니어임장단' ? '🏆' :
             post.authorGrade === '정예단원' ? '⚡' : '🌱'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-800">{post.author}</span>
              <GradeBadge grade={post.authorGrade as Grade} size="sm" />
            </div>
            <div className="flex gap-3 text-xs text-stone-400 mt-0.5">
              <span>{post.date}</span>
              <span>👁 {post.views.toLocaleString()}</span>
              <span>❤️ {post.likes}</span>
              <span>💬 {post.comments}</span>
            </div>
          </div>
        </div>

        {/* Thumbnail */}
        <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-8 bg-stone-100">
          <Image src={post.thumbnail} alt={post.title} fill className="object-cover" sizes="768px" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {post.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 bg-stone-100 text-stone-500 rounded-full text-xs">
              #{tag}
            </span>
          ))}
        </div>

        {/* Content */}
        <div className="prose-sm space-y-1 mb-10">
          {contentLines}
        </div>

        {/* Like / Share */}
        <div className="flex items-center justify-center gap-4 py-6 border-t border-b border-stone-100 mb-10">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-full font-semibold transition-colors">
            ❤️ 좋아요 {post.likes}
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full font-semibold transition-colors">
            🔗 공유하기
          </button>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-4">관련 게시글</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((p) => (
                <PostCard key={p.id} post={p} size="compact" />
              ))}
            </div>
          </section>
        )}

        {/* Back */}
        <div className="mt-8 text-center">
          <Link
            href="/board"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full font-semibold transition-colors"
          >
            ← 목록으로
          </Link>
        </div>
      </article>
    </div>
  );
}
