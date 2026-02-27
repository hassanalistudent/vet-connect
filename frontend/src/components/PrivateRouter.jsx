import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export const PrivateRouter = () => {
  const { userInfo, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <p>Loading...</p>
    </div>;
  }

  return userInfo ? <Outlet /> : <Navigate to="/login" replace />;
};