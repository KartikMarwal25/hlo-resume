import { GoogleGenAI } from '@google/genai';
import { promises as fs } from 'fs';
import fetch from 'node-fetch';
import pdf from 'pdf-parse';
import dotenv from "dotenv";
dotenv.config();
// Initialize Google GenAI client

const genAI = new GoogleGenAI({apiKey: process.env.GOOGLE_AI_API_KEY});
// genAI.models.list().then(models => {
//   console.log('Available models:', models);}).catch(err => {
//   console.error('Error listing models:', err);});
/**
 * Extracts text from a PDF file.
 * Works with either a file buffer (preferred) or file path.
 * - PDF file buffer (Buffer) or file path (string).
 * @returns {Promise<string>} - Extracted text.
 */


//const extractResumeText = async (source) => { try { let fileBuffer; // If source is a string, read the file asynchronously if (typeof source === 'string') { fileBuffer = await fs.readFile(source); } // If source is already a Buffer, use it directly else if (Buffer.isBuffer(source)) { fileBuffer = source; } else { throw new Error('Invalid source type: must be file path or Buffer'); } // Parse the PDF const data = await pdf(fileBuffer); return data.text; } catch (err) { console.error('Error parsing PDF:', err.message); throw err; } };







const extractResumeText = async (source) => { 
  try {
    let fileBuffer;

    if (typeof source === 'string') {
      if (source.startsWith('http')) {
        // Fetch PDF from Cloudinary or any URL
        const res = await fetch(source);
        if (!res.ok) throw new Error(`Failed to fetch PDF: ${res.statusText}`);
        fileBuffer = Buffer.from(await res.arrayBuffer());
      } else {
        // Local file path
        fileBuffer = await fs.readFile(source);
      }
    } 
    else if (Buffer.isBuffer(source)) {
      fileBuffer = source;
    } 
    else {
      throw new Error('Invalid source type: must be file path, URL, or Buffer');
    }

    const data = await pdf(fileBuffer);
    return data.text;
  } catch (err) { 
    console.error('Error parsing PDF:', err.message);
    throw err;
  }
};

// Analyze resume and extract skills, experience, and generate ATS score
const analyzeResume = async (resumeText, jobDescription = null) => {
  try {
    // const model = genAI.models.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
    You are an expert resume analyzer and career coach. Provide accurate, helpful analysis in the requested JSON format.
    
    Analyze the following resume and provide a comprehensive assessment:
    
    Resume Text:
    ${resumeText}
    
    ${jobDescription ? `Job Description: ${jobDescription}` : ''}
    
    Please provide the following analysis in JSON format:
    {
      "atsScore": number (0-100),
      "extractedSkills": ["skill1", "skill2", ...],
      "experience": "summary of experience level",
      "education": "summary of education",
      "summary": "brief professional summary",
      "recommendations": ["recommendation1", "recommendation2", ...],
      "keywords": ["keyword1", "keyword2", ...],
      "missingKeywords": ["missing1", "missing2", ...]
    }
    
    Focus on:
    - ATS compatibility (keyword matching, formatting, clarity)
    - Skill extraction and relevance
    - Experience level assessment
    - Areas for improvement
    
    Respond ONLY with valid JSON — no markdown, no explanations.
    `;

    const result = await genAI.models.generateContent({ model: "gemini-2.5-flash-lite" ,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });
    const response =  result.text;
    console.log('AI analysis response:', response);
    // Parse JSON response
    try {
      return JSON.parse(response);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      throw new Error('Failed to parse AI analysis response');
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to analyze resume with AI');
  }
};


// Generate interview questions based on resume and job description
const generateInterviewQuestions = async (resumeText, jobDescription, questionCount = 10) => {
  try {
    // const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
    You are an expert interview coach. Generate relevant, challenging interview questions in the requested JSON format.
    
    Generate ${questionCount} relevant interview questions based on the following resume and job description:
    
    Resume Text:
    ${resumeText}
    
    Job Description:
    ${jobDescription}
    
    Please provide questions in JSON format:
    {
      "questions": [
        {
          "question": "question text",
          "category": "technical|behavioral|situational|company",
          "difficulty": "easy|medium|hard"
        }
      ]
    }
    
    Include a mix of:
    - Technical questions related to skills mentioned
    - Behavioral questions about past experiences
    - Situational questions relevant to the role
    - Company-specific questions
    
    Respond only with valid JSON format.
    `;

    const result = await genAI.models.generateContent({ model: "gemini-2.5-flash-lite" ,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });
    const response = await result.text;
    
    try {
      return JSON.parse(response);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      throw new Error('Failed to parse interview questions response');
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate interview questions');
  }
};

// Generate company recommendations based on skills
const generateCompanyRecommendations = async (userSkills, experienceLevel, industry = null) => {
  try {
    // const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
    You are an expert career advisor and company researcher. Provide accurate company recommendations in the requested JSON format after analyzing the realtime company hiring data.
    The user is of Indian origin, so focus on companies that are open to hiring Indian candidates also the big tech companies too
    Based on the following user profile, suggest 10 companies that is open for hiring for those skills and would be a good match:
    
    Skills: ${userSkills.join(', ')}
    Experience Level: ${experienceLevel}
    ${industry ? `Preferred Industry: ${industry}` : ''}
    
    Please provide recommendations in JSON format:
    {
      "companies": [
        {
          "name": "company name",
          "industry": "industry",
          "size": "startup|small|medium|large|enterprise",
          "location": {
            "city": "city",
            "state": "state",
            "country": "country"
          },
          "description": "brief company description",
          "requiredSkills": [
            {
              "skill": "skill name",
              "importance": "low|medium|high|critical"
            }
          ],
          "preferredSkills": ["skill1", "skill2"],
          "experienceLevel": "entry|mid|senior|executive",
          "jobTitles": ["title1", "title2"],
          "benefits": ["benefit1", "benefit2"],
          "companyCulture": "brief culture description",
          "matchPercentage": number (0-100)
        }
      ]
    }
    
    Calculate match percentage based on skill overlap and experience level compatibility.
    
    Respond only with valid JSON format.
    `;

    const result = await genAI.models.generateContent({ model: "gemini-2.5-flash-lite" ,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    }); 
    const response = await result.text; 
    console.log('Company recommendations response:', response);
    try {
      return JSON.parse(response);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      throw new Error('Failed to parse company recommendations response');
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate company recommendations');
  }
};

export {
  extractResumeText,
  analyzeResume,
  generateInterviewQuestions,
  generateCompanyRecommendations
};
