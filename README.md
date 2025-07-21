# Event Management System

A full-stack event management application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). This application allows users to create, manage, and discover events with features like user authentication, event registration, and comprehensive event management.

## 🚀 Features

### User Features
- **User Authentication**: Secure registration and login with JWT
- **Profile Management**: Update profile information and change password
- **Event Discovery**: Browse events with advanced search and filtering
- **Event Registration**: Register and unregister from events
- **Dashboard**: View created events and registered events

### Event Management
- **Create Events**: Comprehensive event creation with all necessary details
- **Edit Events**: Update event information and settings
- **Delete Events**: Remove events with confirmation
- **Event Categories**: Organize events by categories (Technology, Business, Education, etc.)
- **Event Status**: Manage event status (draft, published, cancelled, completed)

### Advanced Features
- **Search & Filtering**: Search events by title, description, tags, and filter by category, location, date
- **Pagination**: Efficient event browsing with pagination
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Live event registration status
- **Image Support**: Event image uploads
- **Contact Information**: Organizer contact details and social media links

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **multer** - File uploads
- **helmet** - Security middleware
- **cors** - Cross-origin resource sharing

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **React Hot Toast** - Notifications
- **Tailwind CSS** - Styling
- **React Icons** - Icon library
- **date-fns** - Date manipulation

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd event-management-system
   ```

2. **Install dependencies**
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

3. **Environment Setup**
   
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/event-management
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

4. **Database Setup**
   
   Make sure MongoDB is running on your system, or update the `MONGODB_URI` to point to your MongoDB instance.

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

2. **Start the frontend application**
   ```bash
   cd frontend
   npm start
   ```
   The frontend will run on `http://localhost:3000`

### Production Mode

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start the production server**
   ```bash
   cd backend
   npm start
   ```

## 📁 Project Structure

```
event-management-system/
├── backend/
│   ├── config.env          # Environment variables
│   ├── server.js           # Main server file
│   ├── models/             # Database models
│   │   ├── User.js
│   │   └── Event.js
│   ├── routes/             # API routes
│   │   ├── auth.js
│   │   ├── events.js
│   │   └── users.js
│   └── middleware/         # Custom middleware
│       └── auth.js
├── frontend/
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── common/     # Reusable components
│   │   │   └── layout/     # Layout components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   ├── tailwind.config.js  # Tailwind configuration
│   └── package.json
├── package.json            # Root package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Events
- `GET /api/events` - Get all events (with filtering)
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/register` - Register for event
- `DELETE /api/events/:id/register` - Unregister from event
- `GET /api/events/my-events` - Get user's created events
- `GET /api/events/registered` - Get user's registered events
- `GET /api/events/categories` - Get event categories

### Users (Admin)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🎨 Features in Detail

### User Authentication
- Secure JWT-based authentication
- Password hashing with bcrypt
- Protected routes with middleware
- User role management (user/admin)

### Event Management
- Comprehensive event creation with validation
- Event editing with pre-filled forms
- Event status management
- Attendee tracking and capacity management
- Event categories and tags

### Search and Filtering
- Text search across event title, description, and tags
- Filter by category, location, and date range
- Pagination for large datasets
- Sort by various criteria

### User Interface
- Modern, responsive design with Tailwind CSS
- Intuitive navigation and user experience
- Real-time notifications with toast messages
- Loading states and error handling
- Mobile-friendly interface

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Helmet security middleware
- Rate limiting
- Protected API endpoints

## 🚀 Deployment

### Backend Deployment (Heroku)
1. Create a Heroku account and install Heroku CLI
2. Create a new Heroku app
3. Set environment variables in Heroku dashboard
4. Deploy using Git:
   ```bash
   heroku git:remote -a your-app-name
   git push heroku main
   ```

### Frontend Deployment (Netlify/Vercel)
1. Build the frontend: `npm run build`
2. Deploy the `build` folder to your preferred hosting service
3. Set environment variables for API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the existing issues in the repository
2. Create a new issue with detailed information
3. Contact the maintainers

## 🎯 Future Enhancements

- Email notifications for event updates
- Social media integration
- Payment processing for paid events
- Event analytics and reporting
- Mobile app development
- Real-time chat for event attendees
- Calendar integration
- Event templates
- Bulk event management
- Advanced search with geolocation

---

**Happy Event Managing! 🎉** 