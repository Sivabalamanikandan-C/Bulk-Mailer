import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import API from "../api";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setIsValid(false);
      return;
    }

    API.get("/api/auth/verify", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        setIsValid(true);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setIsValid(false);
        setLoading(false);
      });
  }, [navigate]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;