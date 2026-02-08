import { useState, useEffect } from "react";
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
  const [updatePet, { isLoading: updating }] = useUpdatePetMutation();
  const [uploadImage] = useUploadImageMutation();
  const [deletePet, { isLoading: deleting }] = useDeletePetMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    petName: "",
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

  // Load pet data when component mounts
  useEffect(() => {
    if (pet) {
      setFormData({
        petName: pet?.petName || "",
        petType: pet?.petType || "",
        breed: pet?.breed || "",
        age: pet?.age?.toString() || "",
        gender: pet?.gender || "",
        weight: pet?.weight?.toString() || "",
        petImages: pet?.petImages || "",
      });
      setUploadedImage(pet?.petImages || "");
    }
  }, [pet]);

  const handleEditToggle = () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (pet) {
      setFormData({
        petName: pet?.petName || "",
        petType: pet?.petType || "",
        breed: pet?.breed || "",
        age: pet?.age?.toString() || "",
        gender: pet?.gender || "",
        weight: pet?.weight?.toString() || "",
        petImages: pet?.petImages || "",
      });
      setUploadedImage(pet?.petImages || "");
    }
  };

  // Upload image handler
  const uploadPetImageHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview image immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    const formDataUpload = new FormData();
    formDataUpload.append("image", file);
    try {
      const res = await uploadImage(formDataUpload).unwrap();
      toast.success("Pet image uploaded successfully");
      const newImage = res.image;
      setUploadedImage(newImage);
      setFormData(prev => ({
        ...prev,
        petImages: newImage
      }));
    } catch (error) {
      toast.error(error?.data?.message || error.error);
      // Revert to original image if upload fails
      setUploadedImage(pet?.petImages || "");
    }
  };

  // Update pet
  const updateHandler = async (e) => {
    e.preventDefault();
    try {
      await updatePet({
        petId: id,
        ...formData,
      }).unwrap();
      toast.success("Pet updated successfully");
      refetch();
      setIsEditing(false);
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
      navigate('/petowner/mypets');
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pet Profile</h1>
            <p className="mt-2 text-gray-600">
              {isEditing ? "Edit your pet's information" : "View your pet's details"}
            </p>
          </div>
          
          {/* Action Buttons */}
          {isOwner && (
            <div className="flex space-x-4 mt-4 md:mt-0">
              {!isEditing ? (
                <>
                  <button
                    onClick={handleEditToggle}
                    className="bg-navigray text-white px-6 py-3 rounded-lg font-medium hover:bg-navigray-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navigray flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Pet
                  </button>
                  <button
                    onClick={deleteHandler}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Pet
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleCancel}
                  className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8">
            {isEditing ? (
              /* Edit Mode */
              <form onSubmit={updateHandler}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Image Upload */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Pet Photo
                    </h3>
                    <div 
                      onClick={() => document.getElementById('petImageInput').click()}
                      className="relative w-full aspect-square max-w-md mx-auto border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-navigray transition-colors group bg-gray-50 overflow-hidden"
                    >
                      {uploadedImage ? (
                        <>
                          <img
                            src={uploadedImage}
                            alt="Pet preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-medium">Change Photo</span>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6">
                          <svg className="w-20 h-20 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-gray-500 text-center mb-2">Click to upload photo</p>
                          <p className="text-sm text-gray-400 text-center">
                            JPG, PNG up to 5MB
                          </p>
                        </div>
                      )}
                      <input
                        id="petImageInput"
                        type="file"
                        accept="image/*"
                        onChange={uploadPetImageHandler}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Right Column - Form */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">
                      Pet Details
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Pet Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pet Name *
                        </label>
                        <input
                          type="text"
                          value={formData.petName}
                          onChange={(e) => setFormData(prev => ({ ...prev, petName: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                          placeholder="Enter pet's name"
                          required
                        />
                      </div>

                      {/* Pet Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pet Type *
                        </label>
                        <select
                          value={formData.petType}
                          onChange={(e) => setFormData(prev => ({ ...prev, petType: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                          required
                        >
                          <option value="">Select Pet Type</option>
                          <option value="Dog">Dog</option>
                          <option value="Cat">Cat</option>
                          <option value="Bird">Bird</option>
                          <option value="Rabbit">Rabbit</option>
                          <option value="Hamster">Hamster</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {/* Breed */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Breed
                        </label>
                        <input
                          type="text"
                          value={formData.breed}
                          onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                          placeholder="Enter breed (optional)"
                        />
                      </div>

                      {/* Age & Weight */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Age (years) *
                          </label>
                          <input
                            type="number"
                            value={formData.age}
                            onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                            min="0"
                            max="50"
                            step="0.5"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Weight (kg) *
                          </label>
                          <input
                            type="number"
                            value={formData.weight}
                            onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                            min="0.1"
                            step="0.1"
                            required
                          />
                        </div>
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender *
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, gender: "Male" }))}
                            className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                              formData.gender === "Male" 
                              ? "border-navigray bg-navigray text-white" 
                              : "border-gray-300 text-gray-700 hover:border-navigray hover:text-navigray"
                            }`}
                          >
                            Male
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, gender: "Female" }))}
                            className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                              formData.gender === "Female" 
                              ? "border-navigray bg-navigray text-white" 
                              : "border-gray-300 text-gray-700 hover:border-navigray hover:text-navigray"
                            }`}
                          >
                            Female
                          </button>
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
                        disabled={updating}
                        className="px-6 py-3 bg-navigray text-white rounded-lg font-medium hover:bg-navigray-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navigray disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                      >
                        {updating ? (
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
                            Update Pet
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              /* View Mode */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Pet Image & Basic Info */}
                <div>
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <div className="flex flex-col items-center">
                      {/* Pet Image */}
                      <div className="w-48 h-48 rounded-full border-4 border-white shadow-lg overflow-hidden mb-6">
                        {pet?.petImages ? (
                          <img
                            src={pet.petImages}
                            alt={pet.petName || pet.petType}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Pet Name & Type */}
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {pet.petName || "Unnamed Pet"}
                      </h2>
                      <div className="inline-flex items-center px-4 py-2 bg-navigray/10 text-navigray rounded-full text-sm font-medium mb-6">
                        {pet.petType}
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-white rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900">{pet.age || "—"}</div>
                        <div className="text-sm text-gray-600">Years Old</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900">{pet.weight || "—"}</div>
                        <div className="text-sm text-gray-600">kg</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Detailed Info */}
                <div className="space-y-6">
                  {/* Detailed Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-6 h-6 mr-2 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Pet Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Pet Name</span>
                        <span className="font-medium">{pet.petName || "Not named"}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Type</span>
                        <span className="font-medium">{pet.petType || "—"}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Breed</span>
                        <span className="font-medium">{pet.breed || "Not specified"}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Gender</span>
                        <span className="font-medium">{pet.gender || "—"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Owner Details */}
                  {owner && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Owner Information
                      </h3>
                      <div className="space-y-3">
                        <p><strong>Name:</strong> {owner.fullName}</p>
                        <p><strong>Email:</strong> {owner.email}</p>
                        {owner.phone && <p><strong>Phone:</strong> {owner.phone}</p>}
                        <Link
                          to={`/users/${owner._id}`}
                          className="inline-flex items-center text-navigray hover:text-navigray-dark font-medium"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                          View Owner Profile
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-6 h-6 mr-2 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Timeline
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Created</span>
                        <span className="font-medium">{moment(pet?.createdAt).format("MMM DD, YYYY")}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Last Updated</span>
                        <span className="font-medium">{moment(pet?.updatedAt).format("MMM DD, YYYY")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDetails;