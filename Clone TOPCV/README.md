# TopCV CV Builder Clone (Trình Tạo CV Online Chuẩn ATS TopCV)

Dự án clone toàn bộ giao diện và tính năng tạo/chỉnh sửa CV chuyên nghiệp của **TopCV**, tích hợp sẵn **12 mẫu CV chuẩn ATS** được tuyển dụng nhiều nhất và thư viện mẫu nội dung theo ngành (Nhân viên kinh doanh, IT, Marketing, Kế toán, Nhân sự).

---

## 🚀 Tính Năng Nổi Bật

### 1. Trình Chỉnh Sửa Trực Tiếp Chuẩn TopCV (WYSIWYG Inline Editing)
- Click trực tiếp vào bất kỳ trường thông tin nào (Họ tên, Vị trí, Mục tiêu, Kinh nghiệm, Học vấn, Kỹ năng,...) để gõ nội dung.
- Thanh công cụ hành động xuất hiện khi hover: Thêm dòng (+), Di chuyển lên/xuống, Xóa mục (🗑️).
- Tải lên ảnh đại diện cá nhân, bật/tắt hiển thị avatar.

### 2. Kho 12 Mẫu CV Chuẩn ATS & Đẹp Nhất TopCV
1. **Mẫu ATS Chuẩn Quốc Tế (100% ATS Parser)**: Bố cục 1 cột truyền thống tối ưu tuyệt đối cho hệ thống lọc hồ sơ tự động (Workday, Taleo, Greenhouse).
2. **Mẫu TopCV Hiện Đại (Phổ biến nhất)**: Bố cục 2 cột thanh lịch đặc trưng của TopCV với thanh bên thông tin & cột kinh nghiệm timeline.
3. **Mẫu CV Chuyên Nghiệp (Executive Pro)**: Banner ngang sang trọng, tối ưu cho Senior, Chuyên viên và Quản lý.
4. **Mẫu CV IT & Tech Developer**: Tối ưu riêng cho Kỹ sư phần mềm, lập trình viên; nổi bật Tech Stack, GitHub và Dự án thực tế.
5. **Mẫu CV Tối Giản (Minimalist Clean)**: Thiết kế tối giản, font chữ thanh thoát, chuẩn ATS.
6. **Mẫu CV Harvard Academic**: Định dạng CV chuẩn học thuật danh giá Ivy League, phù hợp tài chính, luật, giáo dục.
7. **Mẫu CV Doanh Nghiệp (Corporate Leader)**: Nhấn mạnh số liệu tăng trưởng, KPI, tỷ lệ % và thành tựu kinh doanh.
8. **Mẫu CV Sáng Tạo (Creative Accent)**: Dải màu thương hiệu trẻ trung, phù hợp Marketing, Agency, Thiết kế.
9. **Mẫu CV Sinh Viên Mới Ra Trường (Fresher / Intern)**: Tôn vinh Học vấn, GPA, Hoạt động ngoại khóa và kỹ năng mềm.
10. **Mẫu CV Tinh Gọn 1 Trang (Compact Precision)**: Căn chuẩn diện tích để toàn bộ CV vừa vặn trong 1 trang A4 duy nhất.
11. **Mẫu CV Sidebar Sang Trọng (Elegant Dark Sidebar)**: Sidebar màu nhấn tương phản cao, tạo ấn tượng mạnh.
12. **Mẫu CV Điểm Nhấn Hiện Đại (Bold Modern)**: Typography đậm nét, bố cục đột phá.

### 3. Bộ Công Cụ Tùy Biến Giao Diện
- **Màu sắc chủ đạo**: 12 màu preset của TopCV (#00b14f, xanh navy, đen sang trọng, đỏ cam,...) + bộ chọn mã màu Hex tuỳ ý.
- **Font chữ hỗ trợ tiếng Việt**: Roboto, Be Vietnam Pro, Montserrat, Open Sans, Merriweather.
- **Cỡ chữ**: Nhỏ / Vừa / Lớn.
- **Khoảng cách dòng**: Hẹp / Vừa / Rộng.
- **Đổi ngôn ngữ**: Tiếng Việt (VI) ⇋ English (EN) (Tự động dịch tiêu đề tất cả các mục).
- **Quản lý bố cục**: Ẩn/hiện bất kỳ mục nào trên CV.

### 4. Thư Viện Gợi Ý Nội Dung Theo Ngành (Content Library)
Được nạp sẵn theo đúng đường dẫn yêu cầu (`nhan-vien-kinh-doanh`, IT Developer, Digital Marketing, Kế toán, Tuyển dụng HR) với các bullet points đầy đủ số liệu đo lường cụ thể (ví dụ: *"Đạt 130% KPI doanh số"*, *"Mang về 3.2 tỷ doanh thu"*).

### 5. Công Cụ Chấm Điểm CV Chuẩn ATS (ATS Score Checker)
- Tự động quét và chấm điểm CV theo thang điểm 100/100.
- Đánh giá thông tin liên hệ, tóm tắt chuyên môn, chỉ số đo lường (%), động từ hành động, kỹ năng từ khóa.
- Đưa ra lời khuyên cải thiện thực tế để nâng cao tỷ lệ trúng tuyển.

### 6. Xuất File PDF Chuẩn In Ấn
- Trang giấy chuẩn A4 (210mm x 297mm).
- Xuất file PDF sắc nét chuẩn vector bằng chức năng in trình duyệt (`Ctrl + P` / nút Tải PDF) với CSS `@media print` căn chỉnh chính xác, không bị cắt ngang dòng.
- Tự động lưu dữ liệu vào `localStorage` trên trình duyệt.

---

## 🛠 Hướng Dẫn Cài Đặt & Chạy

```bash
# 1. Cài đặt các gói phụ thuộc (nếu chưa cài)
npm install

# 2. Khởi chạy môi trường phát triển (Dev Server)
npm run dev

# 3. Mở trình duyệt tại:
http://localhost:3000
```
