import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

type TelemetryResponse = {
  alt: number;
  speed: number;
  battery: number;
  vlos: string;
  zk_proof?: string;
};

const DEFAULT_TELEMETRY: TelemetryResponse = {
  alt: 118,
  speed: 24.3,
  battery: 78,
  vlos: 'OK',
  zk_proof: '0xa4f9…3b21',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<TelemetryResponse | { error: string }>) {
  // Try new column `zk_proof` first; if it doesn't exist, fall back to legacy
  // `pod_hash` or `hash` and map to `zk_proof`.
  const { data, error } = await supabase
    .from('telemetry')
    .select('alt,speed,battery,vlos,zk_proof')
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Supabase telemetry fetch failed:', error.message, error.code, error.details);
    try {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('telemetry')
        .select('alt,speed,battery,vlos,pod_hash,hash')
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();

      if (fallbackError) {
        console.error('Supabase telemetry fallback fetch failed:', fallbackError.message, fallbackError.code, fallbackError.details);
        return res.status(200).json(DEFAULT_TELEMETRY);
      }

      if (!fallbackData) return res.status(200).json(DEFAULT_TELEMETRY);

      const mapped = {
        alt: fallbackData.alt,
        speed: fallbackData.speed,
        battery: fallbackData.battery,
        vlos: fallbackData.vlos,
        zk_proof: (fallbackData as any).zk_proof || (fallbackData as any).pod_hash || (fallbackData as any).hash || undefined,
      } as TelemetryResponse;

      return res.status(200).json(mapped);
    } catch (e) {
      return res.status(200).json(DEFAULT_TELEMETRY);
    }
  }

  if (!data) {
    return res.status(200).json(DEFAULT_TELEMETRY);
  }

  return res.status(200).json(data);
}
