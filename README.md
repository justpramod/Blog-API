# Blog API

A RESTful Blog API built with Node.js, Express, MongoDB, and JWT Authentication.

## Live URL
https://blog-api-uenr.onrender.com

## Tech Stack
- Node.js
- Express.js
- MongoDB & Mongoose
- JWT Authentication
- bcrypt

## Features
- User registration and login
- JWT protected routes
- Create, read, update, delete posts
- Comment on posts
- Ownership protection (users can only edit/delete their own posts and comments)

## API Endpoints

### Auth (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register a new user |
| POST | /auth/login | Login and get token |

### Posts (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /posts | Get your posts |
| GET | /posts/:id | Get one post |
| POST | /posts | Create a post |
| PUT | /posts/:id | Update your post |
| DELETE | /posts/:id | Delete your post |

### Comments (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /posts/:id/comments | Get all comments |
| POST | /posts/:id/comments | Add a comment |
| DELETE | /posts/:id/comments/:cid | Delete your comment |

## Setup

### Prerequisites
- Node.js
- MongoDB Atlas account

### Installation
```bash
git clone https://github.com/justpramod/blog-api.git
cd blog-api
npm install
```
### Environmental Variables
Create a '.env' file: 
MONTO_URI = your_mongodb_connection_string
JWT_SECRET = your_secret_key

### Run
```bash
npm start
```
