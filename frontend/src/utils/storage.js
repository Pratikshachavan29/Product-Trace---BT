const STORAGE_KEY = 'producttrace_products'
const DEMO_REMOVED_KEY = 'producttrace_demo_removed'
const LEGACY_STORAGE_KEYS = [
  'products',
  'producttrace_items',
  'product_records',
  'product_data',
  'trace_products',
  'pt_products',
]

export const SUPPLY_CHAIN_STAGES = [
  {
    id: 'Manufacturer',
    label: 'Manufacturer',
    stepNumber: 1,
    description: 'Origin facility records product creation, batch, and initial dispatch.',
    role: 'Origin Facility',
  },
  {
    id: 'Distributor',
    label: 'Distributor',
    stepNumber: 2,
    description: 'Regional logistics hub captures receipt, warehouse storage, and freight transfer.',
    role: 'Logistics Partner',
  },
  {
    id: 'Retailer',
    label: 'Retailer',
    stepNumber: 3,
    description: 'Retail facility logs inventory arrival, shelf verification, and pricing.',
    role: 'Store Merchant',
  },
  {
    id: 'Customer',
    label: 'Customer',
    stepNumber: 4,
    description: 'Final buyer confirms delivery receipt and end-to-end journey closes.',
    role: 'End Consumer',
  },
]

