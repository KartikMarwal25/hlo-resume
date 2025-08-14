import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Upload, 
  FileText, 
  BarChart3, 
  MessageSquare, 
  Building, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Trash2
  //eslint-disable-next-line
} from 'lucide-react';
 

const Dashboard = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await axios.get(`/api/resume/history?limit=5`);
      setResumes(response.data.resumes);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast.error('Failed to load resume history');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }
      if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'].includes(file.type)) {
        toast.error('Please select a PDF, DOCX, or DOC file');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('resume', selectedFile);
    if (jobDescription) {
      formData.append('jobDescription', jobDescription);
    }

    try {
      const response = await axios.post('/api/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Resume uploaded successfully!');
      setSelectedFile(null);
      setJobDescription('');
      document.getElementById('file-input').value = '';
      fetchResumes();
    } catch (error) {
      const message = error.response?.data?.message || 'Upload failed';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success-600';
    if (score >= 60) return 'text-warning-600';
    return 'text-error-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-success-100 border-success-300';
    if (score >= 60) return 'bg-warning-100 border-warning-300';
    return 'bg-error-100 border-error-300';
  };

  const stats = [
    {
      title: 'Total Resumes',
      value: resumes.length,
      icon: FileText,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100'
    },
    {
      title: 'Average ATS Score',
      value: resumes.length > 0 
        ? Math.round(resumes.reduce((acc, resume) => acc + resume.atsScore, 0) / resumes.length)
        : 0,
      icon: BarChart3,
      color: 'text-success-600',
      bgColor: 'bg-success-100'
    },
    {
      title: 'Analyzed Resumes',
      value: resumes.filter(r => r.isAnalyzed).length,
      icon: CheckCircle,
      color: 'text-success-600',
      bgColor: 'bg-success-100'
    }
  ];

  const quickActions = [
    {
      title: 'Upload Resume',
      description: 'Upload and analyze a new resume',
      icon: Upload,
      href: '#upload-section',
      color: 'text-primary-600',
      bgColor: 'bg-primary-100'
    },
    {
      title: 'Interview Prep',
      description: 'Get personalized interview questions',
      icon: MessageSquare,
      href: '/interview-prep',
      color: 'text-warning-600',
      bgColor: 'bg-warning-100'
    },
    {
      title: 'Company Match',
      description: 'Find matching companies',
      icon: Building,
      href: '/company-recommendations',
      color: 'text-success-600',
      bgColor: 'bg-success-100'
    },
    {
      title: 'Resume History',
      description: 'View all your resumes',
      icon: FileText,
      href: '/resume-history',
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-primary-100">
          Ready to optimize your resume and boost your job search? Let's get started.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${action.bgColor}`}>
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">{action.title}</h3>
                    <p className="text-xs text-gray-500">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div id="upload-section" className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Upload Resume</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Resume File
              </label>
              <input
                id="file-input"
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleFileSelect}
                className="input"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Supported formats: PDF, DOCX, DOC (Max size: 2MB)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description (Optional)
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description to get tailored analysis and interview questions..."
                className="input h-24 resize-none"
                rows={3}
              />
            </div>

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <div className="flex items-center">
                  <div className="spinner w-4 h-4 mr-2"></div>
                  Uploading...
                </div>
              ) : (
                <div className="flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload & Analyze
                </div>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Recent Resumes */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Resumes</h2>
            <Link to="/resume-history" className="text-sm text-primary-600 hover:text-primary-500">
              View All
            </Link>
          </div>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="spinner w-8 h-8"></div>
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No resumes yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload your first resume to get started with AI analysis.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {resumes.map((resume) => (
                <div key={resume.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${getScoreBgColor(resume.atsScore)}`}>
                      <FileText className={`h-5 w-5 ${getScoreColor(resume.atsScore)}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{resume.originalFileName}</h3>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{resume.fileSize}</span>
                        <span>{resume.fileType.toUpperCase()}</span>
                        <span>{new Date(resume.uploadDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${getScoreColor(resume.atsScore)}`}>
                        {resume.atsScore}%
                      </div>
                      <div className="text-xs text-gray-500">ATS Score</div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => window.open(`/api/resume/${resume.id}/download`, '_blank')}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <Link
                        to={`/resume-history`}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="View Details"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
