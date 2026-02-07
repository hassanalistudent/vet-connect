import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux';
import { useLoginMutation, useForgotPasswordMutation } from '../../redux/api/userApiSlice';
import { setCredentials } from "../../redux/features/auth/authSlice.js";
import { toast } from 'react-toastify';
import Loader from '../../components/Loader.jsx';

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showForgotForm, setShowForgotForm] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [login, { isLoading: loginLoading }] = useLoginMutation()
  const [forgotPassword, { isLoading: forgotLoading }] = useForgotPasswordMutation()

  const { userInfo } = useSelector(state => state.auth)
  const { search } = useLocation()
  const sp = new URLSearchParams(search)
  const redirect = sp.get('redirect') || '/'

  useEffect(() => {
    if (userInfo) {
      navigate(redirect)
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
    } catch (error) {
      const status = error?.status;
      const message = error?.data?.message || error.message;

      if (status === 403) {
        toast.error("Please verify your email first. Check your inbox!");
        navigate("/resend-email");
      } else if (status === 401) {
        toast.error("Invalid email or password");
      } else {
        toast.error(message);
      }
    }
  };

  const forgotPasswordHandler = async (e) => {
    e.preventDefault()
    try {
      await forgotPassword(forgotEmail).unwrap()
      toast.success("✅ Check your inbox for reset link!")
      setShowForgotForm(false)
      setForgotEmail('')
    } catch (error) {
      toast.error(error?.data?.message || "Failed to send reset email")
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full flex flex-col md:flex-row bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Left Side - Login Form */}
        <div className="flex-1 p-8 md:p-12">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {showForgotForm ? 'Reset Password' : 'Welcome Back'}
              </h1>
              <p className="text-gray-600">
                {showForgotForm 
                  ? 'Enter your email to receive a reset link'
                  : 'Sign in to your account to continue'
                }
              </p>
            </div>

            {/* Login Form */}
            {!showForgotForm ? (
              <>
                <form onSubmit={submitHandler} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray focus:outline-none transition-all"
                      placeholder="Enter your email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotForm(true)}
                        className="text-sm text-navigray hover:text-navigray-dark font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      type="password"
                      id="password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray focus:outline-none transition-all"
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full bg-navigray text-white py-3 px-4 rounded-lg font-medium hover:bg-navigray-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navigray disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loginLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing In...
                      </span>
                    ) : 'Sign In'}
                  </button>
                  
                  {loginLoading && <Loader />}
                </form>

                {/* Divider */}
                <div className="flex items-center my-8">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <div className="px-4 text-gray-500 text-sm">OR</div>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Register Link */}
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Don't have an account?
                  </p>
                  <Link
                    to={redirect ? `/register?redirect=${redirect}` : `/register`}
                    className="inline-flex items-center justify-center w-full py-3 px-4 border-2 border-navigray text-navigray rounded-lg font-medium hover:bg-navigray hover:text-white transition-colors"
                  >
                    Create New Account
                  </Link>
                </div>
              </>
            ) : (
              /* Forgot Password Form */
              <>
                <form onSubmit={forgotPasswordHandler} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="forgotEmail"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray focus:outline-none transition-all"
                      placeholder="your@email.com"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      We'll send you a link to reset your password
                    </p>
                  </div>

                  <div className="space-y-4">
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full bg-navigray text-white py-3 px-4 rounded-lg font-medium hover:bg-navigray-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navigray disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {forgotLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </span>
                      ) : 'Send Reset Link'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotForm(false)
                        setForgotEmail('')
                      }}
                      className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="flex-1 bg-gradient-to-br from-navigray to-navigray-dark p-8 md:p-12 flex items-center justify-center">
          <div className="text-center text-white max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4">PetCare Veterinary</h2>
              <p className="text-navigray-light opacity-90">
                Your trusted partner in pet health and wellness. 
                Professional care for your furry family members.
              </p>
            </div>
            
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&auto=format&fit=crop&q=80"
                alt="Pet care"
                className="rounded-xl shadow-2xl w-full h-64 object-cover"
              />
              <div className="absolute -bottom-4 -right-4 bg-white text-navigray p-4 rounded-lg shadow-lg">
                <div className="text-sm font-medium">24/7 Emergency Care</div>
                <div className="text-xs text-gray-600">Always here for you</div>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">100+</div>
                <div className="text-sm opacity-90">Expert Vets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm opacity-90">Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">5K+</div>
                <div className="text-sm opacity-90">Happy Pets</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login