export function formatDateTime(date = new Date()) {
  const d = new Date(date)
  const day = d.getDate()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day} ${month} ${year}, ${hours}:${minutes}`
}

export const DEMO_PRODUCTS = [
  {
    id: 'PT-14980',
    name: 'Organic Green Tea',
    manufacturer: 'Kyoto Farms',
    manufacturingDate: '2026-10-18',
    originLocation: 'Pune, Maharashtra',
    stage: 'Manufacturer',
    status: 'Registered',
    isDemo: true,
    updated: '18 Oct 2026, 09:30',
    history: [
      {
        stage: 'Manufacturer',
        status: 'Registered',
        location: 'Pune, Maharashtra',
        handler: 'Kyoto Farms',
        timestamp: '18 Oct 2026, 09:30',
        note: 'Product created and registered in tracking ledger.',
      },
    ],
  },
  {
    id: 'PT-14981',
    name: 'Organic Honey',
    manufacturer: 'NaturePure Foods',
    manufacturingDate: '2026-10-19',
    originLocation: 'Nashik, Maharashtra',
    stage: 'Distributor',
    status: 'In Transit',
    isDemo: true,
    updated: '20 Oct 2026, 14:15',
    history: [
      {
        stage: 'Manufacturer',
        status: 'Registered',
        location: 'Nashik, Maharashtra',
        handler: 'NaturePure Foods',
        timestamp: '19 Oct 2026, 11:00',
        note: 'Product created and registered in tracking ledger.',
      },
      {
        stage: 'Distributor',
        status: 'In Transit',
        location: 'Nashik Regional Distribution Hub, Maharashtra',
        handler: 'Apex Express Logistics',
        timestamp: '20 Oct 2026, 14:15',
        note: 'Handover completed at Distributor stage.',
      },
    ],
  },
  {
    id: 'PT-14983',
    name: 'Premium Coffee Beans',
    manufacturer: 'Hilltop Coffee Co.',
    manufacturingDate: '2026-10-15',
    originLocation: 'Chikmagalur, Karnataka',
    stage: 'Manufacturer',
    status: 'Verified',
    isVerified: true,
    isDemo: true,
    updated: '17 Oct 2026, 16:45',
    history: [
      {
        stage: 'Manufacturer',
        status: 'Registered',
        location: 'Chikmagalur, Karnataka',
        handler: 'Hilltop Coffee Co.',
        timestamp: '15 Oct 2026, 10:20',
        note: 'Product created and registered in tracking ledger.',
      },
      {
        stage: 'Manufacturer',
        status: 'Verified',
        location: 'Chikmagalur Quality Lab, Karnataka',
        handler: 'Hilltop Coffee Co.',
        timestamp: '17 Oct 2026, 16:45',
        note: 'Origin authenticated and quality certified.',
      },
    ],
  },
  {
    id: 'PT-14985',
    name: 'Organic Turmeric Powder',
    manufacturer: 'SpiceRoot Organics',
    manufacturingDate: '2026-10-20',
    originLocation: 'Sangli, Maharashtra',
    stage: 'Distributor',
    status: 'In Transit',
    isDemo: true,
    updated: '21 Oct 2026, 11:50',
    history: [
      {
        stage: 'Manufacturer',
        status: 'Registered',
        location: 'Sangli, Maharashtra',
        handler: 'SpiceRoot Organics',
        timestamp: '20 Oct 2026, 08:45',
        note: 'Product created and registered in tracking ledger.',
      },
      {
        stage: 'Distributor',
        status: 'In Transit',
        location: 'Sangli Agro Logistics Terminal, Maharashtra',
        handler: 'Central Freight Logistics Co.',
        timestamp: '21 Oct 2026, 11:50',
        note: 'Handover completed at Distributor stage.',
      },
    ],
  },
  {
    id: 'PT-14986',
    name: 'Cold-Pressed Coconut Oil',
    manufacturer: 'Coastal Naturals',
    manufacturingDate: '2026-10-21',
    originLocation: 'Ratnagiri, Maharashtra',
    stage: 'Manufacturer',
    status: 'Registered',
    isDemo: true,
    updated: '21 Oct 2026, 09:15',
    history: [
      {
        stage: 'Manufacturer',
        status: 'Registered',
        location: 'Ratnagiri, Maharashtra',
        handler: 'Coastal Naturals',
        timestamp: '21 Oct 2026, 09:15',
        note: 'Product created and registered in tracking ledger.',
      },
    ],
  },
  {
    id: 'PT-14987',
    name: 'Whole Wheat Flour',
    manufacturer: 'GreenField Mills',
    manufacturingDate: '2026-10-17',
    originLocation: 'Kolhapur, Maharashtra',
    stage: 'Retailer',
    status: 'In Transit',
    isDemo: true,
    updated: '20 Oct 2026, 11:20',
    history: [
      {
        stage: 'Manufacturer',
        status: 'Registered',
        location: 'Kolhapur, Maharashtra',
        handler: 'GreenField Mills',
        timestamp: '17 Oct 2026, 10:00',
        note: 'Product created and registered in tracking ledger.',
      },
      {
        stage: 'Distributor',
        status: 'In Transit',
        location: 'Western Maharashtra Logistics Center, Kolhapur',
        handler: 'Sahyadri Supply Chain Ltd.',
        timestamp: '18 Oct 2026, 15:30',
        note: 'Handover completed at Distributor stage.',
      },
      {
        stage: 'Retailer',
        status: 'In Transit',
        location: 'City Mart Distribution Hub, Kolhapur',
        handler: 'Metro Retail Outlets',
        timestamp: '20 Oct 2026, 11:20',
        note: 'Handover completed at Retailer stage. In transit to retail shelves.',
      },
    ],
  },
  {
    id: 'PT-14988',
    name: 'Raw Cashew Nuts',
    manufacturer: 'Konkan Harvest',
    manufacturingDate: '2026-10-14',
    originLocation: 'Sindhudurg, Maharashtra',
    stage: 'Customer',
    status: 'Delivered',
    isDemo: true,
    updated: '19 Oct 2026, 17:30',
    history: [
      {
        stage: 'Manufacturer',
        status: 'Registered',
        location: 'Sindhudurg, Maharashtra',
        handler: 'Konkan Harvest',
        timestamp: '14 Oct 2026, 08:30',
        note: 'Product created and registered in tracking ledger.',
      },
      {
        stage: 'Distributor',
        status: 'In Transit',
        location: 'Konkan Agro Freight Hub, Sindhudurg',
        handler: 'Coastal Express Cargo',
        timestamp: '15 Oct 2026, 13:00',
        note: 'Handover completed at Distributor stage.',
      },
      {
        stage: 'Retailer',
        status: 'In Transit',
        location: 'Konkan Fresh Superstore, Sindhudurg',
        handler: 'Konkan Retail Enterprises',
        timestamp: '17 Oct 2026, 10:45',
        note: 'Handover completed at Retailer stage.',
      },
      {
        stage: 'Customer',
        status: 'Delivered',
        location: 'Residential Delivery, Malvan, Sindhudurg',
        handler: 'Home Direct Courier',
        timestamp: '19 Oct 2026, 17:30',
        note: 'Product delivered to end consumer.',
      },
    ],
  },
  {
    id: 'PT-14989',
    name: 'Dark Chocolate',
    manufacturer: 'CocoaCraft Foods',
    manufacturingDate: '2026-10-16',
    originLocation: 'Mumbai, Maharashtra',
    stage: 'Manufacturer',
    status: 'Verified',
    isVerified: true,
    isDemo: true,
    updated: '18 Oct 2026, 14:00',
    history: [
      {
        stage: 'Manufacturer',
        status: 'Registered',
        location: 'Mumbai, Maharashtra',
        handler: 'CocoaCraft Foods',
        timestamp: '16 Oct 2026, 11:15',
        note: 'Product created and registered in tracking ledger.',
      },
      {
        stage: 'Manufacturer',
        status: 'Verified',
        location: 'Mumbai Food Standards Inspection Facility, Maharashtra',
        handler: 'CocoaCraft Foods',
        timestamp: '18 Oct 2026, 14:00',
        note: 'Origin authenticated and batch verified.',
      },
    ],
  },
  {
    id: 'PT-14990',
    name: 'Basmati Rice',
    manufacturer: 'Golden Grain Farms',
    manufacturingDate: '2026-10-12',
    originLocation: 'Nashik, Maharashtra',
    stage: 'Customer',
    status: 'Delivered',
    isDemo: true,
    updated: '18 Oct 2026, 15:45',
    history: [
      {
        stage: 'Manufacturer',
        status: 'Registered',
        location: 'Nashik, Maharashtra',
        handler: 'Golden Grain Farms',
        timestamp: '12 Oct 2026, 09:00',
        note: 'Product created and registered in tracking ledger.',
      },
      {
        stage: 'Distributor',
        status: 'In Transit',
        location: 'North Maharashtra Agro Depot, Nashik',
        handler: 'Godavari Logistics Hub',
        timestamp: '13 Oct 2026, 16:20',
        note: 'Handover completed at Distributor stage.',
      },
      {
        stage: 'Retailer',
        status: 'In Transit',
        location: 'Reliance Fresh Retail Hub, Nashik',
        handler: 'Apex Retail Mart',
        timestamp: '16 Oct 2026, 11:10',
        note: 'Handover completed at Retailer stage.',
      },
      {
        stage: 'Customer',
        status: 'Delivered',
        location: 'Residential Delivery, Nashik',
        handler: 'QuickShip Courier',
        timestamp: '18 Oct 2026, 15:45',
        note: 'Product delivered to end consumer.',
      },
    ],
  },
  {
    id: 'PT-14991',
    name: 'Herbal Soap',
    manufacturer: 'PureLeaf Organics',
    manufacturingDate: '2026-10-21',
    originLocation: 'Pune, Maharashtra',
    stage: 'Manufacturer',
    status: 'Registered',
    isDemo: true,
    updated: '21 Oct 2026, 14:20',
    history: [
      {
        stage: 'Manufacturer',
        status: 'Registered',
        location: 'Pune, Maharashtra',
        handler: 'PureLeaf Organics',
        timestamp: '21 Oct 2026, 14:20',
        note: 'Product created and registered in tracking ledger.',
      },
    ],
  },
]

export const DEMO_PRODUCT_IDS = DEMO_PRODUCTS.map((p) => p.id)

export function getStoredProducts() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    let current = []

    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          current = parsed.filter(Boolean)
        }
      } catch (err) {
        console.error('Failed to parse primary storage data:', err)
      }
    }

    // 1. Data Recovery: Check legacy keys for existing user records
    let recoveredAny = false
    const existingIds = new Set(current.map((p) => (p?.id ? String(p.id).trim().toLowerCase() : '')))

    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      const legacyRaw = window.localStorage.getItem(legacyKey)
      if (legacyRaw) {
        try {
          const parsedLegacy = JSON.parse(legacyRaw)
          if (Array.isArray(parsedLegacy)) {
            parsedLegacy.filter(Boolean).forEach((item) => {
              const id = item?.id ? String(item.id).trim().toLowerCase() : ''
              if (id && !existingIds.has(id)) {
                current.push(item)
                existingIds.add(id)
                recoveredAny = true
              }
            })
          }
        } catch (err) {
          // ignore parsing error on legacy key
        }
      }
    }

    // 2. Auto-initialization / Default Demo Seeding:
    // If storage is completely empty and demo was not explicitly removed by user
    const demoRemoved = window.localStorage.getItem(DEMO_REMOVED_KEY) === 'true'
    if (current.length === 0 && !demoRemoved) {
      current = [...DEMO_PRODUCTS]
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
      } catch (err) {
        console.warn('Unable to seed default demo products to localStorage:', err)
      }
      return current
    }

    // If we recovered items from legacy keys, persist the merged list to STORAGE_KEY
    if (recoveredAny) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
      } catch (err) {
        console.warn('Unable to persist recovered products to primary storage:', err)
      }
    }

    return current
  } catch (err) {
    console.error('Failed to read products from localStorage:', err)
    return []
  }
}

export function getProductById(productId) {
  if (!productId) return null
  const normalized = String(productId).trim().toLowerCase()
  const products = getStoredProducts()
  return products.find((item) => (item?.id ? String(item.id).trim().toLowerCase() === normalized : false)) || null
}

export function isProductIdDuplicate(productId) {
  if (!productId) return false
  const normalized = String(productId).trim().toLowerCase()
  const current = getStoredProducts()
  return current.some((item) => (item?.id ? String(item.id).trim().toLowerCase() === normalized : false))
}

export function saveProduct(productInput) {
  const current = getStoredProducts()
  const normalizedId = String(productInput.productId || '').trim()

  if (!normalizedId) {
    return { success: false, error: 'Product ID is required.' }
  }

  if (current.some((item) => (item?.id ? String(item.id).trim().toLowerCase() === normalizedId.toLowerCase() : false))) {
    return { success: false, error: `Product ID "${normalizedId}" already exists.` }
  }

  const newProduct = {
    id: normalizedId,
    name: String(productInput.productName || '').trim(),
    manufacturer: String(productInput.manufacturer || '').trim(),
    manufacturingDate: productInput.manufacturingDate || '',
    originLocation: String(productInput.originLocation || '').trim(),
    stage: 'Manufacturer',
    status: 'Registered',
    updated: formatDateTime(new Date()),
    history: [
      {
        stage: 'Manufacturer',
        status: 'Registered',
        location: String(productInput.originLocation || '').trim(),
        handler: String(productInput.manufacturer || '').trim(),
        timestamp: formatDateTime(new Date()),
        note: 'Product created and registered in tracking ledger.',
      },
    ],
  }

  const updated = [newProduct, ...current]
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(
        new CustomEvent('producttrace_storage_update', {
          detail: { productId: newProduct.id, product: newProduct },
        })
      )
    }
  } catch (err) {
    console.error('Failed to write to localStorage:', err)
    return { success: false, error: 'Could not save product to browser storage.' }
  }

  return { success: true, product: newProduct }
}

export const STAGE_SEQUENCE = ['Manufacturer', 'Distributor', 'Retailer', 'Customer']

export const STAGE_TRANSITIONS = {
  Manufacturer: {
    nextStage: 'Distributor',
    nextStatus: 'In Transit',
    actionLabel: 'Transfer to Distributor',
    role: 'Logistics Partner',
    defaultLocationHint: 'e.g. Regional Freight Hub, Atlanta GA',
    defaultHandlerHint: 'e.g. Apex Freight Logistics Co.',
  },
  Distributor: {
    nextStage: 'Retailer',
    nextStatus: 'In Transit',
    actionLabel: 'Transfer to Retail Store',
    role: 'Store Merchant',
    defaultLocationHint: 'e.g. Metro Retail Warehouse, Chicago IL',
    defaultHandlerHint: 'e.g. Midwest Retail Distribution LLC',
  },
  Retailer: {
    nextStage: 'Customer',
    nextStatus: 'Delivered',
    actionLabel: 'Deliver to End Consumer',
    role: 'End Consumer',
    defaultLocationHint: 'e.g. 742 Evergreen Terrace, Springfield',
    defaultHandlerHint: 'e.g. Consumer Direct Handover',
  },
}

export function getNextStageInfo(currentStage) {
  if (!currentStage) return null
  return STAGE_TRANSITIONS[currentStage] || null
}

export function recordHandover({ productId, receivingParty, location, notes = '' }) {
  if (!productId) {
    return { success: false, error: 'Product ID is required.' }
  }

  const current = getStoredProducts()
  const normalizedId = String(productId).trim().toLowerCase()
  const index = current.findIndex((item) => (item?.id ? String(item.id).trim().toLowerCase() === normalizedId : false))

  if (index === -1) {
    return { success: false, error: `Product with ID "${productId}" not found in registry.` }
  }

  const product = current[index]
  const currentStage = product.stage || 'Manufacturer'

  // Check if journey is already completed
  if (currentStage === 'Customer' && product.status === 'Delivered') {
    return {
      success: false,
      error: 'Product has already completed all supply-chain stages (Delivered to Customer). No further handovers can be recorded.',
    }
  }

  const transition = STAGE_TRANSITIONS[currentStage]
  if (!transition) {
    return {
      success: false,
      error: `Cannot advance product from unsupported stage "${currentStage}".`,
    }
  }

  const trimmedHandler = String(receivingParty || '').trim()
  if (!trimmedHandler) {
    return { success: false, error: 'Receiving party / organization name is required.' }
  }

  const trimmedLocation = String(location || '').trim()
  if (!trimmedLocation) {
    return { success: false, error: 'Handover location is required.' }
  }

  const trimmedNotes = String(notes || '').trim()

  // Prevent duplicate milestone
  const existingMilestones = Array.isArray(product.history) ? product.history : []
  const isDuplicate = existingMilestones.some((m) => m?.stage === transition.nextStage)
  if (isDuplicate) {
    return {
      success: false,
      error: `Handover milestone for "${transition.nextStage}" has already been recorded.`,
    }
  }

  const timestamp = formatDateTime(new Date())
  const newEntry = {
    stage: transition.nextStage,
    status: transition.nextStatus,
    location: trimmedLocation,
    handler: trimmedHandler,
    timestamp,
    note: trimmedNotes || `Handover completed at ${transition.nextStage} stage.`,
  }

  const updatedProduct = {
    ...product,
    stage: transition.nextStage,
    status: transition.nextStatus,
    updated: timestamp,
    history: [...existingMilestones, newEntry],
  }

  const updatedList = [...current]
  updatedList[index] = updatedProduct

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList))
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(
        new CustomEvent('producttrace_storage_update', {
          detail: { productId: product.id, updatedProduct },
        })
      )
    }
  } catch (err) {
    console.error('Failed to update product in localStorage:', err)
    return { success: false, error: 'Could not write handover record to browser storage.' }
  }

  return { success: true, product: updatedProduct, transition }
}

export function updateProductStage(productId, newStage, newStatus, location = '', handler = '') {
  return recordHandover({
    productId,
    receivingParty: handler,
    location,
    notes: `Handover recorded at ${newStage} milestone.`,
  })
}

// Generates a deterministic simulated hash for demonstrating cryptographic tamper-evidence
export function generateRecordFingerprint(product) {
  if (!product) return ''
  const str = `${product.id}|${product.name}|${product.manufacturer}|${product.manufacturingDate}|${product.originLocation}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0')
  return `0x${hex}7f8e3c${hex}9b2d4a1e6f0c8a5d`
}

