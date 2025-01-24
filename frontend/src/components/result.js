import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { score } = location.state || { score: 0 };

  useEffect(() => {
    // Clear session validation and quiz submission flags
    sessionStorage.removeItem("sessionValidated");
    sessionStorage.removeItem("quizSubmitted");

    // Prevent back navigation
    const preventBackNavigation = () => {
      navigate("/login");
    };

    window.addEventListener("popstate", preventBackNavigation);
    return () => window.removeEventListener("popstate", preventBackNavigation);
  }, [navigate]);

  return (
    <div className="bg-[#2a3439] min-h-screen flex flex-col items-center justify-center">
      <div className="bg-[#f5efe7] p-8 rounded-lg shadow-xl max-w-md text-center">
        <h1 className="text-2xl font-bold text-[#2a3439] mb-4">Thank You!</h1>
        <p className="text-lg text-[#2a3439] mb-6">
          Your submission was successful.
        </p>
        <p className="text-lg font-semibold text-[#2a3439]">
          Your Score: {score}
        </p>
        <button
          onClick={() => navigate("/login")}
          className="mt-6 py-2 px-4 bg-[#2a3439] text-white font-semibold rounded-md 
            hover:bg-[#1e2529] transition-colors"
        >
          Go Back to Home
        </button>
      </div>
    </div>
  );
};

export default ResultsPage;
