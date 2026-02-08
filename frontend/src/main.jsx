import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css"; // ✅ Tailwind CSS
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import { Provider } from "react-redux";   // ✅ FIX: import Provider
import store from "./redux/store.js";

import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import { PrivateRouter } from "./components/PrivateRouter.jsx";
import PetOwnerProfile from "./pages/User/PetOwnerProfile.jsx";
import {PetOwnerRoute} from './components/PetOwnerRouter.jsx'
import { DoctorRoute } from "./components/DoctorRouter.jsx";
import {AdminRoute} from './components/AdminRouter.jsx' 
import DoctorProfile from "./pages/User/DoctorProfile.jsx";
import UserList from "./pages/Admin/UserList.jsx";
import UserDetails from "./pages/User/UserDetails.jsx";
import AllPets from "./pages/Admin/AllPets.jsx";
import UserPets from "./pages/Pets/UserPets.jsx";
import PetDetails from "./pages/Pets/GetPetDetails.jsx";
import CreatePet from "./pages/Pets/CreatePet.jsx";
import DoctorAppointments from "./pages/Appointments/DoctorAppointments.jsx";
import DoctorResponse from "./pages/Appointments/DoctorResponse.jsx";
import PetOwnerResponse from "./pages/Appointments/PetOwnerResponse.jsx";
import PetOwnerAppointments from "./pages/Appointments/PetOwnerAppointments.jsx";
import AdminAllAppointments from "./pages/Admin/AdminAllAppointments.jsx";
import CreateAppointment from "./pages/Appointments/CreateAppointment.jsx";
import AllDoctors from "./pages/User/AllDoctors.jsx";
import VideoSession from "./pages/Appointments/VideoSession.jsx";
import CompleteAppointment from "./pages/Appointments/CompleteAppointment.jsx";
import AuthVerification from "./pages/Auth/AuthVarification.jsx";
import ResendVerification from "./pages/Auth/ResendVarificationEmail.jsx";
import { EmailVerifier } from "./components/EmailVerifier.jsx";
import ResetPassword from "./pages/Auth/ResetPassword.jsx";


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/verify-email" element={<AuthVerification />}/>
      <Route path="/resend-email" element={<ResendVerification />}/>
      <Route path="/reset-password/:token" element={<ResetPassword/>}/>
      <Route  path=":id" element={<UserDetails/>}/>

      <Route  path="" element={<PrivateRouter/>}>  
      <Route path="" element={<EmailVerifier/>}>   
     <Route  path=":doctorId/newappointment" element={<CreateAppointment/>}/>
      <Route  path="pet/:id" element={<PetDetails/>}/>
      <Route  path=":appointmentId/video" element={<VideoSession/>}/>
      <Route  path="petowner" element={<PetOwnerRoute/>}>
          <Route  path="profile" element={<PetOwnerProfile/>}/>
          <Route  path="mypets" element={<UserPets/>}/>
          <Route  path="createPet" element={<CreatePet/>}/>
          <Route  path="owner-appointments" element={<PetOwnerAppointments/>}/>
          <Route  path=":id/owner-response" element={<PetOwnerResponse/>}/>
          <Route  path="vets" element={<AllDoctors/>}/>
          
      </Route>
      <Route  path="doctor" element={<DoctorRoute/>}>
          <Route  path="profile" element={<DoctorProfile/>}/>
          <Route  path="doctor-appointments" element={<DoctorAppointments/>}/>
          <Route  path=":id/doctor-response" element={<DoctorResponse/>}/>
          <Route  path=":appointmentId/complete" element={<CompleteAppointment/>}/>
      </Route>
      <Route  path="admin" element={<AdminRoute/>}>
          <Route  path="userslist" element={<UserList/>}/>
          <Route  path="allpets" element={<AllPets/>}/>
          <Route  path="allappointments" element={<AdminAllAppointments/>}/>
      </Route>
      </Route>
      </Route>
    </Route>

    
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);