import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import {
  useGetUserPetsQuery,
} from "../../redux/api/petApiSlice";
import {
  useCreateAppointmentMutation,
} from "../../redux/api/appointmentApiSlice";
import { useGetProfileQuery, useGetUserDetailsQuery } from "../../redux/api/userApiSlice";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const CreateAppointment = () => {
  const { doctorId } = useParams(); // This is the doctor's USER ID
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  // Get current user's profile to check completion status
  const { data: userProfile, isLoading: profileLoading } = useGetProfileQuery();
  const { data: pets = [], isLoading: petsLoading, error: petsError } = useGetUserPetsQuery();
  
  // Get doctor's user details - this returns the user object (which may have doctor profile populated)
  const { data: doctorUser, isLoading: doctorLoading, error: doctorError } = useGetUserDetailsQuery(doctorId);
  
  const [createAppointment, { isLoading: creating }] = useCreateAppointmentMutation();

  const [formData, setFormData] = useState({
    petId: "",
    appointmentDate: "",
    appointmentTime: "",
    charges: "",
    appointmentType: "",
  });

  const [selectedServiceDetails, setSelectedServiceDetails] = useState(null);

  // Check if profile is complete
  const isProfileComplete = userProfile;

  // Extract doctor profile from user object (assuming it's populated)
  const doctorProfile = doctorUser?.doctorProfile || doctorUser?.profile || {};

  // Get available appointment types based on doctor's services
  const getAvailableAppointmentTypes = () => {
    if (!doctorProfile?.servicesOffered) return [];
    
    const types = [];
    if (doctorProfile.servicesOffered.videoConsultation?.available) {
      types.push({
        value: "Video Call",
        label: "Video Call",
        serviceKey: "videoConsultation",
        details: doctorProfile.servicesOffered.videoConsultation
      });
    }
    if (doctorProfile.servicesOffered.clinicConsultation?.available) {
      types.push({
        value: "On Clinic",
        label: "Clinic Visit",
        serviceKey: "clinicConsultation",
        details: doctorProfile.servicesOffered.clinicConsultation
      });
    }
    if (doctorProfile.servicesOffered.homeVisit?.available) {
      types.push({
        value: "Home Visit",
        label: "Home Visit",
        serviceKey: "homeVisit",
        details: doctorProfile.servicesOffered.homeVisit
      });
    }
    return types;
  };

  const availableTypes = getAvailableAppointmentTypes();

  // Get doctor's name from user object
  const doctorName = doctorUser?.fullName || doctorUser?.username || "the veterinarian";

  // Update charges when appointment type changes
  useEffect(() => {
    if (formData.appointmentType && availableTypes.length > 0) {
      const selectedType = availableTypes.find(
        type => type.value === formData.appointmentType
      );
      
      if (selectedType) {
        setSelectedServiceDetails(selectedType);
        
        // If it's a home visit, check if home visit has its own charges
        if (formData.appointmentType === "Home Visit" && doctorProfile.homeVisitDetails?.charges) {
          setFormData(prev => ({
            ...prev,
            charges: doctorProfile.homeVisitDetails.charges
          }));
        } else {
          // Use charges from servicesOffered
          setFormData(prev => ({
            ...prev,
            charges: selectedType.details?.charges || ""
          }));
        }
      }
    } else {
      setSelectedServiceDetails(null);
      setFormData(prev => ({ ...prev, charges: "" }));
    }
  }, [formData.appointmentType, availableTypes, doctorProfile.homeVisitDetails]);

  const handlePetChange = (e) => {
    setFormData((prev) => ({ ...prev, petId: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Double-check profile completion before submission
    if (!isProfileComplete) {
      toast.error("Please complete your profile first");
      navigate("/petowner/profile");
      return;
    }

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

  // Show loader while profile or doctor data is loading
  if (profileLoading || petsLoading || doctorLoading) return <Loader />;
  
  // Show error if pets loading failed
  if (petsError) return <Message variant="danger">Error loading pets</Message>;
  
  // Show error if doctor loading failed
  if (doctorError) return <Message variant="danger">Error loading doctor information</Message>;

  // If doctor doesn't offer any services
  if (availableTypes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-8 py-6 bg-orange-50 border-b border-orange-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-orange-800">Services Not Available</h2>
                  <p className="text-orange-700">This doctor hasn't added any services yet</p>
                </div>
              </div>
            </div>

            <div className="p-8 text-center">
              <div className="mb-8">
                <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">🩺</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Services Available
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  The doctor you're trying to book hasn't configured their services yet. 
                  Please try another doctor or contact support.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/doctors"
                  className="px-8 py-4 bg-navigray hover:bg-navigray-dark text-white rounded-xl font-semibold transition-colors"
                >
                  Browse Other Doctors
                </Link>
                <button
                  onClick={() => navigate(-1)}
                  className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If profile is incomplete, show warning and redirect option
  if (!isProfileComplete) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-8 py-6 bg-yellow-50 border-b border-yellow-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-yellow-800">Profile Incomplete</h2>
                  <p className="text-yellow-700">Please complete your profile before booking an appointment</p>
                </div>
              </div>
            </div>

            <div className="p-8 text-center">
              <div className="mb-8">
                <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Why Complete Your Profile?
                </h3>
                <div className="space-y-2 text-gray-600 max-w-md mx-auto">
                  <p className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Faster appointment booking
                  </p>
                  <p className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Better communication with veterinarians
                  </p>
                  <p className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Access to medical records
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/petowner/profile"
                  className="px-8 py-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Complete Profile Now
                </Link>
                <button
                  onClick={() => navigate(-1)}
                  className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
            <p className="mt-2 text-gray-600">
              Schedule a visit for your pet with {doctorName}
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

        {/* Doctor Profile Card */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-navigray to-navigray-dark px-6 py-4">
            <h2 className="text-xl font-bold text-white">Doctor Information</h2>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Doctor Image */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-xl overflow-hidden border-4 border-navigray/20 shadow-md">
                  {doctorProfile.image ? (
                    <img 
                      src={doctorProfile.image} 
                      alt={doctorName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-navigray/10 flex items-center justify-center">
                      <svg className="w-16 h-16 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Doctor Details */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Full Name</p>
                  <p className="font-semibold text-gray-900">{doctorName}</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Specialization</p>
                  <p className="font-semibold text-gray-900">
                    {doctorProfile?.specialization || "General Practice"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Experience</p>
                  <p className="font-semibold text-gray-900">
                    {doctorProfile?.yearsOfExperience ? `${doctorProfile.yearsOfExperience} years` : "Not specified"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Degree</p>
                  <p className="font-semibold text-gray-900">
                    {doctorProfile?.degreeName || "Not specified"}
                  </p>
                </div>

                {doctorProfile?.pvmcRegistrationNumber && (
                  <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                    <p className="text-sm text-gray-600 mb-1">PVMC Registration</p>
                    <p className="font-semibold text-gray-900">{doctorProfile.pvmcRegistrationNumber}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Clinic Details Card */}
        {doctorProfile?.clinicDetails && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Clinic Information</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctorProfile.clinicDetails.clinicName && (
                  <div className="bg-purple-50 rounded-xl p-4">
                    <p className="text-sm text-purple-600 mb-1">Clinic Name</p>
                    <p className="font-semibold text-gray-900">{doctorProfile.clinicDetails.clinicName}</p>
                  </div>
                )}

                {(doctorProfile.clinicDetails.clinicCity || doctorProfile.clinicDetails.clinicDistrict) && (
                  <div className="bg-purple-50 rounded-xl p-4">
                    <p className="text-sm text-purple-600 mb-1">Location</p>
                    <p className="font-semibold text-gray-900">
                      {doctorProfile.clinicDetails.clinicCity}
                      {doctorProfile.clinicDetails.clinicDistrict && `, ${doctorProfile.clinicDetails.clinicDistrict}`}
                    </p>
                  </div>
                )}

                {doctorProfile.clinicDetails.clinicStreet && (
                  <div className="bg-purple-50 rounded-xl p-4">
                    <p className="text-sm text-purple-600 mb-1">Street Address</p>
                    <p className="font-semibold text-gray-900">{doctorProfile.clinicDetails.clinicStreet}</p>
                  </div>
                )}

                {(doctorProfile.clinicDetails.startTime && doctorProfile.clinicDetails.endTime) && (
                  <div className="bg-purple-50 rounded-xl p-4">
                    <p className="text-sm text-purple-600 mb-1">Working Hours</p>
                    <p className="font-semibold text-gray-900">
                      {doctorProfile.clinicDetails.startTime} – {doctorProfile.clinicDetails.endTime}
                    </p>
                  </div>
                )}

                {doctorProfile.clinicDetails.googleMapLocation && (
                  <div className="bg-purple-50 rounded-xl p-4 md:col-span-2">
                    <a
                      href={doctorProfile.clinicDetails.googleMapLocation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 font-medium flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      View on Google Maps
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Home Visit Details Card */}
        {doctorProfile?.homeVisitDetails && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Home Visit Information</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctorProfile.homeVisitDetails.areasCovered?.length > 0 && (
                  <div className="bg-indigo-50 rounded-xl p-4 md:col-span-2">
                    <p className="text-sm text-indigo-600 mb-2">Areas Covered</p>
                    <div className="flex flex-wrap gap-2">
                      {doctorProfile.homeVisitDetails.areasCovered.map((area, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-white rounded-full text-sm text-indigo-700 border border-indigo-200"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {doctorProfile.homeVisitDetails.charges && (
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <p className="text-sm text-indigo-600 mb-1">Base Charges</p>
                    <p className="font-semibold text-gray-900">PKR {doctorProfile.homeVisitDetails.charges}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Services Cards */}
        {availableTypes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availableTypes.map((service) => (
                <div
                  key={service.value}
                  className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    formData.appointmentType === service.value
                      ? 'border-navigray ring-2 ring-navigray/20'
                      : 'border-gray-200 hover:border-navigray/50'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, appointmentType: service.value }))}
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        service.value === "Video Call" ? "bg-blue-100" :
                        service.value === "On Clinic" ? "bg-purple-100" : "bg-indigo-100"
                      }`}>
                        <span className="text-xl">
                          {service.value === "Video Call" ? "📹" :
                           service.value === "On Clinic" ? "🏥" : "🏠"}
                        </span>
                      </div>
                      {formData.appointmentType === service.value && (
                        <div className="w-6 h-6 rounded-full bg-navigray flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.label}</h3>
                    
                    {service.details?.description && (
                      <p className="text-sm text-gray-600 mb-3">{service.details.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Charges</span>
                      <span className="font-bold text-navigray">
                        PKR {service.value === "Home Visit" && doctorProfile.homeVisitDetails?.charges
                          ? doctorProfile.homeVisitDetails.charges
                          : service.details?.charges || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
              
              {/* Pet Selection Cards */}
              {pets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

            {/* Appointment Type & Charges - Display Only */}
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
                  {availableTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Charges (Auto-calculated)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">PKR</span>
                  <input
                    type="text"
                    value={formData.charges}
                    readOnly
                    disabled
                    className="w-full pl-12 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                  />
                </div>
                {selectedServiceDetails && (
                  <p className="text-xs text-gray-500 mt-1">
                    Charges are based on the selected service type
                  </p>
                )}
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