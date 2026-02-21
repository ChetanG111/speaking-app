
# Firebase Setup Guide

To connect your FluentArena app to Firebase, follow these steps:

## 1. Get Firebase Config
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Open your project.
3. Click the ⚙️ (Gear icon) -> **Project settings**.
4. Scroll down to the **Your apps** section.
5. If you haven't created a Web App yet, click the **</>** icon to add a web app. Register it (you don't need Firebase Hosting for now).
6. Copy the `firebaseConfig` object values.

## 2. Configure Environment Variables
1. Open `.env.local` in your project root.
2. Add the following keys with your values from the Firebase Console:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 3. Enable Authentication
1. Go to **Authentication** in the left sidebar.
2. Click **Get Started**.
3. Select **Google** from the Sign-in method list.
4. Enable it.
5. Set the support email.
6. Click **Save**.

## 4. Create Firestore Database
1. Go to **Firestore Database** in the left sidebar.
2. Click **Create database**.
3. Select a location (e.g., `nam5` or whatever is close to you).
4. Start in **Production mode**.
5. Click **Create**.

## 5. Set Firestore Security Rules (Optional but Recommended)
*Note: Since you set up in **Test Mode**, your database is currently open to everyone for 30 days. This is fine for development! You can skip this step for now, but we recommend pasting these rules eventually to secure your user data.*

1. Go to the **Rules** tab in Firestore.
2. Replace the existing rules with the following to secure user data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users: Users can read and write only their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Speeches: Users can create and read only their own speeches
    match /speeches/{speechId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    
    // Topics: Publicly readable, writeable only by admins
    match /topics/{topicId} {
      allow read: if true;
      allow write: if false; 
    }
  }
}
```
3. Click **Publish**.

## 6. Setup Firestore Indexes
Firestore requires composite indexes for complex queries (like filtering by user and sorting by date).

1. Go to the **Indexes** tab in the Firestore Database sidebar.
2. If you see an error in your browser console with a link to create an index, **simply click that link** and click "Create Index".
3. Alternatively, you can manually create an index on the `speeches` collection with the following fields:
   - `userId`: **Ascending**
   - `date`: **Descending**
   - Query scope: **Collection**

## 7. Run the App
- Restart your development server if it's running:
  ```bash
  bun run dev
  ```
- Click "Sign In" on the dashboard to test Google Login.
- Complete a speaking session to see it save to Firestore!
