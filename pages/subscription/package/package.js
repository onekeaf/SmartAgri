Page({
  data: {},
  goToPay(e) {
    const type = e.currentTarget.dataset.type;
    console.log('Selected package:', type);
    wx.navigateTo({
      url: '/pages/subscription/pay/pay'
    });
  }
});
