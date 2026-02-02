import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";

export const DoctorRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  return userInfo && userInfo.role === "Doctor" ? <Outlet /> : console.log("DoctorRoute userInfo:", userInfo);
};