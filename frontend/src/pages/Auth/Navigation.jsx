import React, { useState, useEffect } from "react";
import {
  AiOutlineHome,
  AiOutlineLogin,
  AiOutlineUserAdd,
  AiOutlineUser,
  AiOutlineClose,
  AiOutlineMenu
} from "react-icons/ai";
import { FaUserMd, FaDog } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./Navigation.css";
import { useDispatch, useSelector } from "react-redux";
import { useLogoutMutation } from "../../redux/api/userApiSlice.js";
import { logout } from "../../redux/features/auth/authSlice.js";

const Navigation = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true); // Open sidebar by default on desktop
      } else {
        setSidebarOpen(false); // Closed by default on mobile
      }
    };

    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    setDropdownOpen(false); // Close dropdown when toggling sidebar
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {/* Fixed Logo and Toggle Button Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-black z-[1000] border-b border-white/10 flex items-center px-4">
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          style={{ zIndex: 1001 }}
        >
          {sidebarOpen ? (
            <AiOutlineClose className="w-6 h-6 text-white" />
          ) : (
            <AiOutlineMenu className="w-6 h-6 text-white" />
          )}
        </button>

        {/* Logo */}
        <div className="ml-4 flex items-center">
          <img 
            src="/uploads/logo.jpeg" 
            alt="Logo" 
            className="h-10 w-10 object-contain rounded"
          />
          <span className="ml-3 text-white font-bold text-lg">VettKoneckt</span>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[998]"
          onClick={closeSidebar}
        />
      )}

      {/* YouTube-style Sidebar - starts below the header */}
      <div
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-black text-white z-[999] transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${sidebarOpen ? 'w-64' : 'w-20'}
        `}
      >
        {/* Sidebar Content */}
        <div className="flex flex-col h-full py-4">
          {/* Main Navigation Links */}
          <div className="flex-1 px-4 space-y-1 overflow-y-auto">
            {/* Home Link */}
            <Link
              to="/"
              className="flex items-center p-3 rounded-lg hover:bg-white/10 transition-colors"
              onClick={closeSidebar}
            >
              <AiOutlineHome className="text-xl min-w-[24px]" />
              <span className={`ml-4 ${sidebarOpen ? 'opacity-100' : 'opacity-0 w-0'} transition-all duration-300 whitespace-nowrap overflow-hidden`}>
                HOME
              </span>
            </Link>

            {/* Doctor Link for Pet Owners */}
            {userInfo?.role === "PetOwner" && (
              <Link
                to="petowner/vets"
                className="flex items-center p-3 rounded-lg hover:bg-white/10 transition-colors"
                onClick={closeSidebar}
              >
                <AiOutlineUser className="text-xl min-w-[24px]" />
                <span className={`ml-4 ${sidebarOpen ? 'opacity-100' : 'opacity-0 w-0'} transition-all duration-300 whitespace-nowrap overflow-hidden`}>
                  DOCTORS
                </span>
              </Link>
            )}

            {/* Login/Register for non-authenticated users */}
            {!userInfo && (
              <>
                <Link
                  to="/login"
                  className="flex items-center p-3 rounded-lg hover:bg-white/10 transition-colors"
                  onClick={closeSidebar}
                >
                  <AiOutlineLogin className="text-xl min-w-[24px]" />
                  <span className={`ml-4 ${sidebarOpen ? 'opacity-100' : 'opacity-0 w-0'} transition-all duration-300 whitespace-nowrap overflow-hidden`}>
                    LOGIN
                  </span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center p-3 rounded-lg hover:bg-white/10 transition-colors"
                  onClick={closeSidebar}
                >
                  <AiOutlineUserAdd className="text-xl min-w-[24px]" />
                  <span className={`ml-4 ${sidebarOpen ? 'opacity-100' : 'opacity-0 w-0'} transition-all duration-300 whitespace-nowrap overflow-hidden`}>
                    REGISTER
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* User Profile Section - Fixed at bottom */}
          {userInfo && (
            <div className="px-4 pt-4 border-t border-white/10">
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center min-w-0">
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                      <AiOutlineUser className="text-lg" />
                    </div>
                    <div className={`ml-3 min-w-0 ${sidebarOpen ? 'opacity-100' : 'opacity-0 w-0'} transition-all duration-300 overflow-hidden`}>
                      <p className="font-medium text-sm truncate">{userInfo.fullName}</p>
                      <p className="text-xs text-gray-400 truncate">{userInfo.role}</p>
                    </div>
                  </div>
                  {sidebarOpen && (
                    <svg
                      className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && sidebarOpen && (
                  <div className="absolute bottom-full left-4 right-4 mb-2 bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-white/10">
                    {userInfo.role === "Admin" && (
                      <>
                        <Link to="/admin/dashboard" className="block px-4 py-3 hover:bg-white/5 transition-colors" onClick={closeSidebar}>Dashboard</Link>
                        <Link to="/admin/userslist" className="block px-4 py-3 hover:bg-white/5 transition-colors" onClick={closeSidebar}>Users</Link>
                        <Link to="/admin/allpets" className="block px-4 py-3 hover:bg-white/5 transition-colors" onClick={closeSidebar}>All Pets</Link>
                        <Link to="/admin/allappointments" className="block px-4 py-3 hover:bg-white/5 transition-colors" onClick={closeSidebar}>All Appointments</Link>
                      </>
                    )}

                    {userInfo.role === "Doctor" && (
                      <>
                        <Link to="/doctor/profile" className="flex items-center px-4 py-3 hover:bg-white/5 transition-colors" onClick={closeSidebar}>
                          <FaUserMd className="mr-3" /> My Profile
                        </Link>
                        <Link to="/doctor/doctor-appointments" className="block px-4 py-3 hover:bg-white/5 transition-colors" onClick={closeSidebar}>Appointments</Link>
                      </>
                    )}

                    {userInfo.role === "PetOwner" && (
                      <>
                        <Link to="/petowner/mypets" className="flex items-center px-4 py-3 hover:bg-white/5 transition-colors" onClick={closeSidebar}>
                          <FaDog className="mr-3" /> My Pets
                        </Link>
                        <Link to="/petowner/createpet" className="flex items-center px-4 py-3 hover:bg-white/5 transition-colors" onClick={closeSidebar}>
                          <FaDog className="mr-3" /> Create Pet
                        </Link>
                        <Link to="/petowner/owner-appointments" className="block px-4 py-3 hover:bg-white/5 transition-colors" onClick={closeSidebar}>Appointments</Link>
                        <Link to="/petowner/profile" className="block px-4 py-3 hover:bg-white/5 transition-colors" onClick={closeSidebar}>Profile</Link>
                      </>
                    )}

                    <button
                      onClick={() => {
                        logoutHandler();
                        closeSidebar();
                      }}
                      className="block w-full text-left px-4 py-3 hover:bg-red-500/10 text-red-400 transition-colors border-t border-white/10"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navigation;