export type Category =
  | 'Compressors'
  | 'Refrigerants'
  | 'Valves'
  | 'Electrical'
  | 'Fittings'

export type BranchId = '001' | '007'

export interface Branch {
  id: BranchId
  name: string
  city: string
  state: string
  role: string
}

export interface InventoryItem {
  partNumber: string
  description: string
  category: Category
  qty: number
  reorderPt: number
  supplier: string
  leadTime: string
  lastReceived: string
  lastPo: string
  oemPartNumbers?: string[]
}

export interface ActivityEntry {
  id: number
  timestamp: string
  message: string
  type: 'transfer' | 'order' | 'adjustment' | 'alert'
}

export const BRANCHES: Branch[] = [
  {
    id: '001',
    name: 'Branch 001',
    city: 'Miami',
    state: 'FL',
    role: 'Main Distribution Center',
  },
  {
    id: '007',
    name: 'Branch 007',
    city: 'Fort Lauderdale',
    state: 'FL',
    role: 'Satellite Branch',
  },
]

export const CATEGORIES: Category[] = [
  'Compressors',
  'Refrigerants',
  'Valves',
  'Electrical',
  'Fittings',
]

const branch001: InventoryItem[] = [
  {
    partNumber: 'COM-COP-ZR48',
    description: 'Copeland ZR48K3 Scroll Compressor',
    category: 'Compressors',
    qty: 8,
    reorderPt: 5,
    supplier: 'Emerson',
    leadTime: '5 days',
    lastReceived: '2026-06-01',
    lastPo: 'PO-4802',
    oemPartNumbers: ['ZR48K3-PFV-130', 'ZR48K3-PFV', 'ZR48K3'],
  },
  {
    partNumber: 'COM-TEC-AE4430',
    description: 'Tecumseh AE4430Y Compressor',
    category: 'Compressors',
    qty: 2,
    reorderPt: 4,
    supplier: 'Tecumseh',
    leadTime: '7 days',
    lastReceived: '2026-05-22',
    lastPo: 'PO-4778',
    oemPartNumbers: ['AE4430Y-AA1A', 'AE4430Y'],
  },
  {
    partNumber: 'COM-BRI-H29',
    description: 'Bristol H29 Recip Compressor',
    category: 'Compressors',
    qty: 0,
    reorderPt: 3,
    supplier: 'Bristol',
    leadTime: '10 days',
    lastReceived: '2026-04-15',
    lastPo: 'PO-4701',
    oemPartNumbers: ['H29A20QABCA', 'H29A20QABPA'],
  },
  {
    partNumber: 'REF-410A-25',
    description: 'Refrigerant R-410A 25lb Cylinder',
    category: 'Refrigerants',
    qty: 34,
    reorderPt: 20,
    supplier: 'Chemours',
    leadTime: '3 days',
    lastReceived: '2026-06-10',
    lastPo: 'PO-4819',
  },
  {
    partNumber: 'REF-404A-24',
    description: 'Refrigerant R-404A 24lb Cylinder',
    category: 'Refrigerants',
    qty: 5,
    reorderPt: 15,
    supplier: 'Honeywell',
    leadTime: '3 days',
    lastReceived: '2026-06-05',
    lastPo: 'PO-4811',
  },
  {
    partNumber: 'REF-22-30',
    description: 'Refrigerant R-22 30lb Cylinder',
    category: 'Refrigerants',
    qty: 12,
    reorderPt: 8,
    supplier: 'Chemours',
    leadTime: '4 days',
    lastReceived: '2026-06-08',
    lastPo: 'PO-4814',
  },
  {
    partNumber: 'REF-134A-30',
    description: 'Refrigerant R-134a 30lb Cylinder',
    category: 'Refrigerants',
    qty: 18,
    reorderPt: 10,
    supplier: 'Honeywell',
    leadTime: '3 days',
    lastReceived: '2026-06-12',
    lastPo: 'PO-4824',
  },
  {
    partNumber: 'VAL-EXV-EX4',
    description: 'Sporlan EX4 Electronic Exp Valve',
    category: 'Valves',
    qty: 3,
    reorderPt: 5,
    supplier: 'Parker',
    leadTime: '6 days',
    lastReceived: '2026-05-30',
    lastPo: 'PO-4795',
    oemPartNumbers: ['EX4-N2', 'EX4-R2', 'EX4N2'],
  },
  {
    partNumber: 'VAL-SOL-1/4',
    description: '1/4" Solenoid Valve 24V',
    category: 'Valves',
    qty: 22,
    reorderPt: 10,
    supplier: 'Alco',
    leadTime: '4 days',
    lastReceived: '2026-06-03',
    lastPo: 'PO-4808',
    oemPartNumbers: ['EVR3', 'EVR 3', 'EVRH3'],
  },
  {
    partNumber: 'VAL-BV-3/8',
    description: '3/8" Ball Valve Flare',
    category: 'Valves',
    qty: 45,
    reorderPt: 20,
    supplier: 'Mueller',
    leadTime: '2 days',
    lastReceived: '2026-06-14',
    lastPo: 'PO-4827',
  },
  {
    partNumber: 'ELC-CAP-45-5',
    description: '45+5 MFD Dual Run Capacitor',
    category: 'Electrical',
    qty: 1,
    reorderPt: 10,
    supplier: 'Genteq',
    leadTime: '3 days',
    lastReceived: '2026-05-10',
    lastPo: 'PO-4745',
    oemPartNumbers: ['Z97F9844', '97F9844', 'P291-4554RS'],
  },
  {
    partNumber: 'ELC-CON-40A',
    description: '40A Single Pole Contactor',
    category: 'Electrical',
    qty: 7,
    reorderPt: 8,
    supplier: 'Schneider',
    leadTime: '4 days',
    lastReceived: '2026-06-01',
    lastPo: 'PO-4803',
    oemPartNumbers: ['LC1D40F7', 'LC1D40', '42GF35AF'],
  },
  {
    partNumber: 'ELC-MOT-1/3HP',
    description: '1/3 HP Condenser Fan Motor',
    category: 'Electrical',
    qty: 4,
    reorderPt: 6,
    supplier: 'A.O. Smith',
    leadTime: '5 days',
    lastReceived: '2026-05-28',
    lastPo: 'PO-4789',
    oemPartNumbers: ['F48C17A45', '5KCP39GGS465S', 'HC33GE230'],
  },
  {
    partNumber: 'FIT-COP-1/4',
    description: '1/4" Copper Flare Fitting',
    category: 'Fittings',
    qty: 200,
    reorderPt: 50,
    supplier: 'Mueller',
    leadTime: '2 days',
    lastReceived: '2026-06-15',
    lastPo: 'PO-4830',
  },
  {
    partNumber: 'FIT-DRI-F33',
    description: 'Filter Drier Catch-All F33',
    category: 'Fittings',
    qty: 9,
    reorderPt: 12,
    supplier: 'Parker',
    leadTime: '4 days',
    lastReceived: '2026-06-02',
    lastPo: 'PO-4805',
    oemPartNumbers: ['C-417-S', 'EK164S', 'BD-053-S'],
  },
]

