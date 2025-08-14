import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['pdf', 'docx', 'doc']
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  analysis: {
    atsScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    extractedSkills: [{
      type: String,
      trim: true
    }],
    experience: {
      type: String,
      trim: true
    },
    education: {
      type: String,
      trim: true
    },
    summary: {
      type: String,
      trim: true
    },
    recommendations: [{
      type: String,
      trim: true
    }],
    keywords: [{
      type: String,
      trim: true
    }],
    missingKeywords: [{
      type: String,
      trim: true
    }]
  },
  interviewQuestions: [{
    question: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['technical', 'behavioral', 'situational', 'company'],
      default: 'behavioral'
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    }
  }],
  isAnalyzed: {
    type: Boolean,
    default: false
  },
  analysisDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
resumeSchema.index({ user: 1, uploadDate: -1 });
resumeSchema.index({ 'analysis.atsScore': -1 });
resumeSchema.index({ isAnalyzed: 1 });

// Virtual for formatted file size
resumeSchema.virtual('formattedFileSize').get(function() {
  const bytes = this.fileSize;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Method to get resume summary
resumeSchema.methods.getSummary = function() {
  return {
    id: this._id,
    originalFileName: this.originalFileName,
    uploadDate: this.uploadDate,
    atsScore: this.analysis.atsScore,
    isAnalyzed: this.isAnalyzed,
    fileSize: this.formattedFileSize,
    fileType: this.fileType
  };
};

// Ensure virtuals are serialized
resumeSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Resume', resumeSchema);
