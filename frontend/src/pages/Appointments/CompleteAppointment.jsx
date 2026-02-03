// src/pages/doctor/CompleteAppointment.jsx - ✅ FULL PAGE (Not Modal)
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useGetAppointmentDetailsQuery, useCompleteAppointmentMutation } from "../../redux/api/appointmentApiSlice";
import Loader from "../../components/Loader";
import moment from "moment";

const CompleteAppointment = () => {
  const { appointmentId } = useParams();
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [prescriptions, setPrescriptions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: appointment, isLoading, error } = useGetAppointmentDetailsQuery(appointmentId);
  const [completeAppointment] = useCompleteAppointmentMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await completeAppointment({
        appointmentId,
        diagnosis,
        treatment,
        prescriptions,
      }).unwrap();

      // ✅ Redirect to appointments list or show success
      window.location.href = "/doctor/doctor-appointments";
    } catch (error) {
      console.error("❌ Error completing appointment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loader />;
  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="text-6xl mb-4">😢</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Appointment Not Found</h1>
          <Link to="/doctor/doctor-appointments" className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold">
            ← Back to Appointments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Form */}
          <div className="lg:w-2/3 bg-white rounded-3xl shadow-2xl p-12">
            <div className="text-center mb-12">
              <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">✅</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text mb-4">
                Complete Appointment
              </h1>
              <div className="flex flex-wrap gap-4 justify-center text-xl">
                <span className="px-6 py-3 bg-emerald-100 text-emerald-800 rounded-2xl font-bold">
                  {appointment.petId?.petName || appointment.petId?.petType}
                </span>
                <span className="px-6 py-3 bg-blue-100 text-blue-800 rounded-2xl font-bold">
                  {appointment.appointmentType}
                </span>
                <span className="px-6 py-3 bg-orange-100 text-orange-800 rounded-2xl font-bold">
                  {moment(appointment.appointmentDate).format("MMM DD, YYYY")}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Diagnosis */}
              <div>
                <label className="block text-xl font-bold text-gray-800 mb-4">
                  🩺 Diagnosis
                </label>
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Enter detailed diagnosis, symptoms observed, test results..."
                  rows={5}
                  className="w-full p-6 border-2 border-gray-200 rounded-3xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 resize-vertical transition-all duration-300 text-lg font-medium"
                  required
                />
              </div>

              {/* Treatment */}
              <div>
                <label className="block text-xl font-bold text-gray-800 mb-4">
                  💊 Treatment Administered
                </label>
                <textarea
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  placeholder="Describe procedures, vaccinations, tests performed..."
                  rows={4}
                  className="w-full p-6 border-2 border-gray-200 rounded-3xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 resize-vertical transition-all duration-300 text-lg font-medium"
                  required
                />
              </div>

              {/* Prescriptions */}
              <div>
                <label className="block text-xl font-bold text-gray-800 mb-4">
                  💉 Prescriptions & Follow-up
                </label>
                <textarea
                  value={prescriptions}
                  onChange={(e) => setPrescriptions(e.target.value)}
                  placeholder="Medications, dosage, frequency, next visit date..."
                  rows={4}
                  className="w-full p-6 border-2 border-gray-200 rounded-3xl focus:ring-4 focus:ring-pink-200 focus:border-pink-400 resize-vertical transition-all duration-300 text-lg font-medium"
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-12">
                <Link
                  to={`/doctor/doctor-appointments`}
                  className="flex-1 px-12 py-6 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-3xl transition-all duration-300 shadow-xl hover:shadow-2xl text-xl flex items-center justify-center h-16"
                >
                  ← Back to Appointments
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-12 py-6 bg-gradient-to-r from-emerald-500 via-emerald-600 to-pink-500 hover:from-emerald-600 hover:via-emerald-700 hover:to-pink-600 text-white font-bold rounded-3xl transition-all duration-300 shadow-2xl hover:shadow-3xl text-xl flex items-center justify-center gap-3 h-16 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader small />
                      Completing...
                    </>
                  ) : (
                    <>
                      ✅ Complete & Save Medical Record
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteAppointment;
