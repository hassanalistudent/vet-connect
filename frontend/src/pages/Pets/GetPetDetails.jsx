import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import {
  useGetPetDetailsQuery,
  useUpdatePetMutation,
  useDeletePetMutation,
} from "../../redux/api/petApiSlice";
import { useUploadImageMutation } from "../../redux/api/uploadApiSlice";
import moment from "moment";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const PetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: pet, isLoading, error, refetch } = useGetPetDetailsQuery(id);
  const [updatePet] = useUpdatePetMutation();
  const [uploadImage] = useUploadImageMutation();
  const [deletePet] = useDeletePetMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    petName: "", // ✅ NEW: Pet Name field
    petType: "",
    breed: "",
    age: "",
    gender: "",
    weight: "",
    petImages: "",
  });
  const [uploadedImage, setUploadedImage] = useState("");

  // Check if current user is owner
  const currentUserId = useSelector(state => state.auth.userInfo?._id);
  const isOwner = pet?.ownerId?._id === currentUserId;

  // Load form data when entering edit mode
  const handleEditToggle = () => {
    if (isEditing) {
      setIsEditing(false);
      setUploadedImage("");
    } else {
      setFormData({
        petName: pet?.petName || "", // ✅ NEW
        petType: pet?.petType || "",
        breed: pet?.breed || "",
        age: pet?.age?.toString() || "",
        gender: pet?.gender || "",
        weight: pet?.weight?.toString() || "",
        petImages: pet?.petImages || "",
      });
      setUploadedImage(pet?.petImages || "");
      setIsEditing(true);
    }
  };

  // Upload image handler (single image)
  const uploadPetImageHandler = async (e) => {
    const formDataUpload = new FormData();
    formDataUpload.append("image", e.target.files[0]);
    try {
      const res = await uploadImage(formDataUpload).unwrap();
      toast.success(res.message);

      const newImage = res.image;
      setUploadedImage(newImage);
      setFormData(prev => ({
        ...prev,
        petImages: newImage
      }));
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

  // Update pet
  const updateHandler = async (e) => {
    e.preventDefault();
    try {
      await updatePet({
        petId: id,
        ...formData, // ✅ Includes petName
      }).unwrap();
      toast.success("Pet updated successfully");
      refetch();
      setIsEditing(false);
      setUploadedImage("");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  // Delete pet handler
  const deleteHandler = async () => {
    if (!window.confirm(`Are you sure you want to delete ${pet?.petName || pet?.petType || 'this pet'}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deletePet(id).unwrap();
      toast.success("Pet deleted successfully");
      navigate('/petowner/mypets'); // ✅ Better navigation
    } catch (err) {
      toast.error(err?.data?.message || err.error || "Failed to delete pet");
    }
  };

  const owner = pet?.ownerId;

  if (isLoading) return <Loader />;
  if (error)
    return (
      <Message variant="danger">
        {error?.data?.message || error.message}
      </Message>
    );

  return (
    <div className="flex flex-col md:flex-row p-4 relative">
      {/* Toggle + Delete Buttons - Lower Right Corner (Owner Only) */}
      {isOwner && (
        <div className="fixed bottom-6 right-6 md:right-24 flex flex-col gap-3 z-50">
          {/* Edit Button */}
          <button
            onClick={handleEditToggle}
            className="bg-pink-600 hover:bg-pink-700 text-white p-4 rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-xl font-bold focus:outline-none focus:ring-4 focus:ring-pink-300 transition-all"
            title={isEditing ? "View Details" : "Edit Pet"}
          >
            {isEditing ? "👁️" : "✏️"}
          </button>
          
          {/* Delete Button */}
          {!isEditing && (
            <button
              onClick={deleteHandler}
              className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-xl font-bold focus:outline-none focus:ring-4 focus:ring-red-300 transition-all"
              title="Delete Pet"
            >
              🗑️
            </button>
          )}
        </div>
      )}

      <main className="flex-1 md:ml-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold text-pink-600 mb-4">
            {isEditing ? "Edit Pet" : "Pet Details"}
          </h2>

          {/* Top: Image + main info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Image Upload/View */}
            <div className="flex items-center justify-left">
              <div className="w-full max-w-sm aspect-square bg-gray-50 rounded-lg flex items-center justify-center relative">
                {isEditing ? (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={uploadPetImageHandler}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {uploadedImage ? (
                      <img
                        src={uploadedImage}
                        alt="Pet image"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center text-gray-500">
                        <div className="text-4xl mb-2">📁</div>
                        <p className="text-sm">Click to upload image</p>
                      </div>
                    )}
                  </>
                ) : pet?.petImages ? (
                  <img
                    src={pet.petImages}
                    alt={pet.petName || pet.petType}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-lg border-2 border-dashed border-pink-300 flex items-center justify-center text-gray-500 font-semibold">
                    No Image
                  </div>
                )}
              </div>
            </div>

            {/* Main pet info - View Mode or Edit Mode */}
            {!isEditing ? (
              <div className="flex items-stretch">
                <div className="w-full rounded-lg p-4 space-y-3 text-gray-700">
                  <h3 className="text-lg font-semibold text-pink-600">Pet Info</h3>
                  {/* ✅ NEW: Pet Name Display */}
                  <p><strong>Name:</strong> {pet.petName || "—"}</p>
                  <p><strong>Type:</strong> {pet.petType}</p>
                  <p><strong>Breed:</strong> {pet.breed || "—"}</p>
                  <p><strong>Age:</strong> {pet.age ?? "—"}</p>
                  <p><strong>Gender:</strong> {pet.gender || "—"}</p>
                  <p><strong>Weight:</strong> {pet.weight ? `${pet.weight} kg` : "—"}</p>
                </div>
              </div>
            ) : (
              /* Edit Mode Form */
              <form onSubmit={updateHandler} className="space-y-4 p-4">
                {/* ✅ NEW: Pet Name Field - TOP */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pet Name *</label>
                  <input
                    type="text"
                    value={formData.petName}
                    onChange={(e) => setFormData(prev => ({ ...prev, petName: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="e.g., Max, Luna"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pet Type *</label>
                  <select
                    value={formData.petType}
                    onChange={(e) => setFormData(prev => ({ ...prev, petType: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    required
                  >
                    <option value="">Select Pet Type</option>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                  <input
                    type="text"
                    value={formData.breed}
                    onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="e.g., Labrador"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      min="0"
                      max="50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg) *</label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      min="0.1"
                      step="0.1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 px-6 rounded-lg focus:ring-4 focus:ring-pink-300 transition-colors mt-2"
                >
                  Update Pet
                </button>
              </form>
            )}
          </div>

          {/* Bottom: Owner + Timeline */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            {/* Owner details */}
            <div>
              <h3 className="text-lg font-semibold text-pink-600 mb-2">Owner Details</h3>
              {owner ? (
                <>
                  <p><strong>Name:</strong> {owner.fullName}</p>
                  <p><strong>Email:</strong> {owner.email}</p>
                  <p><strong>Phone:</strong> {owner.phone || "—"}</p>
                  <Link
                    to={`/users/${owner._id}`} // ✅ Fixed path
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-pink-700 rounded-lg hover:bg-pink-800 mt-2"
                  >
                    View Owner Profile
                  </Link>
                </>
              ) : (
                <p className="text-gray-500">No owner information found.</p>
              )}
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-lg font-semibold text-pink-600 mb-2">Timeline</h3>
              <p><strong>Created:</strong> {moment(pet?.createdAt).format("MMM DD, YYYY, h:mm A")}</p>
              <p><strong>Updated:</strong> {moment(pet?.updatedAt).format("MMM DD, YYYY, h:mm A")}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PetDetails;
