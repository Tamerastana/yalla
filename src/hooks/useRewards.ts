import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as rewardsApi from '../api/rewards'

export function useActiveRewards() {
  return useQuery({ queryKey: ['rewards', 'active'], queryFn: rewardsApi.listActiveRewards })
}

export function useCompanyRewards(companyId: string | undefined) {
  return useQuery({
    queryKey: ['rewards', 'company', companyId],
    queryFn: () => rewardsApi.listRewardsByCompany(companyId as string),
    enabled: !!companyId,
  })
}

export function usePendingRewards() {
  return useQuery({ queryKey: ['rewards', 'pending'], queryFn: rewardsApi.listPendingRewards })
}

export function useRewardsByIds(ids: string[]) {
  const key = [...ids].sort().join(',')
  return useQuery({
    queryKey: ['rewards', 'byIds', key],
    queryFn: () => rewardsApi.listRewardsByIds(ids),
    enabled: ids.length > 0,
  })
}

function invalidateRewardQueries(queryClient: ReturnType<typeof useQueryClient>, companyId: string) {
  queryClient.invalidateQueries({ queryKey: ['rewards', 'company', companyId] })
  queryClient.invalidateQueries({ queryKey: ['rewards', 'active'] })
  queryClient.invalidateQueries({ queryKey: ['rewards', 'pending'] })
}

export function useCreateReward() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: rewardsApi.CreateRewardInput) => rewardsApi.createReward(input),
    onSuccess: (reward) => invalidateRewardQueries(queryClient, reward.companyId),
  })
}

export function useUpdateReward(rewardId: string, companyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: rewardsApi.UpdateRewardInput) => rewardsApi.updateReward(rewardId, input),
    onSuccess: () => invalidateRewardQueries(queryClient, companyId),
  })
}

export function useDeleteReward(companyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (rewardId: string) => rewardsApi.deleteReward(rewardId),
    onSuccess: () => invalidateRewardQueries(queryClient, companyId),
  })
}

export function useApproveReward() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (rewardId: string) => rewardsApi.approveReward(rewardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] })
    },
  })
}

export function useRejectReward() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ rewardId, reason }: { rewardId: string; reason?: string }) => rewardsApi.rejectReward(rewardId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] })
    },
  })
}

export function useRewardCategories(companyId: string | undefined) {
  return useQuery({
    queryKey: ['rewardCategories', companyId],
    queryFn: () => rewardsApi.listCategoriesByCompany(companyId as string),
    enabled: !!companyId,
  })
}

export function useCreateCategory(companyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => rewardsApi.createCategory(companyId, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rewardCategories', companyId] }),
  })
}

export function useDeleteCategory(companyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (categoryId: string) => rewardsApi.deleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewardCategories', companyId] })
      invalidateRewardQueries(queryClient, companyId)
    },
  })
}
