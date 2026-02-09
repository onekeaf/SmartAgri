// 商城模拟数据

// 分类数据
const mockCategories = [
  { id: 1, name: '全部' },
  { id: 2, name: '蔬菜' },
  { id: 3, name: '水果' },
  { id: 4, name: '粮食' },
  { id: 5, name: '其他' }
];

// 商品数据（20个）
const mockProducts = [
  // 蔬菜类（5个）
  {
    product_id: 1,
    product_name: '有机小白菜',
    category: '蔬菜',
    price: 5.80,
    original_price: 7.50,
    images: ['/assets/images/products/product1.jpg'],
    description: '新鲜有机小白菜，无农药种植，口感清脆，营养丰富。',
    specification: '500g/份',
    stock: 150,
    sales: 89,
    origin: '山东寿光',
    farmer: {
      farmer_id: 101,
      farmer_name: '张农户',
      farmer_avatar: '/assets/images/avatars/farmer1.jpg',
      verified: true
    },
    status: 'on_sale',
    created_at: '2025-01-15 10:30:00',
    updated_at: '2025-01-20 15:20:00'
  },
  {
    product_id: 2,
    product_name: '本地胡萝卜',
    category: '蔬菜',
    price: 4.50,
    original_price: 6.00,
    images: ['/assets/images/products/product2.jpg'],
    description: '本地新鲜胡萝卜，色泽鲜艳，富含胡萝卜素。',
    specification: '1kg/份',
    stock: 200,
    sales: 156,
    origin: '河南郑州',
    farmer: {
      farmer_id: 102,
      farmer_name: '李农户',
      farmer_avatar: '/assets/images/avatars/farmer2.jpg',
      verified: true
    },
    status: 'on_sale',
    created_at: '2025-01-10 08:00:00',
    updated_at: '2025-01-18 14:30:00'
  },
  {
    product_id: 3,
    product_name: '有机西兰花',
    category: '蔬菜',
    price: 8.90,
    original_price: 12.00,
    images: ['/assets/images/products/product3.jpg'],
    description: '优质有机西兰花，绿色健康，维生素C含量高。',
    specification: '400g/份',
    stock: 80,
    sales: 67,
    origin: '江苏徐州',
    farmer: {
      farmer_id: 103,
      farmer_name: '王农户',
      farmer_avatar: '/assets/images/avatars/farmer3.jpg',
      verified: true
    },
    status: 'on_sale',
    created_at: '2025-01-12 11:45:00',
    updated_at: '2025-01-19 09:15:00'
  },
  {
    product_id: 4,
    product_name: '新鲜黄瓜',
    category: '蔬菜',
    price: 3.50,
    original_price: 5.00,
    images: ['/assets/images/products/product4.jpg'],
    description: '脆嫩爽口的新鲜黄瓜，清热解暑，适合凉拌。',
    specification: '600g/份',
    stock: 180,
    sales: 234,
    origin: '山东聊城',
    farmer: {
      farmer_id: 104,
      farmer_name: '赵农户',
      farmer_avatar: '/assets/images/avatars/farmer4.jpg',
      verified: false
    },
    status: 'on_sale',
    created_at: '2025-01-08 07:20:00',
    updated_at: '2025-01-17 16:40:00'
  },
  {
    product_id: 5,
    product_name: '有机菠菜',
    category: '蔬菜',
    price: 6.20,
    original_price: 8.00,
    images: ['/assets/images/products/product5.jpg'],
    description: '新鲜有机菠菜，叶片翠绿，富含铁元素。',
    specification: '450g/份',
    stock: 120,
    sales: 98,
    origin: '河北石家庄',
    farmer: {
      farmer_id: 105,
      farmer_name: '孙农户',
      farmer_avatar: '/assets/images/avatars/farmer5.jpg',
      verified: true
    },
    status: 'on_sale',
    created_at: '2025-01-14 13:10:00',
    updated_at: '2025-01-21 10:50:00'
  },
  // 水果类（5个）
  {
    product_id: 6,
    product_name: '红富士苹果',
    category: '水果',
    price: 12.80,
    original_price: 15.00,
    images: ['/assets/images/products/product6.jpg'],
    description: '正宗红富士苹果，甜脆多汁，果香浓郁。',
    specification: '1.5kg/份',
    stock: 100,
    sales: 312,
    origin: '陕西延安',
    farmer: {
      farmer_id: 106,
      farmer_name: '周农户',
      farmer_avatar: '/assets/images/avatars/farmer6.jpg',
      verified: true
    },
    status: 'on_sale',
    created_at: '2025-01-05 09:00:00',
    updated_at: '2025-01-20 14:00:00'
  },
  {
    product_id: 7,
    product_name: '海南香蕉',
    category: '水果',
    price: 7.50,
    original_price: 9.50,
    images: ['/assets/images/products/product7.jpg'],
    description: '海南热带香蕉，香甜软糯，营养丰富。',
    specification: '1kg/份',
    stock: 150,
    sales: 267,
    origin: '海南三亚',
    farmer: {
      farmer_id: 107,
      farmer_name: '吴农户',
      farmer_avatar: '/assets/images/avatars/farmer7.jpg',
      verified: true
    },
    status: 'on_sale',
    created_at: '2025-01-07 10:15:00',
    updated_at: '2025-01-18 11:30:00'
  },
  {
    product_id: 8,
    product_name: '新疆哈密瓜',
    category: '水果',
    price: 18.50,
    original_price: 22.00,
    images: ['/assets/images/products/product8.jpg'],
    description: '新疆哈密瓜，果肉金黄，甜蜜可口。',
    specification: '2kg/个',
    stock: 60,
    sales: 145,
    origin: '新疆吐鲁番',
    farmer: {
      farmer_id: 108,
      farmer_name: '郑农户',
      farmer_avatar: '/assets/images/avatars/farmer8.jpg',
      verified: true
    },
    status: 'on_sale',
    created_at: '2025-01-11 12:00:00',
    updated_at: '2025-01-19 15:45:00'
  },
  {
    product_id: 9,
    product_name: '四川柑橘',
    category: '水果',
    price: 9.90,
    original_price: 12.50,
    images: ['/assets/images/products/product9.jpg'],
    description: '四川优质柑橘，汁多味甜，维生素C丰富。',
    specification: '1.2kg/份',
    stock: 130,
    sales: 189,
    origin: '四川成都',
    farmer: {
      farmer_id: 109,
      farmer_name: '冯农户',
      farmer_avatar: '/assets/images/avatars/farmer9.jpg',
      verified: false
    },
    status: 'on_sale',
    created_at: '2025-01-09 08:30:00',
    updated_at: '2025-01-16 13:20:00'
  },
  {
    product_id: 10,
    product_name: '云南蓝莓',
    category: '水果',
    price: 28.00,
    original_price: 35.00,
    images: ['/assets/images/products/product10.jpg'],
    description: '云南高原蓝莓，新鲜饱满，抗氧化能力强。',
    specification: '125g/盒',
    stock: 90,
    sales: 78,
    origin: '云南昆明',
    farmer: {
      farmer_id: 110,
      farmer_name: '陈农户',
      farmer_avatar: '/assets/images/avatars/farmer10.jpg',
      verified: true
    },
    status: 'on_sale',
    created_at: '2025-01-13 14:20:00',
    updated_at: '2025-01-21 09:40:00'
  },
  // 粮食类（5个）
  {
    product_id: 11,
    product_name: '东北大米',
    category: '粮食',
    price: 45.00,
    original_price: 55.00,
    images: ['/assets/images/products/product11.jpg'],
    description: '东北优质大米，颗粒饱满，米香浓郁。',
    specification: '5kg/袋',
    stock: 50,
    sales: 423,
    origin: '黑龙江五常',
    farmer: {
      farmer_id: 111,
      farmer_name: '褚农户',
      farmer_avatar: '/assets/images/avatars/farmer1.jpg',
      verified: true
    },
    status: 'on_sale',
    created_at: '2025-01-03 07:00:00',
    updated_at: '2025-01-20 10:00:00'
  },
  {
    product_id: 12,
    product_name: '山西小米',
    category: '粮食',
    price: 32.00,
    original_price: 40.00,
    images: ['/assets/images/products/product12.jpg'],
    description: '山西特产小米，金黄透亮，营养价值高。',
    specification: '2.5kg/袋',
    stock: 70,
    sales: 198,
    origin: '山西吕梁',
    farmer: {
      farmer_id: 112,
      farmer_name: '卫农户',
      farmer_avatar: '/assets/images/avatars/farmer2.jpg',
      verified: true
    },
    status: 'on_sale',
    created_at: '2025-01-06 11:00:00',
    updated_at: '2025-01-17 14:30:00'
  },
  {
    product_id: 13,
    product_name: '河北玉米',
    category: '粮食',
    price: 18.50,
    original_price: 24.00,
    images: ['/assets/images/products/product13.jpg'],
    description: '河北优质玉米，颗粒饱满，香甜可口。',
    specification: '2kg/袋',
    stock: 80,
    sales: 267,
    origin: '河北保定',
    farmer: {
      farmer_id: 113,
      farmer_name: '蒋农户',
      farmer_avatar: '/assets/images/avatars/farmer3.jpg',
      verified: false
    },
    status: 'on_sale',
    created_at: '2025-01-04 09:30:00',
    updated_at: '2025-01-18 12:00:00'
  },
  {
    product_id: 14,
    product_name: '湖北绿豆',
    category: '粮食',
    price: 28.00,
    original_price: 35.00,
    images: ['/assets/images/products/product14.jpg'],
    description: '湖北优质绿豆，颗粒均匀，清热解毒。',
    specification: '1kg/袋',
    stock: 60,
    sales: 156,
    origin: '湖北荆州',
    farmer: {
      farmer_id: 114,
      farmer_name: '沈农户',
      farmer_avatar: '/assets/images/avatars/farmer4.jpg',
      verified: true
    },
    status: 'on_sale',
    created_at: '2025-01-08 10:45:00',
    updated_at: '2025-01-19 15:15:00'
  },
  {
    product_id: 15,
    product_name: '河南黄豆',
    category: '粮食',
    price: 22.00,
    original_price: 28.00,
    images: ['/assets/images/products/product15.jpg'],
    description: '河南优质黄豆，蛋白质含量高，适合制作豆腐。',
    specification: '1.5kg/袋',
    stock: 75,
    sales: 189,
    origin: '河南周口',
    farmer: {
      farmer_id: 115,
      farmer_name: '韩农户',
      farmer_avatar: '/assets/images/avatars/farmer5.jpg',
      verified: true
    },
    status: 'on_sale',
    created_at: '2025-01-10 08:15:00',
    updated_at: '2025-01-16 11:40:00'
  },
  // 其他类（5个）
  {
    product_id: 16,
    product_name: '土鸡蛋',
    category: '其他',
    price: 35.00,
    original_price: 42.00,
    images: ['/assets/images/products/product16.jpg'],
    description: '农家散养土鸡蛋，营养丰富，口感醇厚。',
    specification: '30枚/盒',
    stock: 40,
    sales: 345,
    origin: '湖南岳阳',
    farmer: {
      farmer_id: 116,
      farmer_name: '杨农户',
      farmer_avatar: '/assets/images/avatars/farmer6.jpg',
      verified: true
    },
    status: 'on_sale',
    created_at: '2025-01-02 06:00:00',
    updated_at: '2025-01-20 08:00:00'
  },
  {
    product_id: 17,
    product_name: '纯天然蜂蜜',
    category: '其他',
    price: 68.00,
    original_price: 85.00,
    images: ['/assets/images/products/product17.jpg'],
    description: '纯天然野花蜂蜜，色泽金黄，香甜纯正。',
    specification: '500g/瓶',
    stock: 30,
    sales: 123,
    origin: '云南大理',
    farmer: {
      farmer_id: 117,
      farmer_name: '朱农户',
      farmer_avatar: '/assets/images/avatars/farmer7.jpg',
      verified: true
    },
    status: 'on_sale',
    created_at: '2025-01-15 14:00:00',
    updated_at: '2025-01-21 16:30:00'
  },
  {
    product_id: 18,
    product_name: '有机茶叶',
    category: '其他',
    price: 88.00,
    original_price: 120.00,
    images: ['/assets/images/products/product18.jpg'],
    description: '高山有机绿茶，清香回甘，汤色清澈。',
    specification: '250g/罐',
    stock: 25,
    sales: 87,
    origin: '浙江杭州',
    farmer: {
      farmer_id: 118,
      farmer_name: '秦农户',
      farmer_avatar: '/assets/images/avatars/farmer8.jpg',
      verified: true
    },
    status: 'on_sale',
    created_at: '2025-01-12 09:00:00',
    updated_at: '2025-01-19 13:00:00'
  },
  {
    product_id: 19,
    product_name: '农家腊肉',
    category: '其他',
    price: 55.00,
    original_price: 68.00,
    images: ['/assets/images/products/product19.jpg'],
    description: '传统工艺农家腊肉，色泽红润，香味浓郁。',
    specification: '500g/份',
    stock: 35,
    sales: 156,
    origin: '四川绵阳',
    farmer: {
      farmer_id: 119,
      farmer_name: '尤农户',
      farmer_avatar: '/assets/images/avatars/farmer9.jpg',
      verified: false
    },
    status: 'on_sale',
    created_at: '2025-01-11 10:30:00',
    updated_at: '2025-01-18 14:45:00'
  },
  {
    product_id: 20,
    product_name: '手工豆腐',
    category: '其他',
    price: 8.00,
    original_price: 10.00,
    images: ['/assets/images/products/product20.jpg'],
    description: '传统工艺手工豆腐，细嫩爽滑，豆香浓郁。',
    specification: '400g/块',
    stock: 45,
    sales: 234,
    origin: '安徽黄山',
    farmer: {
      farmer_id: 120,
      farmer_name: '许农户',
      farmer_avatar: '/assets/images/avatars/farmer10.jpg',
      verified: true
    },
    status: 'on_sale',
    created_at: '2025-01-14 07:30:00',
    updated_at: '2025-01-21 09:00:00'
  }
];

