// controllers/appointmentController.js
import asyncHandler from "express-async-handler";
import DoctorAppointment from "../models/doctorAppointment.js";
import MedicalHistory from "../models/medicalHistory.js";

/*
  req.userInfo example:
  {
    _id: "695699e5666716788909fc97",
    fullName: "orange",
    email: "orange@gmail.com",
    phone: "03267146697",
    role: "PetOwner" | "Doctor" | "Admin"
  }

  doctorId & ownerId in DoctorAppointment both ref "User".
*/

// -------------------- CREATE (C) --------------------
// @desc   Pet Owner creates appointment
// @route  POST /api/appointments
// @access Private (PetOwner)
const createAppointment = asyncHandler(async (req, res) => {
  const {
    doctorId,
    petId,
    appointmentDate,
    appointmentTime,
    charges,
    appointmentType,
  } = req.body;

  // ✅ SAFETY CHECK: Ensure user is authenticated
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error('Authentication required. Please login again.');
  }

  const effectiveOwnerId = req.user._id;

  const appointment = await DoctorAppointment.create({
    doctorId,
    petId,
    ownerId: effectiveOwnerId,
    appointmentDate,
    appointmentTime,
    charges,
    appointmentType,
    status: "Scheduled",
  });

  res.status(201).json({
    success: true,
    message: "Appointment created successfully",
    appointment,
  });
});

// -------------------- READ (R) --------------------

// @desc   Get all appointments (admin)
// @route  GET /api/appointments
// @access Private (Admin)
const getAppointments = asyncHandler(async (req, res) => {
  const { doctorId, petId, ownerId, status } = req.query;

  const filter = {};
  if (doctorId) filter.doctorId = doctorId;
  if (petId) filter.petId = petId;
  if (ownerId) filter.ownerId = ownerId;
  if (status) filter.status = status;

  const appointments = await DoctorAppointment.find(filter)
    .populate("doctorId", "fullName email phone role")
    .populate("petId")
    .populate("ownerId", "fullName email phone role")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: appointments.length,
    appointments,
  });
});

// @desc   Get doctor's own appointments
// @route  GET /api/appointments/doctor
// @access Private (Doctor)
const getDoctorAppointments = asyncHandler(async (req, res) => {
  const userInfo = req.user;

  if (!userInfo || userInfo.role !== "Doctor") {
    res.status(403);
    throw new Error("Not authorized as Doctor");
  }

  const doctorId = userInfo._id;

  const { status } = req.query;
  const filter = { doctorId };
  if (status) filter.status = status;

  const appointments = await DoctorAppointment.find(filter)
    .populate("petId")
    .populate("ownerId", "fullName email phone")
    .sort({ appointmentDate: 1, appointmentTime: 1 });

  res.json({
    success: true,
    count: appointments.length,
    appointments,
  });
});

// @desc   Get pet owner's own appointments
// @route  GET /api/appointments/owner
// @access Private (PetOwner)
const getOwnerAppointments = asyncHandler(async (req, res) => {
  const userInfo = req.user;

  if (!userInfo || userInfo.role !== "PetOwner") {
    res.status(403);
    throw new Error("Not authorized as Pet Owner");
  }

  const ownerId = userInfo._id;

  const { status } = req.query;
  const filter = { ownerId };
  if (status) filter.status = status;

  const appointments = await DoctorAppointment.find(filter)
    .populate("doctorId", "fullName email phone")
    .populate("petId")
    .sort({ appointmentDate: 1, appointmentTime: 1 });

  res.json({
    success: true,
    count: appointments.length,
    appointments,
  });
});

// @desc   Get appointment by ID
// @route  GET /api/appointments/:id
// @access Private
const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await DoctorAppointment.findById(req.params.id)
    .populate("doctorId", "fullName email phone role")
    .populate("petId")
    .populate("ownerId", "fullName email phone role");

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  res.json({
    success: true,
    appointment,
  });
});

// -------------------- UPDATE (U) --------------------

// @desc   Doctor response (accept / reschedule / cancel)
// @route  PUT /api/appointments/:id/doctor-response
// @access Private (Doctor)
const doctorResponse = asyncHandler(async (req, res) => {
  const { status, appointmentDate, appointmentTime } = req.body;

  const appointment = await DoctorAppointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  if (status) appointment.status = status;
  if (appointmentDate) appointment.appointmentDate = appointmentDate;
  if (appointmentTime) appointment.appointmentTime = appointmentTime;

  const updated = await appointment.save();

  res.json({
    success: true,
    message: "Doctor response updated",
    appointment: updated,
  });
});

// @desc   Pet owner response (accept / cancel)
// @route  PUT /api/appointments/:id/owner-response
// @access Private (PetOwner)
const ownerResponse = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const appointment = await DoctorAppointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  if (!["Scheduled", "Cancelled","Accepted"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status for owner response");
  }

  appointment.status = status;

  const updated = await appointment.save();

  res.json({
    success: true,
    message: "Owner response updated",
    appointment: updated,
  });
});

// @desc   Mark appointment paid
// @route  PUT /api/appointments/:id/pay
// @access Private
const markAppointmentPaid = asyncHandler(async (req, res) => {
  const { isPaid } = req.body;

  const appointment = await DoctorAppointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  appointment.isPaid = Boolean(isPaid);

  const updated = await appointment.save();

  res.json({
    success: true,
    message: "Appointment payment status updated",
    appointment: updated,
  });
});

// @desc   Complete appointment and create medical history
// @route  PUT /api/appointments/:id/complete
// @access Private (Doctor)
const completeAppointment = asyncHandler(async (req, res) => {
  const { diagnosis, treatment, prescriptions } = req.body;

  const appointment = await DoctorAppointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  appointment.diagnosis = diagnosis;
  appointment.treatment = treatment;
  appointment.prescriptions = prescriptions;
  appointment.status = "Completed";

  const updated = await appointment.save();

  const history = await MedicalHistory.create({
    petId: appointment.petId,
    doctorId: appointment.doctorId,
    appointmentId: appointment._id,
    visitDate: appointment.appointmentDate || new Date(),
  });

  res.json({
    success: true,
    message: "Appointment completed and medical history created",
    appointment: updated,
    history,
  });
});

// -------------------- DELETE (D) --------------------

// @desc   Cancel appointment (soft delete)
// @route  DELETE /api/appointments/:id
// @access Private
const deleteOrCancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await DoctorAppointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  appointment.status = "Cancelled";

  const updated = await appointment.save();

  res.json({
    success: true,
    message: "Appointment cancelled",
    appointment: updated,
  });
});

// -------------------- EXPORTS --------------------
export {
  createAppointment,
  getAppointments,
  getDoctorAppointments,
  getOwnerAppointments,
  getAppointmentById,
  doctorResponse,
  ownerResponse,
  markAppointmentPaid,
  completeAppointment,
  deleteOrCancelAppointment,
};
