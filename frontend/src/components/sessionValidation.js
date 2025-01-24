import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SessionValidation = () => {
  const [sessionId, setSessionId] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Prevent back navigation to session page after validation
    const preventBackNavigation = () => {
      if (sessionStorage.getItem("sessionValidated") === "true") {
        navigate("/student/greeting");
      }
    };

    window.addEventListener("popstate", preventBackNavigation);
    return () => window.removeEventListener("popstate", preventBackNavigation);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = sessionStorage.getItem("token");

    if (!token) {
      setMessage("No active session. Please log in again.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3000/auth/validate-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sessionId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Session validation failed");
      }

      // Set session validation flag
      sessionStorage.setItem("sessionValidated", "true");
      navigate("/student/greeting");
    } catch (error) {
      setMessage(error.message || "Session validation failed");
    }
  };

  return (
    <div className="bg-[#2a3439] min-h-screen flex items-center justify-center shadow-inner">
      <div className="bg-[#f5efe7] p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-center text-[#2a3439]">
            Session Validation
          </h1>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Session ID
            </label>
            <input
              className="mt-1 p-2 w-full border rounded-md focus:ring-[#2a3439] focus:border-[#2a3439]"
              type="text"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="Enter Session ID"
              required
            />
          </div>

          <button
            className="w-full py-2 px-4 bg-[#2a3439] text-white font-semibold rounded-md shadow hover:bg-transparent hover:text-[#2a3439] border border-[#2a3439] transition-all duration-300"
            type="submit"
          >
            Validate Session
          </button>
        </form>
        {message && <p className="mt-4 text-red-600 text-center">{message}</p>}
      </div>
    </div>
  );
};

export default SessionValidation;
