import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  MessageSquare, 
  FileText, 
  Clock, 
  Target,
  Filter,
  BookOpen,
  Play,
  Pause
} from 'lucide-react';

const InterviewPrep = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState('all');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await axios.get('/api/resume/history');
      setResumes(response.data.resumes);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast.error('Failed to load resumes');
    }
  };

  const generateQuestions = async () => {
    if (!selectedResume || !jobDescription.trim()) {
      toast.error('Please select a resume and enter a job description');
      return;
    }

    setGenerating(true);
    try {
      const response = await axios.post('/api/resume/analyze', {
        resumeId: selectedResume,
        jobDescription: jobDescription
      });

      setQuestions(response.data.interviewQuestions || []);
      toast.success('Interview questions generated successfully!');
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error('Failed to generate interview questions');
    } finally {
      setGenerating(false);
    }
  };

  const filteredQuestions = questions.filter(q => {
    if (filter === 'all') return true;
    return q.category === filter;
  });

  const getCategoryColor = (category) => {
    switch (category) {
      case 'technical': return 'bg-blue-100 text-blue-800';
      case 'behavioral': return 'bg-green-100 text-green-800';
      case 'situational': return 'bg-purple-100 text-purple-800';
      case 'company': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const startPractice = () => {
    if (filteredQuestions.length === 0) {
      toast.error('No questions available for practice');
      return;
    }
    setCurrentQuestion(0);
    setIsPlaying(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < filteredQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsPlaying(false);
      toast.success('Practice session completed!');
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Interview Preparation</h1>
        <p className="text-gray-600">Get AI-generated interview questions based on your resume and job descriptions</p>
      </div>

      {/* Question Generator */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Generate Interview Questions</h2>
        </div>
        <div className="card-body space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Resume
              </label>
              <select
                value={selectedResume}
                onChange={(e) => setSelectedResume(e.target.value)}
                className="input"
              >
                <option value="">Choose a resume...</option>
                {resumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.originalFileName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="input h-20 resize-none"
                rows={3}
              />
            </div>
          </div>
          
          <button
            onClick={generateQuestions}
            disabled={generating || !selectedResume || !jobDescription.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <div className="flex items-center">
                <div className="spinner w-4 h-4 mr-2"></div>
                Generating Questions...
              </div>
            ) : (
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Generate Questions
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Questions Display */}
      {questions.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Interview Questions ({filteredQuestions.length})
              </h2>
              <div className="flex items-center space-x-4">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="input text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="technical">Technical</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="situational">Situational</option>
                  <option value="company">Company</option>
                </select>
                <button
                  onClick={startPractice}
                  className="btn-primary"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Practice
                </button>
              </div>
            </div>
          </div>
          <div className="card-body">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No questions found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your filter or generate new questions.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQuestions.map((question, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="badge-secondary">Q{index + 1}</span>
                          <span className={`badge ${getCategoryColor(question.category)}`}>
                            {question.category}
                          </span>
                          <span className={`text-sm font-medium ${getDifficultyColor(question.difficulty)}`}>
                            {question.difficulty}
                          </span>
                        </div>
                        <p className="text-gray-900">{question.question}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Practice Mode */}
      {isPlaying && filteredQuestions.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">Practice Mode</h2>
              <button
                onClick={() => setIsPlaying(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Question {currentQuestion + 1} of {filteredQuestions.length}</span>
                <div className="flex items-center space-x-2">
                  <span className={`badge ${getCategoryColor(filteredQuestions[currentQuestion]?.category)}`}>
                    {filteredQuestions[currentQuestion]?.category}
                  </span>
                  <span className={`font-medium ${getDifficultyColor(filteredQuestions[currentQuestion]?.difficulty)}`}>
                    {filteredQuestions[currentQuestion]?.difficulty}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {filteredQuestions[currentQuestion]?.question}
                </h3>
                
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Tips for answering:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Take a moment to think before responding</li>
                      <li>• Use the STAR method for behavioral questions</li>
                      <li>• Provide specific examples from your experience</li>
                      <li>• Keep your answer concise but comprehensive</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={previousQuestion}
                  disabled={currentQuestion === 0}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsPlaying(false)}
                    className="btn-secondary"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </button>
                  <button
                    onClick={nextQuestion}
                    className="btn-primary"
                  >
                    {currentQuestion === filteredQuestions.length - 1 ? 'Finish' : 'Next'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Interview Tips</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Before the Interview</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Research the company and role thoroughly</li>
                <li>• Review your resume and prepare to discuss your experience</li>
                <li>• Prepare questions to ask the interviewer</li>
                <li>• Practice common interview questions</li>
                <li>• Plan your outfit and route to the interview</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-3">During the Interview</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Use the STAR method for behavioral questions</li>
                <li>• Provide specific examples from your experience</li>
                <li>• Ask thoughtful questions about the role and company</li>
                <li>• Show enthusiasm and genuine interest</li>
                <li>• Follow up with a thank-you email</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPrep;
