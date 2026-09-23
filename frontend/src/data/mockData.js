export const heroSlides = [
  {
    badge: 'AI-Powered Matching',
    title: 'Find your dream job<br/>before anyone else does.',
    description: 'Our AI continuously scans thousands of listings across industries and matches them to your skills, experience level, and career goals — then notifies you of the best fits in real time. No more endless scrolling.',
    buttonText: 'Browse Jobs',
    buttonLink: '/job-postings',
    gradient: 'linear-gradient(135deg,#2563eb 0%,#4f46e5 50%,#7c3aed 100%)',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=220&h=280&fit=crop&crop=face&auto=format&q=80',
    floatingCards: [
      { type: 'match', title: 'Senior UI/UX Designer', subtitle: 'NovaTech · Remote', score: 92 },
      { type: 'new', title: 'Frontend Developer', subtitle: 'PixelWorks · $2,000/mo' }
    ]
  },
  {
    badge: 'Smart CV Generator',
    title: 'A CV that actually<br/>gets you shortlisted.',
    description: 'Automatically generates an ATS-friendly CV tailored to each company\'s requirements based on your profile and the specific job description.',
    buttonText: 'Create CV',
    buttonLink: '/profile',
    gradient: 'linear-gradient(135deg,#7c3aed 0%,#db2777 55%,#f97316 100%)',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=220&h=280&fit=crop&crop=face&auto=format&q=80',
    floatingCards: [
      { type: 'match', title: 'Product Manager', subtitle: 'Global Tech · Onsite', score: 85 },
      { type: 'new', title: 'Data Scientist', subtitle: 'AI Solutions · $3,500/mo' }
    ]
  },
  {
    badge: 'Real-Time Interview Prep',
    title: 'Ace your interviews<br/>with AI simulation.',
    description: 'AI acts as an HR, creating role-specific questions and practice sessions to boost your confidence and help you articulate your value effectively.',
    buttonText: 'Practice Now',
    buttonLink: '/interview',
    gradient: 'linear-gradient(135deg,#0ea5e9 0%,#3b82f6 50%,#8b5cf6 100%)',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=220&h=280&fit=crop&crop=face&auto=format&q=80',
    floatingCards: [
      { type: 'match', title: 'DevOps Engineer', subtitle: 'CloudSync · Remote', score: 95 },
      { type: 'new', title: 'Backend Developer', subtitle: 'FinTech Pro · $2,800/mo' }
    ]
  }
];

export const categories = [
  { name: 'UI/UX Design', icon: 'PenTool', jobCount: '1,200+', colorClasses: 'text-brand-600 bg-brand-50' },
  { name: 'Development', icon: 'Code', jobCount: '3,500+', colorClasses: 'text-indigo-600 bg-indigo-50' },
  { name: 'Marketing', icon: 'Megaphone', jobCount: '800+', colorClasses: 'text-pink-600 bg-pink-50' },
  { name: 'Data Science', icon: 'BarChart', jobCount: '450+', colorClasses: 'text-emerald-600 bg-emerald-50' },
  { name: 'Product Management', icon: 'Briefcase', jobCount: '600+', colorClasses: 'text-amber-600 bg-amber-50' },
  { name: 'Sales', icon: 'TrendingUp', jobCount: '1,500+', colorClasses: 'text-sky-600 bg-sky-50' }
];

export const recommendedJobs = [
  {
    companyInitials: 'N',
    gradient: 'linear-gradient(135deg,#2563eb,#4f46e5)',
    company: 'NovaTech',
    location: 'Remote',
    title: 'Senior UI/UX Designer',
    tags: ['Figma', 'Prototyping', 'User Research'],
    salary: '$2,000 - $3,500',
    summary: 'Join our core design team to build intuitive enterprise software interfaces. Focus on complex user journeys and design systems.',
    timeAgo: '2h ago',
    applicants: 12
  },
  {
    companyInitials: 'P',
    gradient: 'linear-gradient(135deg,#10b981,#059669)',
    company: 'PixelWorks',
    location: 'Onsite',
    title: 'Frontend Developer',
    tags: ['React', 'TypeScript', 'Tailwind'],
    salary: '$1,500 - $2,500',
    summary: 'Looking for a strong frontend developer to help build performant web applications with modern tech stack.',
    timeAgo: '5h ago',
    applicants: 45
  },
  {
    companyInitials: 'G',
    gradient: 'linear-gradient(135deg,#f59e0b,#d97706)',
    company: 'Global Tech',
    location: 'Hybrid',
    title: 'Product Manager',
    tags: ['Agile', 'Scrum', 'Roadmapping'],
    salary: '$2,500 - $4,000',
    summary: 'Lead a cross-functional team to deliver high-impact features for our flagship B2B product.',
    timeAgo: '1d ago',
    applicants: 23
  },
  {
    companyInitials: 'A',
    gradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
    company: 'AI Solutions',
    location: 'Remote',
    title: 'Data Scientist',
    tags: ['Python', 'Machine Learning', 'SQL'],
    salary: '$3,000 - $5,000',
    summary: 'Develop predictive models and machine learning pipelines to solve complex business problems.',
    timeAgo: '2d ago',
    applicants: 8
  }
];

