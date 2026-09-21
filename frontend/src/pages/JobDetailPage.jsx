import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, MapPin, CheckCircle2, Star, Clock, Briefcase, DollarSign, Calendar, ChevronRight, Share2, Flag, AlertCircle } from 'lucide-react';
import { jobs } from '../data/mockData';

const JobDetailPage = () => {
  const { id } = useParams();
  
  // Find the job or use a default one for demo purposes if not found in mock data
  const job = jobs.find(j => j.id === id) || jobs[0];

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Job not found</h1>
          <p className="text-gray-500 mb-6">The job you are looking for does not exist or has been removed.</p>
          <Link to="/find-jobs" className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const similarJobs = jobs.filter(j => j.category === job.category && j.id !== job.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex text-sm text-gray-500 mb-6 mt-4">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link to="/find-jobs" className="hover:text-primary-600">Find Jobs</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900 truncate max-w-[200px] sm:max-w-xs">{job.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content (Left) */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              
              <div className="p-6 md:p-8 border-b border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                    {job.title}
                  </h1>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 gap-4 mb-6">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> Posted {job.postedAt}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {job.location}
                  </span>
                </div>
                
                <div className="border-t border-b border-gray-100 py-6 my-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <div className="flex items-center text-gray-500 mb-1">
                      <Briefcase className="w-4 h-4 mr-2" />
                      <span className="text-sm">Experience</span>
                    </div>
                    <p className="font-semibold text-gray-900">{job.experienceLevel}</p>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-500 mb-1">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span className="text-sm">Budget ({job.budgetType})</span>
                    </div>
                    <p className="font-semibold text-gray-900">${job.budget}</p>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-500 mb-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm">Duration</span>
                    </div>
                    <p className="font-semibold text-gray-900">{job.duration}</p>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-500 mb-1">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm">Category</span>
                    </div>
                    <p className="font-semibold text-gray-900">{job.category}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Job Description</h2>
                  <div className="text-gray-700 space-y-4 whitespace-pre-line leading-relaxed">
                    {job.description || "This is a detailed job description that outlines the responsibilities, requirements, and expectations for the role. The ideal candidate will have strong experience in the required skills and be able to deliver high-quality results within the specified timeframe.\n\nKey responsibilities include:\n- Developing and maintaining core features\n- Collaborating with the design team\n- Ensuring code quality and performance\n\nPlease include examples of previous work in your proposal."}
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Skills Required</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, idx) => (
                      <span key={idx} className="bg-primary-50 text-primary-700 px-4 py-2 rounded-lg text-sm font-medium border border-primary-100 hover:bg-primary-100 transition-colors cursor-default">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Activity on this job</h2>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-center justify-between py-2 border-b border-gray-50">
                      <span>Proposals:</span>
                      <span className="font-medium text-gray-900">{job.proposals || '10 to 15'}</span>
                    </li>
                    <li className="flex items-center justify-between py-2 border-b border-gray-50">
                      <span>Last viewed by client:</span>
                      <span className="font-medium text-gray-900">2 hours ago</span>
                    </li>
                    <li className="flex items-center justify-between py-2">
                      <span>Interviewing:</span>
                      <span className="font-medium text-gray-900">2</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Similar Jobs */}
            {similarJobs.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Similar Jobs</h2>
                <div className="space-y-4">
                  {similarJobs.map(sj => (
                    <div key={sj.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <Link to={`/job/${sj.id}`} className="font-bold text-lg text-gray-900 hover:text-primary-600">
                          {sj.title}
                        </Link>
                        <span className="font-semibold text-gray-900">${sj.budget}</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{sj.budgetType} • {sj.experienceLevel}</p>
                      <div className="flex gap-2">
                        {sj.skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                        {sj.skills.length > 3 && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                            +{sj.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar (Right) */}
          <div className="lg:w-80 flex-shrink-0 space-y-6">
            
            {/* Actions Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <button className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-bold transition-colors mb-3">
                Submit Proposal
              </button>
              <button className="w-full bg-white border-2 border-primary-500 text-primary-600 hover:bg-primary-50 py-3 rounded-lg font-bold transition-colors mb-6 flex items-center justify-center gap-2">
                <Heart className="w-5 h-5" /> Save Job
              </button>

              <div className="flex items-center justify-center gap-4 text-sm font-medium text-primary-600 border-t border-gray-100 pt-6">
                <button className="flex items-center gap-1 hover:text-primary-700">
                  <Flag className="w-4 h-4" /> Flag as inappropriate
                </button>
              </div>
            </div>

            {/* AI Match Card */}
            {job.matchScore && (
              <div className="bg-[#f0f9f0] rounded-xl shadow-sm border border-primary-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded">AI</span>
                  Skill Match
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full border-4 border-primary-500 flex items-center justify-center bg-white shadow-sm">
                    <span className="text-xl font-bold text-primary-600">{job.matchScore}%</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Your profile matches <strong className="text-primary-700">{job.matchScore}%</strong> of the required skills.
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2 text-green-700">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Matches: {job.skills[0]}, {job.skills[1]}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Client Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">About the client</h3>
              
              <div className="mb-4">
                <p className="font-semibold text-gray-900">{job.company}</p>
                <div className="flex items-center gap-2 mt-1">
                  {job.clientVerified ? (
                    <span className="flex items-center text-primary-600 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Payment verified
                    </span>
                  ) : (
                    <span className="text-gray-500 text-sm">Payment unverified</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 mb-4 text-sm">
                <div className="flex text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <span className="font-medium text-gray-900">{job.clientRating}</span>
                <span className="text-gray-500">(12 reviews)</span>
              </div>

              <div className="space-y-3 text-sm text-gray-600 border-t border-gray-100 pt-4">
                <div>
                  <p className="font-semibold text-gray-900">{job.location}</p>
                  <p className="text-xs">Location</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">15 Jobs posted</p>
                  <p className="text-xs">80% hire rate, 1 open job</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">$10k+ total spent</p>
                  <p className="text-xs">36 hires, 12 active</p>
                </div>
                <div>
                  <p className="text-xs mt-4">Member since Aug 2, 2021</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
