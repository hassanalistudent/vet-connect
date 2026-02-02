import { useState } from "react";
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

  // Base fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [street, setStreet] = useState("");

  const { data: profile, isLoading } = useGetProfileQuery();
  const [createProfile, { isLoading: creating }] = useCreateProfileMutation();
  const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation();

  const handleTabClick = (tabNumber) => setActiveTab(tabNumber);

  const createHandler = async (e) => {
    e.preventDefault();
    try {
      await createProfile({
        userId: userInfo?._id,
        role,
        address: { city, district, street },
      }).unwrap();
      toast.success(`profile created successfully!`);
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
      toast.success(`${role} profile updated successfully!`);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update profile");
    }
  };

  if (isLoading) return <Loader />;

  return (
   <div className="flex flex-col md:flex-row">
  {/* Sidebar Tabs */}
  <aside className="w-full md:w-1/4 md:border-r md:pr-4 mb-6 md:mb-0">
    <div className="flex md:flex-col gap-4">
      <button
        className={`px-4 py-2 rounded-lg text-lg font-medium transition
          ${activeTab === 1
            ? "bg-pink-600 text-white shadow-md"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        onClick={() => handleTabClick(1)}
      >
       {profile?.petOwnerProfile
              ? "Update Profile"
              : "Create Profile"}
      </button>

      <button
        className={`px-4 py-2 rounded-lg text-lg font-medium transition
          ${activeTab === 2
            ? "bg-pink-600 text-white shadow-md"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        onClick={() => handleTabClick(2)}
      >
        View Profile
      </button>
    </div>
  </aside>

  {/* Main Content */}
  <main className="flex-1 md:ml-6">
    {activeTab === 1 && (
      <form
        onSubmit={profile?.petOwnerProfile ? updateHandler : createHandler}
        className="mt-6 space-y-4 bg-white shadow-md rounded-lg p-6"
      >
        <h2 className="text-xl font-bold text-pink-600 mb-4">
          {profile?.petOwnerProfile ? "Update Pet Owner Profile" : "Complete Pet Owner Profile"}
        </h2>

        <input
          type="text"
          placeholder="Full Name"
          value={fullName || profile?.fullName || ""}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
        />

        <input
          type="tel"
          placeholder="Phone"
          value={phone || profile?.phone || ""}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
        />

        <input
          type="text"
          placeholder="City"
          value={city || profile?.petOwnerProfile?.address?.city || ""}
          onChange={(e) => setCity(e.target.value)}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
        />

        <input
          type="text"
          placeholder="District/Area"
          value={district || profile?.petOwnerProfile?.address?.district || ""}
          onChange={(e) => setDistrict(e.target.value)}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
        />

        <input
          type="text"
          placeholder="Street"
          value={street || profile?.petOwnerProfile?.address?.street || ""}
          onChange={(e) => setStreet(e.target.value)}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
        />

        <button
          type="submit"
          disabled={creating || updating}
          className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition"
        >
          {profile?.petOwnerProfile
            ? updating
              ? "Updating..."
              : "Update"
            : creating
            ? "Creating..."
            : "Create"}
        </button>
      </form>
    )}

    {activeTab === 2 && profile && (
      <div className="mt-6 space-y-4 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-bold text-pink-600 mb-4">Profile Details</h2>
        <p><strong>Name:</strong> {profile.fullName}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Phone:</strong> {profile.phone}</p>
        <p><strong>Role:</strong> {profile.role}</p>
        {profile.petOwnerProfile && (
          <>
            <p><strong>City:</strong> {profile.petOwnerProfile.address?.city}</p>
            <p><strong>District:</strong> {profile.petOwnerProfile.address?.district}</p>
            <p><strong>Street:</strong> {profile.petOwnerProfile.address?.street}</p>
          </>
        )}
        <UserPets/>
      </div>
    )}
    
  </main>
</div>
  );
};

export default ProfileTabs;