import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./components/common/Sidebar";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import PoultryManagement from "./pages/PoultryManagement";
import VetLocator from "./pages/VetLocator";
import Chatbot from "./pages/Chatbot";
import ReportsAndAnalytics from "./pages/ReportsAndAnalytics";
import LayerDetails from "./pages/LayerDetails";
import BroilerDetails from "./pages/BroilerDetails";

const isAuthenticated = () => localStorage.getItem("authToken") !== null;

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/dashboard" replace />;
};

const AuthenticatedLayout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar location={location} />
      <div className="flex-1 ml-24 bg-white flex flex-col h-screen overflow-auto">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={
          // <ProtectedRoute>
          <AuthenticatedLayout>
            <Home />
          </AuthenticatedLayout>
          // </ProtectedRoute>
        } />
        <Route path="/flock-management" element={
          // <ProtectedRoute>
          <AuthenticatedLayout>
            <PoultryManagement />
          </AuthenticatedLayout>
          // </ProtectedRoute>
        } />
        <Route path="/vet-locator" element={
          // <ProtectedRoute>
          <AuthenticatedLayout>
            <VetLocator />
          </AuthenticatedLayout>
          // </ProtectedRoute>
        } />
        <Route path="/chatbot" element={
          // <ProtectedRoute>
          <AuthenticatedLayout>
            <Chatbot />
          </AuthenticatedLayout>
          // </ProtectedRoute>
        } />
        <Route path="/reports-&-analytics" element={
          // <ProtectedRoute>
          <AuthenticatedLayout>
            <ReportsAndAnalytics />
          </AuthenticatedLayout>
          // </ProtectedRoute>
        } />

        <Route path="/layer/:id" element={
          <AuthenticatedLayout>
            <LayerDetails />
          </AuthenticatedLayout>
        } />

        <Route path="/broiler/:id" element={
          <AuthenticatedLayout>
            <BroilerDetails />
          </AuthenticatedLayout>
        } />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;