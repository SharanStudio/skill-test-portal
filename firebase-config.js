// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDummy123456789Dummy", // Not used for Realtime DB in test mode
  authDomain: "skill-test-portal.firebaseapp.com",
  databaseURL: "https://skill-test-portal-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "skill-test-portal",
  storageBucket: "skill-test-portal.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get reference to the Realtime Database
const db = firebase.database();
