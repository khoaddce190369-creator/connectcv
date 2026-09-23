import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, Plus, ChevronDown, ChevronRight, ChevronLeft, Star, CheckCircle, Briefcase } from 'lucide-react';
import { candidates } from '../data/mockData.js'; // Using local mock if needed

const mockCandidates = [
  {
    id: 1,
    name: "Nguyễn Minh Tuấn",
    location: "Hà Nội, Việt Nam",
    status: "Shortlisted",
    role: "Senior UI/UX Designer | Figma, React, TypeScript | 4 years exp.",
    rating: 5.0,
    reviews: 18,
    appliedFor: "NovaTech",
    matchScore: 92,
    skills: [
      { name: "React", color: "bg-blue-50 text-blue-700" },
      { name: "TypeScript", color: "bg-blue-50 text-blue-700" },
      { name: "UI/UX", color: "bg-violet-50 text-violet-700" },
      { name: "Figma", color: "bg-pink-50 text-pink-700" }
    ],
    bio: "I design intuitive digital experiences for web and mobile products. Passionate about user-centered design and building scalable design systems with a strong eye for detail.",
    exp: "4 years experience",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenMinhTuan&backgroundColor=b6e3f4",
    avatarBg: "bg-sky-100",
    statusBadge: "bg-amber-50 text-amber-700"
  },
  {
    id: 2,
    name: "Trần Thị Hà",
    location: "TP.HCM, Việt Nam",
    status: "Interview",
    role: "Graphic Designer | Adobe Suite, Figma | 3 years exp.",
    rating: 4.9,
    reviews: 24,
    appliedFor: "PixelWorks",
    matchScore: 87,
    skills: [
      { name: "Figma", color: "bg-pink-50 text-pink-700" },
      { name: "Adobe XD", color: "bg-orange-50 text-orange-700" },
      { name: "Illustrator", color: "bg-rose-50 text-rose-700" },
      { name: "Photoshop", color: "bg-slate-100 text-slate-600" }
    ],
    bio: "Graphic designer with a passion for visual storytelling. I create compelling brand identities, social media content and marketing materials that make brands stand out.",
    exp: "3 years experience",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=TranThiHa&backgroundColor=ffd5dc",
    avatarBg: "bg-pink-100",
    statusBadge: "bg-brand-50 text-brand-700 text-blue-700"
  },
  {
    id: 3,
    name: "Lê Quang Huy",
    location: "Đà Nẵng, Việt Nam",
    status: "Applied",
    role: "Frontend Developer | React, Next.js, Tailwind CSS | 2 years exp.",
    rating: 4.8,
    reviews: 11,
    appliedFor: "BrightPath",
    matchScore: 81,
    skills: [
      { name: "React", color: "bg-blue-50 text-blue-700" },
      { name: "Next.js", color: "bg-green-50 text-green-700" },
      { name: "Tailwind", color: "bg-teal-50 text-teal-700" },
      { name: "TypeScript", color: "bg-slate-100 text-slate-600" }
    ],
    bio: "Frontend developer who loves clean code and pixel-perfect UI. I build performant web apps with React and Next.js and have a strong eye for design-to-code translation.",
    exp: "2 years experience",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=LeQuangHuy&backgroundColor=c0aede",
    avatarBg: "bg-violet-100",
    statusBadge: "bg-slate-100 text-slate-600"
  },
  {
    id: 4,
    name: "Phạm Ngọc Anh",
    location: "Hà Nội, Việt Nam",
    status: "Applied",
    role: "Product Designer | UI/UX, Prototyping, Research | 6 years exp.",
    rating: 4.7,
    reviews: 36,
    appliedFor: "NextGen",
    matchScore: 76,
    skills: [
      { name: "UI/UX", color: "bg-violet-50 text-violet-700" },
      { name: "Figma", color: "bg-pink-50 text-pink-700" },
      { name: "Prototyping", color: "bg-indigo-50 text-indigo-700" },
      { name: "User Research", color: "bg-sky-50 text-sky-700" }
    ],
    bio: "Senior product designer with 6 years of experience crafting digital products for startups and enterprise clients. Expert at design systems, user flows and cross-functional collaboration.",
    exp: "6 years experience",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=PhamNgocAnh&backgroundColor=d1fae5",
    avatarBg: "bg-emerald-100",
    statusBadge: "bg-slate-100 text-slate-600"
  },
  {
    id: 5,
    name: "Võ Thành Long",
    location: "Cần Thơ, Việt Nam",
    status: "Rejected",
    role: "AI Research | Python, ML, Data Science | 1 year exp.",
    rating: 4.3,
    reviews: 5,
    appliedFor: "BrightPath",
    matchScore: 63,
    skills: [
      { name: "Python", color: "bg-amber-50 text-amber-700" },
      { name: "SQL", color: "bg-slate-100 text-slate-600" },
      { name: "ML", color: "bg-emerald-50 text-emerald-700" },
      { name: "TensorFlow", color: "bg-sky-50 text-sky-700" }
    ],
    bio: "Junior AI researcher with a background in machine learning and data analysis. Looking to apply ML models to real-world problems and contribute to innovative AI products.",
    exp: "1 year experience",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=VoThanhLong&backgroundColor=fde68a",
    avatarBg: "bg-amber-100",
    statusBadge: "bg-red-50 text-red-600"
  },
  {
    id: 6,
    name: "Nguyễn Thanh Tâm",
    location: "TP.HCM, Việt Nam",
    status: "Shortlisted",
    role: "Motion Designer | After Effects, Lottie, 3D | 5 years exp.",
    rating: 5.0,
    reviews: 42,
    appliedFor: "PixelWorks",
    matchScore: 89,
    skills: [
      { name: "After Effects", color: "bg-purple-50 text-purple-700" },
      { name: "Lottie", color: "bg-blue-50 text-blue-700" },
      { name: "Cinema 4D", color: "bg-indigo-50 text-indigo-700" },
      { name: "Premiere", color: "bg-slate-100 text-slate-600" }
    ],
    bio: "Motion designer specialized in UI animations, explainer videos, and micro-interactions for web and mobile apps. I bring interfaces to life with purpose and style.",
    exp: "5 years experience",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenThanhTam&backgroundColor=e9d5ff",
    avatarBg: "bg-purple-100",
    statusBadge: "bg-amber-50 text-amber-700"
  }
];

