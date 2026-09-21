import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Video, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Briefcase,
  ChevronRight,
  FileSearch,
  User,
  Activity,
  Bell
} from 'lucide-react';
import { currentUser, dashboardStats, recentActivity, jobs, notifications } from '../data/mockData';

const iconMap = {
  FileText: FileText,
  Video: Video,
  DollarSign: DollarSign,
  TrendingUp: TrendingUp,
};

export default function DashboardPage() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const topJobs = jobs
    .filter(j => j.matchScore)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-dark mb-1">
              Welcome back, {currentUser.name}!
            </h1>
            <p className="text-gray-500 text-sm">{currentDate}</p>
          </div>
          <div className="w-full md:w-64">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-dark">Profile Completion</span>
              <span className="text-primary-500 font-bold">85%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-primary-500 h-2.5 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat, idx) => {
          const IconComponent = iconMap[stat.icon] || Activity;
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center space-x-4">
              <div className={`p-4 rounded-lg ${stat.bg}`}>
                <IconComponent className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                <div className="flex items-baseline space-x-2">
                  <h3 className="text-2xl font-bold text-dark">{stat.value}</h3>
                  <span className={`text-xs font-semibold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trend === 'up' ? '↑' : '↓'} {stat.change}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Wider) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-dark">Recent Activity</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-gray-800">
                      {activity.action} <span className="font-semibold text-dark">{activity.target}</span>
                    </p>
                    <div className="flex items-center mt-1 space-x-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{activity.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {activity.amount && (
                      <span className="font-semibold text-dark">{activity.amount}</span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-center">
              <button className="text-primary-500 hover:text-primary-600 font-medium text-sm flex items-center justify-center w-full">
                View All Activity
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>

          {/* Recommended Jobs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-dark">Recommended Jobs</h2>
              <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-md font-semibold">
                High Matches
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {topJobs.map((job) => (
                <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                    <h3 className="font-bold text-dark text-lg">{job.title}</h3>
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-md border border-green-200">
                      {job.matchScore}% Match
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mb-4 flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1 font-medium text-dark">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      {job.budget || job.salary}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      {job.type}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Apply Now
                    </button>
                    <button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Save
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-center">
              <Link to="/find-jobs" className="text-primary-500 hover:text-primary-600 font-medium text-sm flex items-center justify-center w-full">
                Browse All Recommended Jobs
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (Narrower) */}
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-dark mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/find-jobs" className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-gray-700 hover:text-primary-600 group">
                <FileSearch className="w-6 h-6 mb-2 text-gray-400 group-hover:text-primary-500" />
                <span className="text-xs font-semibold text-center">Optimize CV</span>
              </Link>
              <Link to="/interview" className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-gray-700 hover:text-primary-600 group">
                <Video className="w-6 h-6 mb-2 text-gray-400 group-hover:text-primary-500" />
                <span className="text-xs font-semibold text-center">Mock Interview</span>
              </Link>
              <Link to="/find-jobs" className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-gray-700 hover:text-primary-600 group">
                <Briefcase className="w-6 h-6 mb-2 text-gray-400 group-hover:text-primary-500" />
                <span className="text-xs font-semibold text-center">Browse Jobs</span>
              </Link>
              <Link to="/profile" className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-gray-700 hover:text-primary-600 group">
                <User className="w-6 h-6 mb-2 text-gray-400 group-hover:text-primary-500" />
                <span className="text-xs font-semibold text-center">Edit Profile</span>
              </Link>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-dark flex items-center gap-2">
                Notifications
                <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold">
                  {notifications.filter(n => !n.read).length}
                </span>
              </h2>
            </div>
            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {notifications.map((notif, idx) => (
                <div key={idx} className={`p-4 flex gap-3 ${!notif.read ? 'bg-blue-50/50' : 'bg-white'}`}>
                  <div className="mt-1">
                    {!notif.read ? (
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                    ) : (
                      <Bell className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm ${!notif.read ? 'text-dark font-medium' : 'text-gray-600'}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
