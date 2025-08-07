Page({
  data: {
    caseId: null,
    caseData: null,
    loading: true,
    fileCount: 0,
    videoCount: 0,
    linkCount: 0,
    detailContent: '',
    fileContent: '' // 文件内容
  },

  onLoad(options) {
    console.log('案例文档页面加载', options);
    if (options.id) {
      this.setData({
        caseId: parseInt(options.id)
      });
      this.loadCaseDetail();
    }
  },

  navigateBack() {
    wx.navigateBack();
  },

  loadCaseDetail() {
    this.setData({ loading: true });
    
    const apiConfig = require('../../config/api.js');
    
    if (apiConfig.isMockEnabled()) {
      // 开发模式：从本地存储和默认数据加载
      setTimeout(() => {
        const storedCases = wx.getStorageSync('typicalCases') || [];
        const defaultCases = this.getDefaultCases();
        const allCases = [...defaultCases, ...storedCases];
        
        const caseData = allCases.find(item => item.id === this.data.caseId);
        
        if (caseData) {
          // 格式化案例数据，确保所有字段都存在
          const formattedCase = {
            ...caseData,
            caseName: caseData.caseName || caseData.title,
            description: caseData.description || caseData.summary || '暂无描述',
            files: (caseData.files || []).map(file => ({
              ...file,
              fileType: this.getFileType(file.name),
              fileUrl: file.url || '#', // 开发模式下使用占位符
              fileName: file.name,
              fileSize: file.sizeFormatted || file.size
            })),
            videos: (caseData.videos || []).map(video => ({
              ...video,
              videoUrl: video.url || '#', // 开发模式下使用占位符
              videoName: video.name,
              videoDuration: video.duration
            })),
            links: (caseData.links || []).map(link => ({
              ...link,
              linkUrl: link.url,
              linkTitle: link.title
            }))
          };

          // 生成详细内容
          const detailContent = this.generateDetailContent(formattedCase);

          this.setData({
            caseData: formattedCase,
            fileCount: (formattedCase.files && formattedCase.files.length) || 0,
            videoCount: (formattedCase.videos && formattedCase.videos.length) || 0,
            linkCount: (formattedCase.links && formattedCase.links.length) || 0,
            detailContent: detailContent,
            loading: false
          });

          // 自动打开文件和链接
          this.autoOpenContent(formattedCase);
        } else {
          wx.showToast({
            title: '案例不存在',
            icon: 'none'
          });
          this.setData({ loading: false });
        }
      }, 500);
      return;
    }

    // 生产模式：调用数据库服务
    try {
      const dbService = require('../../utils/databaseService.js');
      const db = new dbService();
      
      db.getTypicalCaseById(this.data.caseId).then(result => {
        if (result.success) {
          const caseData = result.case;
          const detailContent = this.generateDetailContent(caseData);

          this.setData({
            caseData: caseData,
            fileCount: (caseData.files && caseData.files.length) || 0,
            videoCount: (caseData.videos && caseData.videos.length) || 0,
            linkCount: (caseData.links && caseData.links.length) || 0,
            detailContent: detailContent,
            loading: false
          });
        } else {
          wx.showToast({
            title: result.message || '加载失败',
            icon: 'none'
          });
          this.setData({ loading: false });
        }
      }).catch(error => {
        console.error('加载案例详情失败:', error);
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
        this.setData({ loading: false });
      });
    } catch (error) {
      console.error('加载案例详情失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  // 生成详细内容
  generateDetailContent(caseData) {
    const templates = {
      '智慧城市建设典型案例': '项目采用先进的物联网技术，建设了全市统一的智慧城市管理平台。通过大数据分析和人工智能算法，实现了城市交通、环境、安全等多个领域的智能化管理。项目覆盖全市12个区县，服务人口超过500万，显著提升了城市治理效率和市民生活质量。',
      '绿色能源示范园区建设案例': '园区建设了总装机容量50MW的太阳能发电系统和20MW的风力发电系统，配套建设了大型储能设施。通过智能电网技术，实现了清洁能源的高效利用和智能调度。园区年发电量达到1.2亿千瓦时，减少二氧化碳排放8万吨，成为区域绿色发展的典型示范。',
      '数字化教育改革实践案例': '项目建设了覆盖全市200所学校的数字化教育平台，开发了适合不同年龄段学生的在线学习资源。通过人工智能技术，实现了个性化教学和精准评估。项目惠及师生15万人，显著提升了教育质量和教学效率，缩小了城乡教育差距。'
    };
    
    return templates[caseData.caseName || caseData.title] || caseData.description || '暂无详细内容';
  },

  // 获取文件类型
  getFileType(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const typeMap = {
      'pdf': 'pdf',
      'doc': 'doc',
      'docx': 'docx',
      'xls': 'excel',
      'xlsx': 'excel',
      'ppt': 'ppt',
      'pptx': 'ppt',
      'png': 'image',
      'jpg': 'image',
      'jpeg': 'image',
      'gif': 'image'
    };
    return typeMap[ext] || 'other';
  },

  // 自动打开内容
  autoOpenContent(caseData) {
    console.log('开始自动打开文件...');

    // 延迟1秒后自动打开文件
    setTimeout(() => {
      if (caseData.files && caseData.files.length > 0) {
        console.log('自动打开文件:', caseData.files[0].name);
        this.autoOpenFile(caseData.files[0]);
      }
    }, 1000);
  },

  // 自动打开文件
  autoOpenFile(file) {
    wx.showToast({
      title: '正在自动加载文件内容...',
      icon: 'loading',
      duration: 2000
    });

    // 延迟1秒后加载文件内容
    setTimeout(() => {
      this.loadFileContent(file);
    }, 1000);
  },

  // 加载文件内容
  loadFileContent(file) {
    console.log('加载文件内容:', file.name);

    // 生成模拟文件内容
    const mockContent = this.generateMockFileContent(file);

    this.setData({
      fileContent: mockContent
    });

    wx.showToast({
      title: '文件内容已加载',
      icon: 'success',
      duration: 1500
    });
  },

  // 生成模拟文件内容
  generateMockFileContent(file) {
    const fileName = file.name || '';
    const caseData = this.data.caseData;

    // 根据案例类型生成不同的文档内容
    if (fileName.includes('智慧城市') || caseData.caseName.includes('智慧城市')) {
      return `智慧城市建设方案

一、项目背景
随着城市化进程的加快，传统的城市管理模式已无法满足现代城市发展的需要。智慧城市建设成为提升城市治理能力、改善民生服务、促进经济发展的重要途径。

二、建设目标
1. 构建统一的城市管理平台
2. 实现城市数据的互联互通
3. 提升公共服务效率
4. 增强城市安全防护能力
5. 促进绿色可持续发展

三、技术架构
• 物联网感知层：部署各类传感器和智能设备
• 网络通信层：建设高速、稳定的通信网络
• 数据处理层：构建大数据分析和处理平台
• 应用服务层：开发各类智慧应用系统
• 用户界面层：提供便民服务门户

四、实施方案
第一阶段：基础设施建设（6个月）
- 网络基础设施升级
- 数据中心建设
- 安全体系构建

第二阶段：平台开发（12个月）
- 数据管理平台开发
- 业务应用系统建设
- 系统集成测试

第三阶段：试点运行（6个月）
- 选择重点区域试点
- 系统优化调整
- 用户培训推广

五、预期效果
• 城市管理效率提升30%
• 公共服务满意度提升25%
• 能源消耗降低20%
• 交通拥堵减少15%

六、投资预算
总投资：5000万元
- 基础设施：2000万元
- 软件开发：1500万元
- 设备采购：1000万元
- 其他费用：500万元`;
    } else if (fileName.includes('绿色能源') || caseData.caseName.includes('绿色能源')) {
      return `绿色能源示范园区建设规划

一、项目概述
本项目旨在建设一个集太阳能、风能、储能于一体的绿色能源示范园区，实现清洁能源的高效利用和智能管理，为区域绿色发展提供典型示范。

二、建设规模
• 园区总面积：500亩
• 太阳能发电装机容量：50MW
• 风力发电装机容量：20MW
• 储能系统容量：30MWh
• 年发电量：1.2亿千瓦时

三、技术方案
1. 太阳能发电系统
- 采用高效单晶硅组件
- 智能跟踪系统
- 分布式逆变器

2. 风力发电系统
- 大型风力发电机组
- 智能控制系统
- 并网保护装置

3. 储能系统
- 锂电池储能
- 智能管理系统
- 安全监控系统

4. 智能电网
- 微电网控制系统
- 能源管理平台
- 负荷预测系统

四、环保效益
• 年减少二氧化碳排放：8万吨
• 年节约标准煤：3.2万吨
• 减少二氧化硫排放：240吨
• 减少氮氧化物排放：120吨

五、经济效益
• 总投资：3.5亿元
• 年发电收入：8000万元
• 投资回收期：6年
• 25年总收益：15亿元

六、社会效益
• 提供就业岗位：200个
• 带动相关产业发展
• 提升区域形象
• 推广清洁能源理念`;
    } else if (fileName.includes('数字化教育') || caseData.caseName.includes('数字化教育')) {
      return `数字化教育改革实践方案

一、改革背景
传统教育模式面临诸多挑战，数字化技术为教育改革提供了新的机遇。本方案旨在运用数字技术改革传统教育模式，建设智慧校园，推进教育公平和质量提升。

二、改革目标
1. 构建数字化教学环境
2. 创新教学模式和方法
3. 提升教育教学质量
4. 促进教育公平发展
5. 培养数字化人才

三、建设内容
1. 基础设施建设
• 校园网络升级改造
• 智慧教室建设
• 数字化实验室
• 云计算中心

2. 平台系统建设
• 教学管理平台
• 学习资源平台
• 评价分析系统
• 家校互动平台

3. 资源内容建设
• 数字化课程资源
• 虚拟仿真实验
• 在线题库系统
• 教学视频库

四、实施策略
第一阶段：试点建设（1年）
- 选择10所学校试点
- 建设基础设施
- 开发核心平台

第二阶段：推广应用（2年）
- 扩展到100所学校
- 完善平台功能
- 培训师资队伍

第三阶段：全面覆盖（2年）
- 覆盖全市200所学校
- 优化系统性能
- 建立长效机制

五、预期成果
• 覆盖学校：200所
• 受益师生：15万人
• 数字化课程：1000门
• 在线资源：10万个

六、保障措施
1. 组织保障：成立领导小组
2. 资金保障：政府投入+社会资本
3. 技术保障：与高校合作
4. 人才保障：师资培训计划`;
    } else {
      return `${caseData.caseName || '案例文档'}

一、项目概述
本项目是一个重要的典型案例，具有重要的示范意义和推广价值。通过科学规划、精心组织、有序实施，项目取得了显著成效。

二、主要内容
1. 项目背景分析
2. 实施方案设计
3. 关键技术应用
4. 组织管理模式
5. 效果评估分析

三、创新亮点
• 理念创新：提出了新的发展理念
• 技术创新：采用了先进的技术方案
• 模式创新：探索了新的管理模式
• 机制创新：建立了有效的运行机制

四、实施效果
通过项目实施，取得了良好的经济效益、社会效益和环境效益，为同类项目提供了有益借鉴。

五、经验总结
1. 加强顶层设计
2. 注重统筹协调
3. 强化技术支撑
4. 完善保障措施
5. 建立长效机制

六、推广建议
建议在更大范围内推广应用本案例的成功经验和做法，发挥典型示范作用，推动相关领域的发展进步。

文件大小：${file.sizeFormatted || file.size || '未知'}
上传时间：${caseData.uploadTime || '未知'}`;
    }
  },

  // 自动打开新闻链接
  autoOpenNewsLink(link) {
    wx.showModal({
      title: '🔗 自动跳转新闻',
      content: `即将自动跳转到：\n"${link.title}"\n\n是否立即跳转？`,
      confirmText: '立即跳转',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 直接跳转到外部链接
          this.openExternalLink(link.url);
        }
      }
    });
  },

  // 打开外部链接
  openExternalLink(url) {
    // 显示跳转提示
    wx.showLoading({
      title: '正在跳转...'
    });

    // 方法1：尝试使用web-view跳转
    setTimeout(() => {
      wx.hideLoading();

      // 创建一个临时页面来显示web-view
      wx.navigateTo({
        url: `/pages/webview/webview?url=${encodeURIComponent(url)}`,
        fail: () => {
          // 如果没有webview页面，使用方法2
          this.fallbackOpenLink(url);
        }
      });
    }, 1000);
  },

  // 备用打开链接方法
  fallbackOpenLink(url) {
    // 方法2：复制链接并提供详细指导
    wx.setClipboardData({
      data: url,
      success: () => {
        wx.showModal({
          title: '🚀 链接已准备就绪',
          content: `链接已自动复制！\n\n快速打开方式：\n1. 打开微信聊天\n2. 长按输入框粘贴\n3. 点击链接直接跳转\n\n或者打开浏览器粘贴访问`,
          confirmText: '知道了',
          showCancel: false
        });
      },
      fail: () => {
        // 方法3：显示链接让用户手动复制
        wx.showModal({
          title: '📋 请手动复制链接',
          content: `请复制以下链接到浏览器打开：\n\n${url}`,
          confirmText: '知道了',
          showCancel: false
        });
      }
    });
  },

  // 直接打开主文件
  openMainFile() {
    const caseData = this.data.caseData;
    if (!caseData || !caseData.files || caseData.files.length === 0) {
      wx.showToast({
        title: '没有可打开的文件',
        icon: 'none'
      });
      return;
    }

    const mainFile = caseData.files[0];

    // 创建模拟事件对象
    const mockEvent = {
      currentTarget: {
        dataset: {
          file: mainFile
        }
      }
    };

    // 调用预览文件方法
    this.previewFile(mockEvent);
  },

  // 预览文件
  previewFile(e) {
    const file = e.currentTarget.dataset.file;
    const apiConfig = require('../../config/api.js');

    if (apiConfig.isMockEnabled()) {
      // 开发模式：显示文件信息
      wx.showModal({
        title: '文件预览（开发模式）',
        content: `文件名：${file.fileName || file.name}\n文件大小：${file.fileSize || file.size}\n文件类型：${file.fileType || '未知'}\n\n开发模式下无法实际打开文件，生产环境中将支持文件预览功能。`,
        showCancel: false,
        confirmText: '知道了'
      });
      return;
    }

    // 生产模式：实际预览文件
    const fileUrl = file.fileUrl || file.url;

    if (!fileUrl || fileUrl === '#') {
      wx.showToast({
        title: '文件链接无效',
        icon: 'none'
      });
      return;
    }

    // 显示加载提示
    wx.showLoading({
      title: '正在加载文件...'
    });

    if (file.fileType === 'image' || this.isImageFile(file.fileName || file.name)) {
      // 图片文件直接预览
      wx.hideLoading();
      wx.previewImage({
        urls: [fileUrl],
        current: fileUrl,
        fail: (error) => {
          console.error('图片预览失败:', error);
          wx.showToast({
            title: '图片预览失败',
            icon: 'none'
          });
        }
      });
    } else if (file.fileType === 'pdf' || file.fileType === 'doc' || file.fileType === 'docx' ||
               file.fileType === 'excel' || file.fileType === 'ppt' || this.isDocumentFile(file.fileName || file.name)) {
      // 文档文件下载后打开
      wx.downloadFile({
        url: fileUrl,
        header: {
          'Content-Type': 'application/octet-stream'
        },
        success: (res) => {
          wx.hideLoading();
          if (res.statusCode === 200) {
            wx.openDocument({
              filePath: res.tempFilePath,
              fileType: file.fileType || this.getFileTypeFromName(file.fileName || file.name),
              success: () => {
                console.log('文档打开成功');
              },
              fail: (error) => {
                console.error('文档打开失败:', error);
                wx.showModal({
                  title: '文件打开失败',
                  content: '可能是文件格式不支持或文件已损坏，请尝试下载到本地查看。',
                  confirmText: '下载文件',
                  cancelText: '取消',
                  success: (modalRes) => {
                    if (modalRes.confirm) {
                      this.downloadFile(e);
                    }
                  }
                });
              }
            });
          } else {
            wx.hideLoading();
            wx.showToast({
              title: '文件下载失败',
              icon: 'none'
            });
          }
        },
        fail: (error) => {
          wx.hideLoading();
          console.error('文件下载失败:', error);
          wx.showModal({
            title: '文件下载失败',
            content: '网络连接异常或文件不存在，请检查网络连接后重试。',
            showCancel: false,
            confirmText: '知道了'
          });
        }
      });
    } else {
      // 其他类型文件提示下载
      wx.hideLoading();
      wx.showModal({
        title: '文件类型提示',
        content: '该文件类型暂不支持在线预览，是否下载到本地查看？',
        confirmText: '下载',
        cancelText: '取消',
        success: (modalRes) => {
          if (modalRes.confirm) {
            this.downloadFile(e);
          }
        }
      });
    }
  },

  // 判断是否为图片文件
  isImageFile(fileName) {
    const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'];
    const ext = fileName.split('.').pop().toLowerCase();
    return imageExts.includes(ext);
  },

  // 判断是否为文档文件
  isDocumentFile(fileName) {
    const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
    const ext = fileName.split('.').pop().toLowerCase();
    return docExts.includes(ext);
  },

  // 从文件名获取文件类型
  getFileTypeFromName(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const typeMap = {
      'pdf': 'pdf',
      'doc': 'doc',
      'docx': 'docx',
      'xls': 'xls',
      'xlsx': 'xlsx',
      'ppt': 'ppt',
      'pptx': 'pptx'
    };
    return typeMap[ext] || ext;
  },

  // 下载文件
  downloadFile(e) {
    const file = e.currentTarget.dataset.file;
    const apiConfig = require('../../config/api.js');

    if (apiConfig.isMockEnabled()) {
      wx.showToast({
        title: '下载功能开发中',
        icon: 'none'
      });
      return;
    }

    const fileUrl = file.fileUrl || file.url;

    if (!fileUrl || fileUrl === '#') {
      wx.showToast({
        title: '文件链接无效',
        icon: 'none'
      });
      return;
    }

    // 显示下载进度
    wx.showLoading({
      title: '正在下载...'
    });

    const downloadTask = wx.downloadFile({
      url: fileUrl,
      header: {
        'Content-Type': 'application/octet-stream'
      },
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          // 保存文件到本地
          wx.saveFile({
            tempFilePath: res.tempFilePath,
            success: (saveRes) => {
              wx.showModal({
                title: '下载成功',
                content: `文件已保存到本地\n文件名：${file.fileName || file.name}`,
                confirmText: '打开文件',
                cancelText: '知道了',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    // 尝试打开已保存的文件
                    wx.openDocument({
                      filePath: saveRes.savedFilePath,
                      success: () => {
                        console.log('文件打开成功');
                      },
                      fail: (error) => {
                        console.error('文件打开失败:', error);
                        wx.showToast({
                          title: '文件已保存，但无法打开',
                          icon: 'none'
                        });
                      }
                    });
                  }
                }
              });
            },
            fail: (error) => {
              console.error('文件保存失败:', error);
              wx.showToast({
                title: '文件保存失败',
                icon: 'none'
              });
            }
          });
        } else {
          wx.showToast({
            title: '文件下载失败',
            icon: 'none'
          });
        }
      },
      fail: (error) => {
        wx.hideLoading();
        console.error('文件下载失败:', error);
        wx.showModal({
          title: '下载失败',
          content: '网络连接异常或文件不存在，请检查网络连接后重试。',
          showCancel: false,
          confirmText: '知道了'
        });
      }
    });

    // 监听下载进度
    downloadTask.onProgressUpdate((res) => {
      if (res.progress > 0) {
        wx.showLoading({
          title: `下载中 ${res.progress}%`
        });
      }
    });
  },

  // 播放视频
  playVideo(e) {
    const video = e.currentTarget.dataset.video;
    const apiConfig = require('../../config/api.js');

    if (apiConfig.isMockEnabled()) {
      // 开发模式：显示视频信息
      wx.showModal({
        title: '视频播放（开发模式）',
        content: `视频名称：${video.videoName || video.name}\n视频时长：${video.videoDuration || video.duration || '未知'}\n\n开发模式下无法实际播放视频，生产环境中将支持视频播放功能。`,
        showCancel: false,
        confirmText: '知道了'
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/video-player/video-player?url=${encodeURIComponent(video.videoUrl)}&title=${encodeURIComponent(video.videoName)}`
    });
  },

  // 打开链接
  openLink(e) {
    const link = e.currentTarget.dataset.link;

    wx.showModal({
      title: '打开新闻链接',
      content: `新闻标题：${link.linkTitle || link.title}\n链接地址：${link.linkUrl || link.url}\n\n是否复制链接到剪贴板？`,
      confirmText: '复制链接',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: link.linkUrl || link.url,
            success: () => {
              wx.showToast({
                title: '链接已复制到剪贴板',
                icon: 'success'
              });
            }
          });
        }
      }
    });
  },

  // 获取默认案例数据
  getDefaultCases() {
    return [
      {
        id: 1,
        caseName: '智慧城市建设典型案例',
        title: '智慧城市建设典型案例',
        category: '基础设施建设',
        createDate: '2024-01-15',
        uploadTime: '2024-01-15 10:30:00',
        description: '通过物联网、大数据、人工智能等技术，构建智慧城市管理平台，实现城市治理现代化，提升市民生活质量。',
        author: '市信息化办公室',
        contact: '张主任 - 13800138000',
        files: [
          { name: '智慧城市建设方案.pdf', size: '2.5MB' },
          { name: '技术架构图.png', size: '1.2MB' }
        ],
        videos: [
          { name: '智慧城市演示视频.mp4', duration: '5:30' }
        ],
        links: [
          { title: '智慧城市官方网站', url: 'https://smartcity.example.com' }
        ]
      },
      {
        id: 2,
        caseName: '绿色能源示范园区建设案例',
        title: '绿色能源示范园区建设案例',
        category: '环保治理',
        createDate: '2024-02-10',
        uploadTime: '2024-02-10 14:20:00',
        description: '建设集太阳能、风能、储能于一体的绿色能源示范园区，实现清洁能源的高效利用和智能管理。',
        author: '市发改委',
        contact: '李处长 - 13900139000',
        files: [
          { name: '绿色能源规划书.docx', size: '3.1MB' },
          { name: '能源效率报告.xlsx', size: '800KB' }
        ],
        videos: [
          { name: '园区建设纪录片.mp4', duration: '8:45' }
        ],
        links: [
          { title: '绿色能源政策解读', url: 'https://greenenergy.example.com' }
        ]
      },
      {
        id: 3,
        caseName: '数字化教育改革实践案例',
        title: '数字化教育改革实践案例',
        category: '民生改善',
        createDate: '2024-03-05',
        uploadTime: '2024-03-05 09:15:00',
        description: '运用数字技术改革传统教育模式，建设智慧校园，推进教育公平和质量提升。',
        author: '市教育局',
        contact: '王局长 - 13700137000',
        files: [
          { name: '数字化教育方案.pdf', size: '4.2MB' },
          { name: '教学效果评估.pptx', size: '6.8MB' }
        ],
        videos: [
          { name: '智慧课堂演示.mp4', duration: '12:20' }
        ],
        links: [
          { title: '数字化教育平台', url: 'https://education.example.com' },
          { title: '在线学习资源', url: 'https://learning.example.com' }
        ]
      }
    ];
  },

  // 分享案例
  shareCase() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  onShareAppMessage() {
    const caseData = this.data.caseData;
    return {
      title: caseData.caseName,
      desc: caseData.description,
      path: `/pages/case_document/case_document?id=${caseData.id}`
    };
  },

  onShareTimeline() {
    const caseData = this.data.caseData;
    return {
      title: caseData.caseName,
      desc: caseData.description,
      path: `/pages/case_document/case_document?id=${caseData.id}`
    };
  }
});
