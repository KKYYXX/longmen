Page({
  data: {},

  // 点击学校卡片
  showProjectCount(e) {
    const schoolKey = e.currentTarget.dataset.school;

    let title = "";
    let apiUrl = ""; // TODO: 后续替换为后端接口

    if (schoolKey === "gdczdx") {
      title = "广东财经大学24-25学年项目个数为：";
      apiUrl = "/api/school/gdczdx"; 
    } else if (schoolKey === "gdgmzyjsxy") {
      title = "广东工贸职业技术学院24-25学年项目个数为：";
      apiUrl = "/api/school/gdgmzyjsxy"; 
    }

    // mock 数据，后续用 wx.request 替换
    const mockCount = Math.floor(Math.random() * 20) + 1;

    // 使用官方 wx.showModal 弹窗
    wx.showModal({
      title: "提示",
      content: `${title}${mockCount}`,
      showCancel: false, // 只显示“确定”按钮
      confirmText: "确定"
    });

    /*
    // TODO: 联调接口后替换为真实请求
    wx.request({
      url: apiUrl,
      method: "GET",
      success: (res) => {
        wx.showModal({
          title: "提示",
          content: `${title}${res.data.count}`,
          showCancel: false,
          confirmText: "确定"
        });
      },
      fail: () => {
        wx.showToast({
          title: "请求失败",
          icon: "none"
        });
      }
    });
    */
  }
});
