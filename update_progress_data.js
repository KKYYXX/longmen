/**
 * 批量更新项目进度数据脚本
 * 为所有进度记录添加 videos 和 documents 字段
 */

// 读取项目进度文件
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'pages/project_progress/project_progress.js');

// 读取文件内容
let content = fs.readFileSync(filePath, 'utf8');

// 使用正则表达式批量替换
// 匹配 images: [] 并添加 videos: [] 和 documents: []
const regex = /images:\s*\[\s*\]/g;
const replacement = 'images: [],\n          videos: [],\n          documents: []';

// 执行替换
content = content.replace(regex, replacement);

// 写回文件
fs.writeFileSync(filePath, content, 'utf8');

console.log('项目进度数据更新完成！');
console.log('已为所有进度记录添加 videos 和 documents 字段');
