#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const csvPath = path.join(os.homedir(), 'uri-poc', 'parsed', 'uri_poc_combined.csv')
const outPath = path.join(projectRoot, 'public', 'catalog.json')

function parseCsvLine(line) {
  const fields = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cur += ch
      }
    } else {
      if (ch === ',') {
        fields.push(cur)
        cur = ''
      } else if (ch === '"') {
        inQuotes = true
      } else {
        cur += ch
      }
    }
  }
  fields.push(cur)
  return fields
}

const raw = fs.readFileSync(csvPath, 'utf8')
const lines = raw.split(/\r?\n/).filter((l) => l.length > 0)
const header = parseCsvLine(lines[0])
const idx = Object.fromEntries(header.map((h, i) => [h, i]))

const required = ['catalog', 'uri_sku', 'description', 'manufacturer', 'oem_part_no', 'price', 'category_hint', 'specs_json']
for (const r of required) {
  if (idx[r] === undefined) {
    console.error(`Missing column: ${r}`)
    process.exit(1)
  }
}

const items = []
for (let i = 1; i < lines.length; i++) {
  const fields = parseCsvLine(lines[i])
  if (fields.length < header.length) continue
  const uri_sku = (fields[idx.uri_sku] || '').trim()
  if (!uri_sku) continue
  const priceStr = (fields[idx.price] || '').trim()
  const priceNum = priceStr === '' ? null : Number(priceStr)
  let specs = {}
  const specsRaw = (fields[idx.specs_json] || '').trim()
  if (specsRaw) {
    try {
      specs = JSON.parse(specsRaw)
    } catch (err) {
      console.warn(`Row ${i}: bad specs_json for ${uri_sku}: ${err.message}`)
    }
  }
  items.push({
    uri_sku,
    description: (fields[idx.description] || '').trim(),
    manufacturer: (fields[idx.manufacturer] || '').trim(),
    oem_part_no: (fields[idx.oem_part_no] || '').trim(),
    price: Number.isFinite(priceNum) ? priceNum : null,
    category_hint: (fields[idx.category_hint] || '').trim(),
    catalog_source: (fields[idx.catalog] || '').trim(),
    specs,
  })
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(items))
console.log(`Wrote ${items.length} items to ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`)
