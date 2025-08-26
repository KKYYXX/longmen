// 迁移辅助脚本
const fs = require('fs');
const path = require('path');

// 硬编码URL模式
const hardcodedUrlPatterns = [
  {
    pattern: /http:\/\/127\.0\.0\.1:80\/app\/api\/([^'"]+)/g,
    replacement: (match, endpoint) => `apiConfig.buildAppUrl('/${endpoint}')`,
    description: '开发环境应用接口'
  },
  {
    pattern: /http:\/\/127\.0\.0\.1:80\/app\/([^'"]+)/g,
    replacement: (match, endpoint) => `apiConfig.buildAppUrl('/${endpoint}')`,
    description: '开发环境应用接口'
  }
];

// 迁移建议
const migrationSuggestions = {
  '/app/api/models': 'apiConfig.getFullUrl(\'typicalCases\', \'list\')',
  '/app/api/video': 'apiConfig.getFullUrl(\'video\', \'query\')',
  '/app/api/news': 'apiConfig.getFullUrl(\'news\', \'query\')',
  '/app/user/query_15': 'apiConfig.getFullUrl(\'user\', \'query15\')',
  '/app/user/alter_15': 'apiConfig.getFullUrl(\'user\', \'alter15\')'
};

// 生成迁移报告
function generateMigrationReport(projectPath) {
  console.log('🔍 开始分析项目中的硬编码URL...\n');
  
  const report = {
    totalFiles: 0,
    filesWithHardcodedUrls: 0,
    totalHardcodedUrls: 0,
    suggestions: []
  };
  
  scanProjectFiles(projectPath, report);
  printMigrationReport(report);
  
  return report;
}

// 扫描项目文件
function scanProjectFiles(projectPath, report) {
  const pagesDir = path.join(projectPath, 'pages');
  
  if (fs.existsSync(pagesDir)) {
    scanDirectory(pagesDir, report);
  }
}

// 扫描目录
function scanDirectory(dirPath, report) {
  const items = fs.readdirSync(dirPath);
  
  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      scanDirectory(fullPath, report);
    } else if (stat.isFile() && item.endsWith('.js')) {
      scanFile(fullPath, report);
    }
  });
}

// 扫描单个文件
function scanFile(filePath, report) {
  report.totalFiles++;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    let hasHardcodedUrls = false;
    let fileSuggestions = [];
    
    // 检查硬编码URL
    hardcodedUrlPatterns.forEach(pattern => {
      const matches = content.match(pattern.pattern);
      if (matches) {
        hasHardcodedUrls = true;
        report.totalHardcodedUrls += matches.length;
        
        matches.forEach(match => {
          const suggestion = generateSuggestion(match, pattern);
          if (suggestion) {
            fileSuggestions.push(suggestion);
          }
        });
      }
    });
    
    if (hasHardcodedUrls) {
      report.filesWithHardcodedUrls++;
      report.suggestions.push({
        file: relativePath,
        suggestions: fileSuggestions
      });
    }
    
  } catch (error) {
    console.error(`读取文件失败: ${filePath}`, error.message);
  }
}

// 生成迁移建议
function generateSuggestion(url, pattern) {
  for (const [key, suggestion] of Object.entries(migrationSuggestions)) {
    if (url.includes(key)) {
      return {
        oldUrl: url,
        newCode: suggestion,
        description: pattern.description
      };
    }
  }
  
  return {
    oldUrl: url,
    newCode: pattern.replacement(url, ''),
    description: pattern.description
  };
}

// 打印迁移报告
function printMigrationReport(report) {
  console.log('📊 迁移分析报告');
  console.log('='.repeat(50));
  console.log(`总文件数: ${report.totalFiles}`);
  console.log(`包含硬编码URL的文件数: ${report.filesWithHardcodedUrls}`);
  console.log(`硬编码URL总数: ${report.totalHardcodedUrls}`);
  console.log('');
  
  if (report.suggestions.length > 0) {
    console.log('🔧 需要迁移的接口:');
    console.log('-'.repeat(30));
    
    report.suggestions.forEach(fileReport => {
      console.log(`\n📁 文件: ${fileReport.file}`);
      fileReport.suggestions.forEach(suggestion => {
        console.log(`  📍 ${suggestion.description}`);
        console.log(`     旧代码: ${suggestion.oldUrl}`);
        console.log(`     新代码: ${suggestion.newCode}`);
        console.log('');
      });
    });
  }
  
  if (report.totalHardcodedUrls === 0) {
    console.log('✅ 恭喜！没有发现硬编码URL。');
  } else {
    console.log('💡 迁移建议:');
    console.log('1. 添加: const apiConfig = require(\'../../config/api.js\');');
    console.log('2. 将硬编码URL替换为apiConfig方法调用');
    console.log('3. 参考 config/api-usage-example.js 中的示例');
  }
}

module.exports = {
  generateMigrationReport,
  hardcodedUrlPatterns,
  migrationSuggestions
};
