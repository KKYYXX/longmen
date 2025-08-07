// 数据库服务工具类
// 用于处理本地存储和数据管理

class DatabaseService {
  constructor() {
    this.storageKeys = {
      typicalCases: 'typicalCases',
      fifteenProjects: 'fifteenProjects',
      userInfo: 'userInfo',
      isLoggedIn: 'isLoggedIn'
    };
  }

  // 获取典型案例列表
  getTypicalCases() {
    try {
      return wx.getStorageSync(this.storageKeys.typicalCases) || [];
    } catch (error) {
      console.error('获取典型案例失败:', error);
      return [];
    }
  }

  // 保存典型案例
  saveTypicalCase(caseData) {
    try {
      const cases = this.getTypicalCases();
      cases.push(caseData);
      wx.setStorageSync(this.storageKeys.typicalCases, cases);
      return true;
    } catch (error) {
      console.error('保存典型案例失败:', error);
      return false;
    }
  }

  // 删除典型案例
  deleteTypicalCase(caseId) {
    try {
      const cases = this.getTypicalCases();
      const updatedCases = cases.filter(item => item.id !== caseId);
      wx.setStorageSync(this.storageKeys.typicalCases, updatedCases);
      return true;
    } catch (error) {
      console.error('删除典型案例失败:', error);
      return false;
    }
  }

  // 获取十五项重点工程列表
  getFifteenProjects() {
    try {
      return wx.getStorageSync(this.storageKeys.fifteenProjects) || [];
    } catch (error) {
      console.error('获取十五项重点工程失败:', error);
      return [];
    }
  }

  // 保存十五项重点工程
  saveFifteenProject(projectData) {
    try {
      const projects = this.getFifteenProjects();
      projects.push(projectData);
      wx.setStorageSync(this.storageKeys.fifteenProjects, projects);
      return true;
    } catch (error) {
      console.error('保存十五项重点工程失败:', error);
      return false;
    }
  }

  // 获取用户信息
  getUserInfo() {
    try {
      return wx.getStorageSync(this.storageKeys.userInfo) || null;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  }

  // 保存用户信息
  saveUserInfo(userInfo) {
    try {
      wx.setStorageSync(this.storageKeys.userInfo, userInfo);
      wx.setStorageSync(this.storageKeys.isLoggedIn, true);
      return true;
    } catch (error) {
      console.error('保存用户信息失败:', error);
      return false;
    }
  }

  // 清除用户信息（登出）
  clearUserInfo() {
    try {
      wx.removeStorageSync(this.storageKeys.userInfo);
      wx.removeStorageSync(this.storageKeys.isLoggedIn);
      return true;
    } catch (error) {
      console.error('清除用户信息失败:', error);
      return false;
    }
  }

  // 检查登录状态
  isLoggedIn() {
    try {
      return wx.getStorageSync(this.storageKeys.isLoggedIn) || false;
    } catch (error) {
      console.error('检查登录状态失败:', error);
      return false;
    }
  }

  // 清空所有数据
  clearAllData() {
    try {
      wx.clearStorageSync();
      return true;
    } catch (error) {
      console.error('清空数据失败:', error);
      return false;
    }
  }
}

// 创建单例实例
const databaseService = new DatabaseService();

module.exports = databaseService;