export function getActivityHistory() {
  const products = getStoredProducts()
  const activities = []

  products.forEach((product) => {
    if (!product || !product.id) return

    if (Array.isArray(product.history) && product.history.length > 0) {
      product.history.forEach((milestone, idx) => {
        if (!milestone) return
        const isRegistration = milestone.stage === 'Manufacturer' && idx === 0
        activities.push({
          id: `${product.id}-${milestone.stage}-${milestone.timestamp || idx}`,
          productId: product.id,
          productName: product.name || 'Unnamed Product',
          action: isRegistration ? 'Product Registered' : `Handover to ${milestone.stage}`,
          type: isRegistration ? 'registration' : 'handover',
          stage: milestone.stage || product.stage || 'Manufacturer',
          status: milestone.status || (isRegistration ? 'Registered' : 'In Transit'),
          location: milestone.location || product.originLocation || '',
          handler: milestone.handler || (isRegistration ? product.manufacturer : ''),
          timestamp: milestone.timestamp || product.updated || '',
          notes: milestone.note || '',
        })
      })
    } else {
      // Fallback for any product without history array
      activities.push({
        id: `${product.id}-initial`,
        productId: product.id,
        productName: product.name || 'Unnamed Product',
        action: 'Product Registered',
        type: 'registration',
        stage: product.stage || 'Manufacturer',
        status: product.status || 'Registered',
        location: product.originLocation || '',
        handler: product.manufacturer || '',
        timestamp: product.manufacturingDate || product.updated || '',
        notes: 'Product created and registered in tracking ledger.',
      })
    }
  })

  // Sort chronologically descending (newest first)
  activities.sort((a, b) => {
    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0
    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0
    if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
      return timeB - timeA
    }
    return 0
  })

  return activities
}

