import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-blue-50 via-white to-indigo-100">

      {/*  NAVBAR  */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">
            Bulk Mailer
          </h1>

          <ul className="hidden md:flex space-x-8 font-medium text-gray-700">
            <li className="hover:text-indigo-600 cursor-pointer">Home</li>
            <li className="hover:text-indigo-600 cursor-pointer">Features</li>
            <li>
              <Link
                to="/login"
                className="hover:text-indigo-600 transition"
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Register
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/*  HERO SECTION  */}
      <section className="grow flex items-center justify-center text-center px-6 py-20">
        <div className="max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight">
            Send Bulk Emails Easily & Efficiently
          </h2>

          <p className="mt-6 text-lg text-gray-600">
            Upload an Excel file containing multiple email addresses,
            customize your subject and message, and send emails instantly
            to hundreds of recipients in just one click. Perfect for
            educational institutions and businesses.
          </p>

          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <Link
              to="/register"
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-lg font-semibold shadow-lg hover:bg-indigo-700 hover:scale-105 transition transform duration-300"
            >
              Get Started
            </Link>

            <Link
              to="/login"
              className="border-2 border-indigo-600 text-indigo-600 px-6 py-3 rounded-xl text-lg font-semibold hover:bg-indigo-600 hover:text-white transition duration-300"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/*  FEATURES SECTION  */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-gray-800 mb-12">
            Powerful Features
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Feature Card 1 */}
            <div className="bg-gray-50 p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300">
              <div className="text-indigo-600 text-3xl mb-4">🔐</div>
              <h4 className="text-xl font-semibold mb-2">
                Secure Authentication
              </h4>
              <p className="text-gray-600">
                Register and login securely with protected user access.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-gray-50 p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300">
              <div className="text-indigo-600 text-3xl mb-4">📂</div>
              <h4 className="text-xl font-semibold mb-2">
                Excel File Upload
              </h4>
              <p className="text-gray-600">
                Upload Excel files containing multiple email addresses easily.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-gray-50 p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300">
              <div className="text-indigo-600 text-3xl mb-4">✉️</div>
              <h4 className="text-xl font-semibold mb-2">
                Custom Subject & Email Body
              </h4>
              <p className="text-gray-600">
                Personalize subject and message content before sending.
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="bg-gray-50 p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300">
              <div className="text-indigo-600 text-3xl mb-4">⚡</div>
              <h4 className="text-xl font-semibold mb-2">
                Fast & Reliable Email Delivery
              </h4>
              <p className="text-gray-600">
                Send bulk emails instantly with reliable performance.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/*  FOOTER  */}
      <footer className="bg-indigo-600 text-white text-center py-6 mt-auto">
        <p className="font-semibold text-lg">Bulk Mailer</p>
        <p className="text-sm mt-1">Developed using MERN Stack</p>
        <p className="text-sm mt-1">© 2026 All rights reserved</p>
      </footer>

    </div>
  );
};

export default Home;