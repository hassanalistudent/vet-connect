import { useState } from "react";
import { useParams } from "react-router-dom";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import {
  useGetUserPetsQuery, // ✅ FIXED: useGetMyPetsQuery for current user
} from "../../redux/api/petApiSlice";
import {
  useCreateAppointmentMutation,
} from "../../redux/api/appointmentApiSlice";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const CreateAppointment = () => {
  const { doctorId } = useParams();
  const { userInfo } = useSelector((state) => state.auth);

  // ✅ FIXED: useGetMyPetsQuery() - loads CURRENT user's pets
  const { data: pets = [], isLoading: petsLoading } = useGetUserPetsQuery();
  const [createAppointment, { isLoading: creating }] = useCreateAppointmentMutation();

  const [formData, setFormData] = useState({
    petId: "",
    appointmentDate: "",
    appointmentTime: "",
    charges: "",
    appointmentType: "", // ✅ Will match backend enum
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
        appointmentType: formData.appointmentType, // ✅ Backend enum values
      }).unwrap();

      toast.success("Appointment created successfully!");
      setFormData({
        petId: "",
        appointmentDate: "",
        appointmentTime: "",
        charges: "",
        appointmentType: "",
      });
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create appointment");
    }
  };

  if (petsLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Book Appointment
          </h1>
          <p className="text-xl text-gray-600">Schedule a visit for your pet</p>
        </div>

        <div className="bg-white shadow-2xl rounded-3xl p-8 md:p-12 border border-pink-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Pet Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Your Pet <span className="text-pink-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.petId}
                  onChange={handlePetChange}
                  className="w-full p-4 pl-12 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-200 focus:border-pink-500 transition-all duration-300 text-lg font-medium bg-gradient-to-r from-pink-50 to-indigo-50"
                  required
                >
                  <option value="">Choose a pet...</option>
                  {pets.map((pet) => (
                    <option key={pet._id} value={pet._id}>
                      {pet.petName || pet.petType}
                    </option>
                  ))}
                </select>
                
                {formData.petId && pets.find(p => p._id === formData.petId) && (
                  <div className="absolute top-2 right-4 flex items-center space-x-3 bg-white px-3 py-2 rounded-xl shadow-md border">
                    {pets.find(p => p._id === formData.petId)?.petImages && (
                      <img
                        src={pets.find(p => p._id === formData.petId)?.petImages}
                        alt={pets.find(p => p._id === formData.petId)?.petName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-pink-300"
                      />
                    )}
                    <span className="text-sm font-semibold text-gray-800">
                      {pets.find(p => p._id === formData.petId)?.petName || 
                       pets.find(p => p._id === formData.petId)?.petType}
                    </span>
                  </div>
                )}
              </div>
              
              {pets.length > 0 && (
                <div className="mt-4 grid grid-cols-3 md:grid-cols-5 gap-2 max-h-24 overflow-y-auto p-2 bg-gray-50 rounded-xl">
                  {pets.slice(0, 8).map((pet) => (
                    <div
                      key={pet._id}
                      className={`flex flex-col items-center p-2 rounded-lg cursor-pointer transition-all group ${
                        formData.petId === pet._id
                          ? "bg-pink-100 border-2 border-pink-400 shadow-md"
                          : "hover:bg-pink-50"
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, petId: pet._id }))}
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-pink-300">
                        {pet.petImages ? (
                          <img src={pet.petImages} alt={pet.petName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-pink-200 to-indigo-200 flex items-center justify-center text-xs font-bold text-pink-600">
                            {pet.petType?.[0]}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-700 mt-1 truncate w-full text-center max-w-[60px]">
                        {pet.petName || pet.petType}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

           {/* Date & Time */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-3">
      Appointment Date <span className="text-pink-500">*</span>
    </label>
    <input
      type="date"
      value={formData.appointmentDate}
      onChange={(e) => setFormData(prev => ({ ...prev, appointmentDate: e.target.value }))}
      min={new Date().toISOString().split('T')[0]}
      className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-200 focus:border-pink-500 transition-all duration-300 text-lg font-medium"
      required
    />
  </div>

  {/* ✅ NEW: Native Time Input - No dropdown, full flexibility */}
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-3">
      Time <span className="text-pink-500">*</span>
    </label>
    <input
      type="time"
      value={formData.appointmentTime}
      onChange={(e) => setFormData(prev => ({ ...prev, appointmentTime: e.target.value }))}
      className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-200 focus:border-pink-500 transition-all duration-300 text-lg font-medium bg-gradient-to-r from-pink-50 to-indigo-50"
      required
    />
  </div>
</div>

            {/* ✅ FIXED: Appointment Type - Matches Backend Schema */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Appointment Type <span className="text-pink-500">*</span>
                </label>
                <select
                  value={formData.appointmentType}
                  onChange={(e) => setFormData(prev => ({ ...prev, appointmentType: e.target.value }))}
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-200 focus:border-pink-500 transition-all duration-300 text-lg font-medium bg-gradient-to-r from-pink-50 to-indigo-50"
                  required
                >
                  <option value="">Select Type *</option>
                  {/* ✅ Backend Schema Values */}
                  <option value="Home Visit">🏠 Home Visit</option>
                  <option value="Video Call">📱 Video Call</option>
                  <option value="On Clinic">🏥 On Clinic</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Charges (PKR)
                </label>
                <input
                  type="number"
                  value={formData.charges}
                  onChange={(e) => setFormData(prev => ({ ...prev, charges: e.target.value }))}
                  placeholder="Enter charges"
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-200 focus:border-pink-500 transition-all duration-300 text-lg font-medium"
                  min="0"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-700 hover:to-indigo-700 text-white font-bold py-6 px-8 rounded-2xl text-xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? "Creating Appointment..." : "📅 Book Appointment Now"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAppointment;