export const featuredTalent = [
  {
    name: 'Nguyễn Minh Tuấn',
    location: 'Hà Nội, Việt Nam',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenMinhTuan&backgroundColor=b6e3f4',
    badge: 'Shortlisted',
    title: 'Senior UI/UX Designer',
    rating: 5.0,
    reviewCount: 18,
    completedJobs: 45,
    matchPercent: 92,
    bio: 'I design intuitive digital experiences for web and mobile products. Passionate about user-centered design and building scalable design systems with a strong eye for detail.',
    skills: ['Figma', 'React', 'TypeScript', 'UI/UX'],
    price: '$30/hr'
  },
  {
    name: 'Trần Thị Hà',
    location: 'TP.HCM, Việt Nam',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TranThiHa&backgroundColor=ffd5dc',
    badge: 'Interview',
    title: 'Graphic Designer',
    rating: 4.9,
    reviewCount: 24,
    completedJobs: 62,
    matchPercent: 87,
    bio: 'Graphic designer with a passion for visual storytelling. I create compelling brand identities, social media content and marketing materials that make brands stand out.',
    skills: ['Figma', 'Adobe XD', 'Illustrator', 'Photoshop'],
    price: '$25/hr'
  },
  {
    name: 'Lê Quang Huy',
    location: 'Đà Nẵng, Việt Nam',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LeQuangHuy&backgroundColor=c0aede',
    badge: 'Applied',
    title: 'Frontend Developer',
    rating: 4.8,
    reviewCount: 11,
    completedJobs: 28,
    matchPercent: 81,
    bio: 'Frontend developer who loves clean code and pixel-perfect UI. I build performant web apps with React and Next.js and have a strong eye for design-to-code translation.',
    skills: ['React', 'Next.js', 'Tailwind', 'TypeScript'],
    price: '$35/hr'
  },
  {
    name: 'Phạm Ngọc Anh',
    location: 'Hà Nội, Việt Nam',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PhamNgocAnh&backgroundColor=d1fae5',
    badge: 'Applied',
    title: 'Product Designer',
    rating: 4.7,
    reviewCount: 36,
    completedJobs: 89,
    matchPercent: 76,
    bio: 'Senior product designer with 6 years of experience crafting digital products for startups and enterprise clients. Expert at design systems, user flows and cross-functional collaboration.',
    skills: ['UI/UX', 'Figma', 'Prototyping', 'User Research'],
    price: '$45/hr'
  },
  {
    name: 'Võ Thành Long',
    location: 'Cần Thơ, Việt Nam',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VoThanhLong&backgroundColor=fde68a',
    badge: 'Rejected',
    title: 'AI Research',
    rating: 4.3,
    reviewCount: 5,
    completedJobs: 12,
    matchPercent: 63,
    bio: 'Junior AI researcher with a background in machine learning and data analysis. Looking to apply ML models to real-world problems and contribute to innovative AI products.',
    skills: ['Python', 'SQL', 'ML', 'TensorFlow'],
    price: '$20/hr'
  },
  {
    name: 'Nguyễn Thanh Tâm',
    location: 'Hà Nội, Việt Nam',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenThanhTam&backgroundColor=e9d5ff',
    badge: 'Applied',
    title: 'Backend Developer',
    rating: 4.9,
    reviewCount: 42,
    completedJobs: 105,
    matchPercent: 89,
    bio: 'Experienced backend developer focusing on scalable microservices. Proficient in Node.js, Go, and cloud infrastructure.',
    skills: ['Node.js', 'Go', 'AWS', 'Docker'],
    price: '$40/hr'
  }
];

export const testimonials = [
  {
    name: 'Nguyễn Minh Tuấn',
    role: 'Information Security Analyst',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenMinhTuan&backgroundColor=b6e3f4',
    content: '"Connect CV helped me land my first internship and the AI-generated CV really made a difference. I got 3 interviews invitations within a week!"'
  },
  {
    name: 'Trần Thị Hà',
    role: 'Graphic Designer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TranThiHa&backgroundColor=ffd5dc',
    content: '"I\'ve hired 5 designers through Connect CV. The quality is amazing and the process is so smooth. Highly recommend!"'
  },
  {
    name: 'Lê Quang Huy',
    role: 'Hiring Manager at NovaTech',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LeQuangHuy&backgroundColor=c0aede',
    content: '"The platform saves us a lot of time. The AI screening and tailored CVs help us find the right candidates faster and more accurately."'
  }
];

