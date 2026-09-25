import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as rewardsApi from '../api/rewards'
import type { Reward } from '../types'

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

export function useCreateReward() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Omit<Reward, 'id'>) => rewardsApi.createReward(input),
    onSuccess: (reward) => {
      queryClient.invalidateQueries({ queryKey: ['rewards', 'company', reward.companyId] })
      queryClient.invalidateQueries({ queryKey: ['rewards', 'active'] })
    },
  })
}

export function useUpdateReward(rewardId: string, companyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: rewardsApi.UpdateRewardInput) => rewardsApi.updateReward(rewardId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards', 'company', companyId] })
      queryClient.invalidateQueries({ queryKey: ['rewards', 'active'] })
    },
  })
}

export function useDeleteReward(companyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (rewardId: string) => rewardsApi.deleteReward(rewardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards', 'company', companyId] })
      queryClient.invalidateQueries({ queryKey: ['rewards', 'active'] })
    },
  })
}
