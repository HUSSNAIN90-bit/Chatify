import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyCm75PAWtBEmIihR7fvZHB4MNk66yVLxNc",
  authDomain: "chatify-5c73b.firebaseapp.com",
  projectId: "chatify-5c73b",
  storageBucket: "chatify-5c73b.firebasestorage.app",
  messagingSenderId: "295097588269",
  appId: "1:295097588269:web:f027bc4fba01d8dd2eb6a4"
};

const app = initializeApp(firebaseConfig);  
export const auth = getAuth(app);