export default function CandidatesPage() {
  const [jobFilter, setJobFilter] = useState("All Jobs");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortFilter, setSortFilter] = useState("Best Match");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCandidates = mockCandidates.filter(c => {
    if (statusFilter !== "All Status" && c.status !== statusFilter) return false;
    if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase()) && !c.role.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen font-inter">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm bg-gradient-to-br from-blue-600 to-indigo-600">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-sora font-bold text-slate-900 text-lg tracking-tight">Connect<span className="text-blue-600">CV</span></span>
          </Link>

          <div className="flex-1 max-w-md hidden md:block">
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3.5 py-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white transition-all">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input type="text" placeholder="Tìm kiếm tin tuyển dụng, kỹ năng, vị trí..." className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full" />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Find Work</Link>
            <Link to="/candidates" className="text-sm font-semibold text-blue-600 transition-colors">Hire a Designer</Link>
            <Link to="/applications" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">For Businesses</Link>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600"></span>
            </button>
            <Link to="/applications" className="hidden sm:flex items-center gap-1.5 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition-opacity hover:opacity-95 bg-gradient-to-r from-blue-600 to-indigo-600">
              <Plus className="w-4 h-4" />
              + Đăng Tin Mới
            </Link>
            <div className="flex items-center gap-2 cursor-pointer pl-1">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenBao&backgroundColor=b6e3f4" className="w-8 h-8 rounded-full bg-sky-100 border border-slate-100" alt="Avatar" />
              <span className="hidden lg:block text-sm font-medium text-slate-700">Nguyễn Bảo (HR)</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Sub-nav */}
        <div className="border-t border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-6 h-11 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <Link to="/social" className="text-sm text-slate-500 hover:text-slate-700 pb-0.5 h-full flex items-center border-b-2 border-transparent hover:border-slate-200 transition-all">Social</Link>
            <Link to="/applications" className="text-sm text-slate-500 hover:text-slate-700 pb-0.5 h-full flex items-center border-b-2 border-transparent hover:border-slate-200 transition-all">
              Quản Lý Tin Tuyển Dụng
              <span className="ml-1.5 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full bg-blue-600">6</span>
            </Link>
            <Link to="/candidates" className="text-sm pb-0.5 h-full flex items-center border-b-2 border-blue-600 text-blue-600 font-semibold transition-all">Candidates / Freelancer</Link>
            <Link to="/interview" className="text-sm text-slate-500 hover:text-slate-700 pb-0.5 h-full flex items-center border-b-2 border-transparent hover:border-slate-200 transition-all">
              Tin Nhắn
              <span className="ml-1.5 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full bg-blue-600">3</span>
            </Link>
            <Link to="/settings" className="text-sm text-slate-500 hover:text-slate-700 pb-0.5 h-full flex items-center border-b-2 border-transparent hover:border-slate-200 transition-all">Cài Đặt Công Ty</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-36 pb-16">
        
        {/* Header & Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-5 gap-4">
            <div>
              <h1 className="font-sora text-xl font-bold text-slate-900">Candidates</h1>
              <p className="text-sm text-slate-500 mt-0.5">Find the best talent for your team.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select 
                value={jobFilter} onChange={e => setJobFilter(e.target.value)}
                className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none cursor-pointer hover:border-blue-300 transition-colors"
              >
                <option>All Jobs</option>
                <option>Senior UI/UX Designer</option>
                <option>Frontend Developer</option>
              </select>
              <select 
                value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none cursor-pointer hover:border-blue-300 transition-colors"
              >
                <option>All Status</option>
                <option>Shortlisted</option>
                <option>Interview</option>
                <option>Applied</option>
                <option>Rejected</option>
              </select>
              <select 
                value={sortFilter} onChange={e => setSortFilter(e.target.value)}
                className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none cursor-pointer hover:border-blue-300 transition-colors"
              >
                <option>Best Match</option>
                <option>Most Recent</option>
                <option>Highest Score</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input 
                type="text" 
                placeholder="Search by name, skill, or keyword..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full" 
              />
            </div>
            <p className="text-sm text-slate-500"><span className="font-semibold text-slate-800">{filteredCandidates.length}</span> candidates found</p>
          </div>
        </div>

        {/* Candidate Cards Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {filteredCandidates.map(candidate => (
            <div key={candidate.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <img src={candidate.avatar} className={`w-14 h-14 rounded-2xl object-cover ${candidate.avatarBg}`} alt={candidate.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-sora font-bold text-slate-900 text-sm">{candidate.name}</h3>
                      <CheckCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span className="text-xs text-slate-400">{candidate.location}</span>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${candidate.statusBadge}`}>
                      {candidate.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2 truncate">{candidate.role}</p>
                  
                  <div className="flex items-center gap-3 mb-3 text-xs text-slate-600 flex-wrap">
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      {candidate.rating} ({candidate.reviews})
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="flex items-center gap-1">Applied for: {candidate.appliedFor}</span>
                    <span className="text-slate-300">·</span>
                    <span className={`flex items-center gap-1 font-bold ${candidate.matchScore >= 80 ? 'text-emerald-600' : candidate.matchScore >= 70 ? 'text-amber-600' : 'text-slate-500'}`}>
                      {candidate.matchScore >= 80 && <CheckCircle className="w-3 h-3" />}
                      {candidate.matchScore}% match
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {candidate.skills.map((skill, idx) => (
                      <span key={idx} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${skill.color}`}>
                        {skill.name}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">
                    {candidate.bio}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{candidate.exp}</span>
                    <Link to={`/job-detail`} className="text-xs font-semibold px-4 py-1.5 rounded-xl text-white transition-opacity hover:opacity-95 bg-gradient-to-r from-blue-600 to-indigo-600">
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-center gap-1">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-white border border-slate-200 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold text-white bg-blue-600">1</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium text-slate-600 hover:bg-white border border-slate-200 transition-colors">2</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium text-slate-600 hover:bg-white border border-slate-200 transition-colors">3</button>
          <span className="text-xs text-slate-400 px-1">…</span>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium text-slate-600 hover:bg-white border border-slate-200 transition-colors">8</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-white border border-slate-200 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