// 订单数据（10个，包含不同状态）
const mockOrders = [
  {
    order_id: 'ORD20250121001',
    user_id: 'USER001',
    products: [
      {
        product_id: 1,
        product_name: '有机小白菜',
        price: 5.80,
        quantity: 2,
        image: '/assets/images/products/product1.jpg'
      },
      {
        product_id: 6,
        product_name: '红富士苹果',
        price: 12.80,
        quantity: 1,
        image: '/assets/images/products/product6.jpg'
      }
    ],
    total_amount: 24.40,
    shipping_fee: 5.00,
    address: {
      id: 1,
      name: '张三',
      phone: '13800138001',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detail: '建国路88号',
      is_default: true
    },
    status: 'pending_payment',
    created_at: '2025-01-21 10:30:00',
    payment_method: 'wechat'
  },
  {
    order_id: 'ORD20250120001',
    user_id: 'USER001',
    products: [
      {
        product_id: 11,
        product_name: '东北大米',
        price: 45.00,
        quantity: 1,
        image: '/assets/images/products/product11.jpg'
      }
    ],
    total_amount: 50.00,
    shipping_fee: 5.00,
    address: {
      id: 1,
      name: '张三',
      phone: '13800138001',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detail: '建国路88号',
      is_default: true
    },
    status: 'pending_shipment',
    created_at: '2025-01-20 15:20:00',
    payment_method: 'alipay'
  },
  {
    order_id: 'ORD20250119001',
    user_id: 'USER001',
    products: [
      {
        product_id: 7,
        product_name: '海南香蕉',
        price: 7.50,
        quantity: 2,
        image: '/assets/images/products/product7.jpg'
      },
      {
        product_id: 16,
        product_name: '土鸡蛋',
        price: 35.00,
        quantity: 1,
        image: '/assets/images/products/product16.jpg'
      }
    ],
    total_amount: 55.00,
    shipping_fee: 5.00,
    address: {
      id: 2,
      name: '李四',
      phone: '13800138002',
      province: '上海市',
      city: '上海市',
      district: '浦东新区',
      detail: '陆家嘴环路1000号',
      is_default: false
    },
    status: 'pending_receipt',
    created_at: '2025-01-19 09:15:00',
    payment_method: 'wechat'
  },
  {
    order_id: 'ORD20250118001',
    user_id: 'USER001',
    products: [
      {
        product_id: 8,
        product_name: '新疆哈密瓜',
        price: 18.50,
        quantity: 1,
        image: '/assets/images/products/product8.jpg'
      }
    ],
    total_amount: 23.50,
    shipping_fee: 5.00,
    address: {
      id: 1,
      name: '张三',
      phone: '13800138001',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detail: '建国路88号',
      is_default: true
    },
    status: 'completed',
    created_at: '2025-01-18 14:30:00',
    payment_method: 'alipay'
  },
  {
    order_id: 'ORD20250117001',
    user_id: 'USER001',
    products: [
      {
        product_id: 2,
        product_name: '本地胡萝卜',
        price: 4.50,
        quantity: 3,
        image: '/assets/images/products/product2.jpg'
      },
      {
        product_id: 3,
        product_name: '有机西兰花',
        price: 8.90,
        quantity: 2,
        image: '/assets/images/products/product3.jpg'
      }
    ],
    total_amount: 36.80,
    shipping_fee: 5.00,
    address: {
      id: 3,
      name: '王五',
      phone: '13800138003',
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      detail: '科技园南区',
      is_default: false
    },
    status: 'completed',
    created_at: '2025-01-17 11:20:00',
    payment_method: 'wechat'
  },
  {
    order_id: 'ORD20250116001',
    user_id: 'USER001',
    products: [
      {
        product_id: 17,
        product_name: '纯天然蜂蜜',
        price: 68.00,
        quantity: 1,
        image: '/assets/images/products/product17.jpg'
      }
    ],
    total_amount: 73.00,
    shipping_fee: 5.00,
    address: {
      id: 1,
      name: '张三',
      phone: '13800138001',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detail: '建国路88号',
      is_default: true
    },
    status: 'cancelled',
    created_at: '2025-01-16 16:45:00',
    payment_method: 'alipay'
  },
  {
    order_id: 'ORD20250115001',
    user_id: 'USER001',
    products: [
      {
        product_id: 12,
        product_name: '山西小米',
        price: 32.00,
        quantity: 1,
        image: '/assets/images/products/product12.jpg'
      },
      {
        product_id: 14,
        product_name: '湖北绿豆',
        price: 28.00,
        quantity: 1,
        image: '/assets/images/products/product14.jpg'
      }
    ],
    total_amount: 70.00,
    shipping_fee: 5.00,
    address: {
      id: 2,
      name: '李四',
      phone: '13800138002',
      province: '上海市',
      city: '上海市',
      district: '浦东新区',
      detail: '陆家嘴环路1000号',
      is_default: false
    },
    status: 'completed',
    created_at: '2025-01-15 10:00:00',
    payment_method: 'wechat'
  },
  {
    order_id: 'ORD20250114001',
    user_id: 'USER001',
    products: [
      {
        product_id: 9,
        product_name: '四川柑橘',
        price: 9.90,
        quantity: 2,
        image: '/assets/images/products/product9.jpg'
      }
    ],
    total_amount: 24.80,
    shipping_fee: 5.00,
    address: {
      id: 1,
      name: '张三',
      phone: '13800138001',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detail: '建国路88号',
      is_default: true
    },
    status: 'completed',
    created_at: '2025-01-14 13:30:00',
    payment_method: 'alipay'
  },
  {
    order_id: 'ORD20250113001',
    user_id: 'USER001',
    products: [
      {
        product_id: 10,
        product_name: '云南蓝莓',
        price: 28.00,
        quantity: 2,
        image: '/assets/images/products/product10.jpg'
      }
    ],
    total_amount: 61.00,
    shipping_fee: 5.00,
    address: {
      id: 3,
      name: '王五',
      phone: '13800138003',
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      detail: '科技园南区',
      is_default: false
    },
    status: 'pending_shipment',
    created_at: '2025-01-13 15:10:00',
    payment_method: 'wechat'
  },
  {
    order_id: 'ORD20250112001',
    user_id: 'USER001',
    products: [
      {
        product_id: 19,
        product_name: '农家腊肉',
        price: 55.00,
        quantity: 1,
        image: '/assets/images/products/product19.jpg'
      },
      {
        product_id: 18,
        product_name: '有机茶叶',
        price: 88.00,
        quantity: 1,
        image: '/assets/images/products/product18.jpg'
      }
    ],
    total_amount: 153.00,
    shipping_fee: 5.00,
    address: {
      id: 2,
      name: '李四',
      phone: '13800138002',
      province: '上海市',
      city: '上海市',
      district: '浦东新区',
      detail: '陆家嘴环路1000号',
      is_default: false
    },
    status: 'pending_payment',
    created_at: '2025-01-12 09:45:00',
    payment_method: 'alipay'
  }
];

// 收货地址数据（3个）
const mockAddresses = [
  {
    id: 1,
    name: '张三',
    phone: '13800138001',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detail: '建国路88号',
    is_default: true
  },
  {
    id: 2,
    name: '李四',
    phone: '13800138002',
    province: '上海市',
    city: '上海市',
    district: '浦东新区',
    detail: '陆家嘴环路1000号',
    is_default: false
  },
  {
    id: 3,
    name: '王五',
    phone: '13800138003',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    detail: '科技园南区',
    is_default: false
  }
];

// 导出所有数据
module.exports = {
  mockProducts,
  mockOrders,
  mockCategories,
  mockAddresses
};