export const jobPostings = [
  {
    company: 'NovaTech',
    logoInitials: 'N',
    gradient: 'linear-gradient(135deg,#2563eb,#4f46e5)',
    status: 'Active',
    title: 'Senior UI/UX Designer',
    location: 'Remote',
    budget: '$2,000 - $3,500',
    deadline: '2 days left',
    skills: ['Figma', 'React', 'TypeScript', 'UI/UX'],
    applicantCount: 48,
    avatarUrls: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=1&backgroundColor=b6e3f4',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=2&backgroundColor=ffd5dc',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=3&backgroundColor=d1fae5'
    ]
  },
  {
    company: 'PixelWorks',
    logoInitials: 'P',
    gradient: 'linear-gradient(135deg,#10b981,#059669)',
    status: 'Draft',
    title: 'Frontend Developer',
    location: 'Onsite',
    budget: '$1,500 - $2,500',
    deadline: '7 days left',
    skills: ['React', 'TypeScript', 'Tailwind'],
    applicantCount: 0,
    avatarUrls: []
  },
  {
    company: 'Global Tech',
    logoInitials: 'G',
    gradient: 'linear-gradient(135deg,#f59e0b,#d97706)',
    status: 'Closed',
    title: 'Product Manager',
    location: 'Hybrid',
    budget: '$2,500 - $4,000',
    deadline: 'Closed',
    skills: ['Agile', 'Scrum', 'Roadmapping'],
    applicantCount: 120,
    avatarUrls: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=4&backgroundColor=b6e3f4',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=5&backgroundColor=ffd5dc'
    ]
  },
  {
    company: 'AI Solutions',
    logoInitials: 'A',
    gradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
    status: 'Active',
    title: 'Data Scientist',
    location: 'Remote',
    budget: '$3,000 - $5,000',
    deadline: '14 days left',
    skills: ['Python', 'Machine Learning', 'SQL'],
    applicantCount: 25,
    avatarUrls: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=6&backgroundColor=d1fae5',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=7&backgroundColor=b6e3f4'
    ]
  },
  {
    company: 'FinTech Pro',
    logoInitials: 'F',
    gradient: 'linear-gradient(135deg,#0ea5e9,#0284c7)',
    status: 'Active',
    title: 'Backend Developer',
    location: 'Hybrid',
    budget: '$2,800 - $4,200',
    deadline: '5 days left',
    skills: ['Node.js', 'Go', 'AWS', 'Docker'],
    applicantCount: 65,
    avatarUrls: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=8&backgroundColor=ffd5dc',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=9&backgroundColor=c0aede',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=10&backgroundColor=b6e3f4'
    ]
  },
  {
    company: 'CloudSync',
    logoInitials: 'C',
    gradient: 'linear-gradient(135deg,#ec4899,#be185d)',
    status: 'Active',
    title: 'DevOps Engineer',
    location: 'Remote',
    budget: '$3,500 - $5,500',
    deadline: '10 days left',
    skills: ['Kubernetes', 'CI/CD', 'Terraform', 'Azure'],
    applicantCount: 32,
    avatarUrls: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=11&backgroundColor=d1fae5',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=12&backgroundColor=ffd5dc'
    ]
  }
];

export const candidates = featuredTalent; // Reuse for candidates view

