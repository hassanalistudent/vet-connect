import express from "express";
const router = express.Router();

import {
  createUser,
  loginUser,
  logoutCurrentUser,
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  deleteUserById,
  getUserById,
  updateUserById,
  getAllDoctors,
  verifyEmail,        // ✅ email verification
  createProfile,      // ✅ profile creation
  resendVerification, // ✅ resend verification controller
  forgotPassword,     // ✅ forgot password controller
  resetPassword,       // ✅ reset password controller
 checkVerified
} from "../controllers/userController.js";

import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

// Public routes
router.route("/").post(createUser);            
router.route("/auth").post(loginUser);        
router.route("/logout").post(logoutCurrentUser);  
router.route("/verify-email").get(verifyEmail);   
router.route("/resend-verification").post(resendVerification); 
router.route("/forgot-password").post(forgotPassword);         
router.route("/reset-password/:token").post(resetPassword);    // ✅ NEW
router.route("/verify").get(authenticate,checkVerified);    // ✅ NEW

// Authenticated user routes
router.route("/profile")
  .get(authenticate, getCurrentUserProfile)
  .put(authenticate, updateCurrentUserProfile)
  .post(authenticate, createProfile);

// Admin routes
router.route("/")
  .get(authenticate, authorizeAdmin, getAllUsers);

router.route("/doctors").get(getAllDoctors);

router.route("/:id")
  .delete(authenticate, authorizeAdmin, deleteUserById)
  .get(authenticate, getUserById)
  .put(authenticate, authorizeAdmin, updateUserById);

export default router;