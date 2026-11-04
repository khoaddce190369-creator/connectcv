import { CVData } from '../types/cv';

export interface ATSCheckItem {
  name: string;
  score: number;
  maxScore: number;
  passed: boolean;
  message: string;
}

export interface ATSScoreResult {
  totalScore: number;
  level: 'Xuất sắc' | 'Tốt' | 'Cần cải thiện';
  items: ATSCheckItem[];
  tips: string[];
}

export function evaluateATS(data: CVData): ATSScoreResult {
  const items: ATSCheckItem[] = [];
  const tips: string[] = [];

  // 1. Contact Information (15 pts)
  const hasEmail = Boolean(data.profile.email && data.profile.email.includes('@'));
  const hasPhone = Boolean(data.profile.phone && data.profile.phone.replace(/\D/g, '').length >= 9);
  const hasAddress = Boolean(data.profile.address && data.profile.address.length >= 3);
  let contactScore = 0;
  if (hasEmail) contactScore += 5;
  if (hasPhone) contactScore += 5;
  if (hasAddress) contactScore += 5;

  items.push({
    name: 'Thông tin liên hệ chuẩn ATS',
    score: contactScore,
    maxScore: 15,
    passed: contactScore === 15,
    message: contactScore === 15 
      ? 'Đầy đủ email, số điện thoại và địa chỉ.' 
      : 'Cần bổ sung đủ email chính xác, số điện thoại và địa chỉ nơi cư trú.'
  });
  if (contactScore < 15) {
    tips.push('Nhà tuyển dụng và máy quét ATS luôn cần số điện thoại và email chuẩn ở phần đầu để liên hệ phỏng vấn.');
  }

  // 2. Professional Summary / Objective (15 pts)
  const summaryLength = data.objective ? data.objective.trim().length : 0;
  let summaryScore = 0;
  if (summaryLength > 120) summaryScore = 15;
  else if (summaryLength > 50) summaryScore = 10;
  else if (summaryLength > 0) summaryScore = 5;

  items.push({
    name: 'Mục tiêu nghề nghiệp & Tóm tắt chuyên môn',
    score: summaryScore,
    maxScore: 15,
    passed: summaryScore >= 10,
    message: summaryScore >= 10 
      ? 'Đoạn tóm tắt súc tích, làm bật được số năm kinh nghiệm và mục tiêu cống hiến.' 
      : 'Nên viết tóm tắt từ 3-4 câu (khoảng 80 - 150 từ), nêu rõ thế mạnh và định hướng.'
  });
  if (summaryScore < 10) {
    tips.push('Thêm số năm kinh nghiệm và chuyên môn cốt lõi vào phần Mục tiêu nghề nghiệp để thu hút nhà tuyển dụng trong 6 giây đầu.');
  }

  // 3. Work Experience with Quantifiable Metrics (25 pts)
  const experiences = data.experience || [];
  let expScore = 0;
  let metricFound = false;
  let actionVerbFound = false;

  const metricRegex = /(\d+[\.,]?\d*|\d+\s*(%|tỷ|triệu|nghìn|usd|\$|k|lần|thành viên|hợp đồng|kpi|kpi's|x))/i;
  const actionVerbRegex = /(đạt|tăng|tối ưu|triển khai|phát triển|xây dựng|đàm phán|quản lý|chủ động|thu hút|vượt|lead|manage|increase|optimize|achieve)/i;

  if (experiences.length >= 2) expScore += 10;
  else if (experiences.length === 1) expScore += 6;

  let totalBullets = 0;
  experiences.forEach(exp => {
    (exp.description || []).forEach(desc => {
      totalBullets++;
      if (metricRegex.test(desc)) metricFound = true;
      if (actionVerbRegex.test(desc)) actionVerbFound = true;
    });
  });

  if (metricFound) expScore += 10;
  if (actionVerbFound) expScore += 5;

  items.push({
    name: 'Kinh nghiệm làm việc & Chỉ số đo lường (Số liệu %)',
    score: expScore,
    maxScore: 25,
    passed: expScore >= 20,
    message: metricFound 
      ? 'Tuyệt vời! Bạn có các số liệu định lượng (%, doanh số, số lượng hợp đồng) rất thuyết phục.' 
      : 'Cần bổ sung thêm số liệu cụ thể (VD: "Tăng doanh số 35%", "Tiết kiệm 20% chi phí") để tăng sức nặng.'
  });
  if (!metricFound) {
    tips.push('Hệ thống ATS và nhà tuyển dụng đánh giá cao các ứng viên có số liệu đo lường cụ thể (ví dụ: đạt 125% KPI, quản lý ngân sách 500 triệu,...).');
  }

  // 4. Skills & Keywords (20 pts)
  const skillCount = (data.skills || []).length;
  let skillScore = 0;
  if (skillCount >= 5) skillScore = 20;
  else if (skillCount >= 3) skillScore = 14;
  else if (skillCount > 0) skillScore = 8;

  items.push({
    name: 'Kỹ năng chuyên môn & Từ khóa ngành (Keywords)',
    score: skillScore,
    maxScore: 20,
    passed: skillScore >= 14,
    message: skillScore >= 14
      ? `Đã liệt kê ${skillCount} kỹ năng chuyên môn phù hợp với vị trí ứng tuyển.`
      : 'Nên bổ sung ít nhất 5-8 kỹ năng kết hợp giữa Hard Skills (chuyên môn) và Soft Skills (kỹ năng mềm).'
  });
  if (skillScore < 14) {
    tips.push('Thêm các công cụ, phần mềm chuyên môn (CRM, Excel, Figma, Git...) vào danh sách kỹ năng.');
  }

  // 5. Education & Background (15 pts)
  const educations = data.education || [];
  let eduScore = 0;
  if (educations.length > 0 && educations[0].school && educations[0].degree) {
    eduScore = 15;
  } else if (educations.length > 0) {
    eduScore = 8;
  }

  items.push({
    name: 'Học vấn & Bằng cấp chính quy',
    score: eduScore,
    maxScore: 15,
    passed: eduScore === 15,
    message: eduScore === 15
      ? 'Thông tin trường, ngành học và bằng cấp rõ ràng.'
      : 'Hãy điền tên trường đại học/cao đẳng và chuyên ngành đào tạo.'
  });

  // 6. Certifications / Projects / Additional (10 pts)
  const hasExtra = (data.certificates?.length || 0) > 0 || (data.projects?.length || 0) > 0 || (data.awards?.length || 0) > 0;
  const extraScore = hasExtra ? 10 : 4;

  items.push({
    name: 'Chứng chỉ, Dự án & Điểm cộng năng lực',
    score: extraScore,
    maxScore: 10,
    passed: hasExtra,
    message: hasExtra
      ? 'Có chứng chỉ/dự án bổ trợ uy tín, tăng độ cạnh tranh so với các ứng viên khác.'
      : 'Nên thêm chứng chỉ ngoại ngữ (TOEIC/IELTS) hoặc chứng chỉ nghề nghiệp ngắn hạn.'
  });

  const totalScore = contactScore + summaryScore + expScore + skillScore + eduScore + extraScore;
  let level: 'Xuất sắc' | 'Tốt' | 'Cần cải thiện' = 'Xuất sắc';
  if (totalScore < 60) level = 'Cần cải thiện';
  else if (totalScore < 85) level = 'Tốt';

  return {
    totalScore,
    level,
    items,
    tips
  };
}
