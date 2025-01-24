import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const StudentLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerNo, setRegisterNo] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any existing session storage on component mount
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("name");
    sessionStorage.removeItem("sessionId");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:3000/auth/student", {
        email,
        password,
        registerNo,
      });

      console.log(response.data.token);
      // Store session information
      if (response.data.token) {
        sessionStorage.setItem("token", response.data.token);
        sessionStorage.setItem("role", response.data.role);
        sessionStorage.setItem("name", response.data.name);
        sessionStorage.setItem("sessionId", response.data.sessionId);
        sessionStorage.setItem("department", response.data.department);

        // Navigate to student panel (adjust route as needed)
        navigate("/student");
      }
    } catch (error) {
      // Handle login error
      setMessage("Login failed. Please check your credentials.");
    }
  };

  const handleAdminRedirect = () => {
    navigate("/admin-login");
  };

  return (
    <div className="bg-[#2a3439] min-h-screen flex items-center justify-center shadow-inner">
      <div className="bg-[#f5efe7] p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-center text-[#2a3439]">
            Student Login
          </h1>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              className="mt-1 p-2 w-full border rounded-md focus:ring-[#2a3439] focus:border-[#2a3439]"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Register Number
            </label>
            <input
              className="mt-1 p-2 w-full border rounded-md focus:ring-[#2a3439] focus:border-[#2a3439]"
              type="text"
              value={registerNo}
              onChange={(e) => setRegisterNo(e.target.value)}
              placeholder="Register Number"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              className="mt-1 p-2 w-full border rounded-md focus:ring-[#2a3439] focus:border-[#2a3439]"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>

          <p
            className="text-[#2a3439] font-medium cursor-pointer mb-6 text-left"
            onClick={handleAdminRedirect}
          >
            Admin Login
          </p>

          <button
            className="w-full py-2 px-4 bg-[#2a3439] text-white font-semibold rounded-md shadow hover:bg-transparent hover:text-[#2a3439] border border-[#2a3439] transition-all duration-300"
            type="submit"
          >
            Login
          </button>
        </form>
        {message && <p className="mt-4 text-red-600">{message}</p>}
      </div>
    </div>
  );
};

export default StudentLogin;
