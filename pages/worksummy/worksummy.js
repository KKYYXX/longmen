// 导入API配置
const apiConfig = require('../../config/api.js');

Page({
  data: {},
  // 点击学校卡片
  showProjectCount(e) {
    const schoolKey = e.currentTarget.dataset.school;

    let title = "";
    let schoolType = "";

    if (schoolKey === "gdczdx") {
      title = "广东财经大学24-25学年项目个数为：";
      schoolType = "gdufe";
    } else if (schoolKey === "gdgmzyjsxy") {
      title = "广东工贸职业技术学院24-25学年项目个数为：";
      schoolType = "gdpic";
    }

    // 通过现有的项目查询接口获取所有项目，然后在前端统计
    this.getProjectCountFromExistingAPI(title, schoolType);
  },

  // 直接调用统计接口获取项目数量
  getProjectCountFromExistingAPI(title, schoolType) {
    console.log('开始获取项目统计，学校类型:', schoolType);
    
    // 显示加载提示
    wx.showLoading({
      title: '统计中...'
    });

    // 构建正确的API路径（与其他接口保持一致）
    const apiPath = schoolType === 'gdufe' ? '/app/api/count/gdufe' : '/app/api/count/gdpic';
    const fullUrl = apiConfig.buildUrl(apiPath);
    
    console.log('构建的API路径:', apiPath);
    console.log('完整的请求URL:', fullUrl);
    
    wx.request({
      url: fullUrl,
      method: 'GET',
      timeout: apiConfig.getTimeout(),
      success: (res) => {
        wx.hideLoading();
        console.log('统计接口响应:', res);
        
        if (res.statusCode === 200 && res.data && typeof res.data.count === 'number') {
          const count = res.data.count;
          console.log(`统计结果: ${count}个项目`);
          
          wx.showModal({
            title: "统计结果",
            content: `${title}${count}个`,
            showCancel: false,
            confirmText: "确定"
          });
        } else {
          console.error('统计接口返回数据格式错误:', res.data);
          wx.showModal({
            title: "数据错误",
            content: "无法获取统计数据，请稍后重试",
            showCancel: false,
            confirmText: "确定"
          });
        }
      },
      fail: (error) => {
        wx.hideLoading();
        console.error('统计接口请求失败:', error);
        wx.showModal({
          title: "网络错误",
          content: "网络连接失败，请检查网络后重试",
          showCancel: false,
          confirmText: "确定"
        });
      }
    });
  },

});
