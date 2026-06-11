'use client';

import { useState, useEffect } from 'react';
import PostCard from '@/components/PostCard';
import type { Post, PostCategory } from '@/data/posts';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { supabase } from '@/lib/supabase';

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

function BoardContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') as PostCategory | null;
  const [activeCategory, setActiveCategory] = useState<'전체' | PostCategory>(
    initialCategory ?? '전체'
  );
  const [sortBy, setSortBy] = useState<'최신' | '인기' | '조회수'>('최신');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('posts')
      .select('*')
      .then(({ data }) => {
        if (data) setPosts(data.map(mapPost));
        setLoading(false);
      });
  }, []);

  const filtered = posts.filter((p) =>
    activeCategory === '전체' ? true : p.category === activeCategory
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === '인기') return b.likes - a.likes;
    if (sortBy === '조회수') return b.views - a.views;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const categoryCounts = {
    전체: posts.length,
    임장기: posts.filter((p) => p.category === '임장기').length,
    여행기: posts.filter((p) => p.category === '여행기').length,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-stone-800 mb-1">게시판</h1>
        <p className="text-stone-500">단원들의 생생한 임장기와 여행기를 공유합니다</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* Category tabs */}
        <div className="flex gap-2">
          {(['전체', '임장기', '여행기'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeCategory === cat
                  ? cat === '임장기'
                    ? 'bg-orange-100 text-orange-700 border border-orange-300'
                    : cat === '여행기'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-green-600 text-white'
                  : 'bg-white text-stone-500 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {cat}
              <span className="ml-1.5 text-xs opacity-70">
                ({categoryCounts[cat]})
              </span>
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-500">정렬:</span>
          {(['최신', '인기', '조회수'] as const).map((sort) => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                sortBy === sort
                  ? 'bg-stone-800 text-white'
                  : 'text-stone-500 hover:bg-stone-100'
              }`}
            >
              {sort}
            </button>
          ))}
        </div>
      </div>

      {/* Post grid */}
      {loading ? (
        <div className="text-center py-20 text-stone-400">
          <div className="text-5xl mb-3">⏳</div>
          <p>게시글을 불러오는 중...</p>
        </div>
      ) : sorted.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sorted.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-stone-400">
          <div className="text-5xl mb-3">📭</div>
          <p>게시글이 없습니다.</p>
        </div>
      )}

      {/* Stats bar */}
      <div className="mt-10 flex justify-center gap-8 text-sm text-stone-400">
        <span>총 {sorted.length}개 게시글</span>
        <span>·</span>
        <span>임장기 {categoryCounts.임장기}개</span>
        <span>·</span>
        <span>여행기 {categoryCounts.여행기}개</span>
      </div>
    </div>
  );
}

export default function BoardPage() {
  return (
    <Suspense>
      <BoardContent />
    </Suspense>
  );
}
