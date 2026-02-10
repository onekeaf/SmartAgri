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
    // Inject mock orders
    const mockOrdersList = [
      {
        order_id: "ORD20231027001",
        status: "pending_payment",
        total_amount: 58.00,
        created_at: "2023-10-27 10:00:00",
        products: [
          {
            product_id: 3,
            product_name: "绿色青菜 500g",
            price: 5.00,
            quantity: 2,
            image: "/images/banners/banner3.jpg",
            specification: "500g/把"
          },
          {
            product_id: 1,
            product_name: "有机草莓 500g",
            price: 29.9,
            quantity: 1,
            image: "/images/banners/banner1.jpg",
            specification: "盒装"
          }
        ]
      },
      {
        order_id: "ORD20231026002",
        status: "completed",
        total_amount: 128.50,
        created_at: "2023-10-26 14:30:00",
        products: [
          {
            product_id: 4,
            product_name: "五常大米 5kg",
            price: 68.00,
            quantity: 1,
            image: "/images/banners/banner2.jpg",
            specification: "5kg/袋"
          }
        ]
      }
    ]
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(mockOrdersList))
    return mockOrdersList
  }
  return JSON.parse(stored)
}

export function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders))
}

export function getCart() {
  const stored = localStorage.getItem(STORAGE_KEYS.CART)
  if (!stored) {
    // Inject mock data if cart is empty
    const mockCart = [
      {
        product_id: 1,
        product_name: "有机草莓 500g",
        price: 29.9,
        quantity: 2,
        stock: 50,
        image: "/images/banners/banner1.jpg",
        specification: "盒装",
        checked: true
      },
      {
        product_id: 2,
        product_name: "本地西红柿 1kg",
        price: 8.5,
        quantity: 1,
        stock: 100,
        image: "/images/banners/banner2.jpg",
        specification: "散装",
        checked: false
      }
    ]
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(mockCart))
    return mockCart
  }
  return JSON.parse(stored)
}

export function saveCart(cart) {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart))
}

export function addToCart(product) {
  const cart = getCart()
  const existingItem = cart.find(item => item.product_id === product.product_id)
  
  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.push({
      ...product,
      quantity: 1,
      selected: true
    })
  }
  
  saveCart(cart)
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
