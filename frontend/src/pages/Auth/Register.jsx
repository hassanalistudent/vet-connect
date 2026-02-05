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
  const [phone, setPhone] = useState(""); // ✅ New field
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
    } else {
      try {
        // ✅ Include phone in payload
        const res = await register({ fullName, email, phone, password, role }).unwrap();
        navigate(redirect);
        toast.success("User successfully registered");
      } catch (error) {
        console.error(error);
        toast.error(error?.data?.message || error.message);
      }
    }
  };

  return (
    <section className="flex flex-col md:flex-row items-start justify-between px-[10rem]">
      <div className="mr-[4rem] mt-[5rem]">
        <h1 className="text-2xl font-semibold mb-4">Register</h1>
        <form onSubmit={submitHandler} className="container w-[40rem]">
          {/* Full Name */}
          <div className="my-[2rem]">
            <label htmlFor="fullName" className="block text-sm font-medium text-black">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              className="mt-1 p-2 border rounded w-full"
              placeholder="Enter full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="my-[2rem]">
            <label htmlFor="email" className="block text-sm font-medium text-black">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 p-2 border rounded w-full"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Phone */}
          <div className="my-[2rem]">
            <label htmlFor="phone" className="block text-sm font-medium text-black">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              className="mt-1 p-2 border rounded w-full"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Role */}
          <div className="my-[2rem]">
            <label htmlFor="role" className="block text-sm font-medium text-black">
              Role
            </label>
            <select
              id="role"
              className="mt-1 p-2 border rounded w-full"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="PetOwner">Pet Owner</option>
              <option value="Doctor">Doctor</option>
            </select>
          </div>

          {/* Password */}
          <div className="my-[2rem]">
            <label htmlFor="password" className="block text-sm font-medium text-black">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="mt-1 p-2 border rounded w-full"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Confirm Password */}
          <div className="my-[2rem]">
            <label htmlFor="confirmpassword" className="block text-sm font-medium text-black">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmpassword"
              className="mt-1 p-2 border rounded w-full"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Submit */}
          <button
            disabled={isLoading}
            type="submit"
            className="bg-pink-500 text-black px-4 py-2 cursor-pointer my-[1rem]"
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
          {isLoading && <Loader />}
        </form>

        {/* Redirect to Login */}
        <div className="mt-4">
          <p className="text-black">
            Already have an Account?{" "}
            <Link
              to={redirect ? `/login?redirect=${redirect}` : `/login`}
              className="text-pink-500 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>

      {/* Image */}
      <img
        src="https://images.unsplash.com/photo-1555529669-2269763671c0?w=600&auto=format&fit=crop&q=60"
        alt="Register VetConnect"
        className="h-screen w-[45%] hidden md:block rounded-lg object-cover"
      />
    </section>
  );
};

export default Register;