import React, { useState } from 'react';
import { Info, Briefcase, DollarSign, Clock, MapPin, Tag, CheckCircle } from 'lucide-react';
import { filterOptions } from '../data/mockData';

const PostJobPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: filterOptions.categories[0],
    description: '',
    skills: '',
    budgetType: 'Fixed',
    budgetMin: '',
    budgetMax: '',
    duration: filterOptions.durations[0],
    experienceLevel: filterOptions.experienceLevels[0],
    location: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (e) => {
    setFormData(prev => ({ ...prev, skills: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Prevent default form submission, just a demo
    alert('Job posted successfully! (Demo only)');
  };

  const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
          <p className="text-gray-600 mt-2">Fill out the details below to find the perfect candidate.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Form (Left) */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
              
              {/* Basic Details */}
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Basic Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                    <input 
                      type="text" 
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. Senior React Developer needed for FinTech dashboard"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select 
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white"
                    >
                      {filterOptions.categories.map((cat, i) => (
                        <option key={i} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea 
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="6"
                      placeholder="Describe the project, scope of work, and specific requirements..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-y"
                      required
                    ></textarea>
                  </div>
                </div>
              </section>

              {/* Skills */}
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Skills & Expertise</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      name="skills"
                      value={formData.skills}
                      onChange={handleSkillsChange}
                      placeholder="e.g. React, Node.js, TypeScript (comma separated)"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  {skillsArray.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {skillsArray.map((skill, i) => (
                        <span key={i} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium border border-primary-100">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Budget & Scope */}
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Budget & Scope</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget Type</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="budgetType" 
                          value="Fixed" 
                          checked={formData.budgetType === 'Fixed'}
                          onChange={handleChange}
                          className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-gray-700">Fixed Price</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="budgetType" 
                          value="Hourly" 
                          checked={formData.budgetType === 'Hourly'}
                          onChange={handleChange}
                          className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-gray-700">Hourly Rate</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {formData.budgetType === 'Fixed' ? 'Budget ($)' : 'Min Rate ($/hr)'}
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                          type="number" 
                          name="budgetMin"
                          value={formData.budgetMin}
                          onChange={handleChange}
                          placeholder="e.g. 500"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                    </div>
                    {formData.budgetType === 'Hourly' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Rate ($/hr)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                            type="number" 
                            name="budgetMax"
                            value={formData.budgetMax}
                            onChange={handleChange}
                            placeholder="e.g. 100"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                      <select 
                        name="experienceLevel"
                        value={formData.experienceLevel}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white"
                      >
                        {filterOptions.experienceLevels.map((lvl, i) => (
                          <option key={i} value={lvl}>{lvl}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                      <select 
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white"
                      >
                        {filterOptions.durations.map((dur, i) => (
                          <option key={i} value={dur}>{dur}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location Preference</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g. Remote, Vietnam, US only"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
                <button type="button" className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-8 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-bold transition-colors shadow-sm">
                  Post Job Now
                </button>
              </div>
            </form>
          </div>

          {/* Preview Panel (Right) */}
          <div className="lg:w-[400px] flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center gap-2">
                <Info className="w-5 h-5 text-gray-500" />
                <h3 className="font-bold text-gray-900">Job Preview</h3>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-2 break-words">
                  {formData.title || 'Your Job Title Will Appear Here'}
                </h4>
                
                <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-gray-600 mb-4">
                  {formData.category && <span>{formData.category}</span>}
                  {formData.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {formData.location}
                    </span>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <span className="block text-gray-500 text-xs">Budget</span>
                    <span className="font-semibold text-gray-900">
                      {formData.budgetType === 'Fixed' 
                        ? (formData.budgetMin ? `$${formData.budgetMin}` : 'TBD')
                        : (formData.budgetMin ? `$${formData.budgetMin}/hr` + (formData.budgetMax ? ` - $${formData.budgetMax}/hr` : '') : 'TBD')}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-500 text-xs">Experience</span>
                    <span className="font-semibold text-gray-900">{formData.experienceLevel}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 text-xs">Duration</span>
                    <span className="font-semibold text-gray-900">{formData.duration}</span>
                  </div>
                </div>

                <div className="text-gray-700 text-sm mb-4 line-clamp-4 break-words whitespace-pre-line">
                  {formData.description || 'Your job description will appear here...'}
                </div>

                <div className="flex flex-wrap gap-2">
                  {skillsArray.length > 0 ? (
                    skillsArray.map((skill, i) => (
                      <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm italic">No skills added yet</span>
                  )}
                </div>
              </div>
              <div className="bg-green-50 p-4 border-t border-green-100 text-sm text-green-800 flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p>This is how freelancers will see your job posting when they search for jobs.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PostJobPage;
