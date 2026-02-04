import { Navigate, Outlet } from "react-router";
import { useCheckVerifiedQuery } from "../redux/api/userApiSlice";

export const EmailVerifier = () => {
  // 🔥 RTK Query handles everything automatically
  const { 
    data, 
    isLoading, 
    error 
  } = useCheckVerifiedQuery();
console.log(data)
  // 🔄 Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>🔄 Checking email verification...</div>
      </div>
    );
  }

  // 🚫 Error or not verified
  if (error || !data?.isVerified) {
    return <Navigate to="/resend-email" replace />;
  }

  // ✅ Verified
  return <Outlet />;
};
