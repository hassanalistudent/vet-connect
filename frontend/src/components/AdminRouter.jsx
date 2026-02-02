import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";

export const AdminRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  return userInfo && userInfo.role === "Admin" ? <Outlet /> : <Navigate to="/login" replace />;
};