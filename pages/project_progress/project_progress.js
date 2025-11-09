Page({
  data: {
    projectId: null,
    projectData: null,
    loading: true,
    selectedDate: '',
    timeFilter: 'all', // 时间筛选：week, month, year, all
    progressList: [],
    filteredProgressList: [],
    progressStats: {
      totalRecords: 0,
      completedTasks: 0,
      ongoingTasks: 0,
      pendingTasks: 0
    },
    serverAvailable: true // 服务器可用状态
  },

  onLoad: function(options) {
    console.log('项目进度页面加载', options);
    if (options.id) {
      this.setData({
        projectId: parseInt(options.id)
      });
      this.loadProjectData();
    }
  },

  // 检查服务器状态
  checkServerStatus: function() {
    const apiConfig = require('../../config/api.js');
    const testUrl = apiConfig.buildFileUrl('test.txt');
    
    wx.request({
      url: testUrl,
      method: 'HEAD',
      timeout: 5000,
      success: (res) => {
        console.log('服务器状态检查成功:', res.statusCode);
        this.setData({
          serverAvailable: true
        });
      },
      fail: (err) => {
        console.log('服务器状态检查失败:', err);
        this.setData({
          serverAvailable: false
        });
        
        // 显示服务器不可用的提示
        wx.showToast({
          title: '本地服务器未启动，部分功能可能受限',
          icon: 'none',
          duration: 3000
        });
      }
    });
  },

  navigateBack: function() {
    wx.navigateBack();
  },

  // 跳转到删除管理页面
  goToDeletePage: function() {
    // 获取项目名称
    let projectName = '';
    if (this.data.projectData && this.data.projectData.projectName) {
      projectName = this.data.projectData.projectName;
    } else {
      // 如果没有项目数据，使用默认项目名称
      projectName = "全民数字素养与技能培训基地龙门分中心建设项目";
    }
    
    wx.navigateTo({
      url: `/pages/progress_delete_manager/progress_delete_manager?projectName=${encodeURIComponent(projectName)}`
    });
  },

  loadProjectData: function() {
    this.setData({ loading: true });
    
    // 检查服务器状态
    this.checkServerStatus();
    
    const apiConfig = require('../../config/api.js');
    
    if (apiConfig.isMockEnabled()) {
      // 开发模式：从本地数据加载
      setTimeout(() => {
        const projectData = this.getProjectById(this.data.projectId);
        const progressList = this.generateProgressData(projectData);
        const stats = this.calculateStats(progressList);
        
        this.setData({
          projectData: projectData,
          progressList: progressList,
          filteredProgressList: progressList,
          progressStats: stats,
          loading: false
        });
      }, 500);
      return;
    }

    // 生产模式：调用数据库服务
    try {
      const dbService = require('../../utils/databaseService.js');
      const db = new dbService();
      
      Promise.all([
        db.getFifteenProjectById(this.data.projectId),
        db.getProjectProgressList(this.data.projectId)
      ]).then(([projectResult, progressResult]) => {
        if (projectResult.success && progressResult.success) {
          const stats = this.calculateStats(progressResult.progressList);
          
          this.setData({
            projectData: projectResult.project,
            progressList: progressResult.progressList,
            filteredProgressList: progressResult.progressList,
            progressStats: stats,
            loading: false
          });
        } else {
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          });
          this.setData({ loading: false });
        }
      }).catch(error => {
        console.error('加载项目数据失败:', error);
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
        this.setData({ loading: false });
      });
    } catch (error) {
      console.error('加载项目数据失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  // 获取项目数据
  getProjectById: function(projectId) {
    const defaultProjects = [
      {
        id: 1,
        projectName: "智慧城市基础设施建设项目",
        projectType: "基础设施建设",
        objectives: "建设覆盖全市的智慧城市基础设施网络，包括物联网传感器部署、数据中心建设、智能交通系统等，提升城市管理效率和市民生活质量。预计完成后将服务人口500万，实现城市管理数字化转型。项目总投资15亿元，分三个阶段实施，将打造全国领先的智慧城市示范区。",
        startDate: "2024-01-15",
        endDate: "2024-12-31",
        progress: 68,
        createDate: "2024-01-15"
      },
      {
        id: 2,
        projectName: "绿色能源产业园区建设",
        projectType: "产业发展",
        objectives: "建设集太阳能、风能、储能技术于一体的绿色能源产业园区，打造清洁能源产业集群。园区规划面积1000亩，预计引入企业50家，年产值达到100亿元，成为区域绿色发展示范基地。项目将建设50MW太阳能发电站、20MW风力发电站和大型储能设施。",
        startDate: "2024-02-01",
        endDate: "2025-01-31",
        progress: 52,
        createDate: "2024-02-01"
      },
      {
        id: 3,
        projectName: "数字化教育改革试点",
        projectType: "民生改善",
        objectives: "在全市200所学校实施数字化教育改革，建设智慧教室、在线学习平台、教师培训体系等。通过技术手段实现个性化教学，提升教育质量，缩小城乡教育差距，惠及师生15万人。项目包括建设1000间智慧教室、培训5000名教师、开发100门在线课程。",
        startDate: "2024-03-01",
        endDate: "2024-11-30",
        progress: 82,
        createDate: "2024-03-01"
      },
      {
        id: 4,
        projectName: "城市轨道交通建设工程",
        projectType: "交通建设",
        objectives: "建设全长120公里的城市轨道交通网络，包括地铁1号线、2号线和轻轨3号线，缓解城市交通压力，提升公共交通服务水平。项目总投资800亿元，预计日客流量达到200万人次，将极大改善市民出行条件。",
        startDate: "2024-01-01",
        endDate: "2026-12-31",
        progress: 35,
        createDate: "2024-01-01"
      },
      {
        id: 5,
        projectName: "现代农业科技示范园",
        projectType: "农业发展",
        objectives: "建设占地5000亩的现代农业科技示范园，推广智慧农业技术，发展高效生态农业。园区将建设智能温室、无土栽培基地、农产品加工中心等，年产值预计达到10亿元，带动周边农民增收致富。",
        startDate: "2024-04-01",
        endDate: "2025-03-31",
        progress: 28,
        createDate: "2024-04-01"
      }
    ];

    return defaultProjects.find(p => p.id === projectId) || defaultProjects[0];
  },

  // 生成进度数据
  generateProgressData: function(projectData) {
    const apiConfig = require('../../config/api.js');
    
    const progressTemplates = {
      1: [ // 智慧城市项目
        {
          id: 1,
          date: "2024-01-15",
          time: "09:00",
          title: "项目启动会议",
          location: "市政府会议室",
          person: "项目经理张三",
          description: "召开项目启动会议，确定项目目标和时间节点，成立项目领导小组",
          status: "completed",
          statusText: "已完成",
          completion: 100,
          images: [
            apiConfig.buildFileUrl('project_image_1.jpg'),
            apiConfig.buildFileUrl('project_image_2.jpg')
          ],
          videos: [
            apiConfig.buildFileUrl('project_video_1.mp4')
          ],
          documents: [
            apiConfig.buildFileUrl('project_document_1.pdf')
          ]
        },
        {
          id: 2,
          date: "2024-01-25",
          time: "14:30",
          title: "可行性研究报告审批",
          location: "市发改委",
          person: "规划师李明",
          description: "完成项目可行性研究报告编制和专家评审，获得正式批复",
          status: "completed",
          statusText: "已完成",
          completion: 100,
          images: [
            apiConfig.buildFileUrl('feasibility_report_1.jpg')
          ],
          videos: [],
          documents: [
            apiConfig.buildFileUrl('feasibility_report.pdf')
          ]
        },
        {
          id: 3,
          date: "2024-02-20",
          time: "10:15",
          title: "设备采购招标",
          location: "市采购中心",
          person: "采购专员李四",
          description: "完成物联网设备和服务器设备的招标采购工作，中标金额3.2亿元",
          status: "completed",
          statusText: "已完成",
          completion: 100,
          images: [
            apiConfig.buildFileUrl('bidding_meeting_1.jpg'),
            apiConfig.buildFileUrl('bidding_meeting_2.jpg')
          ],
          videos: [
            apiConfig.buildFileUrl('bidding_process.mp4')
          ],
          documents: [
            apiConfig.buildFileUrl('bidding_documents.pdf')
          ]
        },
        {
          id: 4,
          date: "2024-03-10",
          time: "08:45",
          title: "数据中心建设开工",
          location: "高新区数据中心基地",
          person: "工程师王五",
          description: "数据中心土建工程正式开工，占地面积5000平方米，预计6月完成主体建设",
          status: "completed",
          statusText: "已完成",
          completion: 100,
          images: [],
          videos: [],
          documents: []
        },
        {
          id: 5,
          date: "2024-04-18",
          time: "15:20",
          title: "网络基础设施建设",
          location: "市区主干道",
          person: "网络工程师陈六",
          description: "完成主城区光纤网络铺设，总长度达到500公里，覆盖率95%",
          status: "completed",
          statusText: "已完成",
          completion: 100,
          images: [],
          videos: [],
          documents: []
        },
        {
          id: 6,
          date: "2024-05-22",
          time: "11:10",
          title: "智能交通系统安装",
          location: "市区各主要路口",
          person: "交通工程师刘七",
          description: "在50个主要路口安装智能交通信号灯和监控设备",
          status: "completed",
          statusText: "已完成",
          completion: 100,
          images: []
        },
        {
          id: 7,
          date: "2024-06-15",
          time: "16:20",
          title: "传感器网络部署",
          location: "市区各主要路口",
          person: "技术员赵六",
          description: "在市区主要路口和公共区域部署物联网传感器200个，实时监测环境数据",
          status: "ongoing",
          statusText: "进行中",
          completion: 75,
          images: []
        },
        {
          id: 8,
          date: "2024-07-08",
          time: "09:45",
          title: "数据中心设备安装",
          location: "高新区数据中心",
          person: "硬件工程师孙八",
          description: "安装服务器机柜50台，存储设备20套，网络设备30台",
          status: "ongoing",
          statusText: "进行中",
          completion: 85,
          images: []
        },
        {
          id: 9,
          date: "2024-08-01",
          time: "11:30",
          title: "系统集成测试",
          location: "数据中心机房",
          person: "系统工程师孙七",
          description: "进行智慧城市管理平台的系统集成和功能测试，测试各子系统连通性",
          status: "ongoing",
          statusText: "进行中",
          completion: 60,
          images: []
        },
        {
          id: 10,
          date: "2024-08-05",
          time: "14:15",
          title: "今日进度检查",
          location: "项目现场",
          person: "项目经理张三",
          description: "检查各子项目进度，协调解决技术难题，确保项目按期完成",
          status: "ongoing",
          statusText: "进行中",
          completion: 70,
          images: []
        },
        {
          id: 11,
          date: "2024-09-15",
          time: "10:00",
          title: "用户培训计划",
          location: "市民服务中心",
          person: "培训师王九",
          description: "开展市民智慧城市服务使用培训，预计培训5000人次",
          status: "pending",
          statusText: "待开始",
          completion: 0,
          images: []
        },
        {
          id: 12,
          date: "2024-10-30",
          time: "16:00",
          title: "系统正式上线",
          location: "市政府",
          person: "项目经理张三",
          description: "智慧城市管理平台正式上线运行，面向全市提供服务",
          status: "pending",
          statusText: "待开始",
          completion: 0,
          images: []
        }
      ],
      2: [ // 绿色能源项目
        {
          id: 13,
          date: "2024-02-01",
          time: "08:30",
          title: "园区规划设计",
          location: "规划设计院",
          person: "规划师周八",
          description: "完成绿色能源产业园区的总体规划和详细设计，通过专家评审",
          status: "completed",
          statusText: "已完成",
          completion: 100,
          images: []
        },
        {
          id: 14,
          date: "2024-02-28",
          time: "10:20",
          title: "环评报告审批",
          location: "市环保局",
          person: "环评专家李十",
          description: "完成环境影响评价报告编制和审批，获得环保部门批复",
          status: "completed",
          statusText: "已完成",
          completion: 100,
          images: []
        },
        {
          id: 15,
          date: "2024-03-15",
          time: "14:00",
          title: "土地征收工作",
          location: "园区周边村庄",
          person: "征收办主任钱一",
          description: "完成1000亩土地征收工作，签订征收补偿协议",
          status: "completed",
          statusText: "已完成",
          completion: 100,
          images: []
        },
        {
          id: 16,
          date: "2024-04-15",
          time: "13:45",
          title: "土地平整工程",
          location: "园区建设现场",
          person: "施工队长吴九",
          description: "完成园区1000亩土地的平整和基础设施建设，修建道路10公里",
          status: "completed",
          statusText: "已完成",
          completion: 100,
          images: []
        },
        {
          id: 17,
          date: "2024-05-20",
          time: "09:15",
          title: "电力配套设施建设",
          location: "园区配电站",
          person: "电力工程师孙二",
          description: "建设110KV变电站和配电网络，满足园区用电需求",
          status: "completed",
          statusText: "已完成",
          completion: 100,
          images: []
        },
        {
          id: 18,
          date: "2024-06-10",
          time: "16:30",
          title: "风力发电机安装",
          location: "园区B区",
          person: "风电工程师李三",
          description: "安装20MW风力发电机组5台，完成基础建设和设备调试",
          status: "completed",
          statusText: "已完成",
          completion: 100,
          images: []
        },
        {
          id: 19,
          date: "2024-07-20",
          time: "15:10",
          title: "太阳能板安装",
          location: "园区A区",
          person: "安装工程师郑十",
          description: "安装第一批太阳能发电板，装机容量20MW，完成支架搭建",
          status: "ongoing",
          statusText: "进行中",
          completion: 65,
          images: []
        },
        {
          id: 20,
          date: "2024-08-05",
          time: "11:45",
          title: "储能设施建设",
          location: "园区储能中心",
          person: "储能工程师王四",
          description: "建设大型锂电池储能系统，容量100MWh，目前完成设备采购",
          status: "ongoing",
          statusText: "进行中",
          completion: 40,
          images: []
        },
        {
          id: 21,
          date: "2024-09-01",
          time: "08:00",
          title: "企业招商引资",
          location: "园区管委会",
          person: "招商经理赵五",
          description: "开展清洁能源企业招商，已签约企业15家，投资额达30亿元",
          status: "pending",
          statusText: "待开始",
          completion: 0,
          images: []
        }
      ],
      3: [ // 数字化教育项目
        {
          id: 22,
          date: "2024-03-01",
          time: "09:15",
          title: "教师培训启动",
          location: "市教育培训中心",
          person: "培训师钱一",
          description: "启动数字化教学技能培训，首批培训教师500名，培训周期3个月",
          status: "completed",
          statusText: "已完成",
          completion: 100,
          images: []
        },
        {
          id: 23,
          date: "2024-03-20",
          time: "14:30",
          title: "教学设备采购",
          location: "市教育局",
          person: "采购主管周六",
          description: "完成智慧教室设备采购，包括交互式白板、平板电脑等",
          status: "completed",
          statusText: "已完成",
          completion: 100,
          images: []
        },
        {
          id: 24,
          date: "2024-04-15",
          time: "10:00",
          title: "网络基础设施升级",
          location: "各试点学校",
          person: "网络工程师吴七",
          description: "升级50所试点学校的网络设施，实现千兆宽带全覆盖",
          status: "completed",
          statusText: "已完成",
          completion: 100,
          images: []
        },
        {
          id: 25,
          date: "2024-05-10",
          time: "14:20",
          title: "智慧教室建设",
          location: "第一中学",
          person: "技术员孙二",
          description: "完成200间智慧教室的设备安装和调试工作，覆盖50所学校",
          status: "completed",
          statusText: "已完成",
          completion: 100,
          images: []
        },
        {
          id: 26,
          date: "2024-06-01",
          time: "16:45",
          title: "教学资源开发",
          location: "教育资源中心",
          person: "课程开发师郑八",
          description: "开发数字化教学资源100套，涵盖各学科重点内容",
          status: "completed",
          statusText: "已完成",
          completion: 100,
          images: []
        },
        {
          id: 27,
          date: "2024-07-15",
          time: "10:45",
          title: "在线平台上线",
          location: "教育局信息中心",
          person: "开发工程师李三",
          description: "数字化教育平台正式上线，支持在线教学和学习，注册用户达5万",
          status: "ongoing",
          statusText: "进行中",
          completion: 90,
          images: []
        },
        {
          id: 28,
          date: "2024-08-05",
          time: "09:30",
          title: "学生使用培训",
          location: "各试点学校",
          person: "培训师王九",
          description: "开展学生数字化学习技能培训，已培训学生2万名",
          status: "ongoing",
          statusText: "进行中",
          completion: 75,
          images: []
        },
        {
          id: 29,
          date: "2024-09-01",
          time: "08:00",
          title: "新学期全面推广",
          location: "全市200所学校",
          person: "教育局局长刘十",
          description: "新学期开始全面推广数字化教学，覆盖全市所有中小学",
          status: "pending",
          statusText: "待开始",
          completion: 0,
          images: []
        }
      ],
      4: [ // 城市轨道交通项目
        {
          id: 30,
          date: "2024-01-01",
          time: "10:00",
          title: "项目前期准备",
          location: "市交通委",
          person: "项目总监陈一",
          description: "完成项目立项、可研报告编制和专家评审工作",
          status: "completed",
          statusText: "已完成",
          completion: 100,
          images: []
        },
        {
          id: 31,
          date: "2024-02-15",
          time: "14:20",
          title: "地质勘探工作",
          location: "地铁1号线沿线",
          person: "地质工程师李二",
          description: "完成地铁1号线全线地质勘探，确定施工方案",
          status: "completed",
          statusText: "已完成",
          completion: 100,
          images: []
        },
        {
          id: 32,
          date: "2024-04-01",
          time: "08:30",
          title: "1号线开工建设",
          location: "市中心站",
          person: "施工经理王三",
          description: "地铁1号线正式开工建设，首个车站开始土方开挖",
          status: "ongoing",
          statusText: "进行中",
          completion: 35,
          images: []
        },
        {
          id: 33,
          date: "2024-08-05",
          time: "16:15",
          title: "盾构机下井",
          location: "火车站",
          person: "盾构工程师赵四",
          description: "首台盾构机成功下井，开始地下隧道掘进工作",
          status: "ongoing",
          statusText: "进行中",
          completion: 25,
          images: []
        }
      ],
      5: [ // 现代农业项目
        {
          id: 34,
          date: "2024-04-01",
          time: "09:00",
          title: "园区规划设计",
          location: "农业园区",
          person: "农业专家孙五",
          description: "完成现代农业科技示范园总体规划和功能分区设计",
          status: "completed",
          statusText: "已完成",
          completion: 100,
          images: []
        },
        {
          id: 35,
          date: "2024-05-15",
          time: "13:30",
          title: "智能温室建设",
          location: "园区A区",
          person: "建设工程师钱六",
          description: "开始建设智能温室大棚50座，采用自动化控制系统",
          status: "ongoing",
          statusText: "进行中",
          completion: 40,
          images: []
        },
        {
          id: 36,
          date: "2024-08-05",
          time: "11:20",
          title: "无土栽培试验",
          location: "试验温室",
          person: "农技师周七",
          description: "开展无土栽培技术试验，种植高品质蔬菜和水果",
          status: "ongoing",
          statusText: "进行中",
          completion: 30,
          images: []
        }
      ]
    };

    const progressData = progressTemplates[projectData.id] || progressTemplates[1];

    // 标记今天的记录
    const today = new Date().toISOString().split('T')[0];
    return progressData.map(item => ({
      ...item,
      isToday: item.date === today
    })).sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
  },

  // 计算统计数据
  calculateStats: function(progressList) {
    const totalRecords = progressList.length;
    const completedTasks = progressList.filter(item => item.status === 'completed').length;
    const ongoingTasks = progressList.filter(item => item.status === 'ongoing').length;
    const pendingTasks = progressList.filter(item => item.status === 'pending').length;

    return {
      totalRecords,
      completedTasks,
      ongoingTasks,
      pendingTasks
    };
  },

  // 按时间段筛选
  filterByTime: function(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({
      timeFilter: filter,
      selectedDate: '' // 清除具体日期选择
    });
    this.applyTimeFilter(filter);
  },

  // 应用时间筛选
  applyTimeFilter: function(filter) {
    const now = new Date();
    let filtered = this.data.progressList;

    if (filter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = this.data.progressList.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= weekAgo;
      });
    } else if (filter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = this.data.progressList.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= monthAgo;
      });
    } else if (filter === 'year') {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      filtered = this.data.progressList.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= yearAgo;
      });
    }

    this.setData({
      filteredProgressList: filtered
    });
  },

  // 日期选择
  onDateChange: function(e) {
    const selectedDate = e.detail.value;
    this.setData({
      selectedDate,
      timeFilter: '' // 清除时间段筛选
    });
    this.filterProgressByDate(selectedDate);
  },

  // 按日期筛选进度
  filterProgressByDate: function(date) {
    if (!date) {
      this.setData({
        filteredProgressList: this.data.progressList
      });
      return;
    }

    const filtered = this.data.progressList.filter(item => item.date === date);
    this.setData({
      filteredProgressList: filtered
    });
  },

  // 删除进度记录
  deleteProgress: function(e) {
    const progressId = e.currentTarget.dataset.id;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条进度记录吗？',
      success: (res) => {
        if (res.confirm) {
          // 从进度列表中删除
          const updatedProgressList = this.data.progressList.filter(item => item.id !== progressId);
          const updatedFilteredList = this.data.filteredProgressList.filter(item => item.id !== progressId);

          // 重新计算统计数据
          const stats = this.calculateStats(updatedProgressList);

          this.setData({
            progressList: updatedProgressList,
            filteredProgressList: updatedFilteredList,
            progressStats: stats
          });

          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });

          // TODO: 调用后端API删除数据
          console.log('删除进度记录:', progressId);
        }
      }
    });
  },

  // 查看进度详情
  viewProgressDetail: function(e) {
    const progress = e.currentTarget.dataset.progress;
    wx.showModal({
      title: progress.title,
      content: `时间：${progress.date} ${progress.time}\n地点：${progress.location}\n负责人：${progress.person}\n\n详情：${progress.description}`,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 预览图片
  previewImage: function(e) {
    const src = e.currentTarget.dataset.src;
    const urls = e.currentTarget.dataset.urls;
    
    // 确保URLs是数组格式
    const imageUrls = Array.isArray(urls) ? urls : [src];
    
    wx.previewImage({
      urls: imageUrls,
      current: src
    });
  },

  // 预览视频
  previewVideo: function(e) {
    const videoUrl = e.currentTarget.dataset.src;
    const title = e.currentTarget.dataset.title || '视频预览';
    
    // 检查URL是否有效
    if (!videoUrl) {
      wx.showToast({
        title: '视频路径无效',
        icon: 'none'
      });
      return;
    }
    
    // 使用微信小程序的视频播放器
    // 视频播放功能已被禁用
    wx.showToast({
      title: '视频播放功能已被禁用',
      icon: 'none',
      duration: 2000
    });
  },

  // 预览文档
  previewDocument: function(e) {
    const documentUrl = e.currentTarget.dataset.src;
    const title = e.currentTarget.dataset.title || '文档预览';
    
    // 检查URL是否有效
    if (!documentUrl) {
      wx.showToast({
        title: '文件路径无效',
        icon: 'none'
      });
      return;
    }
    
    // 使用统一的文件访问方式
    const apiConfig = require('../../config/api.js');
    const fullUrl = documentUrl.startsWith('http') ? documentUrl : apiConfig.buildFileUrl(documentUrl);
    
    wx.showLoading({
      title: '正在下载文件...'
    });
    
    // 使用wx.downloadFile下载到本地临时文件，然后使用wx.openDocument打开
    wx.downloadFile({
      url: fullUrl,
      timeout: 10000, // 10秒超时
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          wx.openDocument({
            filePath: res.tempFilePath,
            success: () => {
              console.log('打开文档成功');
            },
            fail: (err) => {
              console.error('打开文档失败:', err);
              wx.showToast({
                title: '无法预览此文件',
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
      fail: (err) => {
        wx.hideLoading();
        console.error('下载文件失败:', err);
        
        // 根据错误类型给出不同的提示
        let errorMessage = '文件下载失败';
        if (err.errMsg) {
          if (err.errMsg.includes('timeout')) {
            errorMessage = '下载超时，请检查网络连接';
          } else if (err.errMsg.includes('fail')) {
            errorMessage = '服务器连接失败，请检查服务器状态';
          } else if (err.errMsg.includes('abort')) {
            errorMessage = '下载被中断';
          }
        }
        
        wx.showToast({
          title: errorMessage,
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 分享项目
  shareProject: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  onShareAppMessage: function() {
    const projectData = this.data.projectData;
    return {
      title: `${projectData.projectName} - 项目进度`,
      desc: projectData.objectives,
      path: `/pages/project_progress/project_progress?id=${projectData.id}`
    };
  },

  onShareTimeline: function() {
    const projectData = this.data.projectData;
    return {
      title: `${projectData.projectName} - 项目进度`,
      desc: projectData.objectives,
      path: `/pages/project_progress/project_progress?id=${projectData.id}`
    };
  }
});