const branch007: InventoryItem[] = [
  {
    partNumber: 'COM-COP-ZR48',
    description: 'Copeland ZR48K3 Scroll Compressor',
    category: 'Compressors',
    qty: 3,
    reorderPt: 5,
    supplier: 'Emerson',
    leadTime: '5 days',
    lastReceived: '2026-05-20',
    lastPo: 'PO-4773',
    oemPartNumbers: ['ZR48K3-PFV-130', 'ZR48K3-PFV', 'ZR48K3'],
  },
  {
    partNumber: 'COM-TEC-AE4430',
    description: 'Tecumseh AE4430Y Compressor',
    category: 'Compressors',
    qty: 6,
    reorderPt: 4,
    supplier: 'Tecumseh',
    leadTime: '7 days',
    lastReceived: '2026-06-05',
    lastPo: 'PO-4812',
    oemPartNumbers: ['AE4430Y-AA1A', 'AE4430Y'],
  },
  {
    partNumber: 'REF-410A-25',
    description: 'Refrigerant R-410A 25lb Cylinder',
    category: 'Refrigerants',
    qty: 11,
    reorderPt: 20,
    supplier: 'Chemours',
    leadTime: '3 days',
    lastReceived: '2026-06-08',
    lastPo: 'PO-4815',
  },
  {
    partNumber: 'REF-404A-24',
    description: 'Refrigerant R-404A 24lb Cylinder',
    category: 'Refrigerants',
    qty: 22,
    reorderPt: 15,
    supplier: 'Honeywell',
    leadTime: '3 days',
    lastReceived: '2026-06-10',
    lastPo: 'PO-4820',
  },
  {
    partNumber: 'REF-22-30',
    description: 'Refrigerant R-22 30lb Cylinder',
    category: 'Refrigerants',
    qty: 4,
    reorderPt: 8,
    supplier: 'Chemours',
    leadTime: '4 days',
    lastReceived: '2026-05-25',
    lastPo: 'PO-4783',
  },
  {
    partNumber: 'REF-134A-30',
    description: 'Refrigerant R-134a 30lb Cylinder',
    category: 'Refrigerants',
    qty: 7,
    reorderPt: 10,
    supplier: 'Honeywell',
    leadTime: '3 days',
    lastReceived: '2026-06-01',
    lastPo: 'PO-4804',
  },
  {
    partNumber: 'VAL-EXV-EX4',
    description: 'Sporlan EX4 Electronic Exp Valve',
    category: 'Valves',
    qty: 8,
    reorderPt: 5,
    supplier: 'Parker',
    leadTime: '6 days',
    lastReceived: '2026-06-10',
    lastPo: 'PO-4818',
  },
  {
    partNumber: 'VAL-SOL-1/4',
    description: '1/4" Solenoid Valve 24V',
    category: 'Valves',
    qty: 4,
    reorderPt: 10,
    supplier: 'Alco',
    leadTime: '4 days',
    lastReceived: '2026-05-28',
    lastPo: 'PO-4790',
  },
  {
    partNumber: 'VAL-BV-3/8',
    description: '3/8" Ball Valve Flare',
    category: 'Valves',
    qty: 60,
    reorderPt: 20,
    supplier: 'Mueller',
    leadTime: '2 days',
    lastReceived: '2026-06-15',
    lastPo: 'PO-4831',
  },
  {
    partNumber: 'ELC-CAP-45-5',
    description: '45+5 MFD Dual Run Capacitor',
    category: 'Electrical',
    qty: 14,
    reorderPt: 10,
    supplier: 'Genteq',
    leadTime: '3 days',
    lastReceived: '2026-06-08',
    lastPo: 'PO-4816',
  },
  {
    partNumber: 'ELC-CON-40A',
    description: '40A Single Pole Contactor',
    category: 'Electrical',
    qty: 2,
    reorderPt: 8,
    supplier: 'Schneider',
    leadTime: '4 days',
    lastReceived: '2026-05-18',
    lastPo: 'PO-4768',
  },
  {
    partNumber: 'ELC-MOT-1/3HP',
    description: '1/3 HP Condenser Fan Motor',
    category: 'Electrical',
    qty: 9,
    reorderPt: 6,
    supplier: 'A.O. Smith',
    leadTime: '5 days',
    lastReceived: '2026-06-05',
    lastPo: 'PO-4813',
  },
  {
    partNumber: 'FIT-COP-1/4',
    description: '1/4" Copper Flare Fitting',
    category: 'Fittings',
    qty: 85,
    reorderPt: 50,
    supplier: 'Mueller',
    leadTime: '2 days',
    lastReceived: '2026-06-13',
    lastPo: 'PO-4826',
  },
  {
    partNumber: 'FIT-DRI-F33',
    description: 'Filter Drier Catch-All F33',
    category: 'Fittings',
    qty: 15,
    reorderPt: 12,
    supplier: 'Parker',
    leadTime: '4 days',
    lastReceived: '2026-06-09',
    lastPo: 'PO-4817',
  },
]

