// src/pages/doctor/CompleteAppointment.jsx - Clean Professional Version
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useGetAppointmentDetailsQuery, useCompleteAppointmentMutation } from "../../redux/api/appointmentApiSlice";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import moment from "moment";
import { toast } from "react-toastify";

const CompleteAppointment = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    diagnosis: "",
    treatment: "",
    prescriptions: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, error } = useGetAppointmentDetailsQuery(appointmentId);
  const [completeAppointment] = useCompleteAppointmentMutation();

  const appointment = data?.appointment || data?.data?.appointment || null;

  useEffect(() => {
    if (appointment?.diagnosis || appointment?.treatment || appointment?.prescriptions) {
      setFormData({
        diagnosis: appointment.diagnosis || "",
        treatment: appointment.treatment || "",
        prescriptions: appointment.prescriptions || "",
      });
    }
  }, [appointment]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.diagnosis.trim()) {
      newErrors.diagnosis = "Diagnosis is required";
    }
    if (!formData.treatment.trim()) {
      newErrors.treatment = "Treatment details are required";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      await completeAppointment({
        appointmentId,
        ...formData,
      }).unwrap();

      toast.success("Appointment completed successfully! Medical record created.");
      setTimeout(() => {
        navigate("/doctor/doctor-appointments");
      }, 1500);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to complete appointment");
      console.error("Error completing appointment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loader />;
  
  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Appointment Not Found</h1>
            <p className="text-gray-600 mb-8">The appointment you're trying to complete doesn't exist or you don't have access to it.</p>
            <Link 
              to="/doctor/doctor-appointments" 
              className="inline-flex items-center px-6 py-3 bg-navigray text-white rounded-lg hover:bg-navigray-dark font-medium transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Appointments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/doctor/doctor-appointments" 
            className="inline-flex items-center text-navigray hover:text-navigray-dark font-medium mb-6"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Appointments
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Complete Appointment</h1>
              <p className="text-gray-600 mt-2">Create medical record for completed appointment</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Appointment ID</div>
              <div className="font-mono text-lg font-semibold">{appointment._id}</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-navigray to-navigray-dark px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Medical Record</h2>
                      <p className="text-navigray-light">Enter consultation details</p>
                    </div>
                  </div>
                  <div className="bg-white/20 px-4 py-2 rounded-lg">
                    <span className="text-white font-semibold">Step 3/3</span>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {/* Diagnosis Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-lg font-semibold text-gray-900 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      Diagnosis *
                    </label>
                    {errors.diagnosis && (
                      <span className="text-sm text-red-600">{errors.diagnosis}</span>
                    )}
                  </div>
                  <textarea
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleChange}
                    placeholder="Enter detailed diagnosis, symptoms observed, test results..."
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray transition-colors ${
                      errors.diagnosis ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                </div>

                {/* Treatment Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-lg font-semibold text-gray-900 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                      Treatment Administered *
                    </label>
                    {errors.treatment && (
                      <span className="text-sm text-red-600">{errors.treatment}</span>
                    )}
                  </div>
                  <textarea
                    name="treatment"
                    value={formData.treatment}
                    onChange={handleChange}
                    placeholder="Describe procedures, vaccinations, tests performed..."
                    rows={5}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray transition-colors ${
                      errors.treatment ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                </div>

                {/* Prescriptions Section */}
                <div className="space-y-4">
                  <label className="block text-lg font-semibold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Prescriptions & Follow-up
                  </label>
                  <textarea
                    name="prescriptions"
                    value={formData.prescriptions}
                    onChange={handleChange}
                    placeholder="Medications, dosage, frequency, next visit date..."
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray transition-colors"
                  />
                  <p className="text-sm text-gray-500">Optional: Enter prescription details and follow-up instructions</p>
                </div>

                {/* Action Buttons */}
                <div className="pt-8 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      to="/doctor/doctor-appointments"
                      className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-6 py-3 bg-navigray hover:bg-navigray-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader small />
                          <span className="ml-2">Saving...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Complete Appointment
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Appointment Details */}
          <div className="space-y-6">
            {/* Appointment Summary Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Appointment Summary
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Date</span>
                  <span className="font-medium">{moment(appointment.appointmentDate).format("MMMM D, YYYY")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Time</span>
                  <span className="font-medium">{appointment.appointmentTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Type</span>
                  <span className="font-medium">{appointment.appointmentType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Charges</span>
                  <span className="font-medium text-navigray">{appointment.charges} PKR</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    appointment.status === "Accepted" ? "bg-blue-100 text-blue-800" : 
                    appointment.status === "Completed" ? "bg-green-100 text-green-800" : 
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Pet Information Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Pet Information
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pet Name</p>
                  <p className="font-medium">{appointment.petId?.petName || "Not named"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Type & Breed</p>
                  <p className="font-medium">{appointment.petId?.petType || "—"} • {appointment.petId?.breed || "Mixed"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Age</p>
                  <p className="font-medium">{appointment.petId?.age || "—"} years</p>
                </div>
                {appointment.petId?.petImages && (
                  <div className="mt-4">
                    <img
                      src={appointment.petId.petImages}
                      alt={appointment.petId.petName}
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Owner Information Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Owner Information
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Name</p>
                  <p className="font-medium">{appointment.ownerId?.fullName || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium text-sm">{appointment.ownerId?.email || "—"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteAppointment;