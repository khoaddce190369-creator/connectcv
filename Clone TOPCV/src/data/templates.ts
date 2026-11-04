import { CVTemplateMeta } from '../types/cv';

export const templatesList: CVTemplateMeta[] = [
  {
    id: 'ats-standard',
    name: 'Mẫu ATS Chuẩn Quốc Tế',
    badge: '100% ATS Parser',
    category: 'ats',
    description: 'Bố cục 1 cột tối ưu 99.8% qua hệ thống lọc hồ sơ tự động quốc tế.',
    recommendedFor: ['Tất cả ngành nghề', 'Doanh nghiệp FDI', 'Tập đoàn đa quốc gia', 'Ngân hàng'],
    tags: ['Chuẩn ATS', 'Đơn giản', 'Quốc tế', 'Tập đoàn'],
    atsCompliant: true,
    thumbnail: '/assets/templates/01_CV_ATS_Tieu_Chuan_default_v2.png'
  },
  {
    id: 'topcv-modern',
    name: 'Mẫu ConnectCV Hiện Đại (Phổ biến nhất)',
    badge: 'Được dùng nhiều nhất',
    category: 'modern',
    description: 'Bố cục 2 cột cân đối, thanh lịch, chuẩn phong cách tuyển dụng.',
    recommendedFor: ['Nhân viên kinh doanh', 'Marketing', 'Hành chính nhân sự', 'Chăm sóc khách hàng', 'Lập trình viên'],
    tags: ['ConnectCV Classic', '2 Cột', 'Bán chạy', 'Dễ trúng tuyển'],
    atsCompliant: true,
    thumbnail: '/assets/templates/15_CV_ATS_Hien_Dai_1_modern_1_v2.png'
  },
  {
    id: 'executive-pro',
    name: 'Mẫu CV Chuyên Nghiệp (Executive)',
    badge: 'Chuyên gia & Quản lý',
    category: 'professional',
    description: 'Dải màu nhận diện sang trọng, nổi bật năng lực quản trị & dẫn dắt.',
    recommendedFor: ['Trưởng phòng', 'Team Leader', 'Quản lý dự án', 'Chuyên viên cao cấp'],
    tags: ['Chuyên nghiệp', 'Quản lý', 'Sang trọng', 'Executive'],
    atsCompliant: true,
    thumbnail: '/assets/templates/08_CV_ATS_Chuyen_Nghiep_1_pro_1_v2.png'
  },
  {
    id: 'tech-developer',
    name: 'Mẫu CV IT & Tech Developer',
    badge: 'Dành riêng IT',
    category: 'modern',
    description: 'Thiết kế thông minh tối ưu Tech Stack, GitHub và dự án thực tế.',
    recommendedFor: ['Frontend / Backend', 'Fullstack Developer', 'Data Engineer', 'DevOps / QA'],
    tags: ['IT', 'Developer', 'Tech Stack', 'Projects'],
    atsCompliant: true,
    thumbnail: '/assets/templates/05_CV_ATS_Chuyen_Nghiep_Lap_Trinh_Vien_IT.png'
  },
  {
    id: 'minimalist-clean',
    name: 'Mẫu CV Tối Giản (Minimalist Clean)',
    badge: 'Chuẩn ATS Tối Giản',
    category: 'ats',
    description: 'Tối giản tinh gọn, tập trung tuyệt đối vào thành tích và số liệu.',
    recommendedFor: ['Sales B2B', 'Tư vấn tài chính', 'Kiểm toán', 'Giảng viên'],
    tags: ['Tối giản', 'Clean', 'Thanh lịch', 'Chuẩn ATS'],
    atsCompliant: true,
    thumbnail: '/assets/templates/07_CV_ATS_Toi_Gian_2_minimalism_v2.png'
  },
  {
    id: 'academic-harvard',
    name: 'Mẫu CV Harvard Academic',
    badge: 'Phong cách Harvard',
    category: 'academic',
    description: 'Chuẩn học thuật danh giá thế giới, tạo dựng sự uy tín và chuyên sâu.',
    recommendedFor: ['Học bổng', 'Giáo dục', 'Luật sư', 'Y dược', 'Tài chính cấp cao'],
    tags: ['Hàn lâm', 'Harvard', 'Nghiêm túc', 'Uy tín'],
    atsCompliant: true,
    thumbnail: '/assets/templates/19_CV_ATS_Harvard_Academic_Nghien_Cuu.png'
  },
  {
    id: 'corporate-business',
    name: 'Mẫu CV Doanh Nghiệp (Corporate Leader)',
    badge: 'Tối ưu Kinh Doanh',
    category: 'professional',
    description: 'Làm bật các chỉ số tăng trưởng, tối ưu cho ngành Kinh doanh & Sales.',
    recommendedFor: ['Nhân viên kinh doanh', 'B2B Sales', 'Giám đốc kinh doanh', 'Tư vấn giải pháp'],
    tags: ['Doanh nghiệp', 'Sales', 'Tăng trưởng', 'Số liệu'],
    atsCompliant: true,
    thumbnail: '/assets/templates/01_CV_ATS_Tieu_Chuan_Kinh_Doanh_Le_Quang_Dung.png'
  },
  {
    id: 'creative-accent',
    name: 'Mẫu CV Sáng Tạo (Creative Accent)',
    badge: 'Màu sắc ấn tượng',
    category: 'creative',
    description: 'Điểm nhấn màu sắc đột phá, lý tưởng cho Marketing & Sáng tạo.',
    recommendedFor: ['Marketing', 'Thiết kế đồ họa', 'Content Creator', 'Event Planner'],
    tags: ['Sáng tạo', 'Ấn tượng', 'Trẻ trung', 'Agency'],
    atsCompliant: true,
    thumbnail: '/assets/templates/09_CV_ATS_Sang_Tao_creative.png'
  },
  {
    id: 'fresh-graduate',
    name: 'Mẫu CV Sinh Viên Mới Ra Trường',
    badge: 'Thực tập & Fresher',
    category: 'modern',
    description: 'Nổi bật học vấn, GPA và kỹ năng mềm, phù hợp sinh viên & Fresher.',
    recommendedFor: ['Sinh viên mới tốt nghiệp', 'Thực tập sinh (Intern)', 'Fresher chuyển ngành'],
    tags: ['Fresher', 'Sinh viên', 'Mới ra trường', 'Dễ xin việc'],
    atsCompliant: true,
    thumbnail: '/assets/templates/17_CV_ATS_Sinh_Vien_3_student_3.png'
  },
  {
    id: 'compact-one-page',
    name: 'Mẫu CV Tinh Gọn 1 Trang Chuẩn ATS',
    badge: 'Gọn trong 1 trang',
    category: 'ats',
    description: 'Thiết kế tối ưu milimet, gói gọn đầy đủ thông tin trong đúng 1 trang.',
    recommendedFor: ['Mọi ứng viên muốn CV 1 trang', 'Ứng tuyển nhanh', 'Gửi trực tiếp sếp'],
    tags: ['1 Trang', 'Tinh gọn', 'Chuẩn ATS', 'Tiện lợi'],
    atsCompliant: true,
    thumbnail: '/assets/templates/04_CV_ATS_An_Tuong_2_onepage_impressive_2_v2.png'
  },
  {
    id: 'elegant-sidebar',
    name: 'Mẫu CV Sidebar Sang Trọng',
    badge: 'Đẳng cấp & Đột phá',
    category: 'creative',
    description: 'Sidebar tương phản thanh lịch, mang phong thái chuyên gia tự tin.',
    recommendedFor: ['Chuyên viên tư vấn', 'Bất động sản', 'Ngân hàng', 'Kiến trúc sư'],
    tags: ['Sidebar', 'Sang trọng', 'Đẳng cấp', 'Nổi bật'],
    atsCompliant: true,
    thumbnail: '/assets/templates/05_CV_ATS_Thanh_Lich_elegant.png'
  },
  {
    id: 'bold-modern',
    name: 'Mẫu CV Điểm Nhấn Hiện Đại (Bold Modern)',
    badge: 'Phong cách mới',
    category: 'modern',
    description: 'Font chữ đậm nét và dải phân cách bắt mắt, nổi bật giữa đám đông.',
    recommendedFor: ['Product Manager', 'Business Analyst', 'Startup Founder', 'Kinh doanh'],
    tags: ['Đột phá', 'Hiện đại', 'Bắt mắt', 'Bold'],
    atsCompliant: true,
    thumbnail: '/assets/templates/03_CV_ATS_An_Tuong_6_Tran_Manh_Dung_Content_Leader.png'
  }
];

