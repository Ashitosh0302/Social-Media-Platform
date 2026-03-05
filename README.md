# 🐦 BirdSky – Social Media Platform

BirdSky is a full-stack social media web application built using **Node.js, Express, MySQL, and EJS**.  
It allows users to register, log in, manage profiles, create posts, and access a protected dashboard using JWT authentication.

---

## 🚀 Features

- User Registration & Login
- JWT-based Authentication
- Profile Management
- Create, View & Manage Posts
- Protected Dashboard
- File Upload Support
- MySQL Database Integration
- MVC Architecture

---

## 🏗️ Tech Stack

- Backend: Node.js, Express.js  
- Frontend: EJS, HTML, CSS  
- Database: MySQL  
- Authentication: JWT  
- Tools: dotenv, multer, bcrypt  

---

## 📁 Project Structure

```bash
BirdSky/
│
├── app.js                          # Main server entry point
├── package.json                    # Project dependencies and scripts
├── package-lock.json               # Dependency lock file
├── .env                            # Environment variables
│
├── config/                         # Configuration files
│   └── db.js                       # MySQL database connection
│
├── controllers/                    # Application logic (controllers)
│   ├── dashboard.js                # Dashboard logic
│   ├── home.js                     # Home page logic
│   ├── posts.js                    # Post handling logic
│   ├── profile.js                  # Profile logic
│   ├── user_login.js               # User login logic
│   └── user_register_login.js      # User registration logic
│
├── routes/                         # Application routes
│   ├── dashboard.js                # Dashboard routes
│   ├── home.js                     # Home routes
│   ├── posts.js                    # Post routes
│   ├── profile.js                  # Profile routes
│   ├── user_login.js               # Login routes
│   └── user_register_login.js      # Register routes
│
├── middlewares/                    # Custom middleware
│   ├── authMiddleware.js           # JWT authentication middleware
│   └── upload.js                   # File upload middleware
│
├── models/                         # Database models
│   └── user.js                     # User model
│
├── db/                             # Database utilities
│   └── recommended-indexes.sql     # SQL indexes for optimization
│
├── public/                         # Static assets
│   ├── css/                        # Stylesheets
│   │   └── style.css
│   ├── js/                         # Client-side JavaScript
│   │   └── main.js
│   └── images/                     # Images
│       └── (image files)
│
└── views/                          # EJS templates
    ├── partials/                    # Reusable UI components
    │   ├── head.ejs
    │   └── nav.ejs
    ├── home.ejs                     # Home page
    ├── login.ejs                    # Login page
    ├── register.ejs                 # Register page
    ├── dashboard.ejs                # Dashboard page
    └── profile.ejs                  # Profile page
```

## 🧪 Testing Strategy

The application has been tested using the following approaches:

- **Manual Testing**  
  Functional testing performed through the web browser to verify UI flow and user actions.

- **API Testing (Postman)**  
  REST APIs tested for correct request handling, responses, and error cases.

- **Authentication & Authorization Testing**  
  Verified JWT-based login, protected routes, and access control for secured pages.

---

## 🚧 Future Enhancements

Planned improvements to extend functionality and scalability:

- ❤️ Like & Comment System  
- 🔔 Notification Module  
- 💬 Real-time Chat Feature  
- 📱 Fully Responsive UI  
- 🔍 Search & Explore Functionality  
- 🌐 Cloud Deployment (AWS / Render)

---

## 🎓 Academic Relevance

This project demonstrates practical implementation of:

- Full-stack web development  
- MVC (Model–View–Controller) architecture  
- Secure authentication & authorization  
- Database optimization techniques  
- Real-world social media application design

---
