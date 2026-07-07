import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

type SampleRow = {
  id: number;
  name: string;
  value: string;
};

const DEFAULT_SAMPLE_DATA: SampleRow[] = [
  { id: 1, name: 'Rooftop MkII', value: 'Premium urban drone landing pad' },
  { id: 2, name: 'BalconyClip Pro', value: 'Compact balcony mount for micro-drones' },
  { id: 3, name: 'Ground Shield X1', value: 'Weatherproof ground landing pad' },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse<SampleRow[] | { error: string }>) {
  const { data, error } = await supabase
    .from('sample_data')
    .select('id,name,value')
    .order('id', { ascending: true });

  if (error) {
    console.error('Supabase sample_data fetch failed:', error.message, error.code, error.details);
    return res.status(200).json(DEFAULT_SAMPLE_DATA);
  }

  return res.status(200).json((data && data.length > 0 ? data : DEFAULT_SAMPLE_DATA) as SampleRow[]);
}
