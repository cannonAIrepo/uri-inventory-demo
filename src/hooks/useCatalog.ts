import { useEffect, useState } from 'react'
import type { CatalogItem } from '../data/catalog'

let cached: CatalogItem[] | null = null
let inflight: Promise<CatalogItem[]> | null = null

function fetchCatalog(): Promise<CatalogItem[]> {
  if (cached) return Promise.resolve(cached)
  if (inflight) return inflight
  const url = `${import.meta.env.BASE_URL}catalog.json`
  inflight = fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`catalog fetch failed: ${r.status}`)
      return r.json() as Promise<CatalogItem[]>
    })
    .then((data) => {
      cached = data
      inflight = null
      return data
    })
    .catch((err) => {
      inflight = null
      throw err
    })
  return inflight
}

export function useCatalog(): { catalog: CatalogItem[]; loading: boolean } {
  const [catalog, setCatalog] = useState<CatalogItem[]>(cached ?? [])
  const [loading, setLoading] = useState<boolean>(!cached)

  useEffect(() => {
    if (cached) return
    let alive = true
    fetchCatalog()
      .then((data) => {
        if (alive) {
          setCatalog(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  return { catalog, loading }
}
