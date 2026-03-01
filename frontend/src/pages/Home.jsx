import React, { useState, useEffect } from 'react';
import hero from "../assets/hero.png"
import { useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import AllDoctors from './User/AllDoctors';
import AdminDashboard from './Admin/AdminDashBoard';
import DoctorDashboard from './Appointments/DoctorDashBoard';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { useGetDoctorsQuery } from '../redux/api/userApiSlice';
import { useGetProfileQuery } from '../redux/api/userApiSlice';
import { useGetAllReviewsQuery } from '../redux/api/platformreviewApiSlice';
import { 
  FaPaw, 
  FaUserMd, 
  FaCalendarCheck, 
  FaStar, 
  FaShieldAlt, 
  FaHeart, 
  FaClock, 
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaChevronRight,
  FaQuoteRight,
  FaDog,
  FaCat,
  FaFish,
  FaHeadset
} from 'react-icons/fa';

// Doctor Card Component (simplified version for home screen)
const DoctorCard = ({ doctor }) => {
  const doctorImage = doctor.doctorProfile?.image 
    ? doctor.doctorProfile.image.replace(/\\\\+/g, '/') 
    : "/images/default-doctor.png";

  const isAvailableNow = doctor.doctorProfile?.availableNow === true;
  const rating = doctor.doctorProfile?.rating || 0;
  const numReviews = doctor.doctorProfile?.numReviews || 0;

  // Star Rating Component - Now with yellow stars
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

// Testimonial Card with real review data
const TestimonialCard = ({ review }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 150;
  const shouldTruncate = review.comment?.length > maxLength;
  
  const displayComment = isExpanded 
    ? review.comment 
    : shouldTruncate 
      ? `${review.comment.substring(0, maxLength)}...` 
      : review.comment;

  // Get owner name from populated ownerId
  const ownerName = review.ownerId?.name || review.ownerId?.fullName || "Pet Owner";
  
  // Create a pet identifier (you might want to customize this based on your data)
  const petInfo = review.appointmentId?.petId?.petName 
    ? `${review.appointmentId.petId.petName}`
    : "their pet";

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg relative border border-gray-100 hover:shadow-xl transition-all duration-300">
      <FaQuoteRight className="absolute top-6 right-6 w-8 h-8 text-navigray/10" />
      
      {/* Reviewer Info */}
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-navigray to-navigray-dark rounded-full flex items-center justify-center text-white font-bold text-xl">
          {ownerName.charAt(0)}
        </div>
        <div className="ml-4">
          <h4 className="font-semibold text-gray-900">{ownerName}</h4>
          <p className="text-sm text-gray-500">
            {review.doctorId?.name 
              ? `Review for Dr. ${review.doctorId.name}`
              : "Pet Owner"}
          </p>
        </div>
      </div>

      {/* Rating */}
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <FaStar 
            key={i} 
            className={`w-5 h-5 ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`} 
          />
        ))}
      </div>

      {/* Review Comment */}
      <p className="text-gray-600 italic leading-relaxed">
        "{displayComment}"
      </p>

      {/* Read More Button */}
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 text-navigray hover:text-navigray-dark text-sm font-medium transition-colors"
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </button>
      )}

      {/* Appointment Date */}
      {review.appointmentId?.appointmentDate && (
        <p className="text-xs text-gray-400 mt-4">
          Appointment: {new Date(review.appointmentId.appointmentDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </p>
      )}
    </div>
  );
};

