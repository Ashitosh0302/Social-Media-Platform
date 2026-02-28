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

BirdSky/<br>
├── app.js                    ---------------------------# Main server entry point<br>
├── package.json              ---------------------------# Project dependencies and scripts<br>
├── package-lock.json         ---------------------------# Dependency lock file<br>
├── .env                      ---------------------------# Environment variables<br>
│<br>
├── config/                   ---------------------------# Configuration files<br>
│   └── db.js                 ---------------------------# MySQL database connection<br>
│<br>
├── controllers/              ---------------------------# Application logic (controllers)<br>
│   ├── dashboard.js          ---------------------------# Dashboard logic<br>
│   ├── home.js               ---------------------------# Home page logic<br>
│   ├── posts.js              ---------------------------# Post handling logic<br>
│   ├── profile.js            ---------------------------# Profile logic<br>
│   ├── user_login.js         ---------------------------# User login logic<br>
│   └── user_register_login.js---------------------------# User registration logic<br>
│<br>
├── routes/                   ---------------------------# Application routes<br>
│   ├── dashboard.js          ---------------------------# Dashboard routes<br>
│   ├── home.js               ---------------------------# Home routes<br>
│   ├── posts.js              ---------------------------# Post routes<br>
│   ├── profile.js            ---------------------------# Profile routes<br>
│   ├── user_login.js         ---------------------------# Login routes<br>
│   └── user_register_login.js---------------------------# Register routes<br>
│<br>
├── middlewares/              ---------------------------# Custom middleware<br>
│   ├── authMiddleware.js     ---------------------------# JWT authentication middleware<br>
│   └── upload.js             ---------------------------# File upload middleware<br>
│<br>
├── models/                   ---------------------------# Database models<br>
│   └── user.js               ---------------------------# User model<br>
│<br>
├── db/                       ---------------------------# Database utilities<br>
│   └── recommended-indexes.sql--------------------------# SQL indexes for optimization<br>
│<br>
├── public/                   ---------------------------# Static assets<br>
│   ├── css/                  ---------------------------# Stylesheets<br>
│   ├── js/                   ---------------------------# Client-side JavaScript<br>
│   └── images/               ---------------------------# Images<br>
│<br>
└── views/                    ---------------------------# EJS templates<br>
    ├── partials/             ---------------------------# Reusable UI components<br>
    │   ├── head.ejs<br>
    │   └── nav.ejs<br>
    ├── home.ejs              ---------------------------# Home page<br>
    ├── login.ejs             ---------------------------# Login page<br>
    ├── register.ejs          ---------------------------# Register page<br>
    ├── dashboard.ejs         ---------------------------# Dashboard page<br>
    └── profile.ejs           ---------------------------# Profile page<br>

---

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
