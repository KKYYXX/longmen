// 批量更新URL脚本
// 这个脚本帮助你将项目中的硬编码URL批量替换为使用API配置

const fs = require('fs');
const path = require('path');

// 需要更新的页面文件列表
const pagesToUpdate = [
  'pages/typicalcasesquery/typicalcasesquery.js',
  'pages/case_document/case_document.js',
  'pages/typicalcasesquery/typicalcases_detail.js',
  'pages/typicalcases_add/typicalcases_add.js',
  'pages/fifteenprojects/fifteenprojects.js',
  'pages/fifteenprojects_add/fifteenprojects_add.js',
  'pages/fifteenprojectsquery/fifteenprojectsquery.js',
  'pages/fifteenprojects_add_project/fifteenprojects_add_project.js',
  'pages/fifteenprojects_modify/fifteenprojects_modify.js',
  'pages/fifteenprojects_delete/fifteenprojects_delete.js',
  'pages/typicalcases/typicalcases.js',
  'pages/typicalcases_delete/typicalcases_delete.js',
  'pages/personal/personal.js',
  'pages/登录后的页面/登录后的页面.js',
  'pages/项目进度内容/项目进度内容.js',
  'pages/zcalter_add/zcalter_add.js',
  'pages/zcalter_delete/zcalter_delete.js',
  'pages/zcdocuments/zcdocuments.js',
  'pages/典型案例修改权限人员/典型案例修改权限人员.js',
  'pages/政策文件修改权限人员/政策文件修改权限人员.js',
  'pages/项目查询权限人员/项目查询权限人员.js',
  'pages/项目进度修改权限人员/项目进度修改权限人员.js',
  'pages/项目修改权限人员/项目修改权限人员.js',
  'pages/被转让人信息/被转让人信息.js',
  'pages/progress_delete_manager/progress_delete_manager.js'
];

// 需要替换的URL模式
const urlReplacements = [
  {
    pattern: /'http:\/\/127\.0\.0\.1:5000\/app\/api\/([^']+)'/g,
    replacement: "apiConfig.buildUrl('/app/api/$1')"
  },
  {
    pattern: /"http:\/\/127\.0\.0\.1:5000\/app\/api\/([^"]+)"/g,
    replacement: 'apiConfig.buildUrl(\'/app/api/$1\')'
  },
  {
    pattern: /'http:\/\/127\.0\.0\.1:5000\/app\/([^']+)'/g,
    replacement: "apiConfig.buildUrl('/app/$1')"
  },
  {
    pattern: /"http:\/\/127\.0\.0\.1:5000\/app\/([^"]+)"/g,
    replacement: 'apiConfig.buildUrl(\'/app/$1\')'
  },
  {
    pattern: /'http:\/\/127\.0\.0\.1:5000\/api\/([^']+)'/g,
    replacement: "apiConfig.buildUrl('/api/$1')"
  },
  {
    pattern: /"http:\/\/127\.0\.0\.1:5000\/api\/([^"]+)"/g,
    replacement: 'apiConfig.buildUrl(\'/api/$1\')'
  },
  {
    pattern: /'http:\/\/127\.0\.0\.1:5000\/user\/([^']+)'/g,
    replacement: "apiConfig.buildUrl('/user/$1')"
  },
  {
    pattern: /"http:\/\/127\.0\.0\.1:5000\/user\/([^"]+)"/g,
    replacement: 'apiConfig.buildUrl(\'/user/$1\')'
  }
];

// 更新单个文件
function updateFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`文件不存在: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // 检查是否已经导入了apiConfig
    const hasApiConfigImport = content.includes('const apiConfig = require');
    
    // 如果没有导入，添加导入语句
    if (!hasApiConfigImport) {
      content = `// 导入API配置\nconst apiConfig = require('../../config/api.js');\n\n${content}`;
      hasChanges = true;
    }

    // 替换URL
    urlReplacements.forEach(replacement => {
      const newContent = content.replace(replacement.pattern, replacement.replacement);
      if (newContent !== content) {
        content = newContent;
        hasChanges = true;
      }
    });

    // 如果有变化，写回文件
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 已更新: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️  无需更新: ${filePath}`);
      return false;
    }

  } catch (error) {
    console.error(`❌ 更新失败: ${filePath}`, error.message);
    return false;
  }
}

// 批量更新所有页面
function batchUpdateAllPages() {
  console.log('🚀 开始批量更新页面URL...\n');
  
  let updatedCount = 0;
  let totalCount = pagesToUpdate.length;
  
  pagesToUpdate.forEach(filePath => {
    if (updateFile(filePath)) {
      updatedCount++;
    }
  });
  
  console.log(`\n📊 更新完成！`);
  console.log(`总文件数: ${totalCount}`);
  console.log(`已更新: ${updatedCount}`);
  console.log(`无需更新: ${totalCount - updatedCount}`);
  
  if (updatedCount > 0) {
    console.log(`\n💡 现在你可以通过修改 config/api.js 中的 baseUrl 来统一管理所有接口的域名了！`);
  }
}

// 检查单个文件
function checkFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ 文件不存在: ${filePath}`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const hasApiConfigImport = content.includes('const apiConfig = require');
    const hasHardcodedUrls = content.includes('http://127.0.0.1:5000');
    
    console.log(`📁 ${filePath}:`);
    console.log(`  - API配置导入: ${hasApiConfigImport ? '✅' : '❌'}`);
    console.log(`  - 硬编码URL: ${hasHardcodedUrls ? '❌' : '✅'}`);
    
    if (hasHardcodedUrls) {
      // 统计硬编码URL数量
      const urlCount = (content.match(/http:\/\/127\.0\.0\.1:5000/g) || []).length;
      console.log(`  - 硬编码URL数量: ${urlCount}`);
    }
    console.log('');
    
  } catch (error) {
    console.error(`❌ 检查失败: ${filePath}`, error.message);
  }
}

// 检查所有文件状态
function checkAllFiles() {
  console.log('🔍 检查所有文件状态...\n');
  
  pagesToUpdate.forEach(filePath => {
    checkFile(filePath);
  });
}

// 主函数
function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'update':
      batchUpdateAllPages();
      break;
    case 'check':
      checkAllFiles();
      break;
    default:
      console.log('使用方法:');
      console.log('  node batch-update-urls.js update  - 批量更新所有页面');
      console.log('  node batch-update-urls.js check   - 检查所有文件状态');
      break;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  updateFile,
  batchUpdateAllPages,
  checkAllFiles,
  pagesToUpdate,
  urlReplacements
};
