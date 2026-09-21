import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, SlidersHorizontal, Heart, CheckCircle2, Star, Clock, Briefcase, ChevronDown, X } from 'lucide-react';
import { jobs, filterOptions } from '../data/mockData';

const FindJobsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortOption, setSortOption] = useState('relevance');

  // Filter states
  const [filters, setFilters] = useState({
    category: '',
    experienceLevel: '',
    budgetRange: '',
    duration: '',
    location: ''
  });

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType] === value ? '' : value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      experienceLevel: '',
      budgetRange: '',
      duration: '',
      location: ''
    });
    setSearchQuery('');
    setSearchLocation('');
  };

  // Filter logic
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Search
      if (searchQuery && !job.title.toLowerCase().includes(searchQuery.toLowerCase()) && !job.company.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filters
      if (filters.category && job.category !== filters.category) return false;
      if (filters.experienceLevel && job.experienceLevel !== filters.experienceLevel) return false;
      if (filters.budgetRange && job.budgetRange !== filters.budgetRange) return false;
      if (filters.duration && job.duration !== filters.duration) return false;
      if (filters.location && job.location !== filters.location) return false;

      return true;
    }).sort((a, b) => {
      if (sortOption === 'newest') return new Date(b.postedAt) - new Date(a.postedAt);
      if (sortOption === 'budget-high') return b.budget - a.budget;
      if (sortOption === 'budget-low') return a.budget - b.budget;
      return 0; // relevance (default)
    });
  }, [jobs, filters, searchQuery, sortOption]);

  const FilterSection = ({ title, options, filterKey }) => (
    <div className="mb-6">
      <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2">
        {options.map((option, idx) => (
          <label key={idx} className="flex items-center cursor-pointer group">
            <input
              type="radio"
              name={filterKey}
              value={option}
              checked={filters[filterKey] === option}
              onChange={() => handleFilterChange(filterKey, option)}
              className="w-4 h-4 text-primary-500 border-gray-300 focus:ring-primary-500 cursor-pointer"
            />
            <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
              {option}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Search Bar Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for jobs, skills, or companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="md:w-64 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Location"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <button className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-2.5 rounded-lg font-medium transition-colors">
              Search
            </button>
            <button 
              className="md:hidden flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <div className={`lg:w-64 flex-shrink-0 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                <button 
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear All
                </button>
              </div>

              <FilterSection title="Category" options={filterOptions.categories} filterKey="category" />
              <FilterSection title="Experience Level" options={filterOptions.experienceLevels} filterKey="experienceLevel" />
              <FilterSection title="Duration" options={filterOptions.durations} filterKey="duration" />
              <FilterSection title="Budget Range" options={filterOptions.budgetRanges} filterKey="budgetRange" />
              <FilterSection title="Location" options={filterOptions.locations} filterKey="location" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
              <h1 className="text-xl font-bold text-gray-900 mb-4 sm:mb-0">
                Showing {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
              </h1>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <div className="relative">
                  <select 
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="newest">Newest</option>
                    <option value="budget-high">Budget: High to Low</option>
                    <option value="budget-low">Budget: Low to High</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Job List */}
            <div className="space-y-4">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <div key={job.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <Link to={`/job/${job.id}`}>
                          <h2 className="text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors mb-1">
                            {job.title}
                          </h2>
                        </Link>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium text-gray-800">{job.company}</span>
                          {job.clientVerified && (
                            <span className="flex items-center text-primary-600">
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Verified
                            </span>
                          )}
                          <span>•</span>
                          <span className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                            {job.clientRating}
                          </span>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-primary-500 transition-colors p-2 rounded-full hover:bg-gray-50">
                        <Heart className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm bg-gray-50 rounded-lg p-3">
                      <div>
                        <span className="block text-gray-500 mb-1">Budget</span>
                        <span className="font-semibold text-gray-900">{job.budgetType === 'Hourly' ? `$${job.budget}/hr` : `$${job.budget}`}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 mb-1">Experience</span>
                        <span className="font-semibold text-gray-900">{job.experienceLevel}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 mb-1">Duration</span>
                        <span className="font-semibold text-gray-900">{job.duration}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 mb-1">Location</span>
                        <span className="font-semibold text-gray-900">{job.location}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skills.map((skill, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" /> Posted {job.postedAt}
                        </span>
                        <span>•</span>
                        <span>{job.proposals} proposals</span>
                      </div>
                      {job.matchScore && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500">Match Score</span>
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold">
                            {job.matchScore}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
                  <button onClick={clearFilters} className="text-primary-600 hover:text-primary-700 font-medium">
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindJobsPage;
