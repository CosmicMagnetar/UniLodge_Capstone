# 🚀 UniLodge v2 - Quick Start Guide

Welcome to the UniLodge v2 Capstone project. This guide will help you get the entire platform up and running on your local machine.

## ✅ Prerequisites

Ensure you have the following installed on your system:
- **Node.js** (v18 or higher)
- **NPM** (v9 or higher)

You do **not** need Python installed to run this project.

---

## ⚙️ Environment Configuration

Before starting the services, ensure your environment variables are correctly configured in each of the three applications.

### 1. Frontend (`apps/frontend/.env.local`)
Create this file and ensure it contains:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 2. Backend (`apps/backend/.env`)
Create this file and ensure it contains:
```env
PORT=3001
MONGODB_URI=mongodb+srv://<your-username>:<your-password>@<your-cluster>.mongodb.net/unilodge?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_12345
AI_ENGINE_URL=http://localhost:3002
```

### 3. AI Engine (`apps/ai-engine/.env`)
Create this file and ensure it contains:
```env
PORT=3002
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

---

## 🎯 Running the Platform

This is a monorepo containing three distinct Node.js services. To run the application successfully, you need to open **three separate terminal windows**.

### 1️⃣ Start the Frontend
In your first terminal:
```bash
cd apps/frontend
npm install --legacy-peer-deps
npm run dev
```
*The frontend will be accessible at `http://localhost:3000`*

### 2️⃣ Start the Backend API
In your second terminal:
```bash
cd apps/backend
npm install --legacy-peer-deps
npm run dev
```
*The backend will be accessible at `http://localhost:3001`*

### 3️⃣ Start the AI Engine
In your third terminal:
```bash
cd apps/ai-engine
npm install --legacy-peer-deps
npm run dev
```
*The AI Engine will be accessible at `http://localhost:3002`*

> 🚨 **CRITICAL WARNING** 🚨
> Do **NOT** attempt to run the AI engine using Python or Uvicorn (e.g. `python -m uvicorn main:app`). The AI Engine was rewritten as a Node.js Express application to stabilize the platform. Running the Python command will result in continuous `503 Service Unavailable` errors in the frontend chat!

---

## 🆘 Troubleshooting

### Port Conflicts
If you encounter an `EADDRINUSE` error, it means a port is already taken by a background process. You can kill the process using:

**For Mac/Linux:**
```bash
# To kill port 3000 (Frontend)
lsof -ti:3000 | xargs kill -9

# To kill port 3001 (Backend)
lsof -ti:3001 | xargs kill -9

# To kill port 3002 (AI Engine)
lsof -ti:3002 | xargs kill -9
```

### Missing Dependencies
If you experience module resolution errors after pulling new code, run the following command in the root of the project to clear the cache and reinstall:
```bash
npm cache clean --force
rm -rf node_modules
npm install --legacy-peer-deps
```

---

## 🎉 You're All Set!

Once all three terminals are running without errors, open your browser and navigate to `http://localhost:3000` to start using UniLodge v2!
