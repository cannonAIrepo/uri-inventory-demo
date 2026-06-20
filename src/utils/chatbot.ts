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
    return `I can help you with:\n• Stock alerts ("What's low?" / "Any critical items?")\n• Category lookups ("Show compressors")\n• Part lookups by number (e.g. COM-COP-ZR48)\n• Branch snapshot ("Give me a status summary")\n• Supplier info ("Who are our vendors?")`
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

  const partMatch = query.match(/[A-Z]{2,}[-/][A-Z0-9-/]+/i)
  if (partMatch) {
    const pn = partMatch[0].toUpperCase()
    const item = items.find(i => i.partNumber.toUpperCase() === pn)
    if (item) {
      const status = getStockStatus(item)
      return `${item.description}\n• Part #: ${item.partNumber}\n• Qty: ${item.qty} (reorder at ${item.reorderPt})\n• Supplier: ${item.supplier} · Lead time: ${item.leadTime}\n• Status: ${status === 'in-stock' ? '✅ In Stock' : status === 'low' ? '⚠️ Low Stock' : '🔴 Critical'}`
    }
    return `Part ${pn} not found at ${branch.name}. Check the Inventory tab to browse by category.`
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