export const INVENTORY_BY_BRANCH: Record<BranchId, InventoryItem[]> = {
  '001': branch001,
  '007': branch007,
}

export const ACTIVITY_BY_BRANCH: Record<BranchId, ActivityEntry[]> = {
  '001': [
    {
      id: 1,
      timestamp: '2026-06-18 14:22',
      message:
        'Compressor COM-COP-ZR48 — 2 units transferred from Branch 007',
      type: 'transfer',
    },
    {
      id: 2,
      timestamp: '2026-06-18 11:08',
      message: 'PO #4830 received — 50 units 1/4" Copper Flare Fittings',
      type: 'order',
    },
    {
      id: 3,
      timestamp: '2026-06-17 16:45',
      message: 'Low stock alert: 45+5 MFD Dual Run Capacitor (1 remaining)',
      type: 'alert',
    },
    {
      id: 4,
      timestamp: '2026-06-17 09:30',
      message: 'PO #4827 received — 25 units 3/8" Ball Valve Flare',
      type: 'order',
    },
    {
      id: 5,
      timestamp: '2026-06-16 13:12',
      message:
        'Critical stock: Bristol H29 Recip Compressor — reorder triggered',
      type: 'alert',
    },
  ],
  '007': [
    {
      id: 1,
      timestamp: '2026-06-18 14:22',
      message: 'Compressor COM-COP-ZR48 — 2 units shipped to Branch 001',
      type: 'transfer',
    },
    {
      id: 2,
      timestamp: '2026-06-18 10:14',
      message: 'PO #4831 received — 20 units 3/8" Ball Valve Flare',
      type: 'order',
    },
    {
      id: 3,
      timestamp: '2026-06-17 15:02',
      message: 'Low stock alert: 40A Single Pole Contactor (2 remaining)',
      type: 'alert',
    },
    {
      id: 4,
      timestamp: '2026-06-16 11:48',
      message: 'Adjustment: +4 units Filter Drier F33 (cycle count)',
      type: 'adjustment',
    },
    {
      id: 5,
      timestamp: '2026-06-15 09:21',
      message: 'PO #4820 received — 24 units R-404A 24lb Cylinders',
      type: 'order',
    },
  ],
}

export type StockStatus = 'critical' | 'low' | 'in-stock'

export function getStockStatus(item: InventoryItem): StockStatus {
  if (item.qty === 0 || item.qty <= item.reorderPt * 0.25) return 'critical'
  if (item.qty <= item.reorderPt) return 'low'
  return 'in-stock'
}
