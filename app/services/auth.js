import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../config/firebaseConfig";

// Sign Up
export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User registered!");
    return userCredential; // Return the user credential
  } catch (error) {
    console.error("Sign Up Error:", error.message);
    throw error; // Re-throw the error for the component to handle
  }
};

// Send Verification Email
export const sendVerificationEmail = async (user) => {
  try {
    await sendEmailVerification(auth.currentUser); // Use the currently logged-in user
    console.log("Verification email sent!");
  } catch (error) {
    console.error("Error sending verification email:", error.message);
    throw error; // Re-throw the error for the component to handle if needed
  }
};

// Sign In
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error; // Pass error back to the calling function
  }
};