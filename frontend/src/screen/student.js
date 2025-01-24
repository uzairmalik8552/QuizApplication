import React, { useEffect } from "react";
import { Outlet, Navigate, useNavigate } from "react-router-dom";

const Student = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication and redirect to session validation if needed
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");

    if (!token || role !== "Student") {
      navigate("/login");
      return;
    }

    // If on /student route, redirect to session validation
    if (window.location.pathname === "/student") {
      navigate("/student/session");
    }
  }, [navigate]);

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");
    return token && role === "Student";
  };

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default Student;
