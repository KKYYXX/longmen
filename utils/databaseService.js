// 数据库服务类
const dbConfig = require('../config/database.js');

class DatabaseService {
  constructor() {
    this.config = dbConfig.config;
    this.isMock = this.config.enableMock;
  }

  // 模拟数据库存储
  mockStorage = {
    typicalCases: [],
    caseFiles: [],
    caseVideos: [],
    caseLinks: []
  };

  // 保存典型案例到数据库
  async saveTypicalCase(caseData) {
    if (this.isMock) {
      // 模拟数据库操作
      const caseId = Date.now();
      const newCase = {
        id: caseId,
        caseName: caseData.caseName,
        description: caseData.description || '',
        uploadTime: new Date().toISOString(),
        status: 'active'
      };
      
      this.mockStorage.typicalCases.push(newCase);
      
      // 保存文件
      if (caseData.files && caseData.files.length > 0) {
        caseData.files.forEach(file => {
          this.mockStorage.caseFiles.push({
            id: Date.now() + Math.random(),
            caseId: caseId,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileUrl: file.url,
            uploadTime: new Date().toISOString()
          });
        });
      }
      
      // 保存视频
      if (caseData.videos && caseData.videos.length > 0) {
        caseData.videos.forEach(video => {
          this.mockStorage.caseVideos.push({
            id: Date.now() + Math.random(),
            caseId: caseId,
            videoName: video.name,
            videoSize: video.size,
            videoUrl: video.url,
            duration: video.duration,
            uploadTime: new Date().toISOString()
          });
        });
      }
      
      // 保存链接
      if (caseData.newsLinks && caseData.newsLinks.length > 0) {
        caseData.newsLinks.forEach(link => {
          this.mockStorage.caseLinks.push({
            id: Date.now() + Math.random(),
            caseId: caseId,
            linkTitle: link.title,
            linkUrl: link.url,
            uploadTime: new Date().toISOString()
          });
        });
      }
      
      return {
        success: true,
        caseId: caseId,
        message: '典型案例保存成功（模拟模式）'
      };
    } else {
      // 实际数据库操作
      try {
        const response = await wx.request({
          url: `${this.config.host}/api/typical-cases/save`,
          method: 'POST',
          header: {
            'Content-Type': 'application/json'
          },
          data: caseData
        });
        
        return response.data;
      } catch (error) {
        return {
          success: false,
          message: '保存失败：' + error.message
        };
      }
    }
  }

  // 获取典型案例列表
  async getTypicalCases(filters = {}) {
    if (this.isMock) {
      // 模拟数据库查询
      let cases = this.mockStorage.typicalCases.filter(c => c.status === 'active');
      
      // 应用筛选条件
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        cases = cases.filter(c => 
          c.caseName.toLowerCase().includes(keyword) ||
          c.description.toLowerCase().includes(keyword)
        );
      }
      
      if (filters.filter) {
        switch (filters.filter) {
          case 'files':
            cases = cases.filter(c => {
              const caseFiles = this.mockStorage.caseFiles.filter(f => f.caseId === c.id);
              return caseFiles.length > 0;
            });
            break;
          case 'videos':
            cases = cases.filter(c => {
              const caseVideos = this.mockStorage.caseVideos.filter(v => v.caseId === c.id);
              return caseVideos.length > 0;
            });
            break;
          case 'links':
            cases = cases.filter(c => {
              const caseLinks = this.mockStorage.caseLinks.filter(l => l.caseId === c.id);
              return caseLinks.length > 0;
            });
            break;
        }
      }
      
      // 为每个案例添加统计信息
      const casesWithStats = cases.map(c => {
        const files = this.mockStorage.caseFiles.filter(f => f.caseId === c.id);
        const videos = this.mockStorage.caseVideos.filter(v => v.caseId === c.id);
        const links = this.mockStorage.caseLinks.filter(l => l.caseId === c.id);
        
        return {
          ...c,
          fileCount: files.length,
          videoCount: videos.length,
          linkCount: links.length,
          files: files,
          videos: videos,
          links: links
        };
      });
      
      return {
        success: true,
        cases: casesWithStats,
        total: casesWithStats.length
      };
    } else {
      // 实际数据库查询
      try {
        const response = await wx.request({
          url: `${this.config.host}/api/typical-cases/list`,
          method: 'GET',
          data: filters
        });
        
        return response.data;
      } catch (error) {
        return {
          success: false,
          message: '查询失败：' + error.message,
          cases: [],
          total: 0
        };
      }
    }
  }

  // 获取单个典型案例详情
  async getTypicalCaseById(caseId) {
    if (this.isMock) {
      const caseData = this.mockStorage.typicalCases.find(c => c.id === caseId);
      if (!caseData) {
        return {
          success: false,
          message: '案例不存在'
        };
      }
      
      const files = this.mockStorage.caseFiles.filter(f => f.caseId === caseId);
      const videos = this.mockStorage.caseVideos.filter(v => v.caseId === caseId);
      const links = this.mockStorage.caseLinks.filter(l => l.caseId === caseId);
      
      return {
        success: true,
        case: {
          ...caseData,
          files,
          videos,
          links
        }
      };
    } else {
      // 实际数据库查询
      try {
        const response = await wx.request({
          url: `${this.config.host}/api/typical-cases/${caseId}`,
          method: 'GET'
        });
        
        return response.data;
      } catch (error) {
        return {
          success: false,
          message: '查询失败：' + error.message
        };
      }
    }
  }

  // 删除典型案例
  async deleteTypicalCase(caseId) {
    if (this.isMock) {
      // 模拟删除操作
      const caseIndex = this.mockStorage.typicalCases.findIndex(c => c.id === caseId);
      if (caseIndex > -1) {
        this.mockStorage.typicalCases[caseIndex].status = 'inactive';
        
        // 删除相关文件、视频、链接
        this.mockStorage.caseFiles = this.mockStorage.caseFiles.filter(f => f.caseId !== caseId);
        this.mockStorage.caseVideos = this.mockStorage.caseVideos.filter(v => v.caseId !== caseId);
        this.mockStorage.caseLinks = this.mockStorage.caseLinks.filter(l => l.caseId !== caseId);
        
        return {
          success: true,
          message: '删除成功（模拟模式）'
        };
      }
      
      return {
        success: false,
        message: '案例不存在'
      };
    } else {
      // 实际数据库删除
      try {
        const response = await wx.request({
          url: `${this.config.host}/api/typical-cases/${caseId}`,
          method: 'DELETE'
        });
        
        return response.data;
      } catch (error) {
        return {
          success: false,
          message: '删除失败：' + error.message
        };
      }
    }
  }
}

module.exports = DatabaseService; 