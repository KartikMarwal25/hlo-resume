import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Building, 
  MapPin, 
  Users, 
  Star, 
  Target,
  Search,
  Filter,
  TrendingUp,
  Globe,
  Briefcase
} from 'lucide-react';

const CompanyRecommendations = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [industries, setIndustries] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [formData, setFormData] = useState({
    skills: user?.skills || [],
    experienceLevel: user?.experience || 'mid',
    industry: user?.industry || ''
  });

  useEffect(() => {
    fetchIndustries();
  }, []);

  const fetchIndustries = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/company/industries`);
      setIndustries(response.data.industries);
    } catch (error) {
      console.error('Error fetching industries:', error);
    }
  };

  const handleSkillChange = (index, value) => {
    const newSkills = [...formData.skills];
    newSkills[index] = value;
    setFormData({ ...formData, skills: newSkills });
  };

  const addSkill = () => {
    setFormData({
      ...formData,
      skills: [...formData.skills, '']
    });
  };

  const removeSkill = (index) => {
    const newSkills = formData.skills.filter((_, i) => i !== index);
    setFormData({ ...formData, skills: newSkills });
  };

  const generateRecommendations = async () => {
    if (formData.skills.filter(skill => skill.trim()).length === 0) {
      toast.error('Please add at least one skill');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/company/match`, {
        skills: formData.skills.filter(skill => skill.trim()),
        experienceLevel: formData.experienceLevel,
        industry: formData.industry
      });

      setCompanies(response.data.companies);
      setShowForm(false);
      toast.success('Company recommendations generated successfully!');
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error('Failed to generate company recommendations');
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = !industryFilter || company.industry === industryFilter;
    const matchesSize = !sizeFilter || company.size === sizeFilter;
    const matchesExperience = !experienceFilter || company.experienceLevel === experienceFilter;
    
    return matchesSearch && matchesIndustry && matchesSize && matchesExperience;
  });

  const getSizeLabel = (size) => {
    switch (size) {
      case 'startup': return 'Startup';
      case 'small': return 'Small (1-50)';
      case 'medium': return 'Medium (51-200)';
      case 'large': return 'Large (201-1000)';
      case 'enterprise': return 'Enterprise (1000+)';
      default: return size;
    }
  };

  const getExperienceLabel = (level) => {
    switch (level) {
      case 'entry': return 'Entry Level';
      case 'mid': return 'Mid Level';
      case 'senior': return 'Senior Level';
      case 'executive': return 'Executive';
      default: return level;
    }
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'text-success-600';
    if (percentage >= 60) return 'text-warning-600';
    return 'text-error-600';
  };

  const getMatchBgColor = (percentage) => {
    if (percentage >= 80) return 'bg-success-100 border-success-300';
    if (percentage >= 60) return 'bg-warning-100 border-warning-300';
    return 'bg-error-100 border-error-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Recommendations</h1>
        <p className="text-gray-600">Find companies that match your skills and experience</p>
      </div>

      {/* Recommendation Form */}
      {showForm && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Generate Recommendations</h2>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Skills
              </label>
              <div className="space-y-2">
                {formData.skills.map((skill, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleSkillChange(index, e.target.value)}
                      placeholder="Enter a skill (e.g., JavaScript, Project Management)"
                      className="input flex-1"
                    />
                    <button
                      onClick={() => removeSkill(index)}
                      className="btn-error px-3"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={addSkill}
                  className="btn-secondary"
                >
                  + Add Skill
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                  className="input"
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Industry (Optional)
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="input"
                >
                  <option value="">Any Industry</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={generateRecommendations}
              disabled={loading || formData.skills.filter(skill => skill.trim()).length === 0}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="spinner w-4 h-4 mr-2"></div>
                  Generating Recommendations...
                </div>
              ) : (
                <div className="flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Generate Recommendations
                </div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {companies.length > 0 && (
        <>
          {/* Filters */}
          <div className="card">
            <div className="card-body">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search companies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={industryFilter}
                    onChange={(e) => setIndustryFilter(e.target.value)}
                    className="input text-sm"
                  >
                    <option value="">All Industries</option>
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                  <select
                    value={sizeFilter}
                    onChange={(e) => setSizeFilter(e.target.value)}
                    className="input text-sm"
                  >
                    <option value="">All Sizes</option>
                    <option value="startup">Startup</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                  <select
                    value={experienceFilter}
                    onChange={(e) => setExperienceFilter(e.target.value)}
                    className="input text-sm"
                  >
                    <option value="">All Levels</option>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Companies List */}
          <div className="card">
            <div className="card-header">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recommended Companies ({filteredCompanies.length})
                </h2>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-secondary"
                >
                  Generate New Recommendations
                </button>
              </div>
            </div>
            <div className="card-body">
              {filteredCompanies.length === 0 ? (
                <div className="text-center py-8">
                  <Building className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No companies found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your filters or generate new recommendations.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCompanies.map((company, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{company.name}</h3>
                          <p className="text-sm text-gray-600">{company.industry}</p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchBgColor(company.matchPercentage)}`}>
                          <span className={getMatchColor(company.matchPercentage)}>
                            {company.matchPercentage}% Match
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>
                            {company.location?.city}, {company.location?.state}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          <span>{getSizeLabel(company.size)}</span>
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-2" />
                          <span>{getExperienceLabel(company.experienceLevel)}</span>
                        </div>
                        {company.rating > 0 && (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 mr-2 text-yellow-500" />
                            <span>{company.rating}/5 ({company.reviewCount} reviews)</span>
                          </div>
                        )}
                      </div>
                      
                      {company.description && (
                        <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                          {company.description}
                        </p>
                      )}
                      
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {company.requiredSkillsCount} required skills
                          </span>
                          <button className="text-sm text-primary-600 hover:text-primary-500 font-medium">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Tips Section */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Tips for Company Research</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Before Applying</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Research the company's mission and values</li>
                <li>• Check recent news and company updates</li>
                <li>• Review employee reviews on Glassdoor</li>
                <li>• Understand the company culture</li>
                <li>• Network with current employees</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-3">During Application</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Tailor your resume to the specific role</li>
                <li>• Highlight relevant skills and experience</li>
                <li>• Write a compelling cover letter</li>
                <li>• Follow up after submitting your application</li>
                <li>• Prepare for company-specific questions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyRecommendations;
