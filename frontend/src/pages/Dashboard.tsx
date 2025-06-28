"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.tsx";
import { api } from "../services/api.ts";
import {
  FolderOpen,
  CheckSquare,
  Clock,
  AlertTriangle,
  CheckCircle,
  Download,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";

interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  doneTasks: number;
  overdueTasks: number;
}

const Dashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalTasks: 0,
    todoTasks: 0,
    inProgressTasks: 0,
    doneTasks: 0,
    overdueTasks: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        api.get("/projects/"),
        api.get("/tasks/"),
      ]);

      const projects = projectsRes.data.results || projectsRes.data;
      const tasks = tasksRes.data.results || tasksRes.data;

      const now = new Date();
      const overdue = tasks.filter(
        (task: any) => new Date(task.due_date) < now && task.status !== "done"
      );

      setStats({
        totalProjects: projects.length,
        totalTasks: tasks.length,
        todoTasks: tasks.filter((task: any) => task.status === "todo").length,
        inProgressTasks: tasks.filter(
          (task: any) => task.status === "in_progress"
        ).length,
        doneTasks: tasks.filter((task: any) => task.status === "done").length,
        overdueTasks: overdue.length,
      });
    } catch (error) {
      toast.error("Failed to fetch dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportTasks = async () => {
    try {
      const response = await api.get("/tasks/export/", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `tasks_export_${new Date().toISOString().split("T")[0]}.json`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Tasks exported successfully!");
    } catch (error) {
      toast.error("Failed to export tasks");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-gray-600 mt-2">
            {isAdmin
              ? "Here's an overview of your organization's projects and tasks"
              : "Here's an overview of your assigned tasks and projects"}
          </p>
          <div className="mt-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                isAdmin
                  ? "bg-purple-100 text-purple-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {isAdmin ? "👑 Administrator" : "👤 Contributor"}
            </span>
          </div>
        </div>

        {isAdmin && (
          <div className="flex space-x-3">
            <button
              onClick={handleExportTasks}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              <Download size={18} />
              <span>Export Tasks</span>
            </button>
            <button
              onClick={() => (window.location.href = "/tasks")}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              <Plus size={18} />
              <span>Create Task</span>
            </button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Projects
              </p>
              <p className="text-3xl font-bold text-gray-800">
                {stats.totalProjects}
              </p>
            </div>
            <FolderOpen className="h-12 w-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-800">
                {stats.totalTasks}
              </p>
            </div>
            <CheckSquare className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
              <p className="text-3xl font-bold text-red-600">
                {stats.overdueTasks}
              </p>
            </div>
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Todo</p>
              <p className="text-3xl font-bold text-yellow-600">
                {stats.todoTasks}
              </p>
            </div>
            <Clock className="h-12 w-12 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.inProgressTasks}
              </p>
            </div>
            <Clock className="h-12 w-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.doneTasks}
              </p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/projects"
            className="flex items-center space-x-2 p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            <FolderOpen size={20} className="text-blue-600" />
            <span className="font-medium">View Projects</span>
          </a>

          <a
            href="/tasks"
            className="flex items-center space-x-2 p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            <CheckSquare size={20} className="text-green-600" />
            <span className="font-medium">View Tasks</span>
          </a>

          {isAdmin && (
            <>
              <a
                href="/activity-logs"
                className="flex items-center space-x-2 p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Clock size={20} className="text-purple-600" />
                <span className="font-medium">Activity Logs</span>
              </a>

              <button
                onClick={handleExportTasks}
                className="flex items-center space-x-2 p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Download size={20} className="text-orange-600" />
                <span className="font-medium">Export Data</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
