export interface CatalogItem {
  uri_sku: string
  description: string
  manufacturer: string
  oem_part_no: string
  price: number | null
  category_hint: string
  catalog_source: string
  specs: Record<string, string>
}
