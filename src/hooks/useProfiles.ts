import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as profilesApi from '../api/profiles'
import type { Emirate, GeoPoint } from '../types'

export function useProfile(id: string | undefined) {
  return useQuery({
    queryKey: ['profiles', id],
    queryFn: () => profilesApi.getUser(id as string),
    enabled: !!id,
  })
}

export function useUsersByIds(ids: string[]) {
  const key = [...ids].sort().join(',')
  return useQuery({
    queryKey: ['profiles', 'byIds', key],
    queryFn: () => profilesApi.listUsersByIds(ids),
    enabled: ids.length > 0,
  })
}

export function useSearchProfiles(query: string, excludeId: string | undefined) {
  return useQuery({
    queryKey: ['profiles', 'search', query, excludeId],
    queryFn: () => profilesApi.searchProfiles(query, excludeId),
    enabled: query.trim().length > 0,
  })
}

export function useCompanies() {
  return useQuery({ queryKey: ['profiles', 'companies'], queryFn: profilesApi.listCompanies })
}

export function usePlayers() {
  return useQuery({ queryKey: ['profiles', 'players'], queryFn: profilesApi.listPlayers })
}

export function useUpdateProfile(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patch: Partial<{ name: string; bio: string; city: Emirate; home: GeoPoint; avatarUrl: string }>) =>
      profilesApi.updateProfile(userId as string, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profiles', userId] }),
  })
}

export function useVerifyCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (companyId: string) => profilesApi.verifyCompany(companyId),
    onSuccess: (_data, companyId) => {
      queryClient.invalidateQueries({ queryKey: ['profiles', 'companies'] })
      queryClient.invalidateQueries({ queryKey: ['profiles', companyId] })
    },
  })
}

export function useSetCompanyActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ companyId, active }: { companyId: string; active: boolean }) =>
      profilesApi.setCompanyActive(companyId, active),
    onSuccess: (_data, { companyId }) => {
      queryClient.invalidateQueries({ queryKey: ['profiles', 'companies'] })
      queryClient.invalidateQueries({ queryKey: ['profiles', companyId] })
    },
  })
}
