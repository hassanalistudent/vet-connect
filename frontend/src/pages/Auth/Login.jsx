import React from 'react'
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux';
import { useLoginMutation } from '../../redux/api/userApiSlice';
import { setCredentials } from "../../redux/features/auth/authSlice.js";
import { toast } from 'react-toastify';
import Loader from '../../components/Loader.jsx';

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [login, { isLoading }] = useLoginMutation()

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

  return (
    <section className='flex flex-col md:flex-row items-start justify-between px-[10rem]'>
      <div className="mr-[4rem] mt-[5rem]">
        <h1 className="text-2xl font-semibold mb-4">
          Sign In
        </h1>
        <form onSubmit={submitHandler} className="form container w-[40rem]">
          <div className="my-[2rem]">
            <label htmlFor="email" className='block text-sm font-medium text-black'>
              Email Address
            </label>
            <input type="email"
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
            <input type="password"
              id='password'
              className='mt-1 p-2 border rounded w-full'
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button disabled={isLoading} type='submit' className='bg-pink-500 text-black px-4 py-2 
          cursor-pointer my-[1rem]'>{isLoading ? "Signing IN..." : "Sign In"}</button>
          {isLoading && <Loader />}
        </form>
        <div className="mt-4">
          <p className='text-black'>
            New Customer ? {" "}
            <Link to={redirect ? `/register?redirect=${redirect}` : `/register`} className='text-pink-500 hover:underline'>Register</Link>
          </p>
        </div>
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