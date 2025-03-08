# ChatMe - Realtime Chat Application

ChatMe is a real-time chat application built with React, Firebase Firestore, and Firebase Authentication. It supports both public chat and private direct messaging (DMs) between registered users.

## Features

- **User Authentication:** Sign up and log in using Firebase Authentication.
- **Real-Time Chat:** Send and receive messages instantly.
- **Public Chat Room:** All users can send and receive messages in the global chat.
- **Direct Messaging:** Users can select a recipient and start a private conversation.

## Tech Stack

- **Frontend:** React, CSS
- **Backend:** Firebase Firestore (NoSQL database)
- **Authentication:** Firebase Authentication
- **Hosting:** Vercel

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kristimarkus1/chatme.git
   cd chatme
   ```

2. **Configure Firebase:**
    1. Create a Firebase project at Firebase
    Console
    2. Enable Firestore and Authentication (Email/Password sign-in method)
    3. Copy your Firebase configuration details and create a .env file in the root folder with the following:
    ```bash
    VITE_API_KEY=your_firebase_api_key
    VITE_AUTH_DOMAIN=your_firebase_auth_domain
    VITE_PROJECT_ID=your_firebase_project_id
    VITE_STORAGE_BUCKET=your_firebase_storage_bucket
    VITE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
    VITE_APP_ID=your_firebase_app_id
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Change directory:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Change directory:**
    ```bash
   cd ..
   cd backend
   npm start
   ```

Server starts on 
http://localhost:5173/

Happy chatting! 🚀# live-chat-app git init
