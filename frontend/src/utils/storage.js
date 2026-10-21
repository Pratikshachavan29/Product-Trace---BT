const STORAGE_KEY = 'producttrace_products'

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

export function getStoredProducts() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(Boolean) : []
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
