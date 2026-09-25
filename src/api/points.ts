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

/**
 * Fulfils a reward at the point of pickup — only the company that issued
 * the code can call this, and only once (see redeem_code() in schema.sql).
 * This is the actual hand-over verification: a code means nothing until a
 * staff member looks it up here and it flips to 'used'.
 */
export async function fulfillRedemptionCode(code: string): Promise<{
  id: string
  userId: string
  rewardId: string
  pointsSpent: number
}> {
  const { data, error } = await supabase.rpc('redeem_code', { p_code: code }).single()
  if (error) throw new Error(error.message)
  const row = data as { id: string; user_id: string; reward_id: string; points_spent: number }
  return { id: row.id, userId: row.user_id, rewardId: row.reward_id, pointsSpent: row.points_spent }
}
