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
  } catch (err) {
    console.error('Failed to write to localStorage:', err)
    return { success: false, error: 'Could not save product to browser storage.' }
  }

  return { success: true, product: newProduct }
}

export function updateProductStage(productId, newStage, newStatus, location = '', handler = '') {
  const current = getStoredProducts()
  const normalizedId = String(productId).trim().toLowerCase()
  const index = current.findIndex((item) => (item?.id ? String(item.id).trim().toLowerCase() === normalizedId : false))

  if (index === -1) {
    return { success: false, error: 'Product not found.' }
  }

  const existing = current[index]
  const timestamp = formatDateTime(new Date())

  const historyEntry = {
    stage: newStage,
    status: newStatus,
    location: location || existing.originLocation || 'Regional Facility',
    handler: handler || `${newStage} Operations`,
    timestamp,
    note: `Handover recorded at ${newStage} milestone.`,
  }

  const updatedProduct = {
    ...existing,
    stage: newStage,
    status: newStatus,
    updated: timestamp,
    history: existing.history ? [...existing.history, historyEntry] : [historyEntry],
  }

  const updatedList = [...current]
  updatedList[index] = updatedProduct

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList))
  } catch (err) {
    console.error('Failed to update product in localStorage:', err)
    return { success: false, error: 'Could not update product record.' }
  }

  return { success: true, product: updatedProduct }
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
