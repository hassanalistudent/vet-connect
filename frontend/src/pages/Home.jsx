import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import AllDoctors from './User/AllDoctors';
import AdminDashboard from './Admin/AdminDashBoard';
import DoctorDashboard from './Appointments/DoctorDashBoard';
import Loader from '../components/Loader';
import Message from '../components/Message';

const Home = () => {
  const { userInfo, isLoading, error } = useSelector((state) => state.auth);

  // Show loader while checking authentication
  if (isLoading) {
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

  // Role-based rendering with welcome header
  const renderDashboard = () => {
    const roleDisplay = {
      Admin: 'Administrator',
      Doctor: 'Doctor',
      PetOwner: 'Pet Owner'
    };

    return (
      <>
        {/* Optional: Add a small welcome banner */}
        <div className="bg-gradient-to-r from-navigray/10 to-navigray-dark/10 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-gray-600">
              Welcome back, <span className="font-semibold text-navigray">{userInfo.fullName}</span> •{' '}
              <span className="text-sm text-gray-500">{roleDisplay[userInfo.role] || userInfo.role}</span>
            </p>
          </div>
        </div>

        {/* Render the appropriate dashboard */}
        {userInfo.role === 'Admin' && <AdminDashboard />}
        {userInfo.role === 'Doctor' && <DoctorDashboard />}
        {userInfo.role === 'PetOwner' && <AllDoctors />}
        
        {/* Fallback for unknown roles */}
        {!['Admin', 'Doctor', 'PetOwner'].includes(userInfo.role) && (
          <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-yellow-800">Unknown Role</h2>
                <p className="text-yellow-700 mt-2">
                  Your account role ({userInfo.role}) is not recognized. Please contact support.
                </p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return renderDashboard();
};

export default Home;