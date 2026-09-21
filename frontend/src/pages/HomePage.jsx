import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, MapPin, Code, PenTool, BarChart, Smartphone, 
  Globe, Database, Cpu, Layout, Briefcase, Star, Clock, 
  Users, ArrowRight, UserPlus, Sparkles, Rocket, 
  FileCheck, Target, MessageSquare
} from 'lucide-react';
import { categories, jobs, stats, testimonials } from '../data/mockData';

const iconMap = {
  Code,
  PenTool,
  BarChart,
  Smartphone,
  Globe,
  Database,
  Cpu,
  Layout,
  Briefcase,
  Search
};

const HomePage = () => {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/find-jobs?q=${searchKeyword}&loc=${searchLocation}`);
  };

  const renderIcon = (iconName) => {
    const IconComponent = iconMap[iconName] || Briefcase;
    return <IconComponent className="w-6 h-6 text-primary-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary-50 to-white pt-20 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            Find the perfect job or talent,<br className="hidden sm:block" /> powered by AI
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Experience the future of hiring. Our AI-powered platform matches top talent with the right opportunities, complete with smart CV optimization.
          </p>
          
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto bg-white rounded-full shadow-lg p-2 flex flex-col sm:flex-row items-center gap-2 mb-10">
            <div className="flex-1 flex items-center px-4 w-full sm:border-r border-gray-200">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <input 
                type="text" 
                placeholder="Job title, keywords, or company" 
                className="w-full py-3 focus:outline-none text-gray-700 bg-transparent"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
            <div className="flex-1 flex items-center px-4 w-full">
              <MapPin className="w-5 h-5 text-gray-400 mr-3" />
              <input 
                type="text" 
                placeholder="Location" 
                className="w-full py-3 focus:outline-none text-gray-700 bg-transparent"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
            </div>
            <button type="submit" className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-8 rounded-full transition-colors duration-200">
              Search
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-8 text-gray-600 font-medium">
            <span>12,500+ Jobs</span>
            <span>•</span>
            <span>8,700+ Freelancers</span>
            <span>•</span>
            <span>$2.5M+ Paid</span>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-10 border-t border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Trusted by leading companies</p>
          <div className="flex flex-wrap justify-center gap-10 opacity-60">
            {['TechCorp', 'Innova', 'GlobalSys', 'Nexus', 'Quantum', 'CloudNet'].map((company, idx) => (
              <span key={idx} className="text-xl font-bold text-gray-800 flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories?.slice(0, 8).map((cat) => (
              <Link key={cat.id} to={`/find-jobs?category=${cat.id}`} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 flex flex-col items-center text-center group">
                <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                  {renderIcon(cat.icon)}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{cat.name}</h3>
                <p className="text-sm text-gray-500">{cat.jobCount} jobs</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                  <UserPlus className="w-10 h-10 text-primary-500" />
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold border-4 border-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Create Profile</h3>
              <p className="text-gray-600">Set up your profile, highlight your skills, and let our system understand your career goals.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                  <Sparkles className="w-10 h-10 text-primary-500" />
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold border-4 border-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Matches Jobs</h3>
              <p className="text-gray-600">Our advanced AI algorithm continuously scans the market to find the perfect job matches for you.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                  <Rocket className="w-10 h-10 text-primary-500" />
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold border-4 border-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Get Hired</h3>
              <p className="text-gray-600">Apply with an AI-optimized CV and customized proposals to stand out and get hired faster.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Featured Jobs</h2>
            <Link to="/find-jobs" className="text-primary-500 hover:text-primary-600 font-semibold flex items-center transition-colors">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs?.slice(0, 6).map((job) => (
              <Link key={job.id} to={`/job/${job.id}`} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 block border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{job.title}</h3>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Briefcase className="w-4 h-4 mr-1" /> {job.company}
                    </p>
                  </div>
                  {job.matchScore && (
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md flex items-center">
                      <Sparkles className="w-3 h-3 mr-1" /> {job.matchScore}% Match
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {job.skills?.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">
                      {skill}
                    </span>
                  ))}
                  {job.skills?.length > 3 && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">+{job.skills.length - 3}</span>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                  <div className="flex items-center text-gray-900 font-semibold">
                    {job.budgetRange || job.salary}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-20 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">AI-Powered Career Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-primary-200 transition-colors">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                <FileCheck className="w-6 h-6 text-primary-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">CV Optimizer</h3>
              <p className="text-gray-600 mb-6">Create an ATS-optimized CV tailored perfectly to each job description, increasing your chances of getting an interview.</p>
              <Link to="/tools/cv" className="text-primary-500 font-semibold flex items-center hover:text-primary-600">
                Learn More <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-primary-200 transition-colors">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-primary-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Matching</h3>
              <p className="text-gray-600 mb-6">Our AI analyzes your skills, experience, and preferences to score your profile against job requirements instantly.</p>
              <Link to="/tools/matching" className="text-primary-500 font-semibold flex items-center hover:text-primary-600">
                Learn More <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-primary-200 transition-colors">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6 text-primary-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Interview Coach</h3>
              <p className="text-gray-600 mb-6">Practice answering behavioral and technical questions with our AI interviewer and get instant actionable feedback.</p>
              <Link to="/tools/coach" className="text-primary-500 font-semibold flex items-center hover:text-primary-600">
                Learn More <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials?.slice(0, 3).map((testimonial) => (
              <div key={testimonial.id} className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 flex flex-col h-full">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic flex-grow">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4 flex-shrink-0 overflow-hidden">
                     {testimonial.avatar ? (
                       <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-500 font-bold">
                         {testimonial.name.charAt(0)}
                       </div>
                     )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#1B3654] to-primary-600 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to accelerate your career?</h2>
          <p className="text-xl opacity-90 mb-10">Join thousands of professionals finding their dream jobs and getting hired faster with our AI tools.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="bg-white text-primary-600 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors shadow-lg">
              Get Started Free
            </Link>
            <Link to="/about" className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white/10 transition-colors">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
