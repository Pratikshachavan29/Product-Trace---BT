const STORAGE_KEY = 'producttrace_products'

export const DEFAULT_PRODUCTS = [
  {
    id: 'PT-10482',
    name: 'Organic Green Tea',
    manufacturer: 'Kyoto Farms Co.',
    manufacturingDate: '2026-10-10',
    originLocation: 'Kyoto, Japan',
    stage: 'Retailer',
    updated: '21 Oct 2026, 14:20',
    status: 'In Transit',
  },
  {
    id: 'PT-10471',
    name: 'Organic Cotton T-Shirts',
    manufacturer: 'Heritage Loom Works',
    manufacturingDate: '2026-10-08',
    originLocation: 'Coimbatore, India',
    stage: 'Distributor',
    updated: '20 Oct 2026, 09:45',
    status: 'In Transit',
  },
  {
    id: 'PT-10455',
    name: 'Extra Virgin Olive Oil',
    manufacturer: 'Tuscan Groves Estate',
    manufacturingDate: '2026-10-05',
    originLocation: 'Florence, Italy',
    stage: 'Customer',
    updated: '19 Oct 2026, 18:05',
    status: 'Delivered',
  },
  {
    id: 'PT-10440',
    name: 'Wireless Headphones',
    manufacturer: 'Aura Sound Technologies',
    manufacturingDate: '2026-10-02',
    originLocation: 'Taipei, Taiwan',
    stage: 'Manufacturer',
    updated: '18 Oct 2026, 11:12',
    status: 'Registered',
  },
  {
    id: 'PT-10428',
    name: 'Herbal Shampoo 250ml',
    manufacturer: 'Botanica Care Ltd.',
    manufacturingDate: '2026-09-28',
    originLocation: 'Marseille, France',
    stage: 'Retailer',
    updated: '17 Oct 2026, 16:38',
    status: 'Verified',
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
  if (typeof window === 'undefined') return DEFAULT_PRODUCTS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS))
      return DEFAULT_PRODUCTS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : DEFAULT_PRODUCTS
  } catch (err) {
    console.error('Failed to read products from localStorage:', err)
    return DEFAULT_PRODUCTS
  }
}

export function isProductIdDuplicate(productId) {
  if (!productId) return false
  const normalized = productId.trim().toLowerCase()
  const current = getStoredProducts()
  return current.some((item) => item.id.trim().toLowerCase() === normalized)
}

export function saveProduct(productInput) {
  const current = getStoredProducts()
  const normalizedId = productInput.productId.trim()

  if (current.some((item) => item.id.trim().toLowerCase() === normalizedId.toLowerCase())) {
    return { success: false, error: `Product ID "${normalizedId}" already exists.` }
  }

  const newProduct = {
    id: normalizedId,
    name: productInput.productName.trim(),
    manufacturer: productInput.manufacturer.trim(),
    manufacturingDate: productInput.manufacturingDate,
    originLocation: productInput.originLocation.trim(),
    stage: 'Manufacturer',
    status: 'Registered',
    updated: formatDateTime(new Date()),
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
