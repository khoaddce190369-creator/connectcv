'use strict';
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

// Đảm bảo thư mục data luôn tồn tại
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Dữ liệu ban đầu mặc định
const initialData = {
  users: [
    {
      id: 'usr_freelancer_demo',
      username: 'Nguyễn Minh Tuấn',
      email: 'tuan.nguyen@email.com',
      password_hash: null,
      isPro: false,
      role: 'Student', // Job Seeker / Freelancer
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      title: 'Senior UI/UX Designer',
      aiCredits: 15,
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_hr_demo',
      username: 'Trần Thị Mai',
      email: 'careers@novatech.vn',
      password_hash: null,
      isPro: true,
      role: 'HR', // Recruiter / Enterprise
      company: 'NovaTech Solutions',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
      aiCredits: 50,
      createdAt: new Date().toISOString()
    }
  ],
  jobs: [
    {
      id: 'job_1',
      title: 'Senior Product Designer (Design System & App)',
      company: 'NovaTech Solutions',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
      type: 'Full-time',
      category: 'Design',
      location: 'Hồ Chí Minh / Hybrid',
      budget: '35.000.000 - 50.000.000 VNĐ',
      minBudget: 35000000,
      tags: ['Figma', 'Design System', 'Mobile App', 'UI/UX'],
      experienceYears: 3,
      description: 'Chúng tôi đang tìm kiếm Senior Product Designer dẫn dắt xây dựng Design System và trải nghiệm ứng dụng Fintech hàng đầu.',
      skills: ['Figma', 'Design System', 'Wireframing', 'Prototyping', 'Fintech UI'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'job_2',
      title: 'Thiết kế Bộ Nhận Diện Thương Hiệu Brand Identity',
      company: 'GreenEats Organic',
      logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&h=100&fit=crop',
      type: 'Freelance',
      category: 'Branding',
      location: 'Remote 100%',
      budget: '15.000.000 - 25.000.000 VNĐ',
      minBudget: 15000000,
      tags: ['Branding', 'Illustrator', 'Logo Design', 'Packaging'],
      experienceYears: 1,
      description: 'Dự án ngắn hạn tái định vị thương hiệu thực phẩm hữu cơ, yêu cầu thiết kế logo, bao bì và visual guidelines.',
      skills: ['Illustrator', 'Branding', 'Photoshop', 'Typography'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'job_3',
      title: 'Lead UI/UX Designer - Nền tảng EdTech',
      company: 'EduForward Global',
      logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop',
      type: 'Full-time',
      category: 'Design',
      location: 'Hà Nội / Remote',
      budget: '40.000.000 - 60.000.000 VNĐ',
      minBudget: 40000000,
      tags: ['EdTech', 'SaaS', 'Figma', 'UX Research'],
      experienceYears: 4,
      description: 'Dẫn dắt thiết kế UX Research và trải nghiệm học tập số cho hàng triệu học viên toàn quốc.',
      skills: ['UX Research', 'Figma', 'Design Thinking', 'Usability Testing'],
      createdAt: new Date().toISOString()
    }
  ],
  portfolios: [
    {
      id: 'pf_1',
      title: 'Fintech Mobile Banking 2.0',
      author: 'Nguyễn Minh Tuấn',
      subdomain: 'tuan-nguyen',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      authorRole: 'Senior UI/UX Designer',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
      tags: ['Fintech', 'Figma', 'Design System'],
      budget: '$2,500 USD',
      duration: '4 tuần',
      likes: 248,
      description: 'Hệ thống thiết kế và giao diện ngân hàng số thế hệ mới, tối ưu hóa tỷ lệ chuyển đổi dòng tiền 35%.'
    },
    {
      id: 'pf_2',
      title: 'GreenEats Organic Brand Identity',
      author: 'Lê Hoàng Yến',
      subdomain: 'hoang-yen',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
      authorRole: 'Brand & Visual Designer',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
      tags: ['Branding', 'Packaging', 'Eco'],
      budget: '$1,200 USD',
      duration: '3 tuần',
      likes: 182,
      description: 'Bộ nhận diện tối giản kết hợp gam màu đất và giấy tái chế chuẩn phong cách eco-friendly quốc tế.'
    },
    {
      id: 'pf_3',
      title: 'AI Dashboard & Analytics SaaS',
      author: 'Trần Quốc Bảo',
      subdomain: 'quoc-bao',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      authorRole: 'Product Designer',
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
      tags: ['SaaS', 'Dark Mode', 'Data Viz'],
      budget: '$3,200 USD',
      duration: '6 tuần',
      likes: 315,
      description: 'Bảng điều khiển trực quan hóa dữ liệu AI real-time, tích hợp dark mode tinh xảo và UX micro-interactions.'
    }
  ],
  candidates: [
    {
      id: 'cand_1',
      name: 'Nguyễn Minh Tuấn',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      role: 'Senior UI/UX Designer',
      experienceYears: 4,
      skills: ['Figma', 'Design System', 'Fintech UI', 'Mobile App', 'Wireframing'],
      rating: 4.9,
      completedProjects: 28,
      portfolioUrl: '/freelancer-profile.html',
      isPro: true
    },
    {
      id: 'cand_2',
      name: 'Lê Hoàng Yến',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
      role: 'Brand & Packaging Designer',
      experienceYears: 3,
      skills: ['Illustrator', 'Branding', 'Photoshop', 'Packaging', 'Typography'],
      rating: 4.8,
      completedProjects: 19,
      portfolioUrl: '/freelancer-profile.html',
      isPro: false
    },
    {
      id: 'cand_3',
      name: 'Đặng Tuấn Kiệt',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop&crop=face',
      role: 'Frontend & UI Engineer',
      experienceYears: 2,
      skills: ['React', 'Tailwind CSS', 'Figma', 'TypeScript', 'Responsive Design'],
      rating: 4.7,
      completedProjects: 14,
      portfolioUrl: '/freelancer-profile.html',
      isPro: true
    }
  ],
  applications: [
    {
      id: 'app_1',
      candidateName: 'Nguyễn Minh Tuấn',
      candidateEmail: 'tuan.nguyen@email.com',
      candidateAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      jobId: 'job_1',
      jobTitle: 'Senior Product Designer (Design System & App)',
      status: 'Applied', // Applied | Shortlisted | Interview | Hired | Rejected
      matchScore: 92,
      portfolioUrl: '/freelancer-profile.html',
      appliedAt: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: 'app_2',
      candidateName: 'Lê Hoàng Yến',
      candidateEmail: 'yen.le@email.com',
      candidateAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
      jobId: 'job_1',
      jobTitle: 'Senior Product Designer (Design System & App)',
      status: 'Shortlisted',
      matchScore: 85,
      portfolioUrl: '/freelancer-profile.html',
      appliedAt: new Date(Date.now() - 3600000 * 48).toISOString()
    },
    {
      id: 'app_3',
      candidateName: 'Đặng Tuấn Kiệt',
      candidateEmail: 'kiet.dang@email.com',
      candidateAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop&crop=face',
      jobId: 'job_1',
      jobTitle: 'Senior Product Designer (Design System & App)',
      status: 'Interview',
      matchScore: 88,
      portfolioUrl: '/freelancer-profile.html',
      appliedAt: new Date(Date.now() - 3600000 * 72).toISOString()
    }
  ],
  posts: [
    {
      id: 'post_1',
      type: 'RECRUITMENT',
      author: 'NovaTech Solutions',
      authorAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
      title: 'Tuyển Senior UI Designer làm việc dự án Fintech Mobile',
      content: 'Cần tìm 1 bạn Senior UI Designer chuyên mảng Fintech, dự án kéo dài 2 tháng, ngân sách 30tr VNĐ. Có bảo chứng hợp đồng qua ConnectCV Escrow.',
      budget: '30.000.000 VNĐ',
      contact: 'hr@novatech.vn',
      likes: 18,
      comments: 6,
      createdAt: new Date().toISOString()
    },
    {
      id: 'post_2',
      type: 'FREELANCER_OFFER',
      author: 'Nguyễn Minh Tuấn',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      title: 'Nhận thiết kế Landing Page & Design System chuẩn tối ưu',
      content: 'Chào mọi người, mình có hơn 4 năm kinh nghiệm làm UI/UX tại các startup công nghệ. Hiện đang trống lịch tháng tới, sẵn sàng nhận thiết kế web app và design system hoàn chỉnh.',
      budget: 'Từ 8.000.000 VNĐ / dự án',
      contact: 'tuan.nguyen@email.com',
      likes: 34,
      comments: 11,
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
    }
  ],
  feedback: [
    {
      id: 'fb_1',
      userName: 'Trần Văn Hưng',
      userRole: 'Frontend Developer',
      rating: 5,
      comment: 'Tính năng tối ưu CV chuẩn ATS cực kỳ hữu ích, giúp mình được gọi phỏng vấn chỉ sau 2 ngày nộp đơn!',
      createdAt: new Date().toISOString()
    },
    {
      id: 'fb_2',
      userName: 'Đỗ Hải My',
      userRole: 'HR Manager',
      rating: 5,
      comment: 'Sàn lọc ứng viên và bảng điều phối Kanban giúp team tiết kiệm 70% thời gian tuyển dụng.',
      createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
    }
  ],
  interviewShares: [
    {
      id: 'is_1',
      companyName: 'VNG Corporation',
      position: 'UI/UX Designer',
      questionsEncountered: 'Quy trình giải quyết xung đột khi PM muốn đổi layout mà không có dữ liệu người dùng? Cho ví dụ về 1 dự án bạn thất bại và bài học rút ra.',
      tips: 'Nên chuẩn bị portfolio dạng case-study có số liệu trước và sau khi ra mắt tính năng, không chỉ show ảnh Figma.',
      submittedBy: 'usr_freelancer_demo',
      createdAt: new Date().toISOString()
    }
  ],
  payments: {}
};

class Store {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Lỗi khi đọc file store.json, khởi tạo dữ liệu mặc định:', e.message);
    }
    this.saveData(initialData);
    return JSON.parse(JSON.stringify(initialData));
  }

  saveData(dataToSave) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('Lỗi khi lưu store.json:', e.message);
    }
  }

  get(collection) {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    return this.data[collection];
  }

  set(collection, list) {
    this.data[collection] = list;
    this.saveData();
  }

  insert(collection, item) {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    this.data[collection].push(item);
    this.saveData();
    return item;
  }

  update(collection, predicate, updates) {
    const list = this.get(collection);
    const index = list.findIndex(predicate);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      this.saveData();
      return list[index];
    }
    return null;
  }
}

const db = new Store();

module.exports = db;
