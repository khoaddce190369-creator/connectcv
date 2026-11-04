import { CVData } from '../types/cv';
import { initialSalesCVData } from './sampleData';

export interface IndustryTemplate {
  id: string;
  name: string;
  category: string;
  iconName: string;
  level: string;
  description: string;
  data: Partial<CVData>;
}

export const industryTemplates: IndustryTemplate[] = [
  {
    id: 'sales-executive',
    name: 'Nhân viên Kinh doanh (Sales)',
    category: 'Kinh doanh / Bán hàng',
    iconName: 'TrendingUp',
    level: '2 - 4 năm kinh nghiệm',
    description: 'Tối ưu cho vị trí Sales B2B, B2C, Account Executive với các chỉ số KPI doanh thu ấn tượng.',
    data: initialSalesCVData
  },
  {
    id: 'it-software-engineer',
    name: 'Lập trình viên (Frontend / Fullstack)',
    category: 'Công nghệ thông tin',
    iconName: 'Code',
    level: '1 - 3 năm kinh nghiệm',
    description: 'Làm nổi bật Tech Stack, GitHub, dự án Web/Mobile và kỹ năng tối ưu hiệu năng.',
    data: {
      title: 'CV Lập trình viên Frontend - Trần Hoàng Long',
      profile: {
        fullName: 'TRẦN HOÀNG LONG',
        jobTitle: 'FRONTEND / REACT DEVELOPER',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
        showAvatar: true,
        email: 'long.tran.dev@gmail.com',
        phone: '0901 234 567',
        address: 'Thanh Xuân, Hà Nội',
        website: 'github.com/longtran-dev',
        dateOfBirth: '20/11/1998',
        gender: 'Nam',
      },
      objective: 'Lập trình viên Frontend với hơn 3 năm kinh nghiệm phát triển các ứng dụng Web SPA & Enterprise bằng React, Next.js và TypeScript. Có nền tảng vững chắc về UI/UX, Web Performance và State Management. Mong muốn đảm nhận vị trí Senior Frontend Engineer để xây dựng hệ thống phần mềm quy mô lớn phục vụ hàng triệu người dùng.',
      skills: [
        { id: 'sk-it-1', name: 'React.js, Next.js, Redux Toolkit', level: 5 },
        { id: 'sk-it-2', name: 'TypeScript, JavaScript ES6+', level: 5 },
        { id: 'sk-it-3', name: 'Tailwind CSS, Ant Design, Material UI', level: 5 },
        { id: 'sk-it-4', name: 'RESTful API, GraphQL, WebSockets', level: 4 },
        { id: 'sk-it-5', name: 'Git, CI/CD, Docker cơ bản', level: 4 },
        { id: 'sk-it-6', name: 'Tối ưu hiệu năng Core Web Vitals, SEO Web', level: 4 }
      ],
      experience: [
        {
          id: 'exp-it-1',
          position: 'Senior Frontend Developer',
          company: 'CÔNG TY CÔNG NGHỆ VNPAY',
          startDate: '06/2022',
          endDate: 'Hiện tại',
          current: true,
          description: [
            'Phát triển cổng thanh toán và Dashboard quản trị cho hơn 15.000 điểm giao dịch bằng React, TypeScript và Next.js.',
            'Tối ưu hóa thời gian tải trang (LCP giảm từ 3.8s xuống 1.2s), giúp điểm Lighthouse của hệ thống tăng từ 65 lên 94 điểm.',
            'Thiết kế và đóng gói hệ thống Design System chung (React UI Component Library) được sử dụng xuyên suốt bởi 4 squad phát triển.',
            'Tham gia review code hàng ngày, hỗ trợ và mentoring kỹ thuật cho 3 thành viên Junior.'
          ]
        },
        {
          id: 'exp-it-2',
          position: 'Frontend Web Developer',
          company: 'FPT SOFTWARE HÀ NỘI',
          startDate: '01/2021',
          endDate: '05/2022',
          current: false,
          description: [
            'Tham gia dự án E-commerce phục vụ thị trường Nhật Bản, xây dựng giao diện responsive và tương thích đa trình duyệt.',
            'Tích hợp các luồng thanh toán quốc tế và xử lý bảo mật phía Frontend theo chuẩn PCI-DSS.',
            'Đạt giải thưởng Developer cá nhân xuất sắc của dự án trong quý 4/2021.'
          ]
        }
      ],
      education: [
        {
          id: 'edu-it-1',
          school: 'Đại học Bách Khoa Hà Nội (HUST)',
          degree: 'Kỹ sư Công nghệ thông tin',
          fieldOfStudy: 'Khoa học Máy tính',
          startDate: '2016',
          endDate: '2021',
          gpa: '3.35 / 4.0',
          description: 'Giải ba Olympic Tin học Sinh viên Toàn quốc môn Khối Chuyên Tin 2019.'
        }
      ]
    }
  },
  {
    id: 'digital-marketing',
    name: 'Chuyên viên Marketing (Digital Marketing)',
    category: 'Marketing / Truyền thông',
    iconName: 'Megaphone',
    level: '2 - 3 năm kinh nghiệm',
    description: 'Làm nổi bật ROAS, ngân sách Ads đã chạy, kỹ năng Content, SEO và quản lý chiến dịch đa kênh.',
    data: {
      title: 'CV Chuyên Viên Digital Marketing - Lê Phương Linh',
      profile: {
        fullName: 'LÊ PHƯƠNG LINH',
        jobTitle: 'DIGITAL MARKETING SPECIALIST / PERFORMANCE MARKETING',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
        showAvatar: true,
        email: 'phuonglinh.digital@gmail.com',
        phone: '0936 888 999',
        address: 'Đống Đa, Hà Nội',
        website: 'behance.net/linhle-marketing',
        dateOfBirth: '12/04/1998',
        gender: 'Nữ',
      },
      objective: 'Chuyên viên Digital Marketing với 3 năm chuyên sâu về Performance Ads (Facebook Ads, Google Ads, TikTok Ads) và Inbound Content. Đã từng trực tiếp quản lý ngân sách quảng cáo hơn 1.5 tỷ đồng/tháng với ROAS trung bình 3.8x. Định hướng phát triển thành Performance Lead trong 2 năm tới.',
      skills: [
        { id: 'sk-mkt-1', name: 'Meta Ads (Facebook, Instagram), TikTok Ads', level: 5 },
        { id: 'sk-mkt-2', name: 'Google Ads (Search, Display, Performance Max)', level: 4 },
        { id: 'sk-mkt-3', name: 'Google Analytics 4 (GA4), Looker Studio', level: 5 },
        { id: 'sk-mkt-4', name: 'Content Marketing & Kịch bản Viral Video', level: 4 },
        { id: 'sk-mkt-5', name: 'SEO & Tối ưu chuyển đổi Landing Page (CRO)', level: 4 }
      ],
      experience: [
        {
          id: 'exp-mkt-1',
          position: 'Chuyên viên Performance Marketing',
          company: 'CÔNG TY CP TẬP ĐOÀN MỸ PHẨM DECOSMETICS',
          startDate: '04/2022',
          endDate: 'Hiện tại',
          current: true,
          description: [
            'Lên kế hoạch và triển khai các chiến dịch Paid Ads đa kênh (Facebook, TikTok, Shopee Ads), đạt ROAS bình quân 4.2x.',
            'Tối ưu tỷ lệ chuyển đổi Landing Page từ 2.1% lên 4.6% qua việc liên tục A/B testing tiêu đề, CTA và layout.',
            'Xây dựng kênh TikTok thương hiệu từ 0 lên 250.000 followers trong 8 tháng với nhiều video đạt hơn 1 triệu views.'
          ]
        }
      ]
    }
  },
  {
    id: 'general-accountant',
    name: 'Kế toán Tổng hợp (Accountant)',
    category: 'Kế toán / Kiểm toán / Thuế',
    iconName: 'Calculator',
    level: '3 - 5 năm kinh nghiệm',
    description: 'Tối ưu cho Kế toán viên, Kế toán tổng hợp với kỹ năng BCTC, phần mềm MISA, SAP, chính sách thuế.',
    data: {
      title: 'CV Kế toán Tổng hợp - Phạm Thu Hà',
      profile: {
        fullName: 'PHẠM THU HÀ',
        jobTitle: 'KẾ TOÁN TỔNG HỢP / CHUYÊN VIÊN TÀI CHÍNH',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
        showAvatar: true,
        email: 'thuha.ketoan@gmail.com',
        phone: '0978 112 233',
        address: 'Quận 1, TP. Hồ Chí Minh',
        dateOfBirth: '08/09/1995',
        gender: 'Nữ',
      },
      objective: 'Kế toán tổng hợp với hơn 4 năm kinh nghiệm làm việc tại các doanh nghiệp thương mại và sản xuất quy mô trên 200 nhân sự. Thành thạo lập Báo cáo tài chính, quyết toán thuế GTGT, TNDN, TNCN và sử dụng chuyên sâu phần mềm MISA, Fast, SAP. Mong muốn gắn bó lâu dài tại vị trí Kế toán trưởng.',
      skills: [
        { id: 'sk-acc-1', name: 'Lập Báo cáo tài chính & Quyết toán thuế', level: 5 },
        { id: 'sk-acc-2', name: 'Phần mềm kế toán: MISA SME, FAST, SAP ERP', level: 5 },
        { id: 'sk-acc-3', name: 'Kỹ năng Excel nâng cao (VLOOKUP, Pivot, Macro)', level: 5 },
        { id: 'sk-acc-4', name: 'Quản lý dòng tiền & Kiểm soát công nợ', level: 4 }
      ]
    }
  },
  {
    id: 'hr-recruiter',
    name: 'Chuyên viên Nhân sự & Tuyển dụng (HR/TA)',
    category: 'Nhân sự / Hành chính',
    iconName: 'Users',
    level: '2 - 4 năm kinh nghiệm',
    description: 'Tối ưu cho Recruiter / HR Specialist với kinh nghiệm Headhunt, EVP, xây dựng văn hóa doanh nghiệp.',
    data: {
      title: 'CV Chuyên viên Tuyển dụng HR - Vũ Minh Trang',
      profile: {
        fullName: 'VŨ MINH TRANG',
        jobTitle: 'TALENT ACQUISITION SPECIALIST / CHUYÊN VIÊN TUYỂN DỤNG',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
        showAvatar: true,
        email: 'minhtrang.hr@gmail.com',
        phone: '0915 678 901',
        address: 'Bình Thạnh, TP. Hồ Chí Minh',
        dateOfBirth: '18/06/1996',
        gender: 'Nữ',
      },
      objective: 'Chuyên viên Tuyển dụng (TA) với 3 năm kinh nghiệm trong lĩnh vực Tech & E-commerce, am hiểu kỹ thuật Sourcing đa kênh qua LinkedIn Recruiter, TopCV, VietnamWorks, Git. Đáp ứng tốc độ tuyển trung bình 15 - 20 nhân sự chất lượng cao mỗi tháng với tỷ lệ pass probation đạt 92%.',
      skills: [
        { id: 'sk-hr-1', name: 'Kỹ năng Sourcing ứng viên (LinkedIn, Git, TopCV)', level: 5 },
        { id: 'sk-hr-2', name: 'Phỏng vấn theo phương pháp STAR & Competency', level: 5 },
        { id: 'sk-hr-3', name: 'Employer Branding (Thương hiệu nhà tuyển dụng)', level: 4 },
        { id: 'sk-hr-4', name: 'Onboarding & Quản trị trải nghiệm ứng viên', level: 5 }
      ]
    }
  }
];
