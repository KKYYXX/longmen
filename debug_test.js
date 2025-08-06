// 调试测试文件 - 用于验证JavaScript语法

// 测试案例数据结构
const testCase = {
  id: 1,
  caseName: '测试案例',
  files: [
    { name: '测试文件.pdf', size: '2MB' }
  ],
  videos: [
    { name: '测试视频.mp4', duration: '5:00' }
  ],
  links: [
    { title: '测试链接', url: 'https://example.com' }
  ]
};

// 测试逻辑运算符
function testLogicalOperators() {
  const hasFiles = testCase.files && testCase.files.length > 0;
  const hasVideos = testCase.videos && testCase.videos.length > 0;
  const hasLinks = testCase.links && testCase.links.length > 0;
  
  console.log('Has files:', hasFiles);
  console.log('Has videos:', hasVideos);
  console.log('Has links:', hasLinks);
  
  return hasFiles && hasVideos && hasLinks;
}

// 测试文件上传逻辑
function testUploadLogic() {
  const uploadedFiles = [];
  
  if (uploadedFiles.length > 0) {
    console.log('已有文件，询问是否替换');
    return false;
  }
  
  console.log('可以上传新文件');
  return true;
}

// 测试字符串模板
function testStringTemplate() {
  const fileName = '测试文件.pdf';
  const fileSize = '2MB';
  const content = `文件名：${fileName}\n文件大小：${fileSize}`;
  console.log(content);
  return content;
}

// 运行测试
try {
  console.log('开始测试...');
  
  const result1 = testLogicalOperators();
  console.log('逻辑运算符测试结果:', result1);
  
  const result2 = testUploadLogic();
  console.log('上传逻辑测试结果:', result2);
  
  const result3 = testStringTemplate();
  console.log('字符串模板测试结果:', result3);
  
  console.log('所有测试通过！');
} catch (error) {
  console.error('测试失败:', error);
}

// 导出测试函数（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testLogicalOperators,
    testUploadLogic,
    testStringTemplate
  };
}
