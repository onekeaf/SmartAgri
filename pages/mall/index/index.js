
Page({
  data: {
    productList: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    totalCount: 0,
    onSaleCount: 0,
    offSaleCount: 0
  },

  onLoad() {
    this.initProducts();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3
      });
    }
    this.loadProducts();
  },

  initProducts() {
    let products = wx.getStorageSync('mall_products');
    if (!products || products.length === 0) {
      products = this.getMockProducts();
      wx.setStorageSync('mall_products', products);
    }
    this.loadProducts();
  },

  getMockProducts() {
    const mallMockData = require('../../../utils/mall-mock-data');
    return mallMockData.mockProducts.map(product => ({
      ...product,
      status: product.status === 'on_sale' ? 1 : 0
    }));
  },

  loadProducts() {
    const products = wx.getStorageSync('mall_products') || [];
    
    let onSaleCount = 0;
    let offSaleCount = 0;
    
    products.forEach(product => {
      const isOnSale = product.status === 1 || product.status === 'on_sale';
      if (isOnSale) {
        onSaleCount++;
      } else {
        offSaleCount++;
      }
    });

    this.setData({
      productList: products,
      totalCount: products.length,
      onSaleCount: onSaleCount,
      offSaleCount: offSaleCount,
      hasMore: products.length >= this.data.pageSize
    });
  },

  onPullDownRefresh() {
    this.loadProducts();
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    if (this.data.loading || !this.data.hasMore) {
      return;
    }
    this.setData({ loading: true });
    setTimeout(() => {
      this.setData({ loading: false });
    }, 1000);
  },

  onProductTap(e) {
    const productId = e.currentTarget.dataset.productId;
    wx.navigateTo({
      url: `/pages/mall/edit-product/edit-product?productId=${productId}`
    });
  },

  onProductLongPress(e) {
    const productId = e.currentTarget.dataset.productId;
    const status = e.currentTarget.dataset.status;
    
    const isOnSale = status === 1 || status === 'on_sale';
    const itemList = ['编辑商品', '删除商品', isOnSale ? '下架商品' : '上架商品'];
    
    wx.showActionSheet({
      itemList: itemList,
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.onProductTap(e);
            break;
          case 1:
            this.deleteProduct(productId);
            break;
          case 2:
            this.toggleProductStatus(productId);
            break;
        }
      }
    });
  },

  deleteProduct(productId) {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个商品吗？',
      success: (res) => {
        if (res.confirm) {
          let products = wx.getStorageSync('mall_products') || [];
          products = products.filter(product => String(product.product_id) !== String(productId));
          wx.setStorageSync('mall_products', products);
          this.loadProducts();
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  toggleProductStatus(productId) {
    let products = wx.getStorageSync('mall_products') || [];
    const productIndex = products.findIndex(product => String(product.product_id) === String(productId));
    
    if (productIndex !== -1) {
      const currentStatus = products[productIndex].status;
      const isOnSale = currentStatus === 1 || currentStatus === 'on_sale';
      products[productIndex].status = isOnSale ? 0 : 1;
      wx.setStorageSync('mall_products', products);
      this.loadProducts();
      
      const statusText = isOnSale ? '下架' : '上架';
      wx.showToast({
        title: `${statusText}成功`,
        icon: 'success'
      });
    }
  },

  onAddProduct() {
    wx.navigateTo({
      url: '/pages/mall/edit-product/edit-product'
    });
  }
});