export const artworks = [
  {
    category: 'UI Design',
    imageUrl: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=600&h=400&fit=crop',
    title: 'Fintech Dashboard UI',
    designer: {
      name: 'Nguyễn Minh Tuấn',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenMinhTuan&backgroundColor=b6e3f4',
      title: 'Senior UI/UX Designer',
      rating: 5.0
    },
    likes: 124,
    views: '1.2k'
  },
  {
    category: 'Branding',
    imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&h=400&fit=crop',
    title: 'Eco Brand Identity',
    designer: {
      name: 'Trần Thị Hà',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TranThiHa&backgroundColor=ffd5dc',
      title: 'Graphic Designer',
      rating: 4.9
    },
    likes: 342,
    views: '3.4k'
  },
  {
    category: 'Web Design',
    imageUrl: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&h=400&fit=crop',
    title: 'E-commerce Landing Page',
    designer: {
      name: 'Phạm Ngọc Anh',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PhamNgocAnh&backgroundColor=d1fae5',
      title: 'Product Designer',
      rating: 4.7
    },
    likes: 89,
    views: '956'
  },
  {
    category: 'Mobile App',
    imageUrl: 'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?w=600&h=400&fit=crop',
    title: 'Health Tracking App',
    designer: {
      name: 'Nguyễn Thanh Tâm',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenThanhTam&backgroundColor=e9d5ff',
      title: 'UI/UX Designer',
      rating: 4.8
    },
    likes: 215,
    views: '2.1k'
  },
  {
    category: 'Illustration',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop',
    title: 'Abstract Vector Art',
    designer: {
      name: 'Trần Thị Hà',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TranThiHa&backgroundColor=ffd5dc',
      title: 'Graphic Designer',
      rating: 4.9
    },
    likes: 567,
    views: '5.6k'
  },
  {
    category: 'Typography',
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop',
    title: 'Custom Font Family',
    designer: {
      name: 'Nguyễn Minh Tuấn',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenMinhTuan&backgroundColor=b6e3f4',
      title: 'Senior UI/UX Designer',
      rating: 5.0
    },
    likes: 145,
    views: '1.5k'
  },
  {
    category: '3D Design',
    imageUrl: 'https://images.unsplash.com/photo-1633355444132-695d5876cd00?w=600&h=400&fit=crop',
    title: 'Product Rendering',
    designer: {
      name: 'Phạm Ngọc Anh',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PhamNgocAnh&backgroundColor=d1fae5',
      title: 'Product Designer',
      rating: 4.7
    },
    likes: 278,
    views: '2.8k'
  },
  {
    category: 'UI Design',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
    title: 'Analytics Dashboard',
    designer: {
      name: 'Nguyễn Thanh Tâm',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenThanhTam&backgroundColor=e9d5ff',
      title: 'UI/UX Designer',
      rating: 4.8
    },
    likes: 198,
    views: '1.9k'
  }
];

export const interviewMessages = [
  { sender: 'ai', content: 'Hello! I am the AI Interviewer for the Senior UI/UX Designer position at NovaTech. Are you ready to begin?', badges: [] },
  { sender: 'user', content: 'Yes, I am ready.', badges: [] },
  { sender: 'ai', content: 'Great. Let\'s start with a foundational question. Can you walk me through your design process when tackling a complex enterprise software project? Specifically, how do you balance user needs with business requirements?', badges: ['UX Process', 'Problem Solving'] },
  { sender: 'user', content: 'I usually start with stakeholder interviews to understand the business goals, followed by user research to map out the pain points. I try to find the intersection where solving the user\'s problem directly drives the business metric.', badges: [] },
  { sender: 'ai', content: 'That\'s a solid approach. Can you give an example of a time you had to compromise between a requested feature from stakeholders and what your user research suggested?', badges: ['Conflict Resolution', 'Communication'], quickReplies: ['Talk about the CRM project', 'Discuss the onboarding flow redesign', 'Explain a time I pushed back on a feature'] }
];

export const jobDetail = {
  title: 'Senior UI/UX Designer',
  company: 'NovaTech',
  location: 'Remote',
  type: 'Full-time',
  salary: '$2,000 - $3,500/month',
  postedDate: '2 hours ago',
  applicants: 12,
  description: `We are looking for a Senior UI/UX Designer to join our core product team. You will be responsible for designing intuitive, scalable, and visually compelling enterprise software interfaces. You will work closely with product managers, engineers, and stakeholders to translate complex requirements into elegant user journeys.`,
  responsibilities: [
    'Lead the design of complex B2B web applications from concept to handoff.',
    'Conduct user research, usability testing, and gather feedback to iterate on designs.',
    'Maintain and evolve our comprehensive design system in Figma.',
    'Collaborate with frontend engineers to ensure pixel-perfect implementation.',
    'Mentor junior designers and advocate for user-centered design principles across the company.'
  ],
  requirements: [
    '4+ years of experience in UI/UX design, specifically for complex web apps or SaaS products.',
    'Expert proficiency in Figma and prototyping tools.',
    'Strong portfolio demonstrating a clean visual aesthetic and deep understanding of UX principles.',
    'Experience building and maintaining design systems.',
    'Excellent communication skills and ability to articulate design decisions to non-designers.'
  ],
  benefits: [
    'Competitive salary and equity package',
    'Fully remote work with flexible hours',
    'Comprehensive health insurance',
    'Annual learning and development budget',
    'MacBook Pro and home office stipend'
  ],
  companyAbout: 'NovaTech is a fast-growing B2B SaaS startup building the next generation of team collaboration tools. We believe in empowering teams to do their best work through intuitive, powerful software.'
};
