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
