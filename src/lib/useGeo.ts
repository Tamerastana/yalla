import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_LOCATION } from './geo'
import type { GeoPoint } from '../types'

export type GeoStatus = 'idle' | 'locating' | 'granted' | 'denied' | 'unsupported'

export function useGeo() {
  const [point, setPoint] = useState<GeoPoint>(DEFAULT_LOCATION)
  const [status, setStatus] = useState<GeoStatus>('idle')

  const request = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unsupported')
      return
    }
    setStatus('locating')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPoint({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setStatus('granted')
      },
      () => setStatus('denied'),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300_000 },
    )
  }, [])

  useEffect(() => {
    request()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { point, status, request, usingFallback: status !== 'granted' }
}
