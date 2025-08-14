import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FileText, 
  Download, 
  Trash2, 
  BarChart3, 
  Calendar,
  Search,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';

const ResumeHistory = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('uploadDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedResume, setSelectedResume] = useState(null);

  useEffect(() => {
    fetchResumes();
  }, [currentPage, sortBy, sortOrder]);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/resume/history?page=${currentPage}&sortBy=${sortBy}&sortOrder=${sortOrder}&limit=10`);
      setResumes(response.data.resumes);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast.error('Failed to load resume history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      await axios.delete(`/api/resume/${resumeId}`);
      toast.success('Resume deleted successfully');
      fetchResumes();
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume');
    }
  };

  const handleDownload = async (resumeId, fileName) => {
    try {
      const response = await axios.get(`/api/resume/${resumeId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Download started');
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error('Failed to download resume');
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

  const filteredResumes = resumes.filter(resume =>
    resume.originalFileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <SortAsc className="h-4 w-4" />;
    return sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resume History</h1>
          <p className="text-gray-600">View and manage all your uploaded resumes</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search resumes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleSort('uploadDate')}
                className="btn-secondary flex items-center"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Date
                <SortIcon field="uploadDate" />
              </button>
              <button
                onClick={() => handleSort('atsScore')}
                className="btn-secondary flex items-center"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Score
                <SortIcon field="atsScore" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resumes List */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="spinner w-8 h-8"></div>
            </div>
          ) : filteredResumes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No resumes found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search terms.' : 'Upload your first resume to get started.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResumes.map((resume) => (
                <div key={resume.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${getScoreBgColor(resume.atsScore)}`}>
                        <FileText className={`h-6 w-6 ${getScoreColor(resume.atsScore)}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{resume.originalFileName}</h3>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(resume.uploadDate).toLocaleDateString()}
                          </span>
                          <span>{resume.fileSize}</span>
                          <span>{resume.fileType.toUpperCase()}</span>
                          {resume.isAnalyzed && (
                            <span className="text-success-600 font-medium">Analyzed</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getScoreColor(resume.atsScore)}`}>
                          {resume.atsScore}%
                        </div>
                        <div className="text-xs text-gray-500">ATS Score</div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDownload(resume.id, resume.originalFileName)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setSelectedResume(resume)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                          title="View Details"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(resume.id)}
                          className="p-2 text-gray-400 hover:text-error-600 hover:bg-error-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === page
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Resume Details Modal */}
      {selectedResume && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">Resume Analysis</h2>
              <button
                onClick={() => setSelectedResume(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">File Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">File Name:</span>
                    <p className="font-medium">{selectedResume.originalFileName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">File Size:</span>
                    <p className="font-medium">{selectedResume.fileSize}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">File Type:</span>
                    <p className="font-medium">{selectedResume.fileType.toUpperCase()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Upload Date:</span>
                    <p className="font-medium">{new Date(selectedResume.uploadDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {selectedResume.analysis && (
                <>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">ATS Analysis</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">ATS Score</span>
                        <span className={`text-lg font-bold ${getScoreColor(selectedResume.analysis.atsScore)}`}>
                          {selectedResume.analysis.atsScore}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-bar-fill" 
                          style={{ width: `${selectedResume.analysis.atsScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {selectedResume.analysis.extractedSkills && selectedResume.analysis.extractedSkills.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Extracted Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedResume.analysis.extractedSkills.map((skill, index) => (
                          <span key={index} className="badge-primary">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedResume.analysis.recommendations && selectedResume.analysis.recommendations.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Recommendations</h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {selectedResume.analysis.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeHistory;
