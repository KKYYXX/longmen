// 数据库配置文件
const config = {
  development: {
    // 开发环境数据库配置
    host: 'localhost',
    port: 3306,
    database: 'typical_cases_db',
    username: 'root',
    password: 'password',
    // 模拟数据库操作
    enableMock: true
  },
  production: {
    // 生产环境数据库配置
    host: 'your-production-host',
    port: 3306,
    database: 'typical_cases_db',
    username: 'your-username',
    password: 'your-password',
    enableMock: false
  }
};

// 获取当前环境配置
function getCurrentEnv() {
  const accountInfo = wx.getAccountInfoSync();
  return accountInfo.miniProgram.envVersion || 'development';
}

function getConfig() {
  const env = getCurrentEnv();
  return config[env] || config.development;
}

// 数据库表结构
const tables = {
  typicalCases: {
    name: 'typical_cases',
    fields: {
      id: 'INT AUTO_INCREMENT PRIMARY KEY',
      caseName: 'VARCHAR(100) NOT NULL',
      description: 'TEXT',
      uploadTime: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
      status: 'ENUM("active", "inactive") DEFAULT "active"'
    }
  },
  caseFiles: {
    name: 'case_files',
    fields: {
      id: 'INT AUTO_INCREMENT PRIMARY KEY',
      caseId: 'INT NOT NULL',
      fileName: 'VARCHAR(255) NOT NULL',
      fileType: 'VARCHAR(50) NOT NULL',
      fileSize: 'BIGINT NOT NULL',
      fileUrl: 'VARCHAR(500)',
      uploadTime: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
    }
  },
  caseVideos: {
    name: 'case_videos',
    fields: {
      id: 'INT AUTO_INCREMENT PRIMARY KEY',
      caseId: 'INT NOT NULL',
      videoName: 'VARCHAR(255) NOT NULL',
      videoSize: 'BIGINT NOT NULL',
      videoUrl: 'VARCHAR(500)',
      duration: 'INT',
      uploadTime: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
    }
  },
  caseLinks: {
    name: 'case_links',
    fields: {
      id: 'INT AUTO_INCREMENT PRIMARY KEY',
      caseId: 'INT NOT NULL',
      linkTitle: 'VARCHAR(255) NOT NULL',
      linkUrl: 'VARCHAR(500) NOT NULL',
      uploadTime: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
    }
  }
};

module.exports = {
  config: getConfig(),
  tables,
  getCurrentEnv,
  getConfig
}; 