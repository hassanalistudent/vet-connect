import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import AllDoctors from './User/AllDoctors';
import AdminDashboard from './Admin/AdminDashBoard';
import DoctorDashboard from './Appointments/DoctorDashBoard';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { useGetDoctorsQuery } from '../redux/api/userApiSlice';
import { useGetProfileQuery } from '../redux/api/userApiSlice';

// Doctor Card Component (simplified version for home screen)
const DoctorCard = ({ doctor }) => {
  const doctorImage = doctor.doctorProfile?.image 
    ? doctor.doctorProfile.image.replace(/\\\\+/g, '/') 
    : "/images/default-doctor.png";

  const isAvailableNow = doctor.doctorProfile?.availableNow === true;
  const rating = doctor.doctorProfile?.rating || 0;
  const numReviews = doctor.doctorProfile?.numReviews || 0;

  // Star Rating Component
  const StarRating = ({ rating, numReviews }) => {
    const stars = [1, 2, 3, 4, 5];
    
    return (
      <div className="flex items-center">
        <div className="flex items-center space-x-0.5">
          {stars.map((star) => (
            <span key={star} className="text-sm">
              {star <= Math.round(rating) ? (
                <span className="text-yellow-500">★</span>
              ) : (
                <span className="text-gray-300">★</span>
              )}
            </span>
          ))}
        </div>
        <span className="ml-2 text-xs text-gray-500">
          ({numReviews})
        </span>
      </div>
    );
  };

  return (
    <Link 
      to={`/${doctor._id}`} 
      className="group bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-200 hover:border-navigray/30 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden h-full"
    >
      {/* Doctor Image */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={doctorImage}
          alt={doctor.fullName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { 
            e.target.src = "/images/default-doctor.png";
          }}
        />
        {/* Available Now Badge */}
        {isAvailableNow && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500 text-white animate-pulse">
              Available Now
            </span>
          </div>
        )}
      </div>

      {/* Doctor Info */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
          Dr. {doctor.fullName}
        </h3>
        
        {doctor.doctorProfile?.degreeName && (
          <p className="text-gray-600 text-xs mb-2 line-clamp-1">{doctor.doctorProfile.degreeName}</p>
        )}

        {/* Rating */}
        {numReviews > 0 ? (
          <div className="mb-2">
            <StarRating rating={rating} numReviews={numReviews} />
          </div>
        ) : (
          <p className="text-xs text-gray-400 mb-2">No reviews yet</p>
        )}

        {/* Specialization */}
        {doctor.doctorProfile?.specialization && (
          <div className="mb-2">
            <span className="inline-block px-2 py-1 bg-navigray/10 text-navigray rounded-full text-xs">
              {doctor.doctorProfile.specialization}
            </span>
          </div>
        )}

        {/* Location */}
        {doctor.doctorProfile?.clinicDetails?.clinicDistrict && (
          <div className="flex items-center text-gray-500 text-xs mt-1">
            <svg className="w-3 h-3 mr-1 text-navigray flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{doctor.doctorProfile.clinicDetails.clinicDistrict}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

const Home = () => {
  const { userInfo, isLoading: authLoading, error } = useSelector((state) => state.auth);
  const [nearbyDoctors, setNearbyDoctors] = useState([]);
  const [otherDoctors, setOtherDoctors] = useState([]);
  
  // Fetch all doctors
  const { data: doctorsData, isLoading: doctorsLoading } = useGetDoctorsQuery();
  
  // Fetch pet owner's profile if user is a pet owner
  const { data: profileData, isLoading: profileLoading } = useGetProfileQuery(undefined, {
    skip: userInfo?.role !== 'PetOwner'
  });

  // Log for debugging
  useEffect(() => {
    if (doctorsData?.doctors && profileData) {
      console.log('All doctors:', doctorsData.doctors);
      console.log('Profile data:', profileData);
      // Fix: Access district from petOwnerProfile.address
      console.log('User district:', profileData?.petOwnerProfile?.address?.district);
      
      // Log all doctors with their districts
      doctorsData.doctors.forEach(doctor => {
        console.log(`Doctor ${doctor.fullName}:`, doctor.doctorProfile?.clinicDetails?.clinicDistrict);
      });
    }
  }, [doctorsData, profileData]);

  // Filter doctors based on pet owner's district
  useEffect(() => {
    if (doctorsData?.doctors) {
      const allDoctors = doctorsData.doctors;
      
      // If user is pet owner and has profile with district
      // Fix: Access district from petOwnerProfile.address
      if (userInfo?.role === 'PetOwner' && profileData?.petOwnerProfile?.address?.district) {
        const userDistrict = profileData.petOwnerProfile.address.district.toLowerCase().trim();
        
        
        // Filter doctors that have clinic in the same district
        const nearby = allDoctors.filter(doctor => {
          const doctorDistrict = doctor.doctorProfile?.clinicDetails?.clinicDistrict;
          // Only include if doctor has a district and it matches
          return doctorDistrict && doctorDistrict.toLowerCase().trim() === userDistrict;
        });
        
        // Get other doctors (limit to 4 for display)
        // Include doctors from other districts AND doctors with no district
        const others = allDoctors
          .filter(doctor => {
            const doctorDistrict = doctor.doctorProfile?.clinicDetails?.clinicDistrict;
            
            // If doctor has no district, include them in "others"
            if (!doctorDistrict) return true;
            
            // If doctor has a district that doesn't match user's district, include them
            return doctorDistrict.toLowerCase().trim() !== userDistrict;
          })
          .slice(0, 4);
        
        console.log('Nearby doctors found:', nearby.length);
        console.log('Other doctors found:', others.length);
        
        setNearbyDoctors(nearby);
        setOtherDoctors(others);
      } else {
        // If not pet owner or no district, show first 8 doctors as featured
        setOtherDoctors(allDoctors.slice(0, 8));
      }
    }
  }, [doctorsData, userInfo, profileData]);

  // Show loader while checking authentication
  if (authLoading || doctorsLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Show error if authentication failed
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Message variant="danger">
            {error}
          </Message>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to login page
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  // Role-based rendering
  const renderDashboard = () => {
    const roleDisplay = {
      Admin: 'Administrator',
      Doctor: 'Doctor',
      PetOwner: 'Pet Owner'
    };

    // For PetOwner, render custom home with doctor sections
    if (userInfo.role === 'PetOwner') {
      // Fix: Access district from petOwnerProfile.address
      const userDistrict = profileData?.petOwnerProfile?.address?.district;
      
      return (
        <>
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-navigray to-navigray-dark text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <h1 className="text-4xl font-bold mb-3">
                Welcome back, {userInfo.fullName}!
              </h1>
              <p className="text-white/90 text-lg max-w-2xl">
                Find the best veterinary care for your pets. Browse doctors in your area or explore our full network.
              </p>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Nearby Doctors Section - Only show if user has district */}
            {userDistrict && (
              <section className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Veterinarians in {userDistrict}
                    </h2>
                    <p className="text-gray-600 mt-2">
                      Local veterinary care near your area
                    </p>
                  </div>
                  <Link
                    to="/petowner/vets"
                    className="inline-flex items-center px-6 py-3 bg-navigray text-white rounded-lg font-medium hover:bg-navigray-dark transition-colors"
                  >
                    View all doctors
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                {nearbyDoctors.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {nearbyDoctors.slice(0, 4).map((doctor) => (
                        <DoctorCard key={doctor._id} doctor={doctor} />
                      ))}
                    </div>
                    
                    {nearbyDoctors.length > 4 && (
                      <div className="text-center mt-8">
                        <Link
                          to={`/petowner/vets?district=${userDistrict}`}
                          className="inline-flex items-center text-navigray hover:text-navigray-dark font-medium"
                        >
                          View all {nearbyDoctors.length} doctors in {userDistrict}
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-12 text-center">
                    <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No doctors in your area yet</h3>
                    <p className="text-gray-600 mb-6">
                      We couldn't find any veterinarians in {userDistrict}. Check out other areas below.
                    </p>
                    <Link
                      to="/petowner/vets"
                      className="inline-flex items-center px-6 py-3 bg-navigray text-white rounded-lg font-medium hover:bg-navigray-dark transition-colors"
                    >
                      Browse all doctors
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                )}
              </section>
            )}

            {/* Other/Featured Doctors Section */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    {userDistrict ? 'More Veterinarians' : 'Featured Veterinarians'}
                  </h2>
                  <p className="text-gray-600 mt-2">
                    {userDistrict 
                      ? 'Explore veterinarians from other areas' 
                      : 'Discover our network of certified veterinarians'}
                  </p>
                </div>
                <Link
                  to="/petowner/vets"
                  className="inline-flex items-center px-6 py-3 bg-navigray text-white rounded-lg font-medium hover:bg-navigray-dark transition-colors"
                >
                  View all
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {otherDoctors.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {otherDoctors.map((doctor) => (
                    <DoctorCard key={doctor._id} doctor={doctor} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <p className="text-gray-600">No doctors available at the moment.</p>
                </div>
              )}
            </section>
          </div>
        </>
      );
    }

    // For Admin and Doctor, render their dashboards with welcome banner
    return (
      <>
        <div className="bg-gradient-to-r from-navigray/10 to-navigray-dark/10 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-gray-600">
              Welcome back, <span className="font-semibold text-navigray">{userInfo.fullName}</span> •{' '}
              <span className="text-sm text-gray-500">{roleDisplay[userInfo.role] || userInfo.role}</span>
            </p>
          </div>
        </div>

        {userInfo.role === 'Admin' && <AdminDashboard />}
        {userInfo.role === 'Doctor' && <DoctorDashboard />}
      </>
    );
  };

  return renderDashboard();
};

export default Home;