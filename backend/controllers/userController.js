import User from "../models/user.js";
import DoctorProfile from "../models/doctorProfile.js";
import PetOwnerProfile from "../models/petOwnerProfile.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import bcrypt from "bcryptjs";
import createToken from "../utils/createToken.js";
import {  setVerificationToken, verifyEmailToken } from "../utils/verificationToken.js";
import {sendVerificationEmail,sendPasswordResetEmail} from "../servises/emailService.js";


// ✅ Register new user with email verification
const createUser = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password, role } = req.body;

  if (!fullName || !email || !phone || !password || !role) {
    return res.status(400).json({ message: "Please fill all required fields" });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    fullName,
    email,
    phone,
    password: hashedPassword,
    role,
  });

  await newUser.save();

  // Generate verification token and send email
  const token = await setVerificationToken(newUser);
  await sendVerificationEmail(newUser.email, token);

  res.status(201).json({
    message: "Signup successful. Please check your email to verify your account.",
    _id: newUser._id,
    fullName: newUser.fullName,
    email: newUser.email,
    phone: newUser.phone,
    role: newUser.role,
    isVerified: newUser.isVerified,
  });
});

// ✅ Login user with verification check
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // Check if user has verified email
  if (!user.isVerified) {
    return res.status(403).json({ message: "Please verify your email before logging in.Check Your inbox" });
  }

  // Issue JWT token only if verified
  createToken(res, user._id);

  res.status(200).json({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isVerified: user.isVerified,
  });
});

// ✅ Verify email route
const verifyEmail = asyncHandler(async (req, res) => {
  const { token, email } = req.query;

  try {
    const user = await verifyEmailToken(email, token);

    res.status(200).json({
      message: "✅ Email verified successfully!",
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.isVerified) {
    return res.status(400).json({ message: "User is already verified" });
  }

  // Generate new token + send email
  const token = await setVerificationToken(user);
  await sendVerificationEmail(user.email, token);

  res.status(200).json({
    message: "Verification email resent. Please check your inbox.",
  });
});


// ✅ Forgot Password: FIXED field names
const forgotPassword = asyncHandler(async (req, res) => {
  
  const { email } = req.body;
  const user = await User.findOne({ email });
  
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  // 🔥 FIXED: Your utility uses verificationTokenExpiry ✅
  const token = await setVerificationToken(user);
  
  const savedUser = await User.findById(user._id);

  await sendPasswordResetEmail(user.email, token);
  
  res.status(200).json({ 
    message: "Password reset email sent. Please check your inbox." ,

  });
});

// ✅ Reset Password: FIXED field names
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  // 🔥 FIXED: Match your model/utility field name
  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpiry: { $gt: Date.now() }  // 👈 verificationTokenExpiry
  });

  if (!user) {
    
    return res.status(400).json({ message: "Invalid or expired reset token" });
  }

  // Hash new password
  user.password = await bcrypt.hash(password, 12);
  
  // Clear token fields - match model
  user.verificationToken = undefined;
  user.verificationTokenExpiry = undefined;  // 👈 FIXED

  await user.save();

  res.status(200).json({ message: "Password reset successful. You can now log in." });
});

// controllers/userController.js
const checkVerified = asyncHandler(async (req, res) => {
  try {
    // 🔥 JUST isVerified status - minimal query
    const user = await User.findById(req.user.id)
      .select('isVerified');              // 👈 Super fast, no Mongoose doc

    if (!user) {
      return res.status(404).json({ isVerified: false });
    }

    res.json({ 
      isVerified: user.isVerified 
    });
  } catch (error) {
    res.status(500).json({ isVerified: false });
  }
});


// Logout user
const logoutCurrentUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logout successful" });
});

// Get all users (Admin only)
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  res.json(users);
});

// Get current user profile
const getCurrentUserProfile = asyncHandler(async (req, res) => {
  // Populate doctorProfile and petOwnerProfile references
  const user = await User.findById(req.user._id)
    .select("-password")
    .populate("doctorProfile")
    .populate("petOwnerProfile");

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});


