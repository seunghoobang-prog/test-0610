import { createClient } from '@/lib/supabase/server';

export type WelfareRegion = { id: number; name: string; province: string };

export type SangjoItem = {
  id: number;
  item_name: string;
  category: string;
  quantity: number;
  unit: string;
  updated_at: string;
};

export type SangjoMonthUsage = { month: number; usage_count: number };

export type SangjoEmployeeQuota = {
  id: number;
  used_count: number;
  total_quota: number;
  year: number;
  welfare_employees: {
    name: string;
    employee_number: string;
    welfare_teams: {
      name: string;
      welfare_regions: { name: string };
    } | null;
  } | null;
};

export type HousingLoan = {
  id: number;
  loan_amount: number;
  limit_amount: number;
  status: string;
  approved_at: string;
  welfare_employees: {
    name: string;
    employee_number: string;
    welfare_teams: {
      name: string;
      welfare_regions: { name: string };
    } | null;
  } | null;
};

export type HousingWaitlist = {
  id: number;
  requested_amount: number;
  priority: number;
  applied_at: string;
  welfare_employees: {
    name: string;
    employee_number: string;
    welfare_teams: {
      name: string;
      welfare_regions: { name: string };
    } | null;
  } | null;
};

export type UniformType = {
  id: number;
  name: string;
  season: string;
  image_url: string | null;
  description: string;
  composition: string[];
  updated_at: string | null;
};

export type UniformDistributionPlan = {
  id: number;
  year: number;
  season: string;
  planned_date: string;
  status: string;
  welfare_regions: { name: string } | null;
};

export type UniformApplication = {
  id: number;
  year: number;
  season: string;
  status: string;
  size: string;
  applied_at: string;
  welfare_employees: {
    name: string;
    welfare_teams: {
      name: string;
      welfare_regions: { name: string };
    } | null;
  } | null;
  uniform_types: { name: string } | null;
};

export async function getRegions(): Promise<WelfareRegion[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('welfare_regions')
    .select('*')
    .order('id');
  return data ?? [];
}

export async function getSangjoItems(): Promise<SangjoItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('sangjo_items')
    .select('*')
    .order('category')
    .order('item_name');
  return data ?? [];
}

export async function getSangjoUsage(year: number, regionId?: number): Promise<SangjoMonthUsage[]> {
  const supabase = await createClient();
  let query = supabase.from('sangjo_usage').select('month, usage_count').eq('year', year);
  if (regionId) query = query.eq('region_id', regionId);
  const { data } = await query.order('month');

  const monthMap = new Map<number, number>();
  for (let m = 1; m <= 12; m++) monthMap.set(m, 0);
  (data ?? []).forEach(row => {
    monthMap.set(row.month, (monthMap.get(row.month) ?? 0) + row.usage_count);
  });
  return Array.from(monthMap.entries()).map(([month, usage_count]) => ({ month, usage_count }));
}

export async function getSangjoEmployeeQuota(year: number): Promise<SangjoEmployeeQuota[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('sangjo_employee_quota')
    .select(`
      id, used_count, total_quota, year,
      welfare_employees (
        name, employee_number,
        welfare_teams (
          name,
          welfare_regions (name)
        )
      )
    `)
    .eq('year', year)
    .order('id');
  return (data ?? []) as unknown as SangjoEmployeeQuota[];
}

export async function getHousingLoans(): Promise<HousingLoan[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('housing_loans')
    .select(`
      id, loan_amount, limit_amount, status, approved_at,
      welfare_employees (
        name, employee_number,
        welfare_teams (
          name,
          welfare_regions (name)
        )
      )
    `)
    .eq('status', 'active')
    .order('approved_at');
  return (data ?? []) as unknown as HousingLoan[];
}

export async function getHousingWaitlist(): Promise<HousingWaitlist[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('housing_waitlist')
    .select(`
      id, requested_amount, priority, applied_at,
      welfare_employees (
        name, employee_number,
        welfare_teams (
          name,
          welfare_regions (name)
        )
      )
    `)
    .order('priority');
  return (data ?? []) as unknown as HousingWaitlist[];
}

