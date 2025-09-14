# 🔐 Authentication Setup Guide

## Quick Setup Steps:

### 1. **Add JWT Secret to your .env file:**
```bash
# Add this line to your backend/.env file
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 2. **Create ML Tables:**
```bash
cd backend
npm run create:ml-tables
```

### 3. **Seed ML Data:**
```bash
npm run seed:ml
```

### 4. **Start the Backend:**
```bash
npm run dev
```

### 5. **Start the Frontend:**
```bash
cd frontend
npm start
```

## 🎯 **How to Test:**

1. **Go to:** `http://localhost:3000`
2. **Click "Sign Up"** to create a new account
3. **Fill in the form** with your details
4. **Click "Create Account"**
5. **You'll be automatically logged in!**

## 🧠 **ML Features Now Available:**

- ✅ **Personalized Recommendations** based on your interactions
- ✅ **Save Recipes** - they'll appear in your profile
- ✅ **Like Recipes** - helps improve recommendations
- ✅ **Rate Recipes** - 1-5 stars with visual feedback
- ✅ **User Profile** - see all your saved, liked, and rated recipes

## 🔄 **How ML Learning Works:**

1. **Sign up** and start using the app
2. **Rate recipes** (1-5 stars)
3. **Save recipes** you like
4. **Like recipes** you enjoy
5. **View recipes** (tracked automatically)
6. **ML algorithm learns** from your preferences
7. **Recommendations improve** over time

## 🎨 **New Features:**

- **Beautiful Authentication UI** with smooth animations
- **User Profile Page** showing all your activity
- **Real-time ML Recommendations** that improve with use
- **Secure JWT Authentication** with token management
- **Responsive Design** that works on all devices

Your ML system will now learn from real user interactions and provide increasingly accurate recommendations! 🚀
