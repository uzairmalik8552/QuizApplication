import "./App.css";
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UserLogin from "./components/login";
import QuestionList from "./components/questionList";
import ResultsPage from "./components/result";
import Student from "./screen/student";
import SessionValidation from "./components/sessionValidation";
import ProtectedRoute from "./ProtectedRoute";
import "./index.css";

function App() {
  return (
    <Routes>
      {/* Login Route */}
      <Route path="/login" element={<UserLogin />} />

      {/* Student Routes with Role Protection */}
      <Route
        path="/student"
        element={
          <ProtectedRoute role="Student">
            <Student />
          </ProtectedRoute>
        }
      >
        {/* Nested routes */}
        <Route index element={<Navigate to="session" replace />} />
        <Route path="session" element={<SessionValidation />} />
        <Route path="greeting" element={<QuestionList />} />
        <Route path="result" element={<ResultsPage />} />
      </Route>

      {/* Redirect to Login if no matching route */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
