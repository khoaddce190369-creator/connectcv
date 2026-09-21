import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram, Globe, Github } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Footer() {
  return (
    <footer className="bg-[#1B3654] text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: About */}
          <div>
            <div className="flex items-center mb-4">
              <img src={logo} alt="ConnectCV" className="h-8 w-8 mr-2" />
              <span className="text-xl font-bold">
                <span className="text-white">Connect</span>
                <span className="text-blue-400">CV</span>
              </span>
            </div>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="hover:text-white transition-colors">Về chúng tôi</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Đội ngũ</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Tuyển dụng nội bộ</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Báo chí</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Liên hệ</Link></li>
            </ul>
          </div>

          {/* Column 2: For Freelancers */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Dành Cho Ứng Viên</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="hover:text-white transition-colors">Cách tìm việc</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Tạo hồ sơ nổi bật</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">AI Phỏng Vấn</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Gợi ý kỹ năng</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Đánh giá CV</Link></li>
            </ul>
          </div>

          {/* Column 3: For Clients */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Dành Cho Nhà Tuyển Dụng</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="hover:text-white transition-colors">Cách tuyển dụng</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Đăng tin tuyển dụng</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Tìm kiếm tài năng</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Quản lý ứng viên</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Bảng giá dịch vụ</Link></li>
            </ul>
          </div>

          {/* Column 4: Resources */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Tài Nguyên</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="hover:text-white transition-colors">Blog hướng dẫn</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Câu chuyện thành công</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Trung tâm trợ giúp</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Cộng đồng</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Sự kiện</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-6 mb-4 md:mb-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">Facebook</span>
              <Facebook className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">Twitter</span>
              <Twitter className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">LinkedIn</span>
              <Linkedin className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">Instagram</span>
              <Instagram className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">GitHub</span>
              <Github className="h-6 w-6" />
            </a>
          </div>

          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center text-gray-400 hover:text-white cursor-pointer">
              <Globe className="h-4 w-4 mr-2" />
              <span>Tiếng Việt</span>
            </div>
            <span className="text-gray-600">|</span>
            <p>&copy; {new Date().getFullYear()} ConnectCV Global Inc.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
