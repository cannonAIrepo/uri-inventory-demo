import { type InventoryItem, type Branch, getStockStatus } from '../data/inventory'
import type { CatalogItem } from '../data/catalog'

const SPEC_KEYWORDS = /\b(spec|specs|specification|voltage|volt|refrigerant|refrig|hp|btu|btuh|oil|weight|wgt|amp|amps|capacity|tonnage|rla|height|length|width|ship|pkg|tell me about|details|info)\b/i

const TON_REGEX = /(\d+(?:\.\d+)?)\s*[-\s]?\s*ton\b/i
const REFRIG_REGEX = /\bR[-\s]?(22|134[aA]?|404[aA]?|407[cC]?|410[aA]?|454[bB]?|448[aA]?|449[aA]?|290|600[aA]?|32|513[aA]?)\b/i
const PRICE_UNDER_REGEX = /(?:under|less than|below|<=?|cheaper than|max(?:imum)?)\s*\$?\s*(\d+(?:[.,]\d+)?)/i
const PRICE_OVER_REGEX = /(?:over|more than|above|>=?|at least|min(?:imum)?)\s*\$?\s*(\d+(?:[.,]\d+)?)/i
const VOLTAGE_REGEX = /\b(460|208[-/]230|208|230|115|120|277|575|24)\s?v(olt)?s?\b/i
const PHASE_REGEX = /\b(single|three|3)[ -]?phase\b/i
const COMPRESSOR_TYPE_REGEX = /\b(scroll|screw|reciprocating|semi[-\s]?hermetic|hermetic)\b/i

function normalizePart(s: string): string {
  return s.toUpperCase().replace(/[-\s/]/g, '')
}

function formatPrice(p: number | null): string {
  if (p == null) return 'price on request'
  return `$${p.toFixed(2)}`
}

function getSpec(item: CatalogItem, ...candidates: string[]): string | null {
  const specs = item.specs
  const keys = Object.keys(specs)
  for (const want of candidates) {
    const wantLower = want.toLowerCase()
    const k = keys.find((kk) => kk.toLowerCase() === wantLower || kk.toLowerCase().startsWith(wantLower))
    if (k && specs[k]) return specs[k]
  }
  return null
}

function keySpecLine(item: CatalogItem): string {
  const parts: string[] = []
  const hp = getSpec(item, 'HP')
  const btuh = getSpec(item, 'Capacity BTUH', 'Capacity (BTUH)', 'Capacity')
  const refrig = getSpec(item, 'Refrig.', 'refrigerant', 'Refrigerant')
  const voltage = getSpec(item, 'Voltage')
  if (hp) parts.push(`${hp} HP`)
  if (btuh) parts.push(`${btuh} BTUH`)
  if (refrig) parts.push(refrig)
  if (voltage) parts.push(voltage)
  return parts.join(' · ')
}

function formatCatalogItemFull(item: CatalogItem): string {
  const specLines = Object.entries(item.specs)
    .map(([k, v]) => `  • ${k}: ${v}`)
    .join('\n')
  const mfr = item.manufacturer ? ` (${item.manufacturer})` : ''
  const oemLine = item.oem_part_no ? `\nOEM cross-ref: ${item.oem_part_no}` : ''
  const specsBlock = specLines ? `\nSpecs:\n${specLines}` : ''
  return `URI SKU: ${item.uri_sku}\n${item.description}${mfr}\nPrice: ${formatPrice(item.price)}${oemLine}${specsBlock}`
}

function formatCatalogItemBrief(item: CatalogItem): string {
  const ks = keySpecLine(item)
  return `• ${item.uri_sku} — ${item.description} — ${formatPrice(item.price)}${ks ? ` · ${ks}` : ''}`
}

function tonToBtuhRange(ton: number): [number, number] {
  const center = ton * 12000
  return [center * 0.85, center * 1.15]
}

