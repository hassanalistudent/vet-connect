import { useState, useRef } from "react";
import { useCreatePetMutation } from "../../redux/api/petApiSlice";
import { useUploadImageMutation } from "../../redux/api/uploadApiSlice";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";

const CreatePet = () => {
  const [isEditing, setIsEditing] = useState(true);
  const [petName, setPetName] = useState(""); // ✅ NEW: Pet Name
  const [petType, setPetType] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [weight, setWeight] = useState("");
  const [petImage, setPetImage] = useState("");

  const [createPet, { isLoading: creatingPet }] = useCreatePetMutation();
  const [uploadImage] = useUploadImageMutation();
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Upload single image handler (same as your profile)
  const uploadPetImageHandler = async (e) => {
    const formDataUpload = new FormData();
    formDataUpload.append("image", e.target.files[0]);
    
    try {
      const res = await uploadImage(formDataUpload).unwrap();
      toast.success(res.message);
      setPetImage(res.image);
      e.target.value = "";
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

  // Toggle preview mode (show final form data)
  const handlePreviewToggle = () => {
    setIsEditing(!isEditing);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!petName || !petType || !age || !gender || !weight) { // ✅ Added petName check
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await createPet({
        petName, // ✅ NEW: Send petName
        petType,
        breed,
        age: Number(age),
        gender,
        weight: Number(weight),
        petImages: petImage,
      }).unwrap();

      toast.success("Pet created successfully!");
      navigate("/petowner/mypets");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row p-4 relative">
      {/* Toggle Button - Lower Right Corner */}
      <button
        onClick={handlePreviewToggle}
        className="fixed bottom-6 right-6 md:right-24 bg-pink-600 hover:bg-pink-700 text-white p-4 rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-xl font-bold z-50 focus:outline-none focus:ring-4 focus:ring-pink-300 transition-all"
        title={isEditing ? "Preview" : "Edit"}
      >
        {isEditing ? "👁️" : "✏️"}
      </button>

      <main className="flex-1 md:ml-6">
        <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-pink-600 mb-4">
            {isEditing ? "Add New Pet" : "Preview Pet"}
          </h2>

          {creatingPet ? (
            <Loader />
          ) : (
            <div className={isEditing ? "space-y-6" : "grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"}>
              {/* Image Section */}
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
                      {petImage ? (
                        <img
                          src={petImage}
                          alt="Pet preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-center text-gray-500">
                          <div className="text-4xl mb-2">📁</div>
                          <p className="text-sm">Click to upload image</p>
                        </div>
                      )}
                    </>
                  ) : petImage ? (
                    <img
                      src={petImage}
                      alt="Pet preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-lg border-2 border-dashed border-pink-300 flex items-center justify-center text-gray-500 font-semibold">
                      No Image
                    </div>
                  )}
                </div>
              </div>

              {/* Form / Preview Content */}
              {!isEditing ? (
                /* Preview Mode */
                <div className="flex items-stretch">
                  <div className="w-full rounded-lg p-4 space-y-3 text-gray-700">
                    <h3 className="text-lg font-semibold text-pink-600">Pet Preview</h3>
                    <p><strong>Name:</strong> {petName}</p> {/* ✅ NEW */}
                    <p><strong>Type:</strong> {petType}</p>
                    <p><strong>Breed:</strong> {breed || "—"}</p>
                    <p><strong>Age:</strong> {age || "—"}</p>
                    <p><strong>Gender:</strong> {gender || "—"}</p>
                    <p><strong>Weight:</strong> {weight ? `${weight} kg` : "—"}</p>
                  </div>
                </div>
              ) : (
                /* Edit Mode Form */
                <form onSubmit={submitHandler} className="space-y-4 p-4">
                  {/* ✅ NEW: Pet Name Field - TOP POSITION */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pet Name *</label>
                    <input
                      type="text"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      placeholder="e.g., Max, Luna"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pet Type *</label>
                    <select
                      value={petType}
                      onChange={(e) => setPetType(e.target.value)}
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
                      value={breed}
                      onChange={(e) => setBreed(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      placeholder="e.g., Labrador"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
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
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
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
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
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
                    disabled={creatingPet}
                    className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-pink-400 text-white font-medium py-3 px-6 rounded-lg focus:ring-4 focus:ring-pink-300 transition-colors"
                  >
                    {creatingPet ? "Creating Pet..." : "Create Pet"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Bottom Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 rounded-lg focus:ring-4 focus:ring-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreatePet;
