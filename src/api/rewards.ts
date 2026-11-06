import { supabase } from '../lib/supabaseClient'
import { mapReward, mapRewardCategory } from './mappers'
import type { Reward, RewardCategory } from '../types'

export async function listActiveRewards(): Promise<Reward[]> {
  const { data, error } = await supabase.from('rewards').select('*').eq('status', 'approved').eq('active', true).gt('stock', 0)
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapReward)
}

/** Everything a company owns, at any moderation status — RLS scopes this to the caller's own rewards (or an admin). */
export async function listRewardsByCompany(companyId: string): Promise<Reward[]> {
  const { data, error } = await supabase.from('rewards').select('*').eq('company_id', companyId)
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapReward)
}

/** Admin moderation queue. RLS only lets a super_admin see other companies' pending rewards. */
export async function listPendingRewards(): Promise<Reward[]> {
  const { data, error } = await supabase.from('rewards').select('*').eq('status', 'pending')
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapReward)
}

export async function listRewardsByIds(ids: string[]): Promise<Reward[]> {
  if (ids.length === 0) return []
  const { data, error } = await supabase.from('rewards').select('*').in('id', ids)
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapReward)
}

export interface CreateRewardInput {
  companyId: string
  categoryId?: string
  title: string
  description: string
  costPoints: number
  imageUrl: string
  stock: number
  active: boolean
}

export async function createReward(input: CreateRewardInput): Promise<Reward> {
  const { data, error } = await supabase
    .from('rewards')
    .insert({
      company_id: input.companyId,
      category_id: input.categoryId ?? null,
      title: input.title,
      description: input.description,
      cost_points: input.costPoints,
      image_url: input.imageUrl,
      stock: input.stock,
      active: input.active,
    })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return mapReward(data)
}

export type UpdateRewardInput = Partial<Omit<Reward, 'id' | 'companyId' | 'status' | 'rejectionReason' | 'reviewedAt' | 'reviewedBy'>>

/**
 * RLS allows this for the reward's own company or a super_admin. The
 * moderation columns (status/rejectionReason/reviewed*) aren't settable
 * here on purpose — see approveReward/rejectReward, and
 * enforce_reward_review_status_trigger in schema.sql, which bounces an
 * approved reward back to 'pending' when its own company edits the content.
 */
export async function updateReward(rewardId: string, input: UpdateRewardInput): Promise<Reward> {
  const row: Record<string, unknown> = {}
  if (input.title !== undefined) row.title = input.title
  if (input.description !== undefined) row.description = input.description
  if (input.costPoints !== undefined) row.cost_points = input.costPoints
  if (input.imageUrl !== undefined) row.image_url = input.imageUrl
  if (input.stock !== undefined) row.stock = input.stock
  if (input.active !== undefined) row.active = input.active
  if (input.categoryId !== undefined) row.category_id = input.categoryId || null

  const { data, error } = await supabase.from('rewards').update(row).eq('id', rewardId).select('*').maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error("You don't have permission to edit this reward.")
  return mapReward(data)
}

export async function deleteReward(rewardId: string): Promise<void> {
  const { data, error } = await supabase.from('rewards').delete().eq('id', rewardId).select('id').maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error("You don't have permission to delete this reward.")
}

/** Admin-only RPC (enforced server-side — see schema.sql). */
export async function approveReward(rewardId: string): Promise<void> {
  const { error } = await supabase.rpc('approve_reward', { p_reward_id: rewardId })
  if (error) throw new Error(error.message)
}

/** Admin-only RPC (enforced server-side — see schema.sql). */
export async function rejectReward(rewardId: string, reason?: string): Promise<void> {
  const { error } = await supabase.rpc('reject_reward', { p_reward_id: rewardId, p_reason: reason ?? null })
  if (error) throw new Error(error.message)
}

export async function listCategoriesByCompany(companyId: string): Promise<RewardCategory[]> {
  const { data, error } = await supabase.from('reward_categories').select('*').eq('company_id', companyId).order('created_at')
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapRewardCategory)
}

export async function createCategory(companyId: string, name: string): Promise<RewardCategory> {
  const { data, error } = await supabase
    .from('reward_categories')
    .insert({ company_id: companyId, name })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return mapRewardCategory(data)
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const { error } = await supabase.from('reward_categories').delete().eq('id', categoryId)
  if (error) throw new Error(error.message)
}
