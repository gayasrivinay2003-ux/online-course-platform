import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import MyCourses from "./pages/MyCourses";
import Videos from "./pages/Videos";
import Profile from "./pages/Profile";
import Payment from "./pages/Payment";
import AdminDashboard from "./pages/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN PAGE */}
        <Route
          path="/"
          element={<Login />}
        />

        {/* REGISTER PAGE */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* HOME PAGE */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* COURSES PAGE */}
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <Courses />
            </ProtectedRoute>
          }
        />

        {/* MY COURSES PAGE */}
        <Route
          path="/my-courses"
          element={
            <ProtectedRoute>
              <MyCourses />
            </ProtectedRoute>
          }
        />

        {/* VIDEO PLAYER PAGE */}
        <Route
          path="/videos/:courseId"
          element={
            <ProtectedRoute>
              <Videos />
            </ProtectedRoute>
          }
        />

        {/* PROFILE PAGE */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* PAYMENT PAGE */}
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;