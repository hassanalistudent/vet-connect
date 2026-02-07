import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Loader from "../../components/Loader";
import {
  useGetProfileQuery,
  useCreateProfileMutation,
  useUpdateProfileMutation,
} from "../../redux/api/userApiSlice";
import { useUploadImageMutation } from "../../redux/api/uploadApiSlice";
import { toast } from "react-toastify";

const DoctorProfile = ({ userInfo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const profileImageInputRef = useRef(null);
  const licenseImageInputRef = useRef(null);
  
  // Initialize all state with proper defaults
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    pvmcRegistrationNumber: "",
    degreeName: "",
    yearsOfExperience: "",
    specialization: "",
    charges: "",
    image: null,
    verificationUploads: {
      veterinaryLicense: null,
      status: "Pending",
    },
  });

  // Services Offered
  const [servicesOffered, setServicesOffered] = useState({
    videoConsultation: false,
    clinicConsultation: false,
    homeVisit: false,
  });

  // Clinic Details
  const [clinicDetails, setClinicDetails] = useState({
    clinicName: "",
    clinicCity: "",
    clinicDistrict: "",
    clinicStreet: "",
    googleMapLocation: "",
    startTime: "",
    endTime: "",
  });

  // Home Visit Details - Now with individual input management
  const [homeVisitDetails, setHomeVisitDetails] = useState({
    areasCovered: [],
    charges: ""
  });
  
  // New area input for adding areas one by one
  const [newArea, setNewArea] = useState("");

  // API hooks
  const { data: profile, isLoading, refetch } = useGetProfileQuery();
  const [createProfile, { isLoading: creating }] = useCreateProfileMutation();
  const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation();
  const [uploadImage] = useUploadImageMutation();

  // Populate form with existing data
  useEffect(() => {
    if (profile?.doctorProfile) {
      setFormData(prev => ({
        ...prev,
        fullName: profile.fullName || "",
        phone: profile.phone || "",
        pvmcRegistrationNumber:
          profile.pvmcRegistrationNumber ||
          profile.doctorProfile.pvmcRegistrationNumber ||
          "",
        degreeName: profile.doctorProfile.degreeName || "",
        yearsOfExperience: profile.doctorProfile.yearsOfExperience || "",
        specialization: profile.doctorProfile.specialization || "",
        image: profile.doctorProfile.image || prev.image || null,
        verificationUploads: {
          veterinaryLicense:
            profile.doctorProfile.verificationUploads?.veterinaryLicense ||
            prev.verificationUploads?.veterinaryLicense ||
            null,
          status:
            profile.doctorProfile.verificationUploads?.status ||
            prev.verificationUploads?.status ||
            "Pending",
        },
      }));

      setServicesOffered(
        profile.doctorProfile.servicesOffered || {
          videoConsultation: false,
          clinicConsultation: false,
          homeVisit: false,
        }
      );

      setClinicDetails(
        profile.doctorProfile.clinicDetails || {
          clinicName: "",
          clinicCity: "",
          clinicDistrict: "",
          clinicStreet: "",
          googleMapLocation: "",
          startTime: "",
          endTime: "",
        }
      );

      setHomeVisitDetails(
        profile.doctorProfile.homeVisitDetails || {
          areasCovered: [],
          charges: "",
        }
      );
    }
  }, [profile]);

  const uploadProfileImageHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview image immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);

    // Upload to server
    const formDataUpload = new FormData();
    formDataUpload.append("image", file);
    try {
      const res = await uploadImage(formDataUpload).unwrap();
      toast.success("Profile image uploaded successfully");
      setFormData(prev => ({ ...prev, image: res.image }));
    } catch (error) {
      toast.error(error?.data?.message || error.error);
      // Revert to original image if upload fails
      setFormData(prev => ({ ...prev, image: profile?.doctorProfile?.image || null }));
    }
  };

  const verificationUploadImageHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview image immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        verificationUploads: {
          ...(prev.verificationUploads || { status: "Pending" }),
          veterinaryLicense: reader.result,
        },
      }));
    };
    reader.readAsDataURL(file);

    // Upload to server
    const formDataUpload = new FormData();
    formDataUpload.append("image", file);

    try {
      const res = await uploadImage(formDataUpload).unwrap();
      toast.success("License image uploaded successfully");
      setFormData(prev => ({
        ...prev,
        verificationUploads: {
          ...(prev.verificationUploads || { status: "Pending" }),
          veterinaryLicense: res.image,
        },
      }));
    } catch (error) {
      toast.error(error?.data?.message || error.error);
      // Revert to original image if upload fails
      setFormData(prev => ({
        ...prev,
        verificationUploads: {
          ...(prev.verificationUploads || { status: "Pending" }),
          veterinaryLicense: profile?.doctorProfile?.verificationUploads?.veterinaryLicense || null,
        },
      }));
    }
  };

  // Add new area
  const handleAddArea = () => {
    if (newArea.trim() === "") {
      toast.error("Please enter an area");
      return;
    }
    
    if (homeVisitDetails.areasCovered.includes(newArea.trim())) {
      toast.error("This area is already added");
      return;
    }
    
    setHomeVisitDetails(prev => ({
      ...prev,
      areasCovered: [...prev.areasCovered, newArea.trim()]
    }));
    setNewArea("");
  };

  // Remove area
  const handleRemoveArea = (areaToRemove) => {
    setHomeVisitDetails(prev => ({
      ...prev,
      areasCovered: prev.areasCovered.filter(area => area !== areaToRemove)
    }));
  };

  // Handle Enter key in area input
  const handleAreaKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddArea();
    }
  };

  // Create handler
  const createHandler = async (e) => {
    e.preventDefault();
    try {
      await createProfile({
        userId: userInfo?._id,
        ...formData,
        clinicDetails,
        servicesOffered,
        homeVisitDetails,
      }).unwrap();
      toast.success("Doctor profile created successfully!");
      refetch();
      setIsEditing(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create doctor profile");
    }
  };

  // Update handler
  const updateHandler = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        userId: userInfo?._id,
        ...formData,
        clinicDetails,
        servicesOffered,
        homeVisitDetails,
      }).unwrap();
      toast.success("Doctor profile updated successfully!");
      refetch();
      setIsEditing(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update doctor profile");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile?.doctorProfile) {
      // Reset form data to original profile data
      setFormData(prev => ({
        ...prev,
        fullName: profile.fullName || "",
        phone: profile.phone || "",
        pvmcRegistrationNumber:
          profile.pvmcRegistrationNumber ||
          profile.doctorProfile.pvmcRegistrationNumber ||
          "",
        degreeName: profile.doctorProfile.degreeName || "",
        yearsOfExperience: profile.doctorProfile.yearsOfExperience || "",
        specialization: profile.doctorProfile.specialization || "",
        image: profile.doctorProfile.image || prev.image || null,
      }));

      setServicesOffered(
        profile.doctorProfile.servicesOffered || {
          videoConsultation: false,
          clinicConsultation: false,
          homeVisit: false,
        }
      );

      setClinicDetails(
        profile.doctorProfile.clinicDetails || {
          clinicName: "",
          clinicCity: "",
          clinicDistrict: "",
          clinicStreet: "",
          googleMapLocation: "",
          startTime: "",
          endTime: "",
        }
      );

      setHomeVisitDetails(
        profile.doctorProfile.homeVisitDetails || {
          areasCovered: [],
          charges: "",
        }
      );
    }
  };

  if (isLoading) return <Loader />;

  const verificationImageUrl =
    formData.verificationUploads?.veterinaryLicense ||
    profile?.doctorProfile?.verificationUploads?.veterinaryLicense ||
    null;

  const verificationStatus =
    profile?.doctorProfile?.verificationUploads?.status ||
    formData.verificationUploads?.status ||
    "Pending";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Action Button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctor Profile</h1>
            <p className="mt-2 text-gray-600">
              {profile?.doctorProfile 
                ? "View and manage your professional profile" 
                : "Complete your profile to start accepting appointments"}
            </p>
          </div>
          
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 md:mt-0 bg-navigray text-white px-6 py-3 rounded-lg font-medium hover:bg-navigray-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navigray flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {profile?.doctorProfile ? "Update Profile" : "Complete Profile"}
            </button>
          )}
        </div>

        {isEditing ? (
          /* Edit Form */
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile?.doctorProfile ? "Update Profile" : "Complete Your Profile"}
                </h2>
                <button
                  onClick={handleCancel}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                Fill in your professional details to make your profile complete
              </p>
            </div>

            <form 
              onSubmit={profile?.doctorProfile ? updateHandler : createHandler}
              className="p-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Personal Information
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, phone: e.target.value }))
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          PVMC Registration Number *
                        </label>
                        <input
                          type="text"
                          value={formData.pvmcRegistrationNumber}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              pvmcRegistrationNumber: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Degree Name *
                        </label>
                        <input
                          type="text"
                          value={formData.degreeName}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, degreeName: e.target.value }))
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Specialization *
                        </label>
                        <select
                          value={formData.specialization}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              specialization: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                          required
                        >
                          <option value="">Select Specialization</option>
                          <option value="Cats">Cats</option>
                          <option value="Dogs">Dogs</option>
                          <option value="Birds">Birds</option>
                          <option value="Small Animals">Small Animals</option>
                          <option value="Exotic Animals">Exotic Animals</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Years of Experience *
                        </label>
                        <input
                          type="number"
                          value={formData.yearsOfExperience}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              yearsOfExperience: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                          required
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Services Offered */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Services Offered
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(servicesOffered).map(([key, value]) => (
                        <label key={key} className="flex items-center space-x-3 cursor-pointer">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) =>
                                setServicesOffered({
                                  ...servicesOffered,
                                  [key]: e.target.checked,
                                })
                              }
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                              value ? 'bg-navigray border-navigray' : 'border-gray-300'
                            }`}>
                              {value && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                          <span className="text-gray-700 capitalize">
                            {key.replace(/([A-Z])/g, ' $1')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Profile Image Upload with Preview */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Profile Photo
                    </h3>
                    <div className="flex flex-col items-center">
                      <div 
                        onClick={() => profileImageInputRef.current.click()}
                        className="relative w-48 h-48 rounded-full border-4 border-dashed border-gray-300 hover:border-navigray cursor-pointer transition-colors group bg-gray-50 flex items-center justify-center overflow-hidden"
                      >
                        {formData.image ? (
                          <>
                            <img
                              src={formData.image}
                              alt="Profile preview"
                              className="w-full h-full object-cover rounded-full"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">Change Photo</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-center">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <p className="text-gray-500">Click to upload</p>
                            <p className="text-sm text-gray-400">Recommended: Square image</p>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        ref={profileImageInputRef}
                        accept="image/*"
                        onChange={uploadProfileImageHandler}
                        className="hidden"
                      />
                      <p className="text-sm text-gray-500 mt-4">
                        Click on the circle above to upload your profile photo
                      </p>
                    </div>
                  </div>

                  {/* Clinic Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Clinic Details
                    </h3>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Clinic Name"
                        value={clinicDetails.clinicName}
                        onChange={(e) =>
                          setClinicDetails({
                            ...clinicDetails,
                            clinicName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="City"
                          value={clinicDetails.clinicCity}
                          onChange={(e) =>
                            setClinicDetails({
                              ...clinicDetails,
                              clinicCity: e.target.value,
                            })
                          }
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                        />
                        <input
                          type="text"
                          placeholder="District"
                          value={clinicDetails.clinicDistrict}
                          onChange={(e) =>
                            setClinicDetails({
                              ...clinicDetails,
                              clinicDistrict: e.target.value,
                            })
                          }
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                        />
                      </div>
                      
                      <input
                        type="text"
                        placeholder="Street Address"
                        value={clinicDetails.clinicStreet}
                        onChange={(e) =>
                          setClinicDetails({
                            ...clinicDetails,
                            clinicStreet: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                      />
                      
                      <input
                        type="text"
                        placeholder="Google Map Location URL"
                        value={clinicDetails.googleMapLocation}
                        onChange={(e) =>
                          setClinicDetails({
                            ...clinicDetails,
                            googleMapLocation: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Opening Time
                          </label>
                          <input
                            type="time"
                            value={clinicDetails.startTime}
                            onChange={(e) =>
                              setClinicDetails({
                                ...clinicDetails,
                                startTime: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Closing Time
                          </label>
                          <input
                            type="time"
                            value={clinicDetails.endTime}
                            onChange={(e) =>
                              setClinicDetails({
                                ...clinicDetails,
                                endTime: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Home Visit Details - New Design */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Home Visit Details
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Areas Covered
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newArea}
                        onChange={(e) => setNewArea(e.target.value)}
                        onKeyPress={handleAreaKeyPress}
                        placeholder="Enter area name"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                      />
                      <button
                        type="button"
                        onClick={handleAddArea}
                        className="bg-navigray text-white px-4 py-3 rounded-lg hover:bg-navigray-dark transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="ml-2">Add</span>
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Press Enter or click Add to include an area
                    </p>

                    {/* Display Added Areas */}
                    {homeVisitDetails.areasCovered.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Added Areas ({homeVisitDetails.areasCovered.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {homeVisitDetails.areasCovered.map((area, index) => (
                            <div
                              key={index}
                              className="flex items-center bg-navigray/10 text-navigray px-3 py-2 rounded-lg"
                            >
                              <span>{area}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveArea(area)}
                                className="ml-2 text-red-500 hover:text-red-700"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Home Visit Charges
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={homeVisitDetails.charges}
                        onChange={(e) =>
                          setHomeVisitDetails((prev) => ({
                            ...prev,
                            charges: e.target.value,
                          }))
                        }
                        className="w-full pl-8 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                        min="0"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* License Upload with Preview */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  License Verification
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Veterinary License
                    </label>
                    <div 
                      onClick={() => licenseImageInputRef.current.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-navigray transition-colors bg-gray-50"
                    >
                      {formData.verificationUploads?.veterinaryLicense ? (
                        <div className="relative">
                          <img
                            src={formData.verificationUploads.veterinaryLicense}
                            alt="License preview"
                            className="w-full max-h-64 object-contain rounded-lg mx-auto"
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 hover:opacity-100">
                            <span className="text-white font-medium">Change Image</span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-gray-600 mb-2">Click to upload license document</p>
                          <p className="text-sm text-gray-500">JPG, PNG, PDF up to 5MB</p>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={licenseImageInputRef}
                      accept="image/*,.pdf"
                      onChange={verificationUploadImageHandler}
                      className="hidden"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Upload a clear photo or scan of your veterinary license
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Status
                    </label>
                    <div className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                      verificationStatus === 'Approved' 
                        ? 'bg-green-100 text-green-800'
                        : verificationStatus === 'Rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {verificationStatus}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {verificationStatus === 'Pending' 
                        ? 'Your license is under review. Please allow 24-48 hours for verification.'
                        : verificationStatus === 'Approved'
                        ? 'Your license has been verified and approved.'
                        : 'Your license was rejected. Please upload a clearer image and try again.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating || creating}
                  className="px-6 py-3 bg-navigray text-white rounded-lg font-medium hover:bg-navigray-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navigray disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                >
                  {updating || creating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {profile?.doctorProfile ? "Update Profile" : "Create Profile"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* View Profile */
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Profile Header with Image */}
            <div className="bg-gradient-to-r from-navigray to-navigray-dark px-8 py-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Profile Image */}
                <div className="relative">
                  {profile?.doctorProfile?.image || formData.image ? (
                    <img
                      src={profile?.doctorProfile?.image || formData.image}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center text-white text-4xl font-bold">
                      {profile?.fullName?.charAt(0) || "D"}
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 bg-white text-navigray px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                    {verificationStatus}
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {profile?.fullName || "Doctor Profile"}
                  </h2>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-white/90">
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {profile?.doctorProfile?.specialization || "Not specified"}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {profile?.doctorProfile?.yearsOfExperience || "0"} years experience
                    </span>
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {profile?.phone || "No phone"}
                    </span>
                  </div>
                  
                  {profile?.doctorProfile?.degreeName && (
                    <p className="mt-4 text-white/80 text-lg">
                      {profile.doctorProfile.degreeName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Personal & Professional */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-6 h-6 mr-2 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Personal & Professional Details
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Email</span>
                        <span className="font-medium">{profile?.email || "—"}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Phone</span>
                        <span className="font-medium">{profile?.phone || "—"}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">PVMC Registration</span>
                        <span className="font-medium">{profile?.doctorProfile?.pvmcRegistrationNumber || "—"}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Degree</span>
                        <span className="font-medium">{profile?.doctorProfile?.degreeName || "—"}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Specialization</span>
                        <span className="font-medium">{profile?.doctorProfile?.specialization || "—"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Services Offered */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-6 h-6 mr-2 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Services Offered
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(servicesOffered).map(([key, value]) => (
                        <div
                          key={key}
                          className={`flex items-center p-3 rounded-lg ${
                            value ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full mr-3 ${
                            value ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Clinic & Verification */}
                <div className="space-y-6">
                  {/* Clinic Details */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-6 h-6 mr-2 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Clinic Details
                    </h3>
                    <div className="space-y-4">
                      {clinicDetails.clinicName && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Clinic Name</span>
                          <span className="font-medium">{clinicDetails.clinicName}</span>
                        </div>
                      )}
                      {clinicDetails.clinicCity && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">City</span>
                          <span className="font-medium">{clinicDetails.clinicCity}</span>
                        </div>
                      )}
                      {clinicDetails.clinicDistrict && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">District</span>
                          <span className="font-medium">{clinicDetails.clinicDistrict}</span>
                        </div>
                      )}
                      {clinicDetails.clinicStreet && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Address</span>
                          <span className="font-medium">{clinicDetails.clinicStreet}</span>
                        </div>
                      )}
                      {clinicDetails.startTime && clinicDetails.endTime && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Timings</span>
                          <span className="font-medium">{clinicDetails.startTime} - {clinicDetails.endTime}</span>
                        </div>
                      )}
                      {clinicDetails.googleMapLocation && (
                        <div className="pt-2">
                          <a
                            href={clinicDetails.googleMapLocation}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-navigray hover:text-navigray-dark font-medium flex items-center"
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

                  {/* Home Visit & Verification */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Home Visit Details */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Home Visit
                      </h3>
                      {homeVisitDetails.areasCovered.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">Areas Covered ({homeVisitDetails.areasCovered.length}):</p>
                          <div className="flex flex-wrap gap-2">
                            {homeVisitDetails.areasCovered.map((area, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-navigray/10 text-navigray rounded-full text-sm"
                              >
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {homeVisitDetails.charges && (
                        <div>
                          <p className="text-sm text-gray-600">Charges:</p>
                          <p className="text-lg font-bold text-gray-900">${homeVisitDetails.charges}</p>
                        </div>
                      )}
                    </div>

                    {/* Verification */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Verification
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Status</p>
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            verificationStatus === 'Approved' 
                              ? 'bg-green-100 text-green-800'
                              : verificationStatus === 'Rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {verificationStatus}
                          </div>
                        </div>
                        {verificationImageUrl && (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">License Document</p>
                            <img
                              src={verificationImageUrl}
                              alt="Veterinary License"
                              className="w-full h-40 object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Empty State */}
              {!profile?.doctorProfile && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">Profile Incomplete</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Your profile is not complete yet. Please add your professional details to start accepting appointments.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;