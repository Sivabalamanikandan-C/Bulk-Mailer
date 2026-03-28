import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BulkMail from "./pages/BulkMail";
import MailHistory from "./pages/MailHistory";
import ProtectedRoute from "./pages/ProtectedRoute";
// import ForgotPassword from "./pages/ForgotPassword";
// import ResetPassword from "./pages/ResetPassword";

const ScheduledCampaigns = lazy(() => import("./pages/ScheduledCampaigns"));

function App() {

  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />}></Route>

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        <Route path="/bulk-mail" element={<ProtectedRoute><BulkMail /></ProtectedRoute>} />

        <Route path="/history" element={<ProtectedRoute><MailHistory /></ProtectedRoute>} />

        <Route path="/scheduled" element={
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <ScheduledCampaigns />
            </Suspense>
          </ProtectedRoute>
        } />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
