'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { categoryColors, type HotspotCategory, type Hotspot } from '@/data/hotspots';
import { supabase } from '@/lib/supabase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapHotspot(row: any): Hotspot {
  return {
    id: row.id,
    name: row.name,
    nameKo: row.name_ko,
    category: row.category,
    lat: row.lat,
    lng: row.lng,
    description: row.description ?? '',
    tip: row.tip ?? '',
    rating: row.rating ?? 0,
    priceRange: row.price_range ?? '',
  };
}

const HotspotMapClient = dynamic(() => import('@/components/HotspotMapClient'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-stone-100 rounded-2xl">
      <div className="text-center text-stone-400">
        <div className="text-4xl mb-2">🗺️</div>
        <p>지도를 불러오는 중...</p>
      </div>
    </div>
  ),
});

const CATEGORIES: Array<HotspotCategory | '전체'> = [
  '전체', '부동산', '맛집', '카페', '관광지', '쇼핑', '숙소',
];

const categoryEmoji: Record<string, string> = {
  전체: '🔍',
  부동산: '🏠',
  맛집: '🍜',
  카페: '☕',
  관광지: '📸',
  쇼핑: '🛍️',
  숙소: '🏨',
};

export default function MapPage() {
  const [selectedCategory, setSelectedCategory] = useState<HotspotCategory | '전체'>('전체');
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);

  useEffect(() => {
    supabase
      .from('hotspots')
      .select('*')
      .then(({ data }) => {
        if (data) setHotspots(data.map(mapHotspot));
      });
  }, []);

  const counts = CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = cat === '전체'
      ? hotspots.length
      : hotspots.filter((h) => h.category === cat).length;
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-stone-800 mb-1">🗺️ 하노이 핫플 지도</h1>
        <p className="text-stone-500">
          임장단이 직접 방문하고 검증한 하노이 핵심 스팟 {hotspots.length > 0 ? `${hotspots.length}곳` : '로딩 중...'}
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
              selectedCategory === cat
                ? 'text-white shadow-sm'
                : 'bg-white text-stone-500 border border-stone-200 hover:border-stone-300'
            }`}
            style={
              selectedCategory === cat
                ? { backgroundColor: cat === '전체' ? '#16a34a' : categoryColors[cat as HotspotCategory] }
                : {}
            }
          >
            {categoryEmoji[cat]} {cat}
            <span className="opacity-70 text-xs">({counts[cat]})</span>
          </button>
        ))}
      </div>

      {/* Map */}
      <HotspotMapClient hotspots={hotspots} selectedCategory={selectedCategory} />

      {/* Info cards below map */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-stone-800 mb-4">전체 스팟 목록</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hotspots
            .filter((h) => selectedCategory === '전체' || h.category === selectedCategory)
            .map((spot) => (
              <div key={spot.id} className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: categoryColors[spot.category] }}
                  >
                    {spot.id}
                  </span>
                  <div>
                    <div className="font-bold text-stone-800 text-sm">{spot.nameKo}</div>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: categoryColors[spot.category] }}
                    >
                      {spot.category}
                    </span>
                  </div>
                  <div className="ml-auto text-sm">{'⭐'.repeat(spot.rating)}</div>
                </div>
                <p className="text-xs text-stone-500 mb-2">{spot.description}</p>
                <div className="bg-green-50 rounded-lg p-2">
                  <p className="text-xs text-green-700">
                    <span className="font-semibold">💡 임장 팁:</span> {spot.tip}
                  </p>
                </div>
                <div className="mt-2 text-xs text-stone-400 font-medium">{spot.priceRange}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
