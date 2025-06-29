"use client";

import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.tsx";
import {
  LogOut,
  User,
  Home,
  FolderOpen,
  CheckSquare,
  Activity,
  Menu,
  X,
} from "lucide-react";

const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
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
          {/* Logo */}
          <Link
            to="/"
            className="text-xl font-bold text-gray-800 flex-shrink-0"
          >
            Smart Task Tracker
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/dashboard"
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Home size={18} />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/projects"
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FolderOpen size={18} />
              <span>Projects</span>
            </Link>

            <Link
              to="/tasks"
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <CheckSquare size={18} />
              <span>Tasks</span>
            </Link>

            {isAdmin && (
              <Link
                to="/activity-logs"
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Activity size={18} />
                <span>Activity Logs</span>
              </Link>
            )}

            {/* User Info & Logout */}
            <div className="flex items-center space-x-4 border-l border-gray-200 pl-6">
              <div className="flex items-center space-x-2">
                <User size={18} className="text-gray-600" />
                <div className="text-sm">
                  <div className="text-gray-800 font-medium">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-gray-500 text-xs">{user.role}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-md hover:bg-gray-100"
                title="Logout"
              >
                <LogOut size={18} />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-gray-800 p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* User Info */}
              <div className="flex items-center space-x-3 px-3 py-3 bg-gray-50 rounded-md mb-3">
                <User size={20} className="text-gray-600" />
                <div>
                  <div className="text-gray-800 font-medium">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-gray-500 text-sm">{user.role}</div>
                </div>
              </div>

              {/* Navigation Links */}
              <Link
                to="/dashboard"
                onClick={closeMobileMenu}
                className="flex items-center space-x-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors"
              >
                <Home size={20} />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/projects"
                onClick={closeMobileMenu}
                className="flex items-center space-x-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors"
              >
                <FolderOpen size={20} />
                <span>Projects</span>
              </Link>

              <Link
                to="/tasks"
                onClick={closeMobileMenu}
                className="flex items-center space-x-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors"
              >
                <CheckSquare size={20} />
                <span>Tasks</span>
              </Link>

              {isAdmin && (
                <Link
                  to="/activity-logs"
                  onClick={closeMobileMenu}
                  className="flex items-center space-x-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors"
                >
                  <Activity size={20} />
                  <span>Activity Logs</span>
                </Link>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded-md transition-colors w-full text-left mt-4 border-t border-gray-200 pt-4"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
