# GigPanda 🐼

GigPanda is a modern freelancing platform that connects talented freelancers with clients looking for professional services. Built with React, Node.js, and MongoDB, it provides a seamless experience for both freelancers and clients.

## 🚀 Quick Setup
```
## Manual Setup
1. Copy environment files:
```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

2. Edit the `.env` files with your configuration
3. Install dependencies: `npm run install-all`
4. For development: `npm run dev`
5. For production: `npm run build && npm start`

## 🌐 Environment Configuration

This project uses centralized environment variables for easy deployment and URL management:

### Backend (.env)
- `CLIENT_URL` - Frontend application URL
- `BACKEND_URL` - Backend API URL  
- `DOMAIN` - Your domain for cookies
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- See `.env.example` for complete list

### Frontend (frontend/.env)
- `VITE_API_BASE_URL` - Backend API base URL
- `VITE_BACKEND_URL` - Backend server URL
- `VITE_WS_URL` - WebSocket URL
- See `frontend/.env.example` for complete list

**🔧 To change your domain:** Simply update the URLs in both `.env` files and rebuild!

## Features

### For Freelancers
- 📋 Create and manage professional profiles
- 💼 Browse and apply to job postings
- 📊 Track earnings and active projects
- 📬 Real-time messaging with clients
- 🔔 Instant notifications for job updates
- 📁 Submit work and manage milestones
- 💰 Secure payment system for completed work

### For Clients
- 📝 Post jobs and manage proposals
- 👥 Browse and hire talented freelancers
- 📊 Track project progress
- 💼 Manage contracts and milestones
- 📬 Real-time communication with freelancers
- 🔔 Instant notifications for project updates
- 💰 Secure escrow payment system

## Tech Stack

### Frontend
- React.js with Vite
- TailwindCSS for styling
- Framer Motion for animations
- React Router for navigation
- Zustand for state management
- Axios for API requests
- React Hot Toast for notifications
- ESLint for code quality

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT for authentication
- Socket.io for real-time features
- Multer for file uploads
- Nodemailer for email services
- Morgan for logging
- Cookie-parser for handling cookies

### Real-time Features
- Server-Sent Events (SSE) for real-time notifications
- Real-time messaging system
- Live updates for contract status changes
- Instant payment notifications
- Read receipts for messages

### Payment System
- Secure escrow system for milestone-based payments
- Automated payment release workflow
- Payment history tracking
- Escrow balance management
- Multiple milestone support

### File Management
- Secure file upload system for work submissions
- Support for multiple file types
- File versioning for work submissions
- Secure file storage and retrieval
- Download functionality for submitted work

### Security Features
- JWT with HTTP-only cookies
- Rate limiting for API endpoints
- Input validation and sanitization
- Secure file upload validation
- XSS protection
- CSRF protection
- Secure password hashing
- Session management

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/gigpanda.git
cd gigpanda
```

2. Install dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables

```bash
# In backend directory, create .env file
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_SERVICE=your_email_service
EMAIL_USERNAME=your_email
EMAIL_APP_PASSWORD=your_email_app_password
EMAIL_SENDER_NAME=GigPanda
NODE_ENV=development
DOMAIN=localhost

# In frontend directory, create .env file
VITE_API_URL=http://localhost:5000/api
```

4. Start the development servers
```bash
# Start backend server (from backend directory)
npm run dev

# Start frontend server (from frontend directory)
npm run dev
```

## Development Features

### API Configuration
- Development and production API configurations
- Automatic proxy setup for development
- CORS configuration for secure communication

### Development Tools
- ESLint configuration for code quality
- Test data generation for development (disabled in production)
- Hot module replacement with Vite
- Source maps enabled for debugging

### Security Features
- HTTP-only cookies for JWT storage
- Secure cookie settings in production
- CORS origin restrictions
- Rate limiting for API endpoints
- Input validation and sanitization

## Deployment

### Production Setup
1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Set production environment variables:
```bash
NODE_ENV=production
DOMAIN=your-domain.com
MONGO_URI=your_production_mongodb_uri
```

3. Configure production settings:
- Frontend API endpoints automatically adjust for production
- Static file serving enabled
- Security headers enabled
- Error logging configured
- SSL/TLS setup required

### Production Features
- Optimized static file serving
- Gzip compression
- Error handling and logging
- Secure cookie settings
- Production-ready MongoDB connection
- Email service configuration

## Project Structure

```
gigpanda/
├── frontend/                # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── auth/      # Authentication components
│   │   │   ├── common/    # Common UI components
│   │   │   ├── contract/  # Contract-related components
│   │   │   ├── messaging/ # Messaging components
│   │   │   └── payment/   # Payment components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand store configurations
│   │   ├── services/      # API and service integrations
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   └── assets/        # Static assets
│   └── public/            # Public assets
│
├── backend/
│   ├── controllers/       # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── services/         # Business logic services
│   ├── utils/            # Utility functions
│   ├── config/          # Configuration files
│   ├── emailServices/    # Email service configurations
│   └── uploads/          # File upload directory
│
└── package.json          # Root package.json
```


## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all contributors who have helped shape GigPanda
- Special thanks to the open-source community for the amazing tools and libraries

## Contact

Your Name - [@yourusername](https://twitter.com/yourusername)
Project Link: [https://github.com/yourusername/gigpanda](https://github.com/yourusername/gigpanda)
