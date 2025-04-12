// src/App.js
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { setupAxiosInterceptors } from "./services/auth";
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
import ProtectedRoute from "./components/ProtectedRoute";
import FarmInfoForm from "./pages/FarmDetails";

const AuthenticatedLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 ml-24 bg-white flex flex-col h-screen overflow-auto">
        {children}
      </div>
    </div>
  );
};

function App() {
  useEffect(() => {
    // Setup axios interceptors for authentication
    setupAxiosInterceptors();
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Protected routes using the new ProtectedRoute component */}
          <Route element={<ProtectedRoute allowedRoles={['Farmer']} />}>
            <Route path="/home" element={
              <AuthenticatedLayout>
                <Home />
              </AuthenticatedLayout>
            } />
            
            <Route path="/flock-management" element={
              <AuthenticatedLayout>
                <PoultryManagement />
              </AuthenticatedLayout>
            } />
            
            <Route path="/vet-locator" element={
              <AuthenticatedLayout>
                <VetLocator />
              </AuthenticatedLayout>
            } />
            
            <Route path="/reports-&-analytics" element={
              <AuthenticatedLayout>
                <ReportsAndAnalytics />
              </AuthenticatedLayout>
            } />
          </Route>

          <Route path="/farm-details" element={
              <AuthenticatedLayout>
                <FarmInfoForm />
              </AuthenticatedLayout>
            } />
          
          {/* Routes for both Farmer and Vet */}
          <Route element={<ProtectedRoute allowedRoles={['Farmer', 'Vet']} />}>
            <Route path="/chatbot" element={
              <AuthenticatedLayout>
                <Chatbot />
              </AuthenticatedLayout>
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
          </Route>
          
          {/* Default route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;