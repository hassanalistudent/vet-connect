import { useState, useEffect } from "react";
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
  // Tab state
  const [activeTab, setActiveTab] = useState(1);

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

  // Home Visit Details
  const [homeVisitDetails, setHomeVisitDetails] = useState({
    areasCovered: [],
    charges: ""
  });

  // API hooks
  const { data: profile, isLoading } = useGetProfileQuery();
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
    const formDataUpload = new FormData();
    formDataUpload.append("image", e.target.files[0]);
    try {
      const res = await uploadImage(formDataUpload).unwrap();
      toast.success(res.message);
      setFormData(prev => ({ ...prev, image: res.image }));
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

  const verificationUploadImageHandler = async (e) => {
    const formDataUpload = new FormData();
    formDataUpload.append("image", e.target.files[0]);

    try {
      const res = await uploadImage(formDataUpload).unwrap();
      toast.success(res.message);
      setFormData(prev => ({
        ...prev,
        verificationUploads: {
          ...(prev.verificationUploads || { status: "Pending" }),
          veterinaryLicense: res.image,
        },
      }));
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

  // Tab handler
  const handleTabClick = (tabNumber) => setActiveTab(tabNumber);

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
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update doctor profile");
    }
  };

  if (isLoading) return <Loader />;

  // Helper for verification image in view tab
  const verificationImageUrl =
    formData.verificationUploads?.veterinaryLicense ||
    profile?.doctorProfile?.verificationUploads?.veterinaryLicense ||
    null;

  const verificationStatus =
    profile?.doctorProfile?.verificationUploads?.status ||
    formData.verificationUploads?.status ||
    "Pending";

  return (
    <div className="flex flex-col md:flex-row">
      {/* Sidebar Tabs */}
      <aside className="w-full md:w-1/4 md:border-r md:pr-4 mb-6 md:mb-0">
        <div className="flex md:flex-col gap-4">
          <button
            className={`px-4 py-2 rounded-lg text-lg font-medium transition
              ${
                activeTab === 1
                  ? "bg-pink-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            onClick={() => handleTabClick(1)}
          >
            {profile?.doctorProfile ? "Update Profile" : "Create Profile"}
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-lg font-medium transition
              ${
                activeTab === 2
                  ? "bg-pink-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            onClick={() => handleTabClick(2)}
          >
            View Profile
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-6">
        {/* Create / Update Profile Tab */}
        {activeTab === 1 && (
          <form
            onSubmit={profile?.doctorProfile ? updateHandler : createHandler}
            className="mt-6 space-y-4 bg-white shadow-md rounded-lg p-6"
          >
            <h2 className="text-xl font-bold text-pink-600 mb-4">
              {profile?.doctorProfile
                ? "Update Doctor Profile"
                : "Create Doctor Profile"}
            </h2>

            {/* Basic Info */}
            <input
              type="text"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, fullName: e.target.value }))
              }
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
            />

            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
            />

            {/* Degree + Specialization */}
            <input
              type="text"
              placeholder="Degree Name"
              value={formData.degreeName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, degreeName: e.target.value }))
              }
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
            />

            <input
              type="text"
              placeholder="PVMC Registration Number"
              value={formData.pvmcRegistrationNumber}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  pvmcRegistrationNumber: e.target.value,
                }))
              }
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
            />

            <select
              value={formData.specialization}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  specialization: e.target.value,
                }))
              }
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
            >
              <option value="">Select Specialization</option>
              <option value="Cats">Cats</option>
              <option value="Dogs">Dogs</option>
              <option value="Birds">Birds</option>
            </select>

            <input
              type="number"
              placeholder="Years of Experience"
              value={formData.yearsOfExperience}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  yearsOfExperience: e.target.value,
                }))
              }
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
            />

            {/* Clinic Details */}
            <h3 className="font-semibold mt-4">Clinic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="p-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
              />
              <input
                type="text"
                placeholder="Clinic City"
                value={clinicDetails.clinicCity}
                onChange={(e) =>
                  setClinicDetails({
                    ...clinicDetails,
                    clinicCity: e.target.value,
                  })
                }
                className="p-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
              />
              <input
                type="text"
                placeholder="Clinic District"
                value={clinicDetails.clinicDistrict}
                onChange={(e) =>
                  setClinicDetails({
                    ...clinicDetails,
                    clinicDistrict: e.target.value,
                  })
                }
                className="p-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
              />
              <input
                type="text"
                placeholder="Clinic Street"
                value={clinicDetails.clinicStreet}
                onChange={(e) =>
                  setClinicDetails({
                    ...clinicDetails,
                    clinicStreet: e.target.value,
                  })
                }
                className="p-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
              />
              <input
                type="text"
                placeholder="Google Map Location"
                value={clinicDetails.googleMapLocation}
                onChange={(e) =>
                  setClinicDetails({
                    ...clinicDetails,
                    googleMapLocation: e.target.value,
                  })
                }
                className="p-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div className="flex gap-4">
              <input
                type="time"
                value={clinicDetails.startTime}
                onChange={(e) =>
                  setClinicDetails({
                    ...clinicDetails,
                    startTime: e.target.value,
                  })
                }
                className="p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 flex-1"
              />
              <span className="self-center">to</span>
              <input
                type="time"
                value={clinicDetails.endTime}
                onChange={(e) =>
                  setClinicDetails({
                    ...clinicDetails,
                    endTime: e.target.value,
                  })
                }
                className="p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 flex-1"
              />
            </div>

            {/* Services Offered */}
            <h3 className="font-semibold mt-4">Services Offered</h3>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={servicesOffered.videoConsultation}
                  onChange={(e) =>
                    setServicesOffered({
                      ...servicesOffered,
                      videoConsultation: e.target.checked,
                    })
                  }
                  className="accent-pink-600"
                />
                Video Consultation
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={servicesOffered.clinicConsultation}
                  onChange={(e) =>
                    setServicesOffered({
                      ...servicesOffered,
                      clinicConsultation: e.target.checked,
                    })
                  }
                  className="accent-pink-600"
                />
                Clinic Consultation
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={servicesOffered.homeVisit}
                  onChange={(e) =>
                    setServicesOffered({
                      ...servicesOffered,
                      homeVisit: e.target.checked,
                    })
                  }
                  className="accent-pink-600"
                />
                Home Visit
              </label>
            </div>

            {/* Home Visit Details */}
            <>
              <input
                type="text"
                placeholder="Areas Covered (comma separated)"
                value={homeVisitDetails.areasCovered.join(", ")}
                onChange={(e) =>
                  setHomeVisitDetails((prev) => ({
                    ...prev,
                    areasCovered: e.target.value
                      .split(",")
                      .map((area) => area.trim())
                      .filter(Boolean),
                  }))
                }
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
              />
              <input
                type="number"
                placeholder="Home Visit Charges"
                value={homeVisitDetails.charges}
                onChange={(e) =>
                  setHomeVisitDetails((prev) => ({
                    ...prev,
                    charges: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </>

            {/* Uploads - With Labels */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={uploadProfileImageHandler}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-700 cursor-pointer"
                />
                {formData.image && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ Profile image uploaded
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Image (Verification)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={verificationUploadImageHandler}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-700 cursor-pointer"
                />
                {formData.verificationUploads?.veterinaryLicense && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ License image uploaded
                  </p>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={updating || creating}
              className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition disabled:opacity-50"
            >
              {updating || creating
                ? "Saving..."
                : profile?.doctorProfile
                ? "Update Profile"
                : "Create Profile"}
            </button>
          </form>
        )}

        {/* View Profile Tab */}
        {activeTab === 2 && profile && (
          <div className="mt-4 bg-gray-100 border rounded-lg xl:w-[40rem]">
            {/* Header with Profile Image */}
            <div className="bg-white px-6 py-4 border-b rounded-t-lg flex items-start gap-4">
              {formData.image || profile.doctorProfile?.image ? (
                <img
                  src={formData.image || profile.doctorProfile.image}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-4 border-pink-600 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-300 border-4 border-dashed border-pink-600 flex items-center justify-center text-gray-500 font-semibold">
                  DP
                </div>
              )}

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-pink-600 mb-1">
                  Profile Details
                </h2>
                <p className="text-gray-600">{profile.fullName || "Doctor"}</p>
              </div>
            </div>

            <div className="bg-white px-6 py-6 rounded-b-lg space-y-3">
              {/* Basic user info */}
              <p>
                <span className="font-semibold">Email:</span>{" "}
                {profile.email || "—"}
              </p>
              <p>
                <span className="font-semibold">Phone:</span>{" "}
                {profile.phone || "—"}
              </p>
              <p>
                <span className="font-semibold">Role:</span>{" "}
                {profile.role || "—"}
              </p>

              {profile.doctorProfile && (
                <>
                  <p>
                    <span className="font-semibold">PVMC Registration:</span>{" "}
                    {profile.doctorProfile.pvmcRegistrationNumber || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">Degree:</span>{" "}
                    {profile.doctorProfile.degreeName || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">Specialization:</span>{" "}
                    {profile.doctorProfile.specialization || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">
                      Years of Experience:
                    </span>{" "}
                    {profile.doctorProfile.yearsOfExperience ?? "—"}
                  </p>

                  {/* Clinic Details */}
                  <p className="mt-4 font-semibold text-pink-600">
                    Clinic Details
                  </p>
                  <p>
                    <span className="font-semibold">City:</span>{" "}
                    {profile.doctorProfile.clinicDetails?.clinicCity || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">District:</span>{" "}
                    {profile.doctorProfile.clinicDetails?.clinicDistrict ||
                      "—"}
                  </p>
                  <p>
                    <span className="font-semibold">Street:</span>{" "}
                    {profile.doctorProfile.clinicDetails?.clinicStreet || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">Clinic Name:</span>{" "}
                    {profile.doctorProfile.clinicDetails?.clinicName || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">Google Map:</span>{" "}
                    {profile.doctorProfile.clinicDetails
                      ?.googleMapLocation || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">Timings:</span>{" "}
                    {profile.doctorProfile.clinicDetails?.startTime &&
                    profile.doctorProfile.clinicDetails?.endTime
                      ? `${profile.doctorProfile.clinicDetails.startTime} to ${profile.doctorProfile.clinicDetails.endTime}`
                      : "—"}
                  </p>

                  {/* Services Offered */}
                  <p className="mt-4 font-semibold text-pink-600">
                    Services Offered
                  </p>
                  <p>
                    <span className="font-semibold">Video Consultation:</span>{" "}
                    {profile.doctorProfile.servicesOffered?.videoConsultation
                      ? "Yes"
                      : "No"}
                  </p>
                  <p>
                    <span className="font-semibold">
                      Clinic Consultation:
                    </span>{" "}
                    {profile.doctorProfile.servicesOffered?.clinicConsultation
                      ? "Yes"
                      : "No"}
                  </p>
                  <p>
                    <span className="font-semibold">Home Visit:</span>{" "}
                    {profile.doctorProfile.servicesOffered?.homeVisit
                      ? "Yes"
                      : "No"}
                  </p>

                  {/* Home Visit Details */}
                  <p className="mt-4 font-semibold text-pink-600">
                    Home Visit Details
                  </p>
                  <p>
                    <span className="font-semibold">Areas Covered:</span>{" "}
                    {Array.isArray(
                      profile.doctorProfile.homeVisitDetails?.areasCovered
                    ) &&
                    profile.doctorProfile.homeVisitDetails.areasCovered
                      .length > 0
                      ? profile.doctorProfile.homeVisitDetails.areasCovered.join(
                          ", "
                        )
                      : "—"}
                  </p>
                  <p>
                    <span className="font-semibold">
                      Home Visit Charges:
                    </span>{" "}
                    {profile.doctorProfile.homeVisitDetails?.charges ?? "—"}
                  </p>

                  {/* Verification Section with Image on Left */}
                  <div className="mt-6 pt-4 border-t flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {verificationImageUrl ? (
                        <img
                          src={verificationImageUrl}
                          alt="Verification License"
                          className="w-20 h-20 object-cover rounded-lg border-2 border-gray-300 shadow-sm"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-lg border-2 border-dashed border-gray-400 flex items-center justify-center text-xs text-gray-500">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-pink-600 mb-1">
                        Verification
                      </p>
                      <p>
                        <span className="font-semibold">Status:</span>{" "}
                        {verificationStatus}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {!profile.doctorProfile && (
                <p className="mt-4 text-gray-600">No doctor profile found.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DoctorProfile;
