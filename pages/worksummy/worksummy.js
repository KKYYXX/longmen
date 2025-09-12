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

  // 通过现有接口获取项目数量
  getProjectCountFromExistingAPI(title, schoolType) {
    console.log('开始获取项目统计，学校类型:', schoolType);
    
    // 显示加载提示
    wx.showLoading({
      title: '统计中...'
    });

    // 使用现有的项目查询接口
    wx.request({
      url: apiConfig.buildUrl('/app/api/15projects/names'),
      method: 'GET',
      timeout: apiConfig.getTimeout(),
      success: (res) => {
        wx.hideLoading();
        console.log('项目查询接口响应:', res);
        
        if (res.statusCode === 200 && res.data && res.data.success && Array.isArray(res.data.data)) {
          const projectNames = res.data.data;
          console.log('获取到项目名称列表:', projectNames);
          
          // 现在需要获取每个项目的详细信息来统计学校类型
          this.getProjectDetailsAndCount(title, schoolType, projectNames);
        } else {
          console.error('项目查询接口返回数据格式错误:', res.data);
          wx.showModal({
            title: "数据错误",
            content: "无法获取项目列表，请稍后重试",
            showCancel: false,
            confirmText: "确定"
          });
        }
      },
      fail: (error) => {
        wx.hideLoading();
        console.error('项目查询接口请求失败:', error);
        wx.showModal({
          title: "网络错误",
          content: "网络连接失败，请检查网络后重试",
          showCancel: false,
          confirmText: "确定"
        });
      }
    });
  },

  // 获取项目详细信息并统计
  getProjectDetailsAndCount(title, schoolType, projectNames) {
    if (projectNames.length === 0) {
      wx.showModal({
        title: "统计结果",
        content: `${title}0个`,
        showCancel: false,
        confirmText: "确定"
      });
      return;
    }

    // 显示加载提示
    wx.showLoading({
      title: '统计中...'
    });

    let completedRequests = 0;
    let totalCount = 0;
    const totalRequests = projectNames.length;

    // 为每个项目获取详细信息
    projectNames.forEach((projectName, index) => {
      wx.request({
        url: apiConfig.buildUrl('/app/api/15projects/search'),
        method: 'GET',
        data: {
          project_name: projectName
        },
        timeout: apiConfig.getTimeout(),
        success: (res) => {
          completedRequests++;
          console.log(`项目 ${index + 1}/${totalRequests} 查询完成:`, projectName, res.data);
          
          if (res.statusCode === 200 && res.data && res.data.success && res.data.data && res.data.data.length > 0) {
            const project = res.data.data[0]; // 取第一个匹配的项目
            
            // 调试信息：打印项目数据
            console.log(`项目 ${projectName} 的学校类型字段:`, {
              is_gdufe: project.is_gdufe,
              is_gdufe_type: typeof project.is_gdufe,
              is_gdpic: project.is_gdpic,
              is_gdpic_type: typeof project.is_gdpic
            });
            
            // 根据学校类型检查项目属性
            // tinyint类型在数据库中存储为数字1或0
            if (schoolType === "gdufe" && project.is_gdufe == 1) {
              totalCount++;
              console.log(`找到广东财经大学项目: ${projectName}, 当前总数: ${totalCount}`);
            } else if (schoolType === "gdpic" && project.is_gdpic == 1) {
              totalCount++;
              console.log(`找到广东工贸职业技术学院项目: ${projectName}, 当前总数: ${totalCount}`);
            }
          }
          
          // 检查是否所有请求都完成了
          if (completedRequests === totalRequests) {
            wx.hideLoading();
            wx.showModal({
              title: "统计结果",
              content: `${title}${totalCount}个`,
              showCancel: false,
              confirmText: "确定"
            });
          }
        },
        fail: (error) => {
          completedRequests++;
          console.error(`项目 ${projectName} 查询失败:`, error);
          
          // 检查是否所有请求都完成了
          if (completedRequests === totalRequests) {
            wx.hideLoading();
            wx.showModal({
              title: "统计结果",
              content: `${title}${totalCount}个`,
              showCancel: false,
              confirmText: "确定"
            });
          }
        }
      });
    });
  }
});