export const colorPresets = [
  { name: 'Xanh ConnectCV (Mặc định)', hex: '#0284c7' },
  { name: 'Xanh Navy Đậm', hex: '#172554' },
  { name: 'Xanh Emerald', hex: '#00b14f' },
  { name: 'Xanh dương hoàng gia', hex: '#1e3a8a' },
  { name: 'Đen sang trọng', hex: '#1e293b' },
  { name: 'Đỏ cam nổi bật', hex: '#ea580c' },
  { name: 'Đỏ rượu vang', hex: '#991b1b' },
  { name: 'Xanh ngọc bích', hex: '#0f766e' },
  { name: 'Tím thời thượng', hex: '#7c3aed' },
  { name: 'Xám than thanh lịch', hex: '#475569' },
  { name: 'Nâu cà phê', hex: '#78350f' },
  { name: 'Vàng hổ phách', hex: '#d97706' }
];

export const fontFamilies = [
  { name: 'Be Vietnam Pro (Tiếng Việt đẹp)', value: 'Be Vietnam Pro' },
  { name: 'Roboto (Hiện đại)', value: 'Roboto' },
  { name: 'Montserrat (Thanh lịch)', value: 'Montserrat' },
  { name: 'Open Sans (Dễ đọc)', value: 'Open Sans' },
  { name: 'Merriweather (Hàn lâm / Serif)', value: 'Merriweather' }
];