// Landing Page Component for Non-Logged-in Users
const LandingPage = () => {
  const { data: doctorsData } = useGetDoctorsQuery();
  const { data: reviewsData, isLoading: reviewsLoading } = useGetAllReviewsQuery();
  
  const featuredDoctors = doctorsData?.doctors?.slice(0, 3) || [];
  
  // Get top 3 reviews by rating
  const topReviews = reviewsData?.reviews
    ?.filter(review => review.comment && review.comment.trim() !== "") // Only show reviews with comments
    ?.sort((a, b) => b.rating - a.rating) // Sort by rating (highest first)
    ?.slice(0, 3) || []; // Take top 3

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with Background Image */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${hero})`,
          }}
        >
          {/* Dark Overlay for better text readability */}
          <div className="absolute inset-0 bg-navigray/70"></div>
        </div>

        {/* Animated Background Elements - Now in white with lower opacity */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 animate-float">
            <FaDog className="w-24 h-24 text-white" />
          </div>
          <div className="absolute bottom-20 right-10 animate-float-delayed">
            <FaCat className="w-24 h-24 text-white" />
          </div>
          <div className="absolute bottom-40 left-1/4 animate-float">
            <FaFish className="w-16 h-16 text-white" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center animate-pulse backdrop-blur-sm">
                  <FaPaw className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center animate-bounce">
                  <FaStar className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in text-white">
              Welcome to{' '}
              <span className="text-white font-extrabold">
                VettKoneckt
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Where passionate pet parents connect with trusted veterinarians. 
              Your pet's health and happiness is our mission.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="group bg-white text-navigray px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                Get Started
                <FaChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="bg-navigray-dark/50 text-white px-8 py-4 rounded-xl font-semibold hover:bg-navigray-dark/70 transition-all border-2 border-white/30 backdrop-blur-sm flex items-center justify-center"
              >
                Sign In
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">500+</div>
                <div className="text-white/80">Happy Pets</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">50+</div>
                <div className="text-white/80">Expert Vets</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">24/7</div>
                <div className="text-white/80">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose VettKoneckt?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide the best platform for pet healthcare with trusted professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<FaUserMd className="w-8 h-8" />}
              title="Expert Vets"
              description="Certified and experienced veterinarians ready to help"
            />
            <FeatureCard
              icon={<FaCalendarCheck className="w-8 h-8" />}
              title="Easy Booking"
              description="Schedule appointments online in just a few clicks"
            />
            <FeatureCard
              icon={<FaShieldAlt className="w-8 h-8" />}
              title="Secure Platform"
              description="Your pet's data is safe and protected with us"
            />
            <FeatureCard
              icon={<FaHeart className="w-8 h-8" />}
              title="Loving Care"
              description="Compassionate care for your furry family members"
            />
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      {featuredDoctors.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Meet Our Featured Veterinarians
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Trusted professionals dedicated to your pet's wellbeing
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredDoctors.map((doctor) => (
                <DoctorCard key={doctor._id} doctor={doctor} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/register"
                className="inline-flex items-center text-navigray hover:text-navigray-dark font-semibold group"
              >
                View All Veterinarians
                <FaChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Getting started is easy with just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              number="01"
              title="Create Account"
              description="Sign up for free and create your pet's profile"
              icon={<FaPaw className="w-6 h-6" />}
            />
            <StepCard
              number="02"
              title="Find a Vet"
              description="Browse our network of verified veterinarians"
              icon={<FaUserMd className="w-6 h-6" />}
            />
            <StepCard
              number="03"
              title="Book Appointment"
              description="Schedule a visit and get the care your pet needs"
              icon={<FaCalendarCheck className="w-6 h-6" />}
            />
          </div>
        </div>
      </section>

      {/* Testimonials - Real Reviews from Platform */}
      <section className="py-20 bg-gradient-to-r from-navigray/5 to-navigray-dark/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Pet Parents Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real reviews from pet owners who trust VettKoneckt
            </p>
          </div>

          {reviewsLoading ? (
            <div className="flex justify-center py-12">
              <Loader />
            </div>
          ) : topReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {topReviews.map((review) => (
                <TestimonialCard key={review._id} review={review} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/50 rounded-2xl">
              <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <FaQuoteRight className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Reviews Yet</h3>
              <p className="text-gray-500">Be the first to share your experience!</p>
            </div>
          )}

          {/* Show review count if available */}
          {reviewsData?.count > 0 && (
            <div className="text-center mt-8">
              <p className="text-sm text-gray-500">
                Based on {reviewsData.count} verified reviews
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-navigray to-navigray-dark text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Give Your Pet the Best Care?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join VettKoneckt today and connect with trusted veterinarians in your area.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-navigray px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite;
          animation-delay: 1s;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
};

// Helper Components for Landing Page - GUARANTEED VISIBLE
const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
      <div className="absolute inset-0 bg-gradient-to-r from-navigray to-navigray-dark opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity" />
      <div className="w-16 h-16 bg-navigray rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
        {icon && React.isValidElement(icon) && (
          <div className="text-white">
            {React.cloneElement(icon, { 
              className: "w-8 h-8 text-white",
              style: { color: 'white' } 
            })}
          </div>
        )}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};

const StepCard = ({ number, title, description, icon }) => {
  // Clone the icon to ensure it's navigray colored
  const coloredIcon = React.cloneElement(icon, {
    className: "w-6 h-6 text-navigray"
  });

  return (
    <div className="relative text-center">
      <div className="relative mb-8">
        <div className="w-20 h-20 mx-auto bg-navigray/10 rounded-full flex items-center justify-center text-navigray text-2xl font-bold">
          {coloredIcon}
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-navigray rounded-full flex items-center justify-center text-white text-sm font-bold">
          {number}
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
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

  // Filter doctors based on pet owner's district
  useEffect(() => {
    if (doctorsData?.doctors) {
      const allDoctors = doctorsData.doctors;
      
      // If user is pet owner and has profile with district
      if (userInfo?.role === 'PetOwner' && profileData?.petOwnerProfile?.address?.district) {
        const userDistrict = profileData.petOwnerProfile.address.district.toLowerCase().trim();
        
        // Filter doctors that have clinic in the same district
        const nearby = allDoctors.filter(doctor => {
          const doctorDistrict = doctor.doctorProfile?.clinicDetails?.clinicDistrict;
          return doctorDistrict && doctorDistrict.toLowerCase().trim() === userDistrict;
        });
        
        // Get other doctors (limit to 4 for display)
        const others = allDoctors
          .filter(doctor => {
            const doctorDistrict = doctor.doctorProfile?.clinicDetails?.clinicDistrict;
            if (!doctorDistrict) return true;
            return doctorDistrict.toLowerCase().trim() !== userDistrict;
          })
          .slice(0, 4);
        
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

  // If not logged in, show attractive landing page
  if (!userInfo) {
    return <LandingPage />;
  }

  // Role-based rendering for logged-in users
  const roleDisplay = {
    Admin: 'Administrator',
    Doctor: 'Doctor',
    PetOwner: 'Pet Owner'
  };

  // For PetOwner, render custom home with doctor sections
  if (userInfo.role === 'PetOwner') {
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
          {/* Nearby Doctors Section */}
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
      <div className="bg-gradient-to-r from-navigray to-navigray-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-3">
            Welcome back, {userInfo.fullName}!
          </h1>
          <p className="text-white/90 text-lg max-w-2xl">
            {userInfo.role === 'Admin' 
              ? 'Manage users, pets, and appointments from your admin dashboard.'
              : 'Manage your appointments and profile from your doctor dashboard.'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {userInfo.role === 'Admin' && <AdminDashboard />}
        {userInfo.role === 'Doctor' && <DoctorDashboard />}
        
        {/* Support Section - Footer for Admin and Doctor */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="bg-gradient-to-r from-navigray/5 to-navigray-dark/5 rounded-2xl p-8 border border-navigray/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-navigray/10 rounded-full flex items-center justify-center">
                  <FaHeadset className="w-6 h-6 text-navigray" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Need Help?</h3>
                  <p className="text-gray-600">
                    Our support team is here to assist you with any questions or issues.
                  </p>
                </div>
              </div>
              <Link
                to="/contact"
                className="px-6 py-3 bg-navigray text-white rounded-lg font-medium hover:bg-navigray-dark transition-colors flex items-center whitespace-nowrap shadow-md hover:shadow-lg"
              >
                <FaHeadset className="mr-2" />
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;