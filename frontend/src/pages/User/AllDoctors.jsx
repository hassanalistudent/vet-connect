// src/pages/DoctorsDirectory.jsx - ✅ FIXED IMAGE HANDLING (Direct URL usage)
import { Link } from "react-router-dom";
import { useGetDoctorsQuery } from "../../redux/api/userApiSlice";
import Loader from "../../components/Loader";

const AllDoctors = () => {
  const { data, isLoading, isError } = useGetDoctorsQuery();

  if (isLoading) return <Loader />;
  if (isError) return <div className="text-red-600 p-8 text-center">Error loading doctors</div>;

  const doctors = data?.doctors || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-12">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-emerald-600 bg-clip-text text-transparent mb-6">
            🩺 Find Your Vet
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Browse verified veterinarians near you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor._id} doctor={doctor} />
          ))}
        </div>

        {doctors.length === 0 && (
          <div className="text-center py-24 col-span-full">
            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-8">
              👨‍⚕️
            </div>
            <h3 className="text-3xl font-bold text-gray-600 mb-4">No Doctors Found</h3>
          </div>
        )}
      </div>
    </div>
  );
};

const DoctorCard = ({ doctor }) => {
  // ✅ SIMPLIFIED: Direct image URL usage + Windows path fix
  const doctorImage = doctor.doctorProfile?.image 
    ? doctor.doctorProfile.image.replace(/\\\\+/g, '/') 
    : "/images/default-doctor.png";

  // ✅ Verification status from API
  const isVerified = doctor.doctorProfile?.verificationUploads?.status === "Approved";

  return (
    <Link 
      to={`/${doctor._id}`} 
      className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl border-2 border-gray-100 hover:border-emerald-200 hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden h-full"
    >
      {/* Doctor Image */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={doctorImage}
          alt={doctor.fullName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => { e.target.src = "/images/default-doctor.png"; }}
        />
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-lg ${
            isVerified 
              ? 'bg-emerald-500 text-white' 
              : 'bg-yellow-500 text-white'
          }`}>
            {isVerified ? '✅ Verified' : '⏳ Pending'}
          </span>
        </div>
      </div>

      {/* Essential Info Only */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
          Dr. {doctor.fullName}
        </h3>
        
        <div className="space-y-3 mb-6">
          {/* Specialization */}
          <div className="flex items-center gap-2">
            <span className="text-emerald-500">🩺</span>
            <span className="font-semibold text-lg">
              {doctor.doctorProfile?.specialization || "General Practice"}
            </span>
          </div>

          {/* Experience */}
          <div className="flex items-center gap-2 text-gray-600">
            <span>⭐</span>
            <span>{doctor.doctorProfile?.yearsOfExperience || 0}+ years exp.</span>
          </div>

          {/* Location */}
          {doctor.doctorProfile?.clinicDetails?.clinicCity && (
            <div className="flex items-center gap-2 text-gray-600">
              <span>🏥</span>
              <span className="font-medium">
                {doctor.doctorProfile.clinicDetails.clinicCity}
              </span>
            </div>
          )}
        </div>

        {/* Book Button */}
        <button className="w-full mt-auto bg-gradient-to-r from-emerald-500 to-orange-500 hover:from-emerald-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-lg">
          📅 Book Now
        </button>
      </div>
    </Link>
  );
};

export default AllDoctors;
