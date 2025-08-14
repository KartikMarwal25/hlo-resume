import express from 'express';
import { body, validationResult } from 'express-validator';
import Company from '../models/Company.js';
import { auth } from '../middleware/auth.js';
import { generateCompanyRecommendations } from '../utils/openai.js';

const router = express.Router();

// @route   POST /api/company/match
// @desc    Get company recommendations based on user skills
// @access  Private
router.post('/match', [
  auth,
  body('skills')
    .isArray({ min: 1 })
    .withMessage('At least one skill is required'),
  body('experienceLevel')
    .optional()
    .isIn(['entry', 'mid', 'senior', 'executive'])
    .withMessage('Invalid experience level'),
  body('industry')
    .optional()
    .trim()
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

    const { skills, experienceLevel = 'mid', industry } = req.body;

    // Get AI-generated company recommendations
    const recommendations = await generateCompanyRecommendations(skills, experienceLevel, industry);
    
    // Process and save companies to database
    const companies = [];
    for (const companyData of recommendations.companies) {
      try {
        // Check if company already exists
        let company = await Company.findOne({ name: companyData.name });
        
        if (!company) {
          // Create new company
          company = new Company(companyData);
          await company.save();
        }
        
        // Calculate match percentage
        const matchPercentage = company.calculateSkillMatch(skills);
        
        companies.push({
          ...company.getSummary(),
          matchPercentage
        });
      } catch (error) {
        console.error('Error processing company:', error);
        // Continue with other companies
      }
    }

    // Sort by match percentage
    companies.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json({
      success: true,
      companies,
      totalCompanies: companies.length
    });
  } catch (error) {
    console.error('Company matching error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during company matching'
    });
  }
});

// @route   GET /api/company/search
// @desc    Search companies by various criteria
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { 
      industry, 
      location, 
      size, 
      experienceLevel,
      skills,
      page = 1, 
      limit = 10 
    } = req.query;

    // Build search query
    const query = { isActive: true };
    
    if (industry) {
      query.industry = { $regex: industry, $options: 'i' };
    }
    
    if (location) {
      query['location.city'] = { $regex: location, $options: 'i' };
    }
    
    if (size) {
      query.size = size;
    }
    
    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }
    
    if (skills) {
      const skillArray = skills.split(',').map(skill => skill.trim());
      query['requiredSkills.skill'] = { $in: skillArray.map(skill => new RegExp(skill, 'i')) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const companies = await Company.find(query)
      .sort({ rating: -1, name: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Company.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      companies: companies.map(company => company.getSummary()),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCompanies: total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Company search error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during company search'
    });
  }
});

// @route   GET /api/company/:id
// @desc    Get specific company details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const company = await Company.findOne({ 
      _id: req.params.id, 
      isActive: true 
    });
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.json({
      success: true,
      company
    });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching company'
    });
  }
});

// @route   GET /api/company/industries
// @desc    Get list of available industries
// @access  Private
router.get('/industries', auth, async (req, res) => {
  try {
    const industries = await Company.distinct('industry', { isActive: true });
    
    res.json({
      success: true,
      industries: industries.sort()
    });
  } catch (error) {
    console.error('Get industries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching industries'
    });
  }
});

// @route   GET /api/company/locations
// @desc    Get list of available locations
// @access  Private
router.get('/locations', auth, async (req, res) => {
  try {
    const locations = await Company.distinct('location.city', { 
      isActive: true,
      'location.city': { $exists: true, $ne: null }
    });
    
    res.json({
      success: true,
      locations: locations.sort()
    });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching locations'
    });
  }
});

// @route   POST /api/company/rate
// @desc    Rate a company
// @access  Private
router.post('/:id/rate', [
  auth,
  body('rating')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5')
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

    const { rating } = req.body;
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Update rating (simplified - in production you'd track individual user ratings)
    const newReviewCount = company.reviewCount + 1;
    const newRating = ((company.rating * company.reviewCount) + rating) / newReviewCount;
    
    company.rating = Math.round(newRating * 10) / 10; // Round to 1 decimal
    company.reviewCount = newReviewCount;
    
    await company.save();

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      company: company.getSummary()
    });
  } catch (error) {
    console.error('Rate company error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rating company'
    });
  }
});

export default router;
