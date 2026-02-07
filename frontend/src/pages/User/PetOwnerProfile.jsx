import { useState, useEffect } from "react";
import Loader from "../../components/Loader";
import {
  useGetProfileQuery,
  useCreateProfileMutation,
  useUpdateProfileMutation,
} from "../../redux/api/userApiSlice";
import { toast } from "react-toastify";
import UserPets from "../Pets/UserPets";

const ProfileTabs = ({ userInfo, role }) => {
  const [activeTab, setActiveTab] = useState(1);
  const [isEditing, setIsEditing] = useState(false);

  // Base fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [street, setStreet] = useState("");

  const { data: profile, isLoading, refetch } = useGetProfileQuery();
  const [createProfile, { isLoading: creating }] = useCreateProfileMutation();
  const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation();

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setPhone(profile.phone || "");
      setCity(profile.petOwnerProfile?.address?.city || "");
      setDistrict(profile.petOwnerProfile?.address?.district || "");
      setStreet(profile.petOwnerProfile?.address?.street || "");
    }
  }, [profile]);

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setFullName(profile.fullName || "");
      setPhone(profile.phone || "");
      setCity(profile.petOwnerProfile?.address?.city || "");
      setDistrict(profile.petOwnerProfile?.address?.district || "");
      setStreet(profile.petOwnerProfile?.address?.street || "");
    }
  };

  const createHandler = async (e) => {
    e.preventDefault();
    try {
      await createProfile({
        userId: userInfo?._id,
        role,
        address: { city, district, street },
      }).unwrap();
      toast.success("Profile created successfully!");
      refetch();
      setIsEditing(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create profile");
    }
  };

  const updateHandler = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        userId: userInfo?._id,
        role,
        fullName,
        phone,
        address: { city, district, street },
      }).unwrap();
      toast.success("Profile updated successfully!");
      refetch();
      setIsEditing(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update profile");
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Action Button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pet Owner Profile</h1>
            <p className="mt-2 text-gray-600">
              {profile?.petOwnerProfile 
                ? "Manage your profile and pets" 
                : "Complete your profile to get started"}
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
              {profile?.petOwnerProfile ? "Update Profile" : "Complete Profile"}
            </button>
          )}
        </div>

        {isEditing ? (
          /* Edit Form */
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile?.petOwnerProfile ? "Update Profile" : "Complete Your Profile"}
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
                Fill in your details to complete your profile
              </p>
            </div>

            <form 
              onSubmit={profile?.petOwnerProfile ? updateHandler : createHandler}
              className="p-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                          required
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                          required
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Address Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                          required
                          placeholder="Enter your city"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          District/Area *
                        </label>
                        <input
                          type="text"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                          required
                          placeholder="Enter your district or area"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                          required
                          placeholder="Enter your street address"
                        />
                      </div>
                    </div>
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
                      {profile?.petOwnerProfile ? "Update Profile" : "Create Profile"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* View Profile */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-navigray to-navigray-dark px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center">
                      {profile?.fullName ? (
                        <span className="text-white text-2xl font-bold">
                          {profile.fullName.charAt(0)}
                        </span>
                      ) : (
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {profile?.fullName || "Pet Owner"}
                      </h2>
                      <p className="text-white/80">{profile?.email || ""}</p>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                    Profile Details
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-xl p-5">
                        <div className="flex items-center mb-3">
                          <div className="w-10 h-10 bg-navigray/10 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="font-medium text-gray-900">{profile?.fullName || "Not set"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-5">
                        <div className="flex items-center mb-3">
                          <div className="w-10 h-10 bg-navigray/10 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Phone Number</p>
                            <p className="font-medium text-gray-900">{profile?.phone || "Not set"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Address Section */}
                    {profile?.petOwnerProfile?.address && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <svg className="w-6 h-6 mr-2 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Address Details
                        </h4>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">City</p>
                              <p className="font-medium text-gray-900">{profile.petOwnerProfile.address.city || "—"}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">District/Area</p>
                              <p className="font-medium text-gray-900">{profile.petOwnerProfile.address.district || "—"}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Street</p>
                              <p className="font-medium text-gray-900">{profile.petOwnerProfile.address.street || "—"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {!profile?.petOwnerProfile && (
                      <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Profile Incomplete</h4>
                        <p className="text-gray-600 mb-4">
                          Please complete your profile to access all features
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pets Section */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900">My Pets</h3>
                  <p className="text-gray-600 mt-2">Manage your pet's information and health records</p>
                </div>
                <div className="p-6">
                  <UserPets />
                </div>
              </div>
            </div>

            {/* Side Info Panel */}
            <div className="space-y-6">
              {/* Account Status */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Email Verification</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Verified
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Profile Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      profile?.petOwnerProfile 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {profile?.petOwnerProfile ? 'Complete' : 'Incomplete'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-medium text-gray-900">
                      {profile?.createdAt 
                        ? new Date(profile.createdAt).toLocaleDateString() 
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                    <span className="text-gray-700 group-hover:text-navigray">Book Appointment</span>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                    <span className="text-gray-700 group-hover:text-navigray">View Appointments</span>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                    <span className="text-gray-700 group-hover:text-navigray">Add New Pet</span>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Support */}
              <div className="bg-gradient-to-r from-navigray to-navigray-dark rounded-2xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
                <p className="text-white/80 mb-4">
                  Our support team is here to help you with any questions about your pets or appointments.
                </p>
                <button className="w-full bg-white text-navigray py-2 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileTabs;