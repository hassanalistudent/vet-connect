import React, { useState, useEffect } from "react";
import logo from "../../assets/logo.png"
import {
  AiOutlineHome,
  AiOutlineLogin,
  AiOutlineUserAdd,
  AiOutlineUser,
  AiOutlineClose,
  AiOutlineMenu,
  AiOutlineDashboard,
  AiOutlineCalendar,
  AiOutlineProfile
} from "react-icons/ai";
import { FaUserMd, FaDog, FaPaw } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./Navigation.css";
import { useDispatch, useSelector } from "react-redux";
import { useLogoutMutation } from "../../redux/api/userApiSlice.js";
import { logout } from "../../redux/features/auth/authSlice.js";

const Navigation = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileMenuOpen(false); // Close mobile menu on desktop
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
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

  // Get navigation links based on user role
  const getNavLinks = () => {
    const links = [];

    // Home link for everyone
    links.push({
      to: "/",
      icon: <AiOutlineHome className="w-6 h-6" />,
      label: "Home"
    });

    if (!userInfo) {
      // Public links
      links.push(
        {
          to: "/login",
          icon: <AiOutlineLogin className="w-6 h-6" />,
          label: "Login"
        },
        {
          to: "/register",
          icon: <AiOutlineUserAdd className="w-6 h-6" />,
          label: "Register"
        }
      );
    } else {
      // Role-based links
      switch (userInfo.role) {
        case "Admin":
          links.push(
            {
              to: "/admin/dashboard",
              icon: <AiOutlineDashboard className="w-6 h-6" />,
              label: "Dashboard"
            },
            {
              to: "/admin/userslist",
              icon: <AiOutlineUser className="w-6 h-6" />,
              label: "Users"
            },
            {
              to: "/admin/allpets",
              icon: <FaPaw className="w-6 h-6" />,
              label: "Pets"
            },
            {
              to: "/admin/allappointments",
              icon: <AiOutlineCalendar className="w-6 h-6" />,
              label: "Appointments"
            }
          );
          break;

        case "Doctor":
          links.push(
            {
              to: "/doctor/profile",
              icon: <FaUserMd className="w-6 h-6" />,
              label: "Profile"
            },
            {
              to: "/doctor/doctor-appointments",
              icon: <AiOutlineCalendar className="w-6 h-6" />,
              label: "Appointments"
            },
            {
              to: "/doctor/dashboard",
              icon: <AiOutlineDashboard className="w-6 h-6" />,
              label: "Dashboard"
            }
          );
          break;

        case "PetOwner":
          links.push(
            {
              to: "/petowner/vets",
              icon: <FaUserMd className="w-6 h-6" />,
              label: "Doctors"
            },
            {
              to: "/petowner/mypets",
              icon: <FaDog className="w-6 h-6" />,
              label: "My Pets"
            },
            {
              to: "/petowner/owner-appointments",
              icon: <AiOutlineCalendar className="w-6 h-6" />,
              label: "Appointments"
            },
            {
              to: "/petowner/profile",
              icon: <AiOutlineProfile className="w-6 h-6" />,
              label: "Profile"
            }
          );
          break;
      }
    }

    return links;
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Top Navigation Bar - Always visible */}
      <nav className="fixed top-0 left-0 right-0 bg-white text-navigray z-50 border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Clean & Properly Fitted */}
            <Link to="/" className="flex items-center">
              <img
                src={logo}
                alt="VETT KONECKT"
                className="h-10 md:h-11 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation - Center */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.to}
                  className="group flex items-center px-4 py-2 rounded-lg hover:bg-navigray transition-all text-sm font-medium text-gray-700"
                >
                  <span className="mr-2 text-navigray group-hover:text-white transition-colors duration-300">
                    {link.icon}
                  </span>
                  <span className="group-hover:text-white transition-colors duration-300">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>

            {/* Desktop Profile Section */}
            {userInfo && (
              <div className="hidden md:block relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="group flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-navigray transition-all text-gray-700"
                >
                  <div className="w-8 h-8 bg-navigray rounded-full flex items-center justify-center border-2 border-navigray-light/20 group-hover:border-white/40 transition-all">
                    <AiOutlineUser className="text-lg text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium truncate max-w-[150px] text-gray-700 group-hover:text-white transition-colors duration-300">
                      {userInfo.fullName}
                    </p>
                    <p className="text-xs text-gray-500 group-hover:text-white/80 transition-colors duration-300">
                      {userInfo.role}
                    </p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-500 group-hover:text-white transition-all duration-300 ${profileDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 animate-fadeIn">
                    <div className="py-1">
                      <Link
                        to={`/${userInfo.role.toLowerCase()}/profile`}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-navigray hover:text-white transition-colors duration-300"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        Profile Settings
                      </Link>
                      <button
                        onClick={logoutHandler}
                        className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-300 border-t border-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Profile Icon - Right side on mobile */}
            {userInfo && isMobile && (
              <div className="md:hidden relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="p-2 rounded-lg hover:bg-navigray transition-all group"
                >
                  <div className="w-8 h-8 bg-navigray rounded-full flex items-center justify-center border-2 border-navigray-light/20 group-hover:border-white/40 transition-all">
                    <AiOutlineUser className="text-lg text-white" />
                  </div>
                </button>

                {/* Mobile Profile Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 animate-fadeIn">
                    <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-navigray/5 to-transparent">
                      <p className="font-medium text-gray-900">{userInfo.fullName}</p>
                      <p className="text-xs text-navigray mt-0.5">{userInfo.role}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to={`/${userInfo.role.toLowerCase()}/profile`}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-navigray hover:text-white transition-colors duration-300"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        Profile Settings
                      </Link>
                      <button
                        onClick={() => {
                          logoutHandler();
                          setProfileDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-300 border-t border-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom Navigation Bar - Mobile Only with Icons */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white text-gray-600 z-50 border-t border-gray-200 shadow-lg md:hidden">
          <div className="flex items-center justify-around h-16">
            {navLinks.map((link, index) => (
              <Link
                key={index}
                to={link.to}
                className="group flex flex-col items-center justify-center px-3 py-1 rounded-lg hover:text-navigray transition-all"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <span className="text-xl transition-all duration-300 text-gray-500 group-hover:text-navigray group-hover:scale-110">
                  {link.icon}
                </span>
                <span className="text-[10px] mt-0.5 font-medium text-gray-500 group-hover:text-navigray transition-colors duration-300">
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Spacer to prevent content from going under fixed navbars */}
      <div className={`h-16 ${isMobile ? 'mb-16' : ''}`} />

      {/* Add animation keyframes */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default Navigation;