export async function getUniformTypes(): Promise<UniformType[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('uniform_types').select('*').order('id');
  return (data ?? []) as UniformType[];
}

export async function getUniformDistributionPlan(year: number): Promise<UniformDistributionPlan[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('uniform_distribution_plan')
    .select(`id, year, season, planned_date, status, welfare_regions (name)`)
    .eq('year', year)
    .order('planned_date');
  return (data ?? []) as unknown as UniformDistributionPlan[];
}

export async function getUniformApplications(year: number, season?: string): Promise<UniformApplication[]> {
  const supabase = await createClient();
  let query = supabase
    .from('uniform_applications')
    .select(`
      id, year, season, status, size, applied_at,
      welfare_employees (
        name,
        welfare_teams (
          name,
          welfare_regions (name)
        )
      ),
      uniform_types (name)
    `)
    .eq('year', year);
  if (season) query = query.eq('season', season);
  const { data } = await query.order('applied_at');
  return (data ?? []) as unknown as UniformApplication[];
}

export async function getRegionDashboard(regionName: string) {
  try {
    const supabase = await createClient();

    const { data: region, error: regionError } = await supabase
      .from('welfare_regions')
      .select('id, name, province')
      .eq('name', regionName)
      .maybeSingle();

    if (regionError || !region) return null;

    const { data: teams } = await supabase
      .from('welfare_teams')
      .select('id, name')
      .eq('region_id', region.id);

    const teamIds = (teams ?? []).map(t => t.id);

    // Pre-compute employee IDs to avoid await-inside-Promise.all
    let employeeIds: number[] = [];
    if (teamIds.length > 0) {
      const { data: empData } = await supabase
        .from('welfare_employees')
        .select('id')
        .in('team_id', teamIds);
      employeeIds = (empData ?? []).map(e => e.id);
    }

    const thisYear = new Date().getFullYear();

    const [
      { count: employeeCount },
      { data: loanRows },
      { count: waitlistCount },
      { data: usageRows },
      { data: quotaRows },
      { data: appRows },
    ] = await Promise.all([
      teamIds.length > 0
        ? supabase.from('welfare_employees').select('id', { count: 'exact', head: true }).in('team_id', teamIds)
        : Promise.resolve({ count: 0, data: null, error: null }),
      employeeIds.length > 0
        ? supabase.from('housing_loans').select('loan_amount, limit_amount').in('employee_id', employeeIds)
        : Promise.resolve({ data: [], error: null }),
      supabase.from('housing_waitlist').select('id', { count: 'exact', head: true }),
      supabase.from('sangjo_usage').select('usage_count').eq('year', thisYear).eq('region_id', region.id),
      supabase.from('sangjo_employee_quota').select('total_quota, used_count').eq('year', thisYear),
      supabase.from('uniform_applications').select('status').eq('year', thisYear).eq('season', 'summer'),
    ]);

    const totalLoan = (loanRows ?? []).reduce((s, l) => s + Number(l.loan_amount), 0);
    const totalLimit = (loanRows ?? []).reduce((s, l) => s + Number(l.limit_amount), 0);
    const annualSangjo = (usageRows ?? []).reduce((s, u) => s + u.usage_count, 0);
    const usedQuota = (quotaRows ?? []).reduce((s, q) => s + q.used_count, 0);
    const totalQuota = (quotaRows ?? []).reduce((s, q) => s + q.total_quota, 0);
    const uniformPending = (appRows ?? []).filter(a => a.status === 'pending').length;
    const uniformDelivered = (appRows ?? []).filter(a => a.status === 'delivered').length;

    return {
      region,
      teams: teams ?? [],
      employeeCount: employeeCount ?? 0,
      totalLoan,
      totalLimit,
      waitlistCount: waitlistCount ?? 0,
      annualSangjo,
      usedQuota,
      totalQuota,
      uniformPending,
      uniformDelivered,
    };
  } catch {
    return null;
  }
}
