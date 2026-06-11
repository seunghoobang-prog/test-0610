import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      members: {
        Row: {
          id: number;
          name: string;
          grade: '새싹단원' | '정예단원' | '시니어임장단' | '마스터임장단';
          join_date: string;
          visit_count: number;
          post_count: number;
          bio: string | null;
          speciality: string | null;
          job: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['members']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['members']['Insert']>;
      };
      posts: {
        Row: {
          id: number;
          title: string;
          category: '임장기' | '여행기';
          author: string;
          author_grade: string;
          date: string;
          views: number;
          likes: number;
          comments: number;
          excerpt: string | null;
          thumbnail: string | null;
          tags: string[];
          content: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['posts']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['posts']['Insert']>;
      };
      hotspots: {
        Row: {
          id: number;
          name: string;
          name_ko: string;
          category: '부동산' | '맛집' | '카페' | '관광지' | '쇼핑' | '숙소';
          lat: number;
          lng: number;
          description: string | null;
          tip: string | null;
          rating: number | null;
          price_range: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['hotspots']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['hotspots']['Insert']>;
      };
    };
  };
};
