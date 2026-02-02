import React, { useState } from "react";
import {
  AiOutlineHome,
  AiOutlineLogin,
  AiOutlineUserAdd,
} from "react-icons/ai";
import { FaUserMd, FaDog } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./Navigation.css";
import { useDispatch, useSelector } from "react-redux";
import {useLogoutMutation} from "../../redux/api/userApiSlice.js"
import { logout } from "../../redux/features/auth/authSlice.js";

const Navigation = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggleSidebar = () => setShowSidebar(!showSidebar);
  const closeSidebar = () => setShowSidebar(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();

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
    <div
      style={{ zIndex: 999 }}
      className={`${showSidebar ? "hidden" : "flex"} xl:flex lg:flex md:hidden sm:hidden 
      flex-col justify-between p-4 text-white bg-black w-[4%] hover:w-[15%] h-[100vh] fixed`}
      id="navigation-container"
    >
      {/* Top links */}
      <div className="flex flex-col space-y-4">
        <Link to="/" className="flex items-center">
          <AiOutlineHome className="mr-2" size={26} />
          <span className="hidden nav-item-name">HOME</span>
        </Link>
      </div>

      {/* User dropdown */}
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="flex items-center text-gray-8000 focus:outline-none"
        >
          {userInfo ? (
            <span className="text-white">{userInfo.fullName}</span>
          ) : (
            <></>
          )}
          {userInfo && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 m-1 ${dropdownOpen ? "transform rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={dropdownOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
              />
            </svg>
          )}
        </button>

        {dropdownOpen && userInfo && (
          <ul
            className={`absolute right-0 mt-2 ml-14 space-y-2 bg-white text-gray-600 
            ${userInfo.role === "Admin" ? "-top-50" : "-top-50"}`}
          >
            {/* Admin links */}
            {userInfo.role === "Admin" && (
              <>
                <li>
                  <Link
                    to="/admin/dashboard"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/userslist"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Users
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/allpets"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    All Pets
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/allappointments"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    All Appointments
                  </Link>
                </li>
              </>
            )}

            {/* Doctor links */}
            {userInfo.role === "Doctor" && (
              <>
                <li>
                  <Link
                    to="/doctor/profile"
                    className="block px-4 py-2 hover:bg-gray-100 flex items-center"
                  >
                    <FaUserMd className="mr-2" /> My Profile
                  </Link>
                </li>
                <li>
                  <Link
                    to="/doctor/doctor-appointments"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Appointments
                  </Link>
                </li>
              </>
            )}

            {/* PetOwner links */}
            {userInfo.role === "PetOwner" && (
              <>
                <li>
                  <Link
                    to="/petowner/mypets"
                    className="block px-4 py-2 hover:bg-gray-100 flex items-center"
                  >
                    <FaDog className="mr-2" /> My Pets
                  </Link>
                </li>
                <li>
                  <Link
                    to="/petowner/createpet"
                    className="block px-4 py-2 hover:bg-gray-100 flex items-center"
                  >
                    <FaDog className="mr-2" /> Create Pet
                  </Link>
                </li>
                <li>
                  <Link
                    to="/petowner/owner-appointments"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Appointments
                  </Link>
                </li>
                 <li>
              <Link
                to="petowner/profile"
                className="block px-4 py-2 hover:bg-gray-100"
              >
                Profile
              </Link>
            </li>
              </>
            )}

            {/* Common links */}
           
            <li>
              <Link
                onClick={logoutHandler}
                className="block px-4 py-2 hover:bg-gray-100"
              >
                Logout
              </Link>
            </li>
          </ul>
        )}
      </div>

      {/* Login/Register if not logged in */}
      {!userInfo && (
        <ul>
          <li>
            <Link to="/login" className="flex items-center">
              <AiOutlineLogin className="mr-2" size={26} />
              <span className="hidden nav-item-name">LOGIN</span>
            </Link>
          </li>
          <li>
            <Link to="/register" className="flex items-center">
              <AiOutlineUserAdd className="mr-2" size={26} />
              <span className="hidden nav-item-name">REGISTER</span>
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
};

export default Navigation;