import express from 'express';
import { body, validationResult } from 'express-validator';
import path from 'path';
import fs from 'fs';
import Resume from '../models/Resume.js';
import { auth } from '../middleware/auth.js';
import { handleUpload } from '../middleware/upload.js';
import { analyzeResume, generateInterviewQuestions,extractResumeText } from '../utils/openai.js';

const router = express.Router();

// @route   POST /api/resume/upload
// @desc    Upload and analyze resume
// @access  Private
router.post('/upload', auth, handleUpload, async (req, res) => {
  try {
    const { jobDescription } = req.body;
    console.log(req.file.path)
    // Create resume record
    const resume = new Resume({
      user: req.user._id,
      originalFileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      fileType: path.extname(req.file.originalname).toLowerCase().substring(1)
    });

    await resume.save();

    console.log(jobDescription);
    
console.log(resume.filePath);
    // Analyze resume with AI (simplified for demo)
    try {
      
      const resumeText = await extractResumeText(resume.filePath);
      console.log(resumeText);
      const analysis = await analyzeResume(resumeText, jobDescription);
      
      // Update resume with analysis results
      resume.analysis = analysis;
      resume.isAnalyzed = true;
      resume.analysisDate = new Date();
      
      // Generate interview questions if job description provided
      if (jobDescription) {
        const questionsData = await generateInterviewQuestions(resumeText, jobDescription);
        resume.interviewQuestions = questionsData.questions || [];
      }
      
      await resume.save();
    } catch (aiError) {
      console.error('AI analysis error:', aiError);
      // Continue without AI analysis - resume is still saved
    }

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully',
      resume: resume.getSummary()
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during resume upload'
    });
  }
});

// @route   POST /api/resume/analyze
// @desc    Analyze existing resume with job description
// @access  Private
router.post('/analyze', [
  auth,
  body('resumeId')
    .isMongoId()
    .withMessage('Valid resume ID is required'),
  body('jobDescription')
    .notEmpty()
    .withMessage('Job description is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { resumeId, jobDescription } = req.body;

    // Find resume and verify ownership
    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Analyze resume with AI
    const resumeText = "Sample resume text - extracted from file";
    const analysis = await analyzeResume(resumeText, jobDescription);
    
    // Generate interview questions
    const questionsData = await generateInterviewQuestions(resumeText, jobDescription);
    
    // Update resume with new analysis
    resume.analysis = analysis;
    resume.interviewQuestions = questionsData.questions || [];
    resume.isAnalyzed = true;
    resume.analysisDate = new Date();
    
    await resume.save();

    res.json({
      success: true,
      message: 'Resume analyzed successfully',
      analysis: resume.analysis,
      interviewQuestions: resume.interviewQuestions
    });
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during resume analysis'
    });
  }
});

// @route   GET /api/resume/history
// @desc    Get user's resume history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'uploadDate', sortOrder = 'desc' } = req.query;
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const resumes = await Resume.find({ user: req.user._id, isActive: true })
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-filePath');
    
    const total = await Resume.countDocuments({ user: req.user._id, isActive: true });
    
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.json({
      success: true,
      resumes: resumes.map(resume => resume.getSummary()),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalResumes: total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get resume history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching resume history'
    });
  }
});

// @route   GET /api/resume/:id
// @desc    Get specific resume details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ 
      _id: req.params.id, 
      user: req.user._id,
      isActive: true 
    });
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    res.json({
      success: true,
      resume: {
        ...resume.toObject(),
        filePath: undefined // Don't send file path for security
      }
    });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching resume'
    });
  }
});

// @route   DELETE /api/resume/:id
// @desc    Delete resume
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }

    // Soft delete - mark as inactive
    resume.isActive = false;
    await resume.save();

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting resume'
    });
  }
});

// @route   GET /api/resume/:id/download
// @desc    Download resume file
// @access  Private
router.get('/:id/download', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ 
      _id: req.params.id, 
      user: req.user._id,
      isActive: true 
    });
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    if (!fs.existsSync(resume.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Resume file not found'
      });
    }

    res.download(resume.filePath, resume.originalFileName);
  } catch (error) {
    console.error('Download resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while downloading resume'
    });
  }
});

export default router;
