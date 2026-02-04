// pages/ResendVerification.jsx
import  { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useResendVerificationMutation } from "../../redux/api/userApiSlice.js";
import { toast } from "react-toastify";

const ResendVerification = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [resendVerification, { isLoading: resending }] = useResendVerificationMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await resendVerification({ email }).unwrap();
      setMessage("✅ Verification email sent! Check your inbox.");
      toast.success("Verification email sent!");
    } catch (err) {
      setMessage("❌ Failed to send email. Please try again.");
      toast.error(err?.data?.message || err.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.5 7.5L21 8M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="mt-2 text-2xl font-bold text-gray-900 text-center">
            Resend Verification Email
          </h2>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Enter your email to receive a new verification link.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              placeholder="your@email.com"
              required
            />
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-sm ${
              message.includes("✅") 
                ? "bg-green-50 border border-green-200 text-green-800" 
                : "bg-red-50 border border-red-200 text-red-800"
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || resending}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center space-x-2"
          >
            {loading || resending ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Sending...</span>
              </>
            ) : (
              "Send Verification Email"
            )}
          </button>
        </form>

        <div className="text-center space-y-4">
          <Link
            to="/login"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium block"
          >
            I already have an account
          </Link>
          <Link
            to="/register"
            className="text-sm text-gray-600 hover:text-gray-900 font-medium block"
          >
            Create new account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResendVerification;