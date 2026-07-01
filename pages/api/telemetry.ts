import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

type TelemetryResponse = {
  alt: number;
  speed: number;
  battery: number;
  vlos: string;
  hash: string;
};

const DEFAULT_TELEMETRY: TelemetryResponse = {
  alt: 118,
  speed: 24.3,
  battery: 78,
  vlos: 'OK',
  hash: '0xa4f9…3b21',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<TelemetryResponse | { error: string }>) {
  const { data, error } = await supabase
    .from('telemetry')
    .select('alt,speed,battery,vlos,hash')
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.warn('Supabase telemetry fetch failed:', error.message);
    return res.status(200).json(DEFAULT_TELEMETRY);
  }

  if (!data) {
    return res.status(200).json(DEFAULT_TELEMETRY);
  }

  return res.status(200).json(data);
}