// Create profile (Doctor or PetOwner depending on role)
const createProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);   // ✅ use authenticated user
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  let profile;

  if (user.role === "Doctor") {
    // ✅ Restrict if doctor profile already exists
    if (user.doctorProfile) {
      return res.status(400).json({ message: "Doctor profile already exists" });
    }

    profile = new DoctorProfile({
      userId: user._id,   // ✅ link to authenticated user
      pvmcRegistrationNumber: req.body.pvmcRegistrationNumber,
      image:req.body.image,
      degreeName: req.body.degreeName,
      yearsOfExperience: req.body.yearsOfExperience,
      specialization: req.body.specialization,
      servicesOffered: req.body.servicesOffered,
      clinicDetails: {
        clinicName: req.body.clinicDetails?.clinicName,
        clinicCity: req.body.clinicDetails?.clinicCity,
        clinicDistrict: req.body.clinicDetails?.clinicDistrict,
        clinicStreet: req.body.clinicDetails?.clinicStreet,
        googleMapLocation: req.body.clinicDetails?.googleMapLocation,
        startTime: req.body.clinicDetails?.startTime,
        endTime: req.body.clinicDetails?.endTime,
      },
      homeVisitDetails : {
        areasCovered: req.body.homeVisitDetails?.areasCovered || [],
        charges: req.body.homeVisitDetails?.charges || 0,
        },
      verificationUploads: req.body.verificationUploads,
    });

    await profile.save();
    user.doctorProfile = profile._id;
    await user.save();

  } else if (user.role === "PetOwner") {
    // ✅ Restrict if pet owner profile already exists
    if (user.petOwnerProfile) {
      return res.status(400).json({ message: "Pet owner profile already exists" });
    }

    profile = new PetOwnerProfile({
      userId: user._id,   // ✅ link to authenticated user
      address: {
        city: req.body.address?.city,
        district: req.body.address?.district,
        street: req.body.address?.street,
      },
    });

    await profile.save();
    user.petOwnerProfile = profile._id;
    await user.save();

  } else {
    return res.status(400).json({ message: "Invalid role for profile creation" });
  }

  res.status(201).json(profile);
});
// Update current user profile
const updateCurrentUserProfile = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  // 🔒 Ensure user can only update their own profile
  if (userId && userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "You are not allowed to update another user's profile" });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Update base user fields
  user.fullName = req.body.fullName || user.fullName;
  user.email = req.body.email || user.email;
  user.phone = req.body.phone || user.phone;

  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
  }

  await user.save();

  // Update role-specific profile
  if (user.role === "Doctor") {
    if (!user.doctorProfile) {
      return res.status(400).json({ message: "Doctor profile not found. Please create it first." });
    }

    await DoctorProfile.findByIdAndUpdate(
      user.doctorProfile,
      {
        $set: {
          pvmcRegistrationNumber: req.body.pvmcRegistrationNumber || undefined,
          degreeName: req.body.degreeName || undefined,
          image: req.body.image || undefined,
          yearsOfExperience: req.body.yearsOfExperience || undefined,
          specialization: req.body.specialization || undefined,
          servicesOffered: req.body.servicesOffered || undefined,
          "clinicDetails.clinicName": req.body.clinicDetails?.clinicName,
          "clinicDetails.clinicCity": req.body.clinicDetails?.clinicCity,
          "clinicDetails.clinicDistrict": req.body.clinicDetails?.clinicDistrict,
          "clinicDetails.clinicStreet": req.body.clinicDetails?.clinicStreet,
          "clinicDetails.googleMapLocation": req.body.clinicDetails?.googleMapLocation,
          "clinicDetails.startTime": req.body.clinicDetails?.startTime,
          "clinicDetails.endTime": req.body.clinicDetails?.endTime,
          "homeVisitDetails.areasCovered": req.body.homeVisitDetails.areasCovered || undefined,
          "homeVisitDetails.charges": req.body.homeVisitDetails.charges || undefined,
          verificationUploads: req.body.verificationUploads || undefined,
        },
      },
      { new: true }
    );
  }

  if (user.role === "PetOwner") {
    if (!user.petOwnerProfile) {
      return res.status(400).json({ message: "Pet owner profile not found. Please create it first." });
    }

    await PetOwnerProfile.findByIdAndUpdate(
      user.petOwnerProfile,
      {
        $set: {
          "address.city": req.body.address?.city || undefined,
          "address.district": req.body.address?.district || undefined,
          "address.street": req.body.address?.street || undefined,
        },
      },
      { new: true }
    );
  }

  // Return populated user with profile
  const updatedUser = await User.findById(req.user._id)
    .select("-password")
    .populate("doctorProfile")
    .populate("petOwnerProfile");

  res.json(updatedUser);
});
// Admin: delete user
const deleteUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    if (user.role === "Admin") {
      return res.status(400).json({ message: "Cannot delete admin user" });
    }
    await User.deleteOne({ _id: user._id });
    res.json({ message: "User removed" });
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

