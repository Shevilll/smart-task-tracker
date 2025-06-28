"use client";

import type React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.tsx";
import {
  LogOut,
  User,
  Home,
  FolderOpen,
  CheckSquare,
  Activity,
} from "lucide-react";

const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-gray-800">
              Smart Task Tracker
            </Link>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-gray-800">
            Smart Task Tracker
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              to="/dashboard"
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
            >
              <Home size={18} />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/projects"
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
            >
              <FolderOpen size={18} />
              <span>Projects</span>
            </Link>

            <Link
              to="/tasks"
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
            >
              <CheckSquare size={18} />
              <span>Tasks</span>
            </Link>

            {isAdmin && (
              <Link
                to="/activity-logs"
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
              >
                <Activity size={18} />
                <span>Activity Logs</span>
              </Link>
            )}

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User size={18} className="text-gray-600" />
                <span className="text-sm text-gray-600">
                  {user.first_name} {user.last_name}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    user.role === "admin"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {user.role.toUpperCase()}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
