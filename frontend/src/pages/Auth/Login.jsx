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
  const [showForgotForm, setShowForgotForm] = useState(false) // 👈 NEW: Toggle forgot form
  const [forgotEmail, setForgotEmail] = useState('')

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [login, { isLoading: loginLoading }] = useLoginMutation()
  const [forgotPassword, { isLoading: forgotLoading }] = useForgotPasswordMutation() // 👈 INLINE mutation

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
    e.preventDefault()
    try {
      const res = await login({ email, password }).unwrap()
      dispatch(setCredentials({ ...res }))
    } catch (error) {
      toast.error(error?.data?.message || error.message)
    }
  }

// 👈 LINE 71 FIXED HERE 👇
const forgotPasswordHandler = async (e) => {
  e.preventDefault()
  try {
    // 🔥 FIXED: Pass STRING only (not object)
    await forgotPassword(forgotEmail).unwrap()  // "dilavarali@gmail.com"
    
    toast.success("✅ Check your inbox for reset link!")
    setShowForgotForm(false)
    setForgotEmail('')
  } catch (error) {
    toast.error(error?.data?.message || "Failed to send reset email")
  }
}

  return (
    <section className='flex flex-col md:flex-row items-start justify-between px-[10rem]'>
      <div className="mr-[4rem] mt-[5rem]">
        <h1 className="text-2xl font-semibold mb-4">
          Sign In
        </h1>
        
        {/* 👇 LOGIN FORM (Default) */}
        {!showForgotForm ? (
          <>
            <form onSubmit={submitHandler} className="form container w-[40rem]">
              <div className="my-[2rem]">
                <label htmlFor="email" className='block text-sm font-medium text-black'>
                  Email Address
                </label>
                <input 
                  type="email"
                  id='email'
                  className='mt-1 p-2 border rounded w-full'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="my-[2rem]">
                <label htmlFor="password" className='block text-sm font-medium text-black'>
                  Password
                </label>
                <input 
                  type="password"
                  id='password'
                  className='mt-1 p-2 border rounded w-full'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <button 
                disabled={loginLoading} 
                type='submit' 
                className='bg-pink-500 text-black px-4 py-2 cursor-pointer my-[1rem] w-full rounded hover:bg-pink-600 transition-colors'
              >
                {loginLoading ? "Signing IN..." : "Sign In"}
              </button>
              {loginLoading && <Loader />}
            </form>

            {/* 👇 LINKS */}
            <div className="mt-6 space-y-3 text-sm text-black">
              <p>
                New Customer? {" "}
                <Link 
                  to={redirect ? `/register?redirect=${redirect}` : `/register`} 
                  className='text-pink-500 hover:underline font-semibold'
                >
                  Register
                </Link>
              </p>
              
              <p>
                <button
                  onClick={() => setShowForgotForm(true)} // 👈 Toggle inline form
                  className='text-pink-500 hover:underline font-semibold cursor-pointer bg-transparent border-none p-0'
                >
                  Forgot your password?
                </button>
              </p>
            </div>
          </>
        ) : (
          /* 👇 FORGOT PASSWORD FORM (Inline) */
          <>
            <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
            <p className="text-gray-600 mb-6">Enter your email to receive a reset link.</p>
            
            <form onSubmit={forgotPasswordHandler} className="form container w-[40rem]">
              <div className="my-[2rem]">
                <label htmlFor="forgotEmail" className='block text-sm font-medium text-black'>
                  Email Address
                </label>
                <input 
                  type="email"
                  id='forgotEmail'
                  className='mt-1 p-2 border rounded w-full'
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <button 
                disabled={forgotLoading}
                type='submit' 
                className='bg-pink-500 text-black px-4 py-2 cursor-pointer my-[1rem] w-full rounded hover:bg-pink-600 transition-colors disabled:opacity-50'
              >
                {forgotLoading ? "Sending..." : "Send Reset Link"}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowForgotForm(false)
                  setForgotEmail('')
                }}
                className="w-full text-pink-500 hover:text-pink-600 py-2 border-none bg-transparent font-semibold text-sm"
              >
                ← Back to Sign In
              </button>
            </form>
          </>
        )}
      </div>
      
      <img
        src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2hvcHBpbmd8ZW58MHx8MHx8fDA%3D"
        alt="Login Shopping img"
        className="h-[40rem] w-[45%] xl:block md:hidden sm:hidden rounded-lg"
      />
    </section>
  )
}

export default Login
