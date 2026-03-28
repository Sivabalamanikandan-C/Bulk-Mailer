import { useState } from "react";
// import axios from "axios";
import API from "../api";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/api/auth/register", form);

      setMessage(res.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (error) {
      setMessage(error.response?.data?.message || "Error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-indigo-100 px-4">

      {/* Register Card */}
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">

        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6">
          Create Account
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Username */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Username
            </label>

            <input
              name="username"
              value={form.username}
              placeholder="Enter username"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Email
            </label>

            <input
              name="email"
              type="email"
              value={form.email}
              placeholder="Enter email"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Password
            </label>

            <input
              name="password"
              type="password"
              value={form.password}
              placeholder="Enter password"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300 shadow-md"
          >
            Register
          </button>

        </form>

        {/* Message */}
        {message && (
          <p className="text-center text-sm mt-4 text-green-600">
            {message}
          </p>
        )}

        {/* Login Link */}
        <p className="text-center text-sm mt-6 text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>

      </div>

    </div>
  );
};

export default Register;