function parseBtuh(raw: string | null): number | null {
  if (!raw) return null
  const cleaned = raw.replace(/[,\s]/g, '')
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

function catalogBtuh(item: CatalogItem): number | null {
  return parseBtuh(getSpec(item, 'Capacity BTUH', 'Capacity (BTUH)', 'Capacity'))
}

interface CatalogFilter {
  name: string
  desc: string
  fn: (i: CatalogItem) => boolean
}

function buildFilters(query: string): CatalogFilter[] {
  const filters: CatalogFilter[] = []

  const tonMatch = query.match(TON_REGEX)
  if (tonMatch) {
    const ton = Number(tonMatch[1])
    const [lo, hi] = tonToBtuhRange(ton)
    filters.push({
      name: 'tonnage',
      desc: `${ton}-ton (${Math.round(lo).toLocaleString()}–${Math.round(hi).toLocaleString()} BTUH)`,
      fn: (i) => {
        const b = catalogBtuh(i)
        return b != null && b >= lo && b <= hi
      },
    })
  }

  const refrigMatch = query.match(REFRIG_REGEX)
  if (refrigMatch) {
    const token = `R${refrigMatch[1]}`.toUpperCase()
    const tokenNorm = token.replace(/[-\s]/g, '')
    filters.push({
      name: 'refrigerant',
      desc: token,
      fn: (i) => {
        const r = getSpec(i, 'Refrig.', 'refrigerant', 'Refrigerant')
        if (!r) return false
        return r.toUpperCase().replace(/[-\s]/g, '').includes(tokenNorm)
      },
    })
  }

  const priceUnder = query.match(PRICE_UNDER_REGEX)
  if (priceUnder) {
    const cap = Number(priceUnder[1].replace(/,/g, ''))
    filters.push({
      name: 'price-under',
      desc: `under $${cap}`,
      fn: (i) => i.price != null && i.price <= cap,
    })
  }
  const priceOver = query.match(PRICE_OVER_REGEX)
  if (priceOver) {
    const floor = Number(priceOver[1].replace(/,/g, ''))
    filters.push({
      name: 'price-over',
      desc: `over $${floor}`,
      fn: (i) => i.price != null && i.price >= floor,
    })
  }

  const voltageMatch = query.match(VOLTAGE_REGEX)
  if (voltageMatch) {
    const v = voltageMatch[1]
    filters.push({
      name: 'voltage',
      desc: `${v}V`,
      fn: (i) => (getSpec(i, 'Voltage') || '').includes(v),
    })
  }

  const phaseMatch = query.match(PHASE_REGEX)
  if (phaseMatch) {
    const phase = /3|three/i.test(phaseMatch[1]) ? '3' : '1'
    filters.push({
      name: 'phase',
      desc: `${phase}-phase`,
      fn: (i) => {
        const volt = getSpec(i, 'Voltage') || ''
        return new RegExp(`/${phase}/`).test(volt)
      },
    })
  }

  const typeMatch = query.match(COMPRESSOR_TYPE_REGEX)
  if (typeMatch) {
    const type = typeMatch[1].toLowerCase().replace(/\s+/g, '-')
    const rx = new RegExp(type.replace('-', '[-\\s]?'), 'i')
    filters.push({
      name: 'type',
      desc: type,
      fn: (i) => rx.test(i.description) || rx.test(i.category_hint),
    })
  }

  return filters
}

function runFilteredCatalogSearch(query: string, catalog: CatalogItem[]): string | null {
  if (!catalog.length) return null
  const filters = buildFilters(query)
  if (!filters.length) return null

  const hasTon = filters.some((f) => f.name === 'tonnage')
  const isShowQuery = /\b(show|find|list|all|every|how many)\b/i.test(query)
  if (!hasTon && filters.length < 2 && !isShowQuery) return null

  let results = catalog
  for (const f of filters) {
    results = results.filter(f.fn)
  }
  const filterDesc = filters.map((f) => f.desc).join(' + ')

  if (results.length) {
    const shown = results.slice(0, 10)
    const more = results.length > 10 ? `\n\nShowing top 10 of ${results.length} matches.` : ''
    return `Found ${results.length} match${results.length === 1 ? '' : 'es'} for ${filterDesc}:\n${shown.map(formatCatalogItemBrief).join('\n')}${more}`
  }

  const dropIdx = filters.findIndex((f) => f.name.startsWith('price'))
  const relaxIdx = dropIdx >= 0 ? dropIdx : filters.length - 1
  const relaxed = filters.filter((_, i) => i !== relaxIdx)
  let relaxedResults = catalog
  for (const f of relaxed) {
    relaxedResults = relaxedResults.filter(f.fn)
  }
  if (relaxedResults.length && relaxed.length) {
    const shown = relaxedResults.slice(0, 10)
    const more = relaxedResults.length > 10 ? `\n\nShowing top 10 of ${relaxedResults.length} matches.` : ''
    return `No matches for ${filterDesc}. Relaxing "${filters[relaxIdx].desc}" found ${relaxedResults.length}:\n${shown.map(formatCatalogItemBrief).join('\n')}${more}`
  }
  return `No matches found for ${filterDesc}.`
}

function extractSkuTokens(query: string): string[] {
  const matches = query.match(/\b[A-Z0-9][A-Z0-9-/]{3,}\b/gi) || []
  return matches
    .filter((t) => /[A-Z]/i.test(t) && /[0-9]/.test(t))
    .filter((t) => !/^R[-\s]?\d/i.test(t))
    .map((t) => t.toUpperCase())
}

function findCatalogBySku(sku: string, catalog: CatalogItem[]): CatalogItem | null {
  const norm = normalizePart(sku)
  return catalog.find((i) => normalizePart(i.uri_sku) === norm) || null
}

function findCatalogByOem(oem: string, catalog: CatalogItem[]): CatalogItem | null {
  const norm = normalizePart(oem)
  return catalog.find((i) => i.oem_part_no && normalizePart(i.oem_part_no) === norm) || null
}

export function getChatResponse(
  query: string,
  branch: Branch,
  items: InventoryItem[],
  catalog: CatalogItem[],
): string {
  const q = query.toLowerCase()

  if (/^(hi|hello|hey)\b/i.test(q)) {
    const total = catalog.length ? ` Full URI catalog of ${catalog.length.toLocaleString()} SKUs available.` : ''
    return `Hello! I'm tracking ${items.length} SKUs at ${branch.name} in ${branch.city}.${total} Ask me about stock levels, specific parts, OEM cross-refs, or spec searches like "2-ton R-410A scroll under $400".`
  }

  if (/critical|out of stock|zero stock|empty/i.test(q)) {
    const critical = items.filter((i) => getStockStatus(i) === 'critical')
    if (!critical.length) return `No critical stock items at ${branch.name} right now. Everything is above 25% of reorder point.`
    return `🔴 Critical at ${branch.name} (${critical.length} item${critical.length > 1 ? 's' : ''}):\n${critical.map((i) => `• ${i.description} — ${i.qty === 0 ? 'OUT OF STOCK' : `${i.qty} left`} | Lead time: ${i.leadTime}`).join('\n')}`
  }

  if (/\b(low|reorder|need to order|running low)\b|alert/i.test(q)) {
    const low = items.filter((i) => getStockStatus(i) !== 'in-stock')
    if (!low.length) return `✅ All ${items.length} items are above reorder points at ${branch.name}.`
    return `${low.length} item${low.length > 1 ? 's' : ''} need attention at ${branch.name}:\n${low.map((i) => `• ${i.description} — ${i.qty} in stock (reorder at ${i.reorderPt}) ${getStockStatus(i) === 'critical' ? '🔴' : '⚠️'}`).join('\n')}`
  }

  if (/summary|overview|status|snapshot|how are we doing/i.test(q)) {
    const critical = items.filter((i) => getStockStatus(i) === 'critical').length
    const low = items.filter((i) => getStockStatus(i) === 'low').length
    const ok = items.filter((i) => getStockStatus(i) === 'in-stock').length
    const total = items.reduce((s, i) => s + i.qty, 0)
    return `${branch.name} · ${branch.city} — ${total} total units across ${items.length} SKUs\n\n✅ In stock: ${ok}\n⚠️ Low: ${low}\n🔴 Critical: ${critical}`
  }

  if (/supplier|vendor|who makes/i.test(q)) {
    const bySupplier: Record<string, string[]> = {}
    items.forEach((i) => {
      if (!bySupplier[i.supplier]) bySupplier[i.supplier] = []
      bySupplier[i.supplier].push(i.description)
    })
    return `Suppliers at ${branch.name}:\n${Object.entries(bySupplier).map(([s, descs]) => `• ${s} — ${descs.length} SKU${descs.length > 1 ? 's' : ''}`).join('\n')}`
  }

  if (/how many|total|count|inventory size/i.test(q)) {
    const total = items.reduce((s, i) => s + i.qty, 0)
    const byCategory: Record<string, number> = {}
    items.forEach((i) => {
      byCategory[i.category] = (byCategory[i.category] ?? 0) + i.qty
    })
    return `${branch.name} total: ${total} units across ${items.length} SKUs\n${Object.entries(byCategory).map(([cat, qty]) => `• ${cat}: ${qty} units`).join('\n')}`
  }

  if (/help|what can you|what do you do/i.test(q)) {
    const catSize = catalog.length ? ` (${catalog.length.toLocaleString()}-SKU catalog)` : ''
    return `I can help you with${catSize}:\n• OEM cross-ref ("Replace a ZR48K3-PFV")\n• Spec lookup ("What refrigerant does HRM032U1LP6 use?")\n• Filtered catalog search ("2-ton R-410A scrolls under $400")\n• Stock alerts ("What's low?" / "Any critical items?")\n• Category lookups ("Show compressors")\n• Branch snapshot ("Give me a status summary")`
  }

  const filteredHit = runFilteredCatalogSearch(query, catalog)
  if (filteredHit) return filteredHit

  const skuTokens = extractSkuTokens(query)
  const wantsSpecs = SPEC_KEYWORDS.test(q) || /tell me about|details on|info on|what is/i.test(q)
  if (skuTokens.length && wantsSpecs) {
    for (const tok of skuTokens) {
      const hit = findCatalogBySku(tok, catalog)
      if (hit) {
        const refrigRequested = /\brefrigerant|refrig\b/i.test(q)
        const voltageRequested = /\bvoltage|volt\b/i.test(q)
        const hpRequested = /\bhp\b/i.test(q)
        const btuRequested = /\bbtu/i.test(q)
        if (refrigRequested) {
          const r = getSpec(hit, 'Refrig.', 'refrigerant', 'Refrigerant')
          if (r) return `${hit.uri_sku} (${hit.description}): refrigerant is ${r}.`
          return `${hit.uri_sku} (${hit.description}): no refrigerant spec listed.`
        }
        if (voltageRequested) {
          const v = getSpec(hit, 'Voltage')
          if (v) return `${hit.uri_sku} (${hit.description}): voltage is ${v}.`
        }
        if (hpRequested) {
          const hp = getSpec(hit, 'HP')
          if (hp) return `${hit.uri_sku} (${hit.description}): ${hp} HP.`
        }
        if (btuRequested) {
          const btu = getSpec(hit, 'Capacity BTUH', 'Capacity (BTUH)', 'Capacity')
          if (btu) return `${hit.uri_sku} (${hit.description}): ${btu} BTUH.`
        }
        return formatCatalogItemFull(hit)
      }
    }
  }

  const CATEGORY_KEYWORDS: Record<string, string> = {
    refrigerant: 'Refrigerants',
    'r-410': 'Refrigerants',
    'r-404': 'Refrigerants',
    'r-22': 'Refrigerants',
    'r-134': 'Refrigerants',
    freon: 'Refrigerants',
    valve: 'Valves',
    solenoid: 'Valves',
    'expansion valve': 'Valves',
    'ball valve': 'Valves',
    electrical: 'Electrical',
    capacitor: 'Electrical',
    contactor: 'Electrical',
    motor: 'Electrical',
    fitting: 'Fittings',
    'filter drier': 'Fittings',
    copper: 'Fittings',
  }

  for (const [kw, cat] of Object.entries(CATEGORY_KEYWORDS)) {
    if (q.includes(kw)) {
      const filtered = items.filter((i) => i.category === cat || i.description.toLowerCase().includes(kw))
      if (!filtered.length) continue
      return `${cat} at ${branch.name} (${filtered.length} SKU${filtered.length > 1 ? 's' : ''}):\n${filtered.map((i) => `• ${i.description}\n  ${i.qty} in stock · reorder at ${i.reorderPt} · ${getStockStatus(i) === 'in-stock' ? '✅' : getStockStatus(i) === 'low' ? '⚠️' : '🔴'}`).join('\n')}`
    }
  }

  function formatInventoryItem(item: InventoryItem, context: string): string {
    const status = getStockStatus(item)
    const statusLabel = status === 'in-stock' ? '✅ In Stock' : status === 'low' ? '⚠️ Low Stock' : '🔴 Critical — reorder now'
    return `${context}\n• URI SKU: ${item.partNumber}\n• ${item.description}\n• Qty at ${branch.name}: ${item.qty} (reorder at ${item.reorderPt})\n• Supplier: ${item.supplier} · Lead time: ${item.leadTime}\n• Status: ${statusLabel}`
  }

  const isReplaceIntent = /replac|cross.?ref|equivalent|substitute|swap|what.*(uri|part).*(for|number)|i have a|i.ve got a|need.*instead/i.test(q)

  const partMatch = query.match(/[A-Z0-9]{2,}[-/\s][A-Z0-9][-A-Z0-9-/\s]*/i)
  const primaryToken = partMatch ? partMatch[0].trim().toUpperCase() : (skuTokens[0] ?? null)

  if (primaryToken) {
    const pn = primaryToken

    const uriItem = items.find((i) => i.partNumber.toUpperCase() === pn)
    if (uriItem) {
      return formatInventoryItem(uriItem, `Found URI part ${pn}:`)
    }

    const pnCompact = normalizePart(pn)
    const oemItem = items.find((i) =>
      i.oemPartNumbers?.some((oem) => normalizePart(oem) === pnCompact),
    )
    if (oemItem) {
      return formatInventoryItem(oemItem, `OEM ${pn} → URI cross-reference:`)
    }

    const catalogSkuHit = findCatalogBySku(pn, catalog)
    if (catalogSkuHit) {
      return formatCatalogItemFull(catalogSkuHit)
    }

    const catalogOemHit = findCatalogByOem(pn, catalog)
    if (catalogOemHit) {
      const ks = keySpecLine(catalogOemHit)
      return `OEM ${pn} → URI SKU: ${catalogOemHit.uri_sku}\n${catalogOemHit.description}${catalogOemHit.manufacturer ? ` (${catalogOemHit.manufacturer})` : ''}\nPrice: ${formatPrice(catalogOemHit.price)}${ks ? `\nKey specs: ${ks}` : ''}`
    }

    if (isReplaceIntent) {
      const words = pn.split(/[-/\s]/)
      const fuzzyOem = items.find((i) =>
        i.oemPartNumbers?.some((oem) =>
          words.some((w) => w.length > 3 && oem.toUpperCase().includes(w)),
        ),
      )
      if (fuzzyOem) {
        return formatInventoryItem(fuzzyOem, `Closest OEM match for ${pn}:`)
      }
      return `No URI cross-reference found for ${pn}. Our ${catalog.length.toLocaleString()}-SKU catalog doesn't carry a direct equivalent — call the counter and we'll source it.`
    }

    return `Part ${pn} not found at ${branch.name} or in the catalog. Try an OEM number to cross-reference, or check the Inventory tab.`
  }

  const words = q.split(/\s+/).filter((w) => w.length > 3)
  for (const word of words) {
    const matches = items.filter(
      (i) => i.description.toLowerCase().includes(word) || i.partNumber.toLowerCase().includes(word),
    )
    if (matches.length) {
      return `Found ${matches.length} match${matches.length > 1 ? 'es' : ''} for "${word}" at ${branch.name}:\n${matches.map((i) => `• ${i.description} — ${i.qty} in stock ${getStockStatus(i) === 'in-stock' ? '✅' : getStockStatus(i) === 'low' ? '⚠️' : '🔴'}`).join('\n')}`
    }
  }

  return `I didn't catch that. Try asking about stock levels, a category like "compressors", a part number, or type "help" to see what I can do.`
}
