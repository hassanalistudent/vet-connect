import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";

export const PetOwnerRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  return userInfo && userInfo.role === "PetOwner" ? <Outlet /> : <Navigate to="/login" replace />;
};