# VetConnect

## Overview
VetConnect is a **SaaS platform for veterinary appointments and real-time video consultations**.  
This MVP enables farmers and pet owners to book appointments with veterinary doctors and connect via secure video calls.  
The project demonstrates my ability to build and deploy a full-stack application using modern cloud services.

## Features
- Appointment booking for farmers/pet owners
- Doctor dashboard for managing appointments
- Real-time video call feature (Agora RTC integration)
- Email notifications via Resend SMTP
- Secure authentication and role-based access
- Responsive design for desktop and mobile

## Tech Stack
- **Frontend**: React (deployed on Netlify)
- **Backend**: Node.js, Express.js (deployed on Railway)
- **Database**: MongoDB Atlas
- **Video Calls**: Agora RTC SDK
- **Email**: Resend SMTP server
- **Authentication**: JWT

## Screenshots
![Home Page](Home Page.jpeg)
![Admin Dashboard](Admin dashboard.jpeg)

## Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/vetconnect.git

# Navigate into the project folder
cd vetconnect

# Install backend dependencies
npm install

# Navigate into the client folder and install frontend dependencies
cd frontend
npm install

# Run backend server (Railway equivalent locally)
npm run backend

# Run frontend (Netlify equivalent locally)
npm  run frontend

# Run full stack (Netlify equivalent locally)
npm  run dev

