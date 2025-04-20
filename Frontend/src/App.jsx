// src/App.js
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { setupAxiosInterceptors } from "./services/auth";

import Sidebar from "./components/common/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import PoultryManagement from "./pages/PoultryManagement";
import HybridMain from "./pages/HybridMain";
import LayerMain from "./pages/LayersMain";
import BroilerMain from "./pages/BroilerMain";
import VetLocator from "./pages/VetLocator";
import ReportsAndAnalytics from "./pages/ReportsAndAnalytics";
import Chatbot from "./pages/Chatbot";
import LayerDetails from "./pages/LayerDetails";
import BroilerDetails from "./pages/BroilerDetails";
import FarmInfoForm from "./pages/FarmDetails";
import Profile from "./pages/Profile";
import AddWorker from "./pages/AddWorker";
import FinancialRecord from "./pages/FinancialRecord";

const AuthenticatedLayout = ({ children }) => {
  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <Sidebar />
      <div className="
        flex-1 bg-white flex flex-col overflow-auto
        md:ml-28 md:mb-0
        ml-0 mb-16
      ">
        {children}
      </div>
    </div>
  );
};


function App() {
  useEffect(() => {
    setupAxiosInterceptors();
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Protected Routes for Farmers */}
          <Route element={<ProtectedRoute allowedRoles={["Farmer"]} />}>
            <Route
              path="/home"
              element={<AuthenticatedLayout><Home /></AuthenticatedLayout>}
            />
            <Route
              path="/flock-management"
              element={<AuthenticatedLayout><PoultryManagement /></AuthenticatedLayout>}
            />
            <Route
              path="/dual-purpose"
              element={<AuthenticatedLayout><HybridMain /></AuthenticatedLayout>}
            />
            <Route
              path="/layer"
              element={<AuthenticatedLayout><LayerMain /></AuthenticatedLayout>}
            />
            <Route
              path="/broiler"
              element={<AuthenticatedLayout><BroilerMain /></AuthenticatedLayout>}
            />
            <Route
              path="/profile"
              element={<AuthenticatedLayout><Profile /></AuthenticatedLayout>}
            />
            <Route
              path="/vet-locator"
              element={<AuthenticatedLayout><VetLocator /></AuthenticatedLayout>}
            />
            <Route
              path="/reports-&-analytics"
              element={<AuthenticatedLayout><ReportsAndAnalytics /></AuthenticatedLayout>}
            />
            <Route
              path="/add-worker"
              element={<AuthenticatedLayout><AddWorker /></AuthenticatedLayout>}
            />
          </Route>

          {/* Farm Details (Open Route or can also be protected if needed) */}
          <Route path="/farm-details" element={<FarmInfoForm />} />

          {/* Shared Protected Routes for Farmers and Vets */}
          <Route element={<ProtectedRoute allowedRoles={["Farmer", "Vet"]} />}>
            <Route
              path="/chatbot"
              element={<AuthenticatedLayout><Chatbot /></AuthenticatedLayout>}
            />
            <Route
              path="/layer/:id"
              element={<AuthenticatedLayout><LayerDetails /></AuthenticatedLayout>}
            />
            <Route
              path="/broiler/:id"
              element={<AuthenticatedLayout><BroilerDetails /></AuthenticatedLayout>}
            />
            <Route
              path="/financial-record"
              element={<AuthenticatedLayout><FinancialRecord /></AuthenticatedLayout>}
            />
          </Route>

          {/* Default Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
