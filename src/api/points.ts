import { supabase } from '../lib/supabaseClient'
import { mapPointsEntry, mapRedemption } from './mappers'
import type { PointsEntry, Redemption } from '../types'

export async function listPointsForUser(userId: string): Promise<PointsEntry[]> {
  const { data, error } = await supabase
    .from('points_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapPointsEntry)
}

export async function listRedemptionsForUser(userId: string): Promise<Redemption[]> {
  const { data, error } = await supabase
    .from('redemptions')
    .select('*')
    .eq('user_id', userId)
    .order('redeemed_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapRedemption)
}

export async function redeemReward(rewardId: string): Promise<{ redemptionId: string; code: string }> {
  const { data, error } = await supabase.rpc('redeem_reward', { p_reward_id: rewardId }).single()
  if (error) throw new Error(error.message)
  const row = data as { redemption_id: string; code: string }
  return { redemptionId: row.redemption_id, code: row.code }
}
