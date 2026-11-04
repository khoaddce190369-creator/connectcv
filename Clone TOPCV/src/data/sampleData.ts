import { CVData } from '../types/cv';

export const initialSalesCVData: CVData = {
  id: 'connectcv-sample-01',
  title: 'CV Chuyên Nghiệp - Nguyễn Văn An',
  templateId: 'topcv-modern',
  language: 'vi',
  theme: {
    primaryColor: '#0284c7', // ConnectCV signature blue
    textColor: '#1f2937',
    bgColor: '#ffffff',
    fontFamily: 'Be Vietnam Pro',
    fontSize: 'medium',
    lineSpacing: 'normal',
  },
  profile: {
    fullName: 'NGUYỄN VĂN AN',
    jobTitle: 'NHÂN VIÊN KINH DOANH CAO CẤP / B2B SALES EXECUTIVE',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    showAvatar: true,
    email: 'nguyenvanan.sales@gmail.com',
    phone: '0987 654 321',
    address: 'Cầu Giấy, Hà Nội',
    website: 'linkedin.com/in/nguyenvanan-sales',
    dateOfBirth: '15/08/1997',
    gender: 'Nam',
  },
  objective:
    'Với hơn 4 năm kinh nghiệm thực chiến trong lĩnh vực kinh doanh B2B & B2C ngành F&B và Giải pháp Công nghệ, sở hữu kỹ năng đàm phán sắc bén và xây dựng mạng lưới khách hàng doanh nghiệp bền vững. Mục tiêu trong 2 năm tới trở thành Trưởng nhóm Kinh doanh (Sales Team Leader), đóng góp tăng trưởng doanh thu vượt mốc 150% cho công ty.',
  experience: [
    {
      id: 'exp-1',
      position: 'Chuyên viên Kinh doanh B2B',
      company: 'CÔNG TY CP TẬP ĐOÀN CÔNG NGHỆ NEXTTECH',
      location: 'Hà Nội',
      startDate: '03/2022',
      endDate: 'Hiện tại',
      current: true,
      description: [
        'Chủ động tìm kiếm, tiếp cận và mở rộng danh mục khách hàng doanh nghiệp vừa và lớn (SMEs), trung bình mang về 18 - 25 hợp đồng mới mỗi quý.',
        'Liên tục vượt chỉ tiêu KPI doanh số 6 quý liên tiếp (đạt trung bình 125% - 140% cam kết), đóng góp hơn 3.2 tỷ VNĐ doanh thu năm 2023.',
        'Trực tiếp thuyết trình giải pháp, đàm phán hợp đồng thương mại và chốt thành công các gói thầu cung cấp phần mềm giá trị trên 500 triệu VNĐ.',
        'Phối hợp chặt chẽ với đội ngũ Marketing và Chăm sóc khách hàng (CS) để tối ưu tỷ lệ tái ký hợp đồng (Retention Rate) đạt 88%.'
      ]
    },
    {
      id: 'exp-2',
      position: 'Nhân viên Kinh doanh & Phát triển thị trường',
      company: 'CÔNG TY TNHH PHÂN PHỐI THỰC PHẨM GREEN VIỆT NAM',
      location: 'Hà Nội',
      startDate: '08/2020',
      endDate: '02/2022',
      current: false,
      description: [
        'Phát triển mạng lưới đại lý và điểm bán lẻ khu vực miền Bắc, mở rộng thêm 65 điểm phân phối mới trong vòng 1 năm.',
        'Chăm sóc danh mục hơn 120 khách hàng định kỳ, quản lý công nợ và giải quyết khiếu nại khách hàng với mức độ hài lòng đạt 95%.',
        'Thu thập dữ liệu thị trường, phân tích động thái của đối thủ cạnh tranh và đề xuất chính sách chiết khấu linh hoạt giúp tăng sản lượng tiêu thụ 30%.'
      ]
    }
  ],
  education: [
    {
      id: 'edu-1',
      school: 'Đại Học Kinh Tế Quốc Dân (NEU)',
      degree: 'Cử nhân Quản trị Kinh doanh',
      fieldOfStudy: 'Chuyên ngành Quản trị Kinh doanh Quốc tế',
      startDate: '2016',
      endDate: '2020',
      gpa: '3.42 / 4.0 (Loại Giỏi)',
      description: 'Đạt học bổng khuyến khích học tập 2 kỳ liên tiếp. Trưởng ban đối ngoại CLB Kỹ năng Doanh nhân NEU.'
    }
  ],
  skills: [
    { id: 'sk-1', name: 'Đàm phán & Chốt hợp đồng (Closing Skills)', level: 5 },
    { id: 'sk-2', name: 'Kỹ năng giao tiếp & Thuyết trình B2B', level: 5 },
    { id: 'sk-3', name: 'Tìm kiếm khách hàng tiềm năng (Lead Generation)', level: 4 },
    { id: 'sk-4', name: 'Sử dụng CRM (Hubspot, Salesforce, KiotViet)', level: 4 },
    { id: 'sk-5', name: 'Xử lý phản đối & Quản trị quan hệ khách hàng', level: 5 },
    { id: 'sk-6', name: 'Tiếng Anh giao tiếp & thương mại (TOEIC 780)', level: 4 }
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'Chiến dịch Mở rộng Khách hàng Chuỗi Bán lẻ 2023',
      role: 'Phụ trách nhóm dự án kinh doanh',
      time: '04/2023 - 10/2023',
      technologies: 'HubSpot CRM, PowerBI, LinkedIn Sales Navigator',
      description: [
        'Lên kế hoạch và triển khai chiến dịch Cold Outreach tới 300+ giám đốc mua hàng và quản lý chuỗi cung ứng.',
        'Kết quả mang về 28 cuộc hẹn demo giải pháp chuyên sâu và ký kết thành công 12 hợp đồng cung ứng dài hạn, mang về doanh thu vượt 180 triệu/tháng.'
      ]
    }
  ],
  certificates: [
    { id: 'cert-1', name: 'Chứng chỉ Chuyên gia Bán hàng B2B Xuất sắc', issuer: 'Học viện Quản trị PACE', year: '2023' },
    { id: 'cert-2', name: 'HubSpot Inbound Sales Certified', issuer: 'HubSpot Academy', year: '2022' },
    { id: 'cert-3', name: 'Chứng chỉ TOEIC 780/990', issuer: 'IIG Vietnam', year: '2021' }
  ],
  awards: [
    { id: 'aw-1', name: 'Best Sales Executive of The Year 2023', issuer: 'NextTech Group', year: '2023' },
    { id: 'aw-2', name: 'Top Performer Quý 3/2022', issuer: 'NextTech Group', year: '2022' }
  ],
  activities: [
    {
      id: 'act-1',
      role: 'Thành viên Ban Đối ngoại & Tài trợ',
      organization: 'Diễn đàn Lãnh đạo Trẻ Việt Nam (VYS)',
      time: '2019 - 2020',
      description: 'Trực tiếp kêu gọi thành công hơn 120 triệu đồng tiền tài trợ từ các nhãn hàng cho chương trình hội thảo hướng nghiệp thường niên.'
    }
  ],
  interests: ['Bơi lội & Chạy bộ Marathon', 'Đọc sách tâm lý kinh doanh & quản trị', 'Tham gia các diễn đàn Startup Tech'],
  references: [
    {
      id: 'ref-1',
      name: 'Ông Trần Hoàng Minh',
      position: 'Giám đốc Kinh doanh (Sales Director)',
      company: 'Tập đoàn Công nghệ NextTech',
      email: 'minh.th@nexttech.vn',
      phone: '0912 345 678'
    }
  ],
  customSections: [],
  sectionsVisibility: {
    objective: true,
    experience: true,
    education: true,
    skills: true,
    projects: true,
    certificates: true,
    awards: true,
    activities: true,
    interests: true,
    references: true,
    customSections: true,
  },
  sectionOrder: [
    'objective',
    'experience',
    'education',
    'skills',
    'projects',
    'certificates',
    'awards',
    'activities',
    'interests',
    'references'
  ]
};
