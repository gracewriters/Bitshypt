import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

type StatsResponse = {
  packages_delivered: number;
  countries_active: number;
  vlos_compliance: number;
  avg_proof_of_delivery: number;
};

const DEFAULT_STATS: StatsResponse = {
  packages_delivered: 2400000,
  countries_active: 34,
  vlos_compliance: 99.97,
  avg_proof_of_delivery: 4.2,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<StatsResponse | { error: string }>) {
  const { data, error } = await supabase
    .from('stats')
    .select('packages_delivered,countries_active,vlos_compliance,avg_proof_of_delivery')
    .single();

  if (error) {
    console.warn('Supabase stats fetch failed:', error.message);
    return res.status(200).json(DEFAULT_STATS);
  }

  if (!data) {
    return res.status(200).json(DEFAULT_STATS);
  }

  return res.status(200).json(data);
}
