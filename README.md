# Resume AI - AI-Powered Resume Analysis Platform

A comprehensive web application that helps job seekers improve their resumes, get ATS compatibility scores, receive personalized interview preparation, and find matching companies based on their skills.

## 🚀 Features

### Core Features
- **AI Resume Analysis**: Advanced AI-powered resume analysis with ATS compatibility scoring
- **Skill Extraction**: Automatically extract and analyze skills from resumes
- **Interview Preparation**: Generate personalized interview questions based on resume and job descriptions
- **Company Matching**: Find companies that match your skills with percentage compatibility
- **Resume History**: Track past uploads and analyze improvement over time
- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **File Upload**: Support for PDF, DOCX, and DOC files with validation
- **Responsive Design**: Modern, mobile-friendly UI built with React and Tailwind CSS

### Technical Features
- **Full-Stack Application**: React.js frontend with Node.js/Express.js backend
- **Database**: MongoDB with Mongoose ODM for data persistence
- **AI Integration**: OpenAI API for intelligent resume analysis and question generation
- **Security**: JWT authentication, input validation, rate limiting, and file security
- **File Management**: Multer for secure file uploads with size and format validation
- **Real-time Feedback**: Toast notifications and loading states for better UX

## 🛠️ Tech Stack

### Frontend
- **React.js 18**: Modern React with hooks and functional components
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication
- **React Hot Toast**: Toast notifications
- **Lucide React**: Modern icon library
- **Framer Motion**: Animation library (ready for implementation)

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing
- **Multer**: File upload middleware
- **OpenAI API**: AI-powered analysis and question generation
- **Express Validator**: Input validation
- **Helmet**: Security middleware
- **CORS**: Cross-origin resource sharing
- **Morgan**: HTTP request logger

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)
- **OpenAI API Key**

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd resume-ai
```

### 2. Install Dependencies

Install all dependencies for both frontend and backend:

```bash
npm run install-all
```

Or install manually:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Configuration

#### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/resume-ai

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# File Upload Configuration
MAX_FILE_SIZE=2097152
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend Configuration

The frontend is configured to proxy requests to the backend on port 5000. This is already set up in `frontend/package.json`.

### 4. Database Setup

#### Option A: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Create a database named `resume-ai`

#### Option B: MongoDB Atlas

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your `.env` file

### 5. OpenAI API Setup

1. Create an OpenAI account at [https://openai.com](https://openai.com)
2. Generate an API key
3. Add the API key to your `.env` file

## 🏃‍♂️ Running the Application

### Development Mode

Run both frontend and backend simultaneously:

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

### Individual Servers

#### Backend Only
```bash
npm run server
# or
cd backend
npm run dev
```

#### Frontend Only
```bash
npm run client
# or
cd frontend
npm start
```

### Production Build

```bash
# Build frontend
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
resume-ai/
├── backend/                 # Backend application
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   ├── uploads/            # File upload directory
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── env.example         # Environment variables template
├── frontend/               # Frontend application
│   ├── public/             # Static files
│   ├── src/                # Source code
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   ├── package.json        # Frontend dependencies
│   └── tailwind.config.js  # Tailwind configuration
├── package.json            # Root package.json
└── README.md               # Project documentation
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Resume Management
- `POST /api/resume/upload` - Upload and analyze resume
- `POST /api/resume/analyze` - Analyze existing resume
- `GET /api/resume/history` - Get user's resume history
- `GET /api/resume/:id` - Get specific resume details
- `DELETE /api/resume/:id` - Delete resume
- `GET /api/resume/:id/download` - Download resume file

### Company Recommendations
- `POST /api/company/match` - Get company recommendations
- `GET /api/company/search` - Search companies
- `GET /api/company/:id` - Get company details
- `GET /api/company/industries` - Get available industries
- `GET /api/company/locations` - Get available locations
- `POST /api/company/:id/rate` - Rate a company

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Comprehensive validation using express-validator
- **Rate Limiting**: Protection against brute force attacks
- **File Security**: File type and size validation
- **CORS Protection**: Cross-origin resource sharing configuration
- **Helmet**: Security headers middleware
- **Environment Variables**: Sensitive data protection

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI**: Clean, professional interface
- **Loading States**: Smooth loading indicators
- **Toast Notifications**: User feedback for actions
- **Form Validation**: Real-time form validation
- **Accessibility**: ARIA labels and keyboard navigation
- **Dark Mode Ready**: Tailwind configuration supports dark mode

## 🚀 Deployment

### Backend Deployment

1. **Environment Variables**: Set all required environment variables
2. **Database**: Ensure MongoDB is accessible
3. **File Storage**: Configure file upload directory
4. **Process Manager**: Use PM2 or similar for production

### Frontend Deployment

1. **Build**: Run `npm run build` to create production build
2. **Static Hosting**: Deploy to Vercel, Netlify, or similar
3. **Environment**: Update API endpoints for production

### Docker Deployment

```dockerfile
# Backend Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@resumeai.com or create an issue in the repository.

## 🔮 Future Enhancements

- **Real-time Chat**: AI-powered chat support
- **Resume Templates**: Pre-built resume templates
- **Cover Letter Generator**: AI-powered cover letter creation
- **Job Application Tracker**: Track job applications and status
- **Analytics Dashboard**: Detailed analytics and insights
- **Multi-language Support**: Internationalization
- **Mobile App**: React Native mobile application
- **Advanced AI**: More sophisticated AI analysis and recommendations

## 📊 Performance

- **Frontend**: Optimized React components with lazy loading
- **Backend**: Efficient database queries with proper indexing
- **File Upload**: Streamlined file processing with validation
- **API**: Rate limiting and caching for optimal performance

---

**Built with ❤️ using modern web technologies**
