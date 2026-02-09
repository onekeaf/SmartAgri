
Page({
  data: {
    isEdit: false,
    productId: null,
    images: [],
    productName: '',
    categoryIndex: -1,
    categories: ['蔬菜', '水果', '粮食', '其他'],
    price: '',
    specification: '',
    stock: '',
    origin: '',
    description: '',
    descriptionLength: 0
  },

  onLoad(options) {
    if (options.productId) {
      this.setData({
        isEdit: true,
        productId: options.productId
      });
      wx.setNavigationBarTitle({
        title: '编辑商品'
      });
      this.loadProductData(options.productId);
    } else {
      wx.setNavigationBarTitle({
        title: '添加商品'
      });
    }
  },

  loadProductData(productId) {
    try {
      const products = wx.getStorageSync('mall_products') || [];
      const product = products.find(p => p.product_id == productId);
      if (product) {
        this.setData({
          images: product.images || [],
          productName: product.product_name || '',
          categoryIndex: this.data.categories.indexOf(product.category),
          price: String(product.price || ''),
          specification: product.specification || '',
          stock: String(product.stock || ''),
          origin: product.origin || '',
          description: product.description || '',
          descriptionLength: (product.description || '').length
        });
      }
    } catch (error) {
      console.error('加载商品数据失败:', error);
    }
  },

  chooseImage() {
    const remainingCount = 9 - this.data.images.length;
    if (remainingCount <= 0) {
      wx.showToast({
        title: '最多上传9张图片',
        icon: 'none'
      });
      return;
    }

    wx.chooseMedia({
      count: remainingCount,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFiles = res.tempFiles.map(file => file.tempFilePath);
        this.setData({
          images: this.data.images.concat(tempFiles)
        });
      },
      fail: (error) => {
        console.error('选择图片失败:', error);
      }
    });
  },

  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      images: this.data.images.filter((_, i) => i !== index)
    });
  },

  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [field]: value
    });
  },

  onCategoryChange(e) {
    this.setData({
      categoryIndex: parseInt(e.detail.value)
    });
  },

  onDescriptionInput(e) {
    this.setData({
      description: e.detail.value,
      descriptionLength: e.detail.value.length
    });
  },

  validateForm() {
    if (this.data.images.length === 0) {
      wx.showToast({
        title: '请至少上传一张图片',
        icon: 'none'
      });
      return false;
    }

    if (!this.data.productName.trim()) {
      wx.showToast({
        title: '请输入商品名称',
        icon: 'none'
      });
      return false;
    }

    if (this.data.categoryIndex === -1) {
      wx.showToast({
        title: '请选择商品分类',
        icon: 'none'
      });
      return false;
    }

    const priceStr = String(this.data.price).trim();
    if (!priceStr) {
      wx.showToast({
        title: '请输入商品价格',
        icon: 'none'
      });
      return false;
    }

    const priceNum = parseFloat(priceStr);
    if (isNaN(priceNum) || priceNum <= 0) {
      wx.showToast({
        title: '请输入有效的价格',
        icon: 'none'
      });
      return false;
    }

    const stockStr = String(this.data.stock).trim();
    if (!stockStr) {
      wx.showToast({
        title: '请输入库存数量',
        icon: 'none'
      });
      return false;
    }

    const stockNum = parseInt(stockStr);
    if (isNaN(stockNum) || stockNum < 0) {
      wx.showToast({
        title: '请输入有效的库存数量',
        icon: 'none'
      });
      return false;
    }

    if (!String(this.data.origin).trim()) {
      wx.showToast({
        title: '请输入产地信息',
        icon: 'none'
      });
      return false;
    }

    if (!String(this.data.description).trim()) {
      wx.showToast({
        title: '请输入商品描述',
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  saveProduct() {
    if (!this.validateForm()) {
      return;
    }

    try {
      let products = wx.getStorageSync('mall_products') || [];
      const now = new Date().getTime();

      const productData = {
        product_name: String(this.data.productName).trim(),
        category: this.data.categories[this.data.categoryIndex],
        price: parseFloat(this.data.price),
        original_price: parseFloat(this.data.price),
        images: this.data.images,
        specification: String(this.data.specification).trim(),
        stock: parseInt(this.data.stock),
        origin: String(this.data.origin).trim(),
        description: String(this.data.description).trim(),
        updated_at: now
      };

      if (this.data.isEdit) {
        const index = products.findIndex(p => p.product_id == this.data.productId);
        if (index !== -1) {
          products[index] = {
            ...products[index],
            ...productData
          };
        }
      } else {
        const newProduct = {
          product_id: now,
          ...productData,
          sales: 0,
          status: 1,
          created_at: now,
          farmer: {}
        };
        products.push(newProduct);
      }

      wx.setStorageSync('mall_products', products);

      wx.showToast({
        title: this.data.isEdit ? '编辑成功' : '添加成功',
        icon: 'success',
        duration: 2000
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);

    } catch (error) {
      console.error('保存商品失败:', error);
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      });
    }
  }
});
