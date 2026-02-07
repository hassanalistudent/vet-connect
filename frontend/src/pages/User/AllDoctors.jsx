// src/pages/DoctorsDirectory.jsx
import { Link } from "react-router-dom";
import { useGetDoctorsQuery } from "../../redux/api/userApiSlice";
import Loader from "../../components/Loader";

const AllDoctors = () => {
  const { data, isLoading, isError } = useGetDoctorsQuery();

  if (isLoading) return <Loader />;
  if (isError) return <div className="text-red-600 p-8 text-center">Error loading doctors</div>;

  const doctors = data?.doctors || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Find Your Veterinarian
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Browse our network of certified veterinary professionals. Find the right care for your pet.
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-10">
            <div className="text-center">
              <div className="text-3xl font-bold text-navigray">100+</div>
              <div className="text-gray-600">Certified Vets</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-navigray">24/7</div>
              <div className="text-gray-600">Availability</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-navigray">10K+</div>
              <div className="text-gray-600">Happy Pets</div>
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor._id} doctor={doctor} />
          ))}
        </div>

        {/* Empty State */}
        {doctors.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Doctors Found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              There are currently no doctors available in our network. Please check back later.
            </p>
          </div>
        )}

        {/* Call to Action */}
        {doctors.length > 0 && (
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-navigray to-navigray-dark rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Can't find the right vet?</h3>
              <p className="text-white/80 mb-6 max-w-2xl mx-auto">
                Our team can help you find the perfect veterinary professional for your pet's specific needs.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center bg-white text-navigray px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Contact Support
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DoctorCard = ({ doctor }) => {
  // Direct image URL usage + Windows path fix
  const doctorImage = doctor.doctorProfile?.image 
    ? doctor.doctorProfile.image.replace(/\\\\+/g, '/') 
    : "/images/default-doctor.png";

  // Verification status from API
  const isVerified = doctor.doctorProfile?.verificationUploads?.status === "Approved";
  const isPending = doctor.doctorProfile?.verificationUploads?.status === "Pending";
  const isRejected = doctor.doctorProfile?.verificationUploads?.status === "Rejected";

  return (
    <Link 
      to={`/${doctor._id}`} 
      className="group bg-white rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 hover:border-navigray/30 hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden h-full"
    >
      {/* Doctor Image */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={doctorImage}
          alt={doctor.fullName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { 
            e.target.src = "/images/default-doctor.png";
            e.target.className = "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300";
          }}
        />
        {/* Verification Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1.5 text-xs font-semibold rounded-full shadow-md ${
            isVerified 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : isRejected
              ? 'bg-red-100 text-red-800 border border-red-200'
              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
          }`}>
            {isVerified ? 'Verified' : isRejected ? 'Rejected' : 'Pending'}
          </span>
        </div>
        {/* Image Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Doctor Info */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Name and Title */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            Dr. {doctor.fullName}
          </h3>
          {doctor.doctorProfile?.degreeName && (
            <p className="text-gray-600 text-sm">{doctor.doctorProfile.degreeName}</p>
          )}
        </div>

        {/* Specialization */}
        {doctor.doctorProfile?.specialization && (
          <div className="mb-4">
            <div className="inline-flex items-center px-3 py-1 bg-navigray/10 text-navigray rounded-full text-sm font-medium">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              {doctor.doctorProfile.specialization}
            </div>
          </div>
        )}

        {/* Details */}
        <div className="space-y-3 mb-6">
          {/* Experience */}
          {doctor.doctorProfile?.yearsOfExperience && (
            <div className="flex items-center text-gray-600">
              <svg className="w-5 h-5 mr-3 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">
                <span className="font-medium">{doctor.doctorProfile.yearsOfExperience}</span> years experience
              </span>
            </div>
          )}

          {/* Location */}
          {doctor.doctorProfile?.clinicDetails?.clinicDistrict && (
            <div className="flex items-center text-gray-600">
              <svg className="w-5 h-5 mr-3 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm">{doctor.doctorProfile.clinicDetails.clinicDistrict}</span>
            </div>
          )}

          {/* Services */}
          {doctor.doctorProfile?.servicesOffered && (
            <div className="flex items-center text-gray-600">
              <svg className="w-5 h-5 mr-3 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-sm">
                {Object.values(doctor.doctorProfile.servicesOffered).filter(v => v).length} services
              </span>
            </div>
          )}
        </div>

        {/* Book Button */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <button className="w-full bg-navigray text-white py-3 px-4 rounded-lg font-medium hover:bg-navigray-dark transition-colors flex items-center justify-center group-hover:shadow-md">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            View Profile & Book
          </button>
        </div>
      </div>
    </Link>
  );
};

export default AllDoctors;