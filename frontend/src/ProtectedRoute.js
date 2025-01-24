import React from "react";
import { jwtDecode } from "jwt-decode";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const checkToken = () => {
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          sessionStorage.removeItem("token"); // Token expired, clear it
          return false;
        }
        return true;
      } catch (err) {
        sessionStorage.removeItem("token"); // Token is invalid, clear it
        return false;
      }
    }
    return false;
  };

  const isAuthenticated = checkToken();

  return isAuthenticated ? children : <Navigate to="/admin-login" />;
};

export default ProtectedRoute;
