# SignBridge – Sign Language Learning & Translation Portal

**SignBridge** is a modern, full-stack web application designed for learning sign language and translating sign language gestures using real-time browser webcam computer vision.

This application is aligned with **UN SDG 10 – Reduced Inequalities**, bridging communication gaps for Deaf and hard-of-hearing individuals.

---

## 🌟 Key Features

1. **Learn Sign Language**: Interactive library categorized into Alphabets, Numbers, Greetings, Common Words, and Common Phrases with search filters and visual instructions.
2. **Real-time Camera Sign Translator**: Accesses browser webcam (`navigator.mediaDevices.getUserMedia()`), detects 21 3D hand landmarks via MediaPipe, classifies signs (`Hello`, `Thank You`, `Yes`, `No`, `Help`, `Water`, `Letter A`, `Letter B`, `Letter C`, `Number 1`, `Number 2`, `Number 3`), displays confidence scores, and offers Text-to-Speech audio output.
3. **Interactive Practice Challenges**: Test hand gestures against target word challenges, compare live camera input, receive instant feedback, and save scores.
4. **Student Dashboard & Analytics**: Visual statistics for signs learned, total translations, practice attempts, category mastery progress bars, and recent activity logs.
5. **Translation History**: Persistent history table stored in MySQL with search filtering, date timestamps, confidence badges, and clear options.
6. **User Authentication & Profile**: Secure registration and login with bcrypt password hashing and JWT token authentication.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript, React.js (Vite), React Router v7, Tailwind CSS, Lucide Icons, Web Speech API.
- **Machine Learning & Vision**: MediaPipe Hands (21 3D Landmark Detection) + Geometric Sign Classifier.
- **Backend**: Node.js, Express.js REST API, `mysql2` connection pool, JWT Authentication, bcryptjs.
- **Database**: MySQL 9.4 (`signbridge_db`).

---

## 🗄️ Database Credentials & Structure

- **Host**: `localhost`
- **Port**: `3306`
- **Database Name**: `signbridge_db`
- **User**: `root`
- **Password**: `Akhila999*`

---

## 🚀 How to Run the Application

### 1. Database Initialization
```bash
cd backend
npm run db:setup
```

### 2. Start Backend REST API Server (Port 5000)
```bash
cd backend
npm start
```

### 3. Start Frontend React Application (Port 3000)
```bash
cd frontend
npm run dev
```

Open your browser at **http://localhost:3000** to launch SignBridge.

---

## 🔑 Default Demo Login

- **Email**: `demo@signbridge.org`
- **Password**: `Password123!`