// Admin: get user by ID
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("doctorProfile")
    .populate("petOwnerProfile");

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

// Admin: update user by ID
const updateUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Update base user fields
  user.fullName = req.body.fullName || user.fullName;
  user.email = req.body.email || user.email;
  user.phone = req.body.phone || user.phone;
  user.role = req.body.role || user.role;

  // Role-specific updates
  if (user.role === "Doctor" && user.doctorProfile) {
    const doctorProfile = await DoctorProfile.findById(user.doctorProfile);
    if (doctorProfile) {
      doctorProfile.specialization = req.body.specialization || doctorProfile.specialization;
      doctorProfile.yearsOfExperience = req.body.yearsOfExperience || doctorProfile.yearsOfExperience;
      doctorProfile.clinicDetails = req.body.clinicDetails || doctorProfile.clinicDetails;
      doctorProfile.homeVisitDetails = req.body.homeVisitDetails || doctorProfile.homeVisitDetails;

      // Admin can update doctor verification status
      if (req.body.status) {
        doctorProfile.verificationUploads = {
          ...doctorProfile.verificationUploads,
          status: req.body.status, // "Pending" | "Approved" | "Rejected"
        };
      }

      await doctorProfile.save();
    }
  }

  if (user.role === "PetOwner" && user.petOwnerProfile) {
    const petOwnerProfile = await PetOwnerProfile.findById(user.petOwnerProfile);
    if (petOwnerProfile) {
      petOwnerProfile.address = {
        city: req.body.address?.city || petOwnerProfile.address.city,
        district: req.body.address?.district || petOwnerProfile.address.district,
        street: req.body.address?.street || petOwnerProfile.address.street,
      };
      await petOwnerProfile.save();
    }
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    fullName: updatedUser.fullName,
    email: updatedUser.email,
    phone: updatedUser.phone,
    role: updatedUser.role,
    doctorProfile: user.role === "Doctor" ? await DoctorProfile.findById(user.doctorProfile) : undefined,
    petOwnerProfile: user.role === "PetOwner" ? await PetOwnerProfile.findById(user.petOwnerProfile) : undefined,
  });
});

// Add this function to your userController.js

// ✅ Add this controller to get ALL DOCTORS (Admin Only)
const getAllDoctors = asyncHandler(async (req, res) => {
  // Find users with role "Doctor" and populate their doctorProfile
  const doctors = await User.find({ role: "Doctor" })
    .select("-password") // Exclude password
    .populate({
      path: "doctorProfile",
      model: DoctorProfile,
      populate: {
        path: 'userId', // Optional: also populate back to user basic info
        select: 'fullName email phone'
      }
    })
    .lean(); // Use lean() for better performance

  if (doctors.length === 0) {
    return res.status(404).json({ 
      message: "No doctors found" 
    });
  }

  res.status(200).json({
    success: true,
    count: doctors.length,
    doctors
  });
});


export {
  createUser,
  loginUser,
  logoutCurrentUser,
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  deleteUserById,
  getUserById,
  updateUserById,
  createProfile,
  getAllDoctors,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  checkVerified
};