import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

type BlockResponse = {
  block_number: number;
  block_hash: string;
  pod_hash: string;
  status: string;
};

const DEFAULT_BLOCKS: BlockResponse[] = [
  { block_number: 1204817, block_hash: '00000a4f9b2e3c…7d8e12f3', pod_hash: 'a4f9b2e3c71d…0x3b21', status: 'DELIVERED' },
  { block_number: 1204816, block_hash: '00000f8c2a1b4e…9c3d05a1', pod_hash: 'f8c2a1b4e69f…0x9a04', status: 'IN_TRANSIT' },
  { block_number: 1204815, block_hash: '00000b3e7f2c9d…2a4e18b7', pod_hash: 'b3e7f2c9d48a…0x71cc', status: 'ACCEPTED' },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse<BlockResponse[] | { error: string }>) {
  const { data, error } = await supabase
    .from('blocks')
    .select('block_number,block_hash,pod_hash,status')
    .order('block_number', { ascending: false })
    .limit(4);

  if (error) {
    console.warn('Supabase blocks fetch failed:', error.message);
    return res.status(200).json(DEFAULT_BLOCKS);
  }

  return res.status(200).json((data && data.length > 0 ? data : DEFAULT_BLOCKS) as BlockResponse[]);
}
