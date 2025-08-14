import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  industry: {
    type: String,
    required: true,
    trim: true
  },
  size: {
    type: String,
    enum: ['startup', 'small', 'medium', 'large', 'enterprise'],
    default: 'medium'
  },
  location: {
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    }
  },
  website: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  requiredSkills: [{
    skill: {
      type: String,
      required: true,
      trim: true
    },
    importance: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    }
  }],
  preferredSkills: [{
    type: String,
    trim: true
  }],
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'executive'],
    default: 'mid'
  },
  jobTitles: [{
    type: String,
    trim: true
  }],
  benefits: [{
    type: String,
    trim: true
  }],
  companyCulture: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
companySchema.index({ name: 1 });
companySchema.index({ industry: 1 });
companySchema.index({ 'requiredSkills.skill': 1 });
companySchema.index({ experienceLevel: 1 });
companySchema.index({ isActive: 1 });

// Method to calculate skill match percentage
companySchema.methods.calculateSkillMatch = function(userSkills) {
  if (!userSkills || userSkills.length === 0) return 0;
  
  const requiredSkills = this.requiredSkills.map(rs => rs.skill.toLowerCase());
  const userSkillsLower = userSkills.map(skill => skill.toLowerCase());
  
  const matchedSkills = requiredSkills.filter(skill => 
    userSkillsLower.some(userSkill => 
      userSkill.includes(skill) || skill.includes(userSkill)
    )
  );
  
  return Math.round((matchedSkills.length / requiredSkills.length) * 100);
};

// Method to get company summary
companySchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.name,
    industry: this.industry,
    size: this.size,
    location: this.location,
    experienceLevel: this.experienceLevel,
    rating: this.rating,
    reviewCount: this.reviewCount,
    requiredSkillsCount: this.requiredSkills.length
  };
};

export default mongoose.model('Company', companySchema);
