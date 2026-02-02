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
  createProfile, // ← ADD THIS IMPORT
} from "../controllers/userController.js"; // ← ADD to your controller

import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

// Public routes
router.route("/").post(createUser);           
router.route("/auth").post(loginUser);       
router.route("/logout").post(logoutCurrentUser); 

// Authenticated user routes
router.route("/profile")
  .get(authenticate, getCurrentUserProfile)
  .put(authenticate, updateCurrentUserProfile)
  .post(authenticate, createProfile);

// Admin routes
router.route("/")
  .get(authenticate, authorizeAdmin, getAllUsers);

router.route("/:id")
  .delete(authenticate, authorizeAdmin, deleteUserById)
  .get(authenticate, getUserById)
  .put(authenticate, authorizeAdmin, updateUserById);

// ← ADD THIS: User-specific pets route


export default router;
