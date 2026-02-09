import { products as mockProducts, orders as mockOrders, addresses as mockAddresses } from './mock-data.js'

const STORAGE_KEYS = {
  PRODUCTS: 'mall_h5_products',
  ORDERS: 'mall_h5_orders',
  CART: 'mall_h5_cart',
  ADDRESSES: 'mall_h5_addresses',
  USER: 'mall_user'
}

export function getProducts() {
  const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(mockProducts))
    return mockProducts
  }
  return JSON.parse(stored)
}

export function getOrders() {
  const stored = localStorage.getItem(STORAGE_KEYS.ORDERS)
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(mockOrders))
    return mockOrders
  }
  return JSON.parse(stored)
}

export function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders))
}

export function getCart() {
  const stored = localStorage.getItem(STORAGE_KEYS.CART)
  if (!stored) {
    return []
  }
  return JSON.parse(stored)
}

export function saveCart(cart) {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart))
}

export function getAddresses() {
  const stored = localStorage.getItem(STORAGE_KEYS.ADDRESSES)
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(mockAddresses))
    return mockAddresses
  }
  return JSON.parse(stored)
}

export function saveAddresses(addresses) {
  localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(addresses))
}

export function getUser() {
  const stored = localStorage.getItem(STORAGE_KEYS.USER)
  if (!stored) {
    return null
  }
  return JSON.parse(stored)
}

export function saveUser(user) {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
}

export function isLoggedIn() {
  return !!localStorage.getItem(STORAGE_KEYS.USER)
}

export function logout() {
  localStorage.removeItem(STORAGE_KEYS.USER)
}
