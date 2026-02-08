import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import {
  useGetUserPetsQuery,
} from "../../redux/api/petApiSlice";
import {
  useCreateAppointmentMutation,
} from "../../redux/api/appointmentApiSlice";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const CreateAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const { data: pets = [], isLoading: petsLoading, error: petsError } = useGetUserPetsQuery();
  const [createAppointment, { isLoading: creating }] = useCreateAppointmentMutation();

  const [formData, setFormData] = useState({
    petId: "",
    appointmentDate: "",
    appointmentTime: "",
    charges: "",
    appointmentType: "",
  });

  const handlePetChange = (e) => {
    setFormData((prev) => ({ ...prev, petId: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.petId || !formData.appointmentDate || !formData.appointmentTime || !formData.appointmentType) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await createAppointment({
        doctorId,
        petId: formData.petId,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        charges: parseFloat(formData.charges) || 0,
        appointmentType: formData.appointmentType,
      }).unwrap();

      toast.success("Appointment created successfully!");
      navigate("/petowner/owner-appointments");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create appointment");
    }
  };

  if (petsLoading) return <Loader />;
  if (petsError) return <Message variant="danger">Error loading pets</Message>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
            <p className="mt-2 text-gray-600">
              Schedule a visit for your pet with the veterinarian
            </p>
          </div>
          
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mt-4 md:mt-0 flex items-center text-navigray hover:text-navigray-dark font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Appointment Details</h2>
            <p className="text-gray-600 mt-2">
              Fill in the details to schedule your appointment
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* Pet Selection */}
            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Select Your Pet <span className="text-red-500">*</span>
              </label>
              
              {/* Pet Selection Grid */}
              {pets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {pets.map((pet) => (
                    <div
                      key={pet._id}
                      className={`relative cursor-pointer rounded-xl border-2 transition-all duration-200 ${
                        formData.petId === pet._id
                          ? "border-navigray bg-navigray/5 ring-2 ring-navigray/20"
                          : "border-gray-200 hover:border-navigray/50 hover:bg-gray-50"
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, petId: pet._id }))}
                    >
                      <div className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100">
                              {pet.petImages ? (
                                <img 
                                  src={pet.petImages} 
                                  alt={pet.petName} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-navigray/10 flex items-center justify-center">
                                  <svg className="w-8 h-8 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {pet.petName || pet.petType}
                            </h3>
                            <div className="mt-1 space-y-1">
                              {pet.petType && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-navigray/10 text-navigray">
                                  {pet.petType}
                                </span>
                              )}
                              {pet.breed && (
                                <p className="text-sm text-gray-600">{pet.breed}</p>
                              )}
                            </div>
                          </div>
                          {formData.petId === pet._id && (
                            <div className="flex-shrink-0">
                              <div className="w-6 h-6 rounded-full bg-navigray flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 mb-4">No pets found. Please add a pet first.</p>
                  <button
                    type="button"
                    onClick={() => navigate("/petowner/createpet")}
                    className="text-navigray hover:text-navigray-dark font-medium flex items-center justify-center mx-auto"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Add New Pet
                  </button>
                </div>
              )}

              {/* Selected Pet Display */}
              {formData.petId && pets.find(p => p._id === formData.petId) && (
                <div className="mt-4 p-4 bg-navigray/5 rounded-xl border border-navigray/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {pets.find(p => p._id === formData.petId)?.petImages && (
                        <img
                          src={pets.find(p => p._id === formData.petId).petImages}
                          alt={pets.find(p => p._id === formData.petId).petName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          Selected: {pets.find(p => p._id === formData.petId).petName || 
                                     pets.find(p => p._id === formData.petId).petType}
                        </p>
                        <p className="text-sm text-gray-600">
                          {pets.find(p => p._id === formData.petId).breed && 
                           `${pets.find(p => p._id === formData.petId).breed} • `}
                          {pets.find(p => p._id === formData.petId).age && 
                           `${pets.find(p => p._id === formData.petId).age} years old`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, petId: "" }))}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.appointmentDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, appointmentDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.appointmentTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, appointmentTime: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                  required
                />
              </div>
            </div>

            {/* Appointment Type & Charges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.appointmentType}
                  onChange={(e) => setFormData(prev => ({ ...prev, appointmentType: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Home Visit">Home Visit</option>
                  <option value="Video Call">Video Call</option>
                  <option value="On Clinic">On Clinic</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Charges (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">PKR</span>
                  <input
                    type="number"
                    value={formData.charges}
                    onChange={(e) => setFormData(prev => ({ ...prev, charges: e.target.value }))}
                    placeholder="0.00"
                    className="w-full pl-12 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || !formData.petId || pets.length === 0}
                className="px-6 py-3 bg-navigray text-white rounded-lg font-medium hover:bg-navigray-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navigray disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
              >
                {creating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Book Appointment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact our support team for assistance with scheduling.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateAppointment;