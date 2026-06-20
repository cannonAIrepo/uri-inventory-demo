import { type InventoryItem, type Branch, getStockStatus } from '../data/inventory'

export function getChatResponse(query: string, branch: Branch, items: InventoryItem[]): string {
  const q = query.toLowerCase()

  if (/^(hi|hello|hey)\b/i.test(q)) {
    return `Hello! I'm tracking ${items.length} SKUs at ${branch.name} in ${branch.city}. Ask me about stock levels, specific parts, or categories.`
  }

  if (/critical|out of stock|zero stock|empty/i.test(q)) {
    const critical = items.filter(i => getStockStatus(i) === 'critical')
    if (!critical.length) return `No critical stock items at ${branch.name} right now. Everything is above 25% of reorder point.`
    return `🔴 Critical at ${branch.name} (${critical.length} item${critical.length > 1 ? 's' : ''}):\n${critical.map(i => `• ${i.description} — ${i.qty === 0 ? 'OUT OF STOCK' : `${i.qty} left`} | Lead time: ${i.leadTime}`).join('\n')}`
  }

  if (/low|alert|reorder|need to order|running low/i.test(q)) {
    const low = items.filter(i => getStockStatus(i) !== 'in-stock')
    if (!low.length) return `✅ All ${items.length} items are above reorder points at ${branch.name}.`
    return `${low.length} item${low.length > 1 ? 's' : ''} need attention at ${branch.name}:\n${low.map(i => `• ${i.description} — ${i.qty} in stock (reorder at ${i.reorderPt}) ${getStockStatus(i) === 'critical' ? '🔴' : '⚠️'}`).join('\n')}`
  }

  if (/summary|overview|status|snapshot|how are we doing/i.test(q)) {
    const critical = items.filter(i => getStockStatus(i) === 'critical').length
    const low = items.filter(i => getStockStatus(i) === 'low').length
    const ok = items.filter(i => getStockStatus(i) === 'in-stock').length
    const total = items.reduce((s, i) => s + i.qty, 0)
    return `${branch.name} · ${branch.city} — ${total} total units across ${items.length} SKUs\n\n✅ In stock: ${ok}\n⚠️ Low: ${low}\n🔴 Critical: ${critical}`
  }

  if (/supplier|vendor|manufacturer|who makes/i.test(q)) {
    const bySupplier: Record<string, string[]> = {}
    items.forEach(i => {
      if (!bySupplier[i.supplier]) bySupplier[i.supplier] = []
      bySupplier[i.supplier].push(i.description)
    })
    return `Suppliers at ${branch.name}:\n${Object.entries(bySupplier).map(([s, descs]) => `• ${s} — ${descs.length} SKU${descs.length > 1 ? 's' : ''}`).join('\n')}`
  }

  if (/how many|total|count|inventory size/i.test(q)) {
    const total = items.reduce((s, i) => s + i.qty, 0)
    const byCategory: Record<string, number> = {}
    items.forEach(i => { byCategory[i.category] = (byCategory[i.category] ?? 0) + i.qty })
    return `${branch.name} total: ${total} units across ${items.length} SKUs\n${Object.entries(byCategory).map(([cat, qty]) => `• ${cat}: ${qty} units`).join('\n')}`
  }

  if (/help|what can you|what do you do/i.test(q)) {
    return `I can help you with:\n• OEM cross-ref ("I need to replace a ZR48K3-PFV")\n• Stock alerts ("What's low?" / "Any critical items?")\n• Category lookups ("Show compressors")\n• Part lookups by URI or OEM number\n• Branch snapshot ("Give me a status summary")\n• Supplier info ("Who are our vendors?")`
  }

  const CATEGORY_KEYWORDS: Record<string, string> = {
    compressor: 'Compressors',
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
      const filtered = items.filter(i => i.category === cat || i.description.toLowerCase().includes(kw))
      if (!filtered.length) return `No ${cat} found at ${branch.name}.`
      return `${cat} at ${branch.name} (${filtered.length} SKU${filtered.length > 1 ? 's' : ''}):\n${filtered.map(i => `• ${i.description}\n  ${i.qty} in stock · reorder at ${i.reorderPt} · ${getStockStatus(i) === 'in-stock' ? '✅' : getStockStatus(i) === 'low' ? '⚠️' : '🔴'}`).join('\n')}`
    }
  }

  function formatItem(item: InventoryItem, context: string): string {
    const status = getStockStatus(item)
    const statusLabel = status === 'in-stock' ? '✅ In Stock' : status === 'low' ? '⚠️ Low Stock' : '🔴 Critical — reorder now'
    return `${context}\n• URI SKU: ${item.partNumber}\n• ${item.description}\n• Qty at ${branch.name}: ${item.qty} (reorder at ${item.reorderPt})\n• Supplier: ${item.supplier} · Lead time: ${item.leadTime}\n• Status: ${statusLabel}`
  }

  const isReplaceIntent = /replac|cross.?ref|equivalent|substitute|swap|what.*(uri|part).*(for|number)|i have a|i.ve got a|need.*instead/i.test(q)

  const partMatch = query.match(/[A-Z0-9]{2,}[-/\s][A-Z0-9][-A-Z0-9-/\s]*/i)
  if (partMatch) {
    const pn = partMatch[0].trim().toUpperCase()

    const uriItem = items.find(i => i.partNumber.toUpperCase() === pn)
    if (uriItem) {
      return formatItem(uriItem, `Found URI part ${pn}:`)
    }

    const pnCompact = pn.replace(/\s+/g, '')
    const oemItem = items.find(i =>
      i.oemPartNumbers?.some(oem => oem.toUpperCase().replace(/\s+/g, '') === pnCompact)
    )
    if (oemItem) {
      return formatItem(oemItem, `OEM ${pn} → URI cross-reference:`)
    }

    if (isReplaceIntent) {
      const words = pn.split(/[-/\s]/)
      const fuzzyOem = items.find(i =>
        i.oemPartNumbers?.some(oem =>
          words.some(w => w.length > 3 && oem.toUpperCase().includes(w))
        )
      )
      if (fuzzyOem) {
        return formatItem(fuzzyOem, `Closest OEM match for ${pn}:`)
      }
      return `No URI cross-reference found for ${pn}. Our catalog doesn't carry a direct equivalent — call the counter and we'll source it.`
    }

    return `Part ${pn} not found at ${branch.name}. Try an OEM number to cross-reference, or check the Inventory tab.`
  }

  const words = q.split(/\s+/).filter(w => w.length > 3)
  for (const word of words) {
    const matches = items.filter(i =>
      i.description.toLowerCase().includes(word) ||
      i.partNumber.toLowerCase().includes(word)
    )
    if (matches.length) {
      return `Found ${matches.length} match${matches.length > 1 ? 'es' : ''} for "${word}" at ${branch.name}:\n${matches.map(i => `• ${i.description} — ${i.qty} in stock ${getStockStatus(i) === 'in-stock' ? '✅' : getStockStatus(i) === 'low' ? '⚠️' : '🔴'}`).join('\n')}`
    }
  }

  return `I didn't catch that. Try asking about stock levels, a category like "compressors", a part number, or type "help" to see what I can do.`
}
