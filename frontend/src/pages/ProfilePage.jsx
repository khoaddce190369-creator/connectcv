import React from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Star, 
  CheckCircle, 
  AlertCircle,
  Briefcase,
  Award,
  Globe,
  Edit2
} from 'lucide-react';
import { currentUser } from '../data/mockData';

export default function ProfilePage() {
  
  // Generating initials
  const initials = currentUser.name.split(' ').map(n => n[0]).join('');

  // Mock Work History
  const workHistory = [
    { id: 1, title: 'Senior React Developer for Fintech App', rating: 5.0, period: 'Jan 2023 - Present', earnings: '$45,000' },
    { id: 2, title: 'Full Stack Engineer - E-commerce Platform', rating: 4.8, period: 'Mar 2022 - Dec 2022', earnings: '$32,500' },
    { id: 3, title: 'UI/UX Implementation', rating: 5.0, period: 'Oct 2021 - Feb 2022', earnings: '$12,000' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          
          <div className="relative">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-primary-500 text-white flex items-center justify-center text-3xl sm:text-4xl font-bold shadow-md">
              {initials}
            </div>
            <div className="absolute bottom-0 right-0 sm:bottom-2 sm:right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
          </div>

          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-dark mb-1">{currentUser.name}</h1>
                <p className="text-lg text-gray-700 font-medium mb-3">{currentUser.title}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {currentUser.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Member since {currentUser.memberSince}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-3">
                <button className="bg-primary-50 text-primary-700 hover:bg-primary-100 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors border border-primary-100">
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
                <div className="text-2xl font-bold text-dark">
                  ${currentUser.hourlyRate} <span className="text-sm font-normal text-gray-500">/hr</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-bold text-dark">{currentUser.successRate}% Job Success</span>
              </div>
              <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
              <div>
                <span className="font-bold text-dark">{currentUser.totalJobs}</span>
                <span className="text-gray-500 ml-1">Total Jobs</span>
              </div>
              <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
              <div>
                <span className="font-bold text-dark">${(currentUser.totalEarnings / 1000).toFixed(0)}k+</span>
                <span className="text-gray-500 ml-1">Total Earnings</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Wider) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* About */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-dark mb-4">About</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {currentUser.bio}
            </p>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-dark mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {currentUser.skills.map((skill, idx) => (
                <span key={idx} className="px-4 py-2 rounded-full border border-primary-200 bg-primary-50 text-primary-700 font-medium text-sm hover:bg-primary-100 cursor-default transition-colors">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Portfolio */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-dark mb-4">Portfolio</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentUser.portfolio.map((item, idx) => (
                <div key={idx} className="group border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer">
                  <div className="h-40 bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                    <Briefcase className="w-10 h-10 text-gray-400" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-dark mb-1 group-hover:text-primary-600 transition-colors">{item.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Work History */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-dark mb-4">Work History</h2>
            <div className="space-y-6">
              {workHistory.map((job) => (
                <div key={job.id} className="pb-6 border-b border-gray-100 last:pb-0 last:border-0">
                  <h3 className="font-bold text-dark text-lg hover:text-primary-600 cursor-pointer">{job.title}</h3>
                  <div className="flex items-center gap-3 mt-1 mb-2">
                    <div className="flex items-center text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="font-medium text-dark">{job.rating}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500 text-sm">{job.period}</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold text-dark">{job.earnings}</span> earned
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>

        {/* Right Column (Narrower) */}
        <div className="space-y-6">
          
          {/* Availability */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-dark mb-4">Availability</h2>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary-500 mt-0.5" />
              <div>
                <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded mb-2">Available for work</span>
                <p className="text-gray-700 text-sm font-medium">More than 30 hrs/week</p>
                <p className="text-gray-500 text-xs mt-1">Open to long-term contracts</p>
              </div>
            </div>
          </div>

          {/* Verifications */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-dark mb-4">Verifications</h2>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Email verified</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Phone verified</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <span className="text-gray-700">ID verification pending</span>
              </li>
            </ul>
          </div>

          {/* Languages */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-dark mb-4">Languages</h2>
            <ul className="space-y-3">
              {currentUser.languages.map((lang, idx) => (
                <li key={idx} className="flex flex-col text-sm">
                  <span className="font-medium text-gray-800">{lang.name}</span>
                  <span className="text-gray-500">{lang.level}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Education */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-dark mb-4">Education</h2>
            <ul className="space-y-4">
              {currentUser.education.map((edu, idx) => (
                <li key={idx} className="flex flex-col text-sm">
                  <span className="font-medium text-gray-800">{edu.school}</span>
                  <span className="text-gray-600">{edu.degree}</span>
                  <span className="text-gray-400 mt-1">{edu.year}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
