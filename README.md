# 🏕️ Campora

A professional-grade, full-stack campground discovery platform.  
Empowering outdoor enthusiasts to discover, review, and map the world’s best camping experiences.

---

## 🚀 Overview

Campora is a feature-rich, scalable web application built to solve the fragmentation in outdoor travel planning.  
It combines geolocation, user-generated content, and secure identity management into a sleek, modern, and responsive user experience.

---

## 🔗 Live Demo
https://campora-81bm.onrender.com/

---

## 💎 Key Features

- 🔍 **Intuitive Discovery Engine**  
  Explore campgrounds with advanced filtering and visual map-based navigation.

- ⭐ **Dynamic Community Engagement**  
  Authenticated users can share experiences through interactive reviews and ratings.

- 🗺️ **Intelligent Geo-Mapping**  
  Real-time location visualization for seamless trip planning.

- 🔐 **Enterprise-Grade Security**
  - Stateless authentication via Passport.js  
  - Protection against XSS, NoSQL Injection, CSRF using Helmet and express-mongo-sanitize  

- 📸 **Media-Rich Content System**  
  Multi-image support with responsive galleries for each campground.

---

## 🛠️ Tech Stack

| Layer | Technology |
|------|------------|
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Security | Passport.js, Helmet, express-session |
| Frontend | EJS, Bootstrap 5, Custom CSS |
| Mapping | MapTiler |
| Architecture | MVC Pattern, RESTful Routing, Middleware-driven logic |

---

## 🚀 Deployment Strategy

The application is architected for production-grade reliability:

- 🌐 **Database**: MongoDB Atlas for global availability  
- 🔐 **Environment Safety**: Managed using `.env` variables  
- ⚡ **Resiliency**: Global error handling + flash messaging system  

---

## 🔧 Setup & Installation

### Clone the Repository

```bash
git clone https://github.com/gowthamrajana/campora.git

cd campora   

```


---
## 🔧 Environment Variables


```env
DB_URL=your_mongodb_connection_string
SECRET=your_session_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET=your_cloudinary_api_secret

MAPTILER_API_KEY=your_maptiler_api_key