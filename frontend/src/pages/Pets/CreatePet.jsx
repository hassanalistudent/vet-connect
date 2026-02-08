import { useState, useRef } from "react";
import { useCreatePetMutation } from "../../redux/api/petApiSlice";
import { useUploadImageMutation } from "../../redux/api/uploadApiSlice";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";

const CreatePet = () => {
  const [isEditing, setIsEditing] = useState(true);
  const [petName, setPetName] = useState("");
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

  // Upload pet image handler
  const uploadPetImageHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview image immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPetImage(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    const formDataUpload = new FormData();
    formDataUpload.append("image", file);
    
    try {
      const res = await uploadImage(formDataUpload).unwrap();
      toast.success("Pet image uploaded successfully");
      setPetImage(res.image);
    } catch (error) {
      toast.error(error?.data?.message || error.error);
      setPetImage(""); // Clear image on error
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!petName || !petType || !age || !gender || !weight) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await createPet({
        petName,
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

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Pet</h1>
            <p className="mt-2 text-gray-600">
              Add your furry friend to your profile
            </p>
          </div>
          
          {/* Toggle Button */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="mt-4 md:mt-0 bg-navigray text-white px-6 py-3 rounded-lg font-medium hover:bg-navigray-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navigray flex items-center"
          >
            {isEditing ? (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </>
            )}
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {isEditing ? (
            /* Edit Mode */
            <form onSubmit={submitHandler} className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Image Upload */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Pet Photo
                  </h3>
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className="relative w-full aspect-square max-w-md mx-auto border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-navigray transition-colors group bg-gray-50 overflow-hidden"
                  >
                    {petImage ? (
                      <>
                        <img
                          src={petImage}
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
                      type="file"
                      ref={fileInputRef}
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
                        value={petName}
                        onChange={(e) => setPetName(e.target.value)}
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
                        value={petType}
                        onChange={(e) => setPetType(e.target.value)}
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
                        value={breed}
                        onChange={(e) => setBreed(e.target.value)}
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
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
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
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
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
                          onClick={() => setGender("Male")}
                          className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                            gender === "Male" 
                            ? "border-navigray bg-navigray text-white" 
                            : "border-gray-300 text-gray-700 hover:border-navigray hover:text-navigray"
                          }`}
                        >
                          Male
                        </button>
                        <button
                          type="button"
                          onClick={() => setGender("Female")}
                          className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                            gender === "Female" 
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
                      disabled={creatingPet}
                      className="px-6 py-3 bg-navigray text-white rounded-lg font-medium hover:bg-navigray-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navigray disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                    >
                      {creatingPet ? (
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Create Pet
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            /* Preview Mode */
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pet Image Preview */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Pet Photo
                  </h3>
                  <div className="w-full aspect-square max-w-md mx-auto bg-gray-50 rounded-2xl overflow-hidden border border-gray-200">
                    {petImage ? (
                      <img
                        src={petImage}
                        alt="Pet preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-gray-500">No image uploaded</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pet Details Preview */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                    Pet Details Preview
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Pet Name</span>
                          <span className="font-medium">{petName || "Not set"}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Type</span>
                          <span className="font-medium">{petType || "Not set"}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Breed</span>
                          <span className="font-medium">{breed || "Not specified"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Health Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Age</p>
                          <p className="font-medium">{age ? `${age} years` : "Not set"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Weight</p>
                          <p className="font-medium">{weight ? `${weight} kg` : "Not set"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Gender</p>
                          <p className="font-medium">{gender || "Not set"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-3 bg-navigray text-white rounded-lg font-medium hover:bg-navigray-dark transition-colors flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {creatingPet && (
          <div className="mt-8 text-center">
            <Loader />
            <p className="mt-4 text-gray-600">Creating your pet's profile...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePet;