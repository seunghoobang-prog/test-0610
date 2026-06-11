'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SangjoItem } from '@/lib/welfare';

export default function SangjoInventoryTable({ items: initial }: { items: SangjoItem[] }) {
  const [items, setItems] = useState(initial);
  const [editId, setEditId] = useState<number | null>(null);
  const [editVal, setEditVal] = useState('');
  const [saving, setSaving] = useState(false);

  async function save(id: number) {
    const qty = parseInt(editVal);
    if (isNaN(qty) || qty < 0) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('sangjo_items')
      .update({ quantity: qty, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) {
      setItems(prev => prev.map(it => it.id === id ? { ...it, quantity: qty } : it));
    }
    setEditId(null);
    setSaving(false);
  }

  const categories = [...new Set(items.map(i => i.category))];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
            <th className="text-left py-2 px-3 font-semibold" style={{ color: '#64748B' }}>품목명</th>
            <th className="text-left py-2 px-3 font-semibold" style={{ color: '#64748B' }}>분류</th>
            <th className="text-center py-2 px-3 font-semibold" style={{ color: '#64748B' }}>수량</th>
            <th className="text-left py-2 px-3 font-semibold" style={{ color: '#64748B' }}>단위</th>
            <th className="text-left py-2 px-3 font-semibold" style={{ color: '#64748B' }}>최종 수정</th>
            <th className="py-2 px-3" />
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => (
            items.filter(i => i.category === cat).map((item, idx) => (
              <tr
                key={item.id}
                style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: idx % 2 === 0 ? '#FAFAFA' : '#ffffff' }}
              >
                <td className="py-2.5 px-3 font-medium" style={{ color: '#1E293B' }}>{item.item_name}</td>
                <td className="py-2.5 px-3">
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: '#F1F5F9', color: '#64748B' }}
                  >
                    {item.category}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-center">
                  {editId === item.id ? (
                    <input
                      type="number"
                      value={editVal}
                      onChange={e => setEditVal(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && save(item.id)}
                      className="w-20 text-center border rounded px-2 py-0.5 text-sm"
                      style={{ borderColor: '#003A8C' }}
                      autoFocus
                      min={0}
                    />
                  ) : (
                    <span
                      className="font-bold text-base"
                      style={{ color: item.quantity < 10 ? '#EF4444' : item.quantity < 30 ? '#F59E0B' : '#16A34A' }}
                    >
                      {item.quantity}
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-3" style={{ color: '#94A3B8' }}>{item.unit}</td>
                <td className="py-2.5 px-3 text-xs" style={{ color: '#94A3B8' }}>
                  {new Date(item.updated_at).toLocaleDateString('ko-KR')}
                </td>
                <td className="py-2.5 px-3 text-right">
                  {editId === item.id ? (
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => save(item.id)}
                        disabled={saving}
                        className="rounded px-2 py-1 text-xs font-semibold text-white transition-colors"
                        style={{ backgroundColor: '#003A8C' }}
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="rounded px-2 py-1 text-xs font-semibold transition-colors"
                        style={{ backgroundColor: '#F1F5F9', color: '#64748B' }}
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditId(item.id); setEditVal(String(item.quantity)); }}
                      className="rounded px-2 py-1 text-xs transition-colors"
                      style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8' }}
                    >
                      수정
                    </button>
                  )}
                </td>
              </tr>
            ))
          ))}
        </tbody>
      </table>
      <p className="text-xs mt-3" style={{ color: '#94A3B8' }}>
        ※ 수량 10개 미만 <span style={{ color: '#EF4444' }}>빨간색</span> / 30개 미만 <span style={{ color: '#F59E0B' }}>주황색</span>으로 표시됩니다.
      </p>
    </div>
  );
}