export function hasDemoProducts() {
  const current = getStoredProducts()
  const demoIdsLower = new Set(DEMO_PRODUCT_IDS.map((id) => id.toLowerCase()))
  return current.some((item) => item?.isDemo === true || (item?.id && demoIdsLower.has(String(item.id).trim().toLowerCase())))
}

export function loadDemoProducts() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(DEMO_REMOVED_KEY)
  }
  const current = getStoredProducts()
  const existingIds = new Set(current.map((item) => (item?.id ? String(item.id).trim().toLowerCase() : '')))

  const toAdd = DEMO_PRODUCTS.filter((dp) => !existingIds.has(dp.id.toLowerCase()))

  if (toAdd.length === 0) {
    return {
      success: false,
      alreadyLoaded: true,
      addedCount: 0,
      message: 'All 10 demo products are already loaded in the ledger.',
    }
  }

  const updated = [...current, ...toAdd]

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(
        new CustomEvent('producttrace_storage_update', {
          detail: { action: 'load_demo', count: toAdd.length },
        })
      )
    }
  } catch (err) {
    console.error('Failed to write demo products to localStorage:', err)
    return { success: false, error: 'Could not save demo products to browser storage.' }
  }

  return {
    success: true,
    addedCount: toAdd.length,
    message: `Loaded ${toAdd.length} demo product${toAdd.length === 1 ? '' : 's'} successfully.`,
  }
}

export function removeDemoProducts() {
  const current = getStoredProducts()
  const demoIdsLower = new Set(DEMO_PRODUCT_IDS.map((id) => id.toLowerCase()))

  const filtered = current.filter((item) => {
    if (!item || !item.id) return false
    if (item.isDemo === true) return false
    if (demoIdsLower.has(String(item.id).trim().toLowerCase())) return false
    return true
  })

  const removedCount = current.length - filtered.length
  if (removedCount === 0) {
    return {
      success: false,
      removedCount: 0,
      message: 'No demo products found to remove.',
    }
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    window.localStorage.setItem(DEMO_REMOVED_KEY, 'true')
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(
        new CustomEvent('producttrace_storage_update', {
          detail: { action: 'remove_demo', count: removedCount },
        })
      )
    }
  } catch (err) {
    console.error('Failed to update localStorage when removing demo products:', err)
    return { success: false, error: 'Could not remove demo products from browser storage.' }
  }

  return {
    success: true,
    removedCount,
    message: `Removed ${removedCount} demo product${removedCount === 1 ? '' : 's'}. Real product records preserved.`,
  }
}
