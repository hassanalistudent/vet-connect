import  {Outlet} from 'react-router-dom'
import  Navigation  from './pages/Auth/Navigation'
import {ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { finishLoading } from './redux/features/auth/authSlice';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(finishLoading());
  }, [dispatch]);

  return (
    <>
      <ToastContainer />
      <Navigation />
      <main className="py-3">
        <Outlet />
      </main>
    </>
  );
}

export default App;
