// models/DoctorProfile.js
import mongoose from "mongoose";

const doctorProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  pvmcRegistrationNumber: { type: String, required: true },
  image: { type: String, required: true },
  degreeName: { type: String, default: "DVM" },
  yearsOfExperience: { type: Number },
  specialization: { type: String, enum: ["Cats", "Dogs", "Birds"] },

  servicesOffered: {
    videoConsultation: { type: Boolean, default: false },
    clinicConsultation: { type: Boolean, default: false },
    homeVisit: { type: Boolean, default: false },
  },

  clinicDetails: {
    clinicName: String,
    clinicCity: { type: String, required: true },
    clinicDistrict: { type: String, required: true },
    clinicStreet: { type: String, required: true },
    googleMapLocation: String,
    startTime: String,
    endTime: String,
  },

  homeVisitDetails: {
    areasCovered: [String],
    charges: Number,
  },

  verificationUploads: {
    veterinaryLicense: String,
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  },
}, { timestamps: true });

export default mongoose.model("DoctorProfile", doctorProfileSchema);

