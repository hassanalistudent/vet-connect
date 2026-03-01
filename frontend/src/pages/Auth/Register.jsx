import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Loader from "../../components/Loader.jsx";
import { useRegisterMutation } from "../../redux/api/userApiSlice.js";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("PetOwner");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState([]);

  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  // Password validation function
  const validatePassword = (pass) => {
    const errors = [];
    
    if (pass.length < 6) {
      errors.push("At least 6 characters");
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) {
      errors.push("At least one special character (!@#$%^&*)");
    }
    
    if (!/[A-Z]/.test(pass)) {
      errors.push("At least one uppercase letter");
    }
    
    if (!/[a-z]/.test(pass)) {
      errors.push("At least one lowercase letter");
    }
    
    if (!/[0-9]/.test(pass)) {
      errors.push("At least one number");
    }
    
    return errors;
  };

  // Update password errors when password changes
  useEffect(() => {
    setPasswordErrors(validatePassword(password));
  }, [password]);

  const isPasswordValid = () => {
    return passwordErrors.length === 0 && password.length > 0;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    
    // Validate password before submission
    const errors = validatePassword(password);
    if (errors.length > 0) {
      toast.error("Please meet all password requirements");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    try {
      const res = await register({ fullName, email, phone, password, role }).unwrap();
      navigate(redirect);
      toast.success("User successfully registered");
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full flex flex-col md:flex-row bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Left Side - Register Form */}
        <div className="flex-1 p-8 md:p-12">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Create Account
              </h1>
              <p className="text-gray-600">
                Join PetCare Veterinary to get started with premium pet care services
              </p>
            </div>

            <form onSubmit={submitHandler} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-2">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray focus:outline-none transition-all"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray focus:outline-none transition-all"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray focus:outline-none transition-all"
                  placeholder="+1 (555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  I want to register as *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole("PetOwner")}
                    className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                      role === "PetOwner" 
                      ? "border-navigray bg-navigray text-white" 
                      : "border-gray-300 text-gray-700 hover:border-navigray hover:text-navigray"
                    }`}
                  >
                    Pet Owner
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("Doctor")}
                    className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                      role === "Doctor" 
                      ? "border-navigray bg-navigray text-white" 
                      : "border-gray-300 text-gray-700 hover:border-navigray hover:text-navigray"
                    }`}
                  >
                    Veterinarian
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {role === "PetOwner" 
                    ? "Register to manage your pets and appointments" 
                    : "Register as a veterinary professional to provide care"}
                </p>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-navigray focus:outline-none transition-all ${
                    password && !isPasswordValid()
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : password && isPasswordValid()
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                      : 'border-gray-300 focus:border-navigray'
                  }`}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                
                {/* Password Requirements Checklist */}
                {password && (
                  <div className="bg-gray-50 rounded-lg p-3 mt-2 border border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">Password must contain:</p>
                    <ul className="space-y-1.5">
                      <li className="flex items-center text-xs">
                        <span className={`mr-2 ${password.length >= 6 ? 'text-green-500' : 'text-gray-300'}`}>
                          {password.length >= 6 ? '✓' : '○'}
                        </span>
                        <span className={password.length >= 6 ? 'text-green-700' : 'text-gray-500'}>
                          At least 6 characters
                        </span>
                      </li>
                      <li className="flex items-center text-xs">
                        <span className={`mr-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-500' : 'text-gray-300'}`}>
                          {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? '✓' : '○'}
                        </span>
                        <span className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-700' : 'text-gray-500'}>
                          At least one special character (!@#$%^&*)
                        </span>
                      </li>
                      <li className="flex items-center text-xs">
                        <span className={`mr-2 ${/[A-Z]/.test(password) ? 'text-green-500' : 'text-gray-300'}`}>
                          {/[A-Z]/.test(password) ? '✓' : '○'}
                        </span>
                        <span className={/[A-Z]/.test(password) ? 'text-green-700' : 'text-gray-500'}>
                          At least one uppercase letter
                        </span>
                      </li>
                      <li className="flex items-center text-xs">
                        <span className={`mr-2 ${/[a-z]/.test(password) ? 'text-green-500' : 'text-gray-300'}`}>
                          {/[a-z]/.test(password) ? '✓' : '○'}
                        </span>
                        <span className={/[a-z]/.test(password) ? 'text-green-700' : 'text-gray-500'}>
                          At least one lowercase letter
                        </span>
                      </li>
                      <li className="flex items-center text-xs">
                        <span className={`mr-2 ${/[0-9]/.test(password) ? 'text-green-500' : 'text-gray-300'}`}>
                          {/[0-9]/.test(password) ? '✓' : '○'}
                        </span>
                        <span className={/[0-9]/.test(password) ? 'text-green-700' : 'text-gray-500'}>
                          At least one number
                        </span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label htmlFor="confirmpassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="confirmpassword"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-navigray focus:outline-none transition-all ${
                    confirmPassword && password !== confirmPassword
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : confirmPassword && password === confirmPassword && isPasswordValid()
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                      : 'border-gray-300 focus:border-navigray'
                  }`}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    Passwords do not match
                  </p>
                )}
                {confirmPassword && password === confirmPassword && isPasswordValid() && (
                  <p className="text-sm text-green-600 mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Passwords match
                  </p>
                )}
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">Password strength:</span>
                    <span className={`text-xs font-medium ${
                      passwordErrors.length === 0 ? 'text-green-600' :
                      passwordErrors.length <= 2 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {passwordErrors.length === 0 ? 'Strong' :
                       passwordErrors.length <= 2 ? 'Medium' :
                       'Weak'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        passwordErrors.length === 0 ? 'bg-green-500' :
                        passwordErrors.length <= 2 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.max(0, 100 - (passwordErrors.length * 20))}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                disabled={isLoading || (password && !isPasswordValid())}
                type="submit"
                className="w-full bg-navigray text-white py-3 px-4 rounded-lg font-medium hover:bg-navigray-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navigray disabled:opacity-70 disabled:cursor-not-allowed mt-6"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : 'Create Account'}
              </button>
              
              {isLoading && <Loader />}
            </form>

            {/* Divider */}
            <div className="flex items-center my-8">
              <div className="flex-1 border-t border-gray-300"></div>
              <div className="px-4 text-gray-500 text-sm">ALREADY HAVE AN ACCOUNT?</div>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <Link
                to={redirect ? `/login?redirect=${redirect}` : `/login`}
                className="inline-flex items-center justify-center w-full py-3 px-4 border-2 border-navigray text-navigray rounded-lg font-medium hover:bg-navigray hover:text-white transition-colors"
              >
                Sign In to Existing Account
              </Link>
            </div>

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center mt-6">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-navigray hover:underline">Terms of Service</a> and{" "}
              <a href="#" className="text-navigray hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="flex-1 bg-gradient-to-br from-navigray to-navigray-dark p-8 md:p-12 flex items-center justify-center">
          <div className="text-center text-white max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4">Why Join PetCare?</h2>
              <p className="text-navigray-light opacity-90">
                Experience premium veterinary care with expert professionals dedicated to your pet's health and well-being.
              </p>
            </div>
            
            <div className="relative mb-8">
              <img
                src="https://plus.unsplash.com/premium_vector-1732667170846-75b7216358f1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dmV0ZXJpbmFyeXxlbnwwfHwwfHx8MA%3D%3D"
                alt="Pet registration"
                className="rounded-xl shadow-2xl w-full h-64 object-cover"
              />
              <div className="absolute -bottom-4 -right-4 bg-white text-navigray p-4 rounded-lg shadow-lg">
                <div className="text-sm font-medium">Expert Care</div>
                <div className="text-xs text-gray-600">Certified Professionals</div>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-4 text-left">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-navigray-light mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h4 className="font-semibold">24/7 Support</h4>
                  <p className="text-sm opacity-90">Round-the-clock care and emergency services</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <svg className="w-6 h-6 text-navigray-light mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h4 className="font-semibold">Easy Appointments</h4>
                  <p className="text-sm opacity-90">Book vet visits with just a few clicks</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <svg className="w-6 h-6 text-navigray-light mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h4 className="font-semibold">Pet Health Records</h4>
                  <p className="text-sm opacity-90">Secure digital records for all your pets</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">100+</div>
                <div className="text-sm opacity-90">Expert Vets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-sm opacity-90">Happy Pets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">98%</div>
                <div className="text-sm opacity-90">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;