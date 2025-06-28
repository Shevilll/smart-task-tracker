"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.tsx";
import { api } from "../services/api.ts";
import { Plus, Edit, Trash2, FolderOpen } from "lucide-react";
import toast from "react-hot-toast";

interface Project {
  id: number;
  title: string;
  description: string;
  owner: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  tasks_count: number;
}

const Projects: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      console.log("Fetching projects..."); // Debug log
      const response = await api.get("/projects/");
      console.log("Projects response:", response.data); // Debug log
      setProjects(response.data.results || response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to fetch projects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    console.log("Submitting project data:", formData); // Debug log

    try {
      if (editingProject) {
        console.log("Updating project:", editingProject.id); // Debug log
        const response = await api.put(
          `/projects/${editingProject.id}/`,
          formData
        );
        console.log("Update response:", response.data); // Debug log
        toast.success("Project updated successfully");
      } else {
        console.log("Creating new project"); // Debug log
        const response = await api.post("/projects/", formData);
        console.log("Create response:", response.data); // Debug log
        toast.success("Project created successfully");
      }

      setFormData({ title: "", description: "" });
      setShowCreateModal(false);
      setEditingProject(null);
      fetchProjects();
    } catch (error: any) {
      console.error("Error saving project:", error);
      console.error("Error response:", error.response?.data);

      if (error.response?.data) {
        // Handle validation errors
        const errorMessages = [];
        for (const [field, messages] of Object.entries(error.response.data)) {
          if (Array.isArray(messages)) {
            errorMessages.push(`${field}: ${messages.join(", ")}`);
          } else {
            errorMessages.push(`${field}: ${messages}`);
          }
        }
        toast.error(`Failed to save project: ${errorMessages.join("; ")}`);
      } else {
        toast.error("Failed to save project");
      }
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        console.log("Deleting project:", id); // Debug log
        await api.delete(`/projects/${id}/`);
        toast.success("Project deleted successfully");
        fetchProjects();
      } catch (error) {
        console.error("Error deleting project:", error);
        toast.error("Failed to delete project");
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: "", description: "" });
    setEditingProject(null);
    setShowCreateModal(false);
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
          <h1 className="text-3xl font-bold text-gray-800">Projects</h1>
          <p className="text-gray-600 mt-1">
            {isAdmin
              ? "Manage all projects in your organization"
              : "View available projects"}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 shadow-md transition-colors"
          >
            <Plus size={20} />
            <span className="font-medium">Create Project</span>
          </button>
        )}
      </div>

      {/* Debug info for admins */}
      {isAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-yellow-800">
            <strong>Debug Info:</strong> User: {user?.username} ({user?.role}) |
            Auth Token:{" "}
            {localStorage.getItem("access_token") ? "Present" : "Missing"}
          </p>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FolderOpen className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  {project.title}
                </h3>
              </div>
              {isAdmin && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(project)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <p className="text-gray-600 mb-4">{project.description}</p>

            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>
                Owner: {project.owner.first_name} {project.owner.last_name}
              </span>
              <span>{project.tasks_count} tasks</span>
            </div>

            <div className="mt-2 text-xs text-gray-400">
              Created: {new Date(project.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-8">
          <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No projects
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {isAdmin ? (
              <>
                No projects available. <br />
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="text-blue-600 hover:text-blue-500 underline mt-2 inline-block"
                >
                  Create your first project
                </button>
              </>
            ) : (
              "No projects available."
            )}
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingProject ? "Edit Project" : "Create New Project"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter project title"
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description *
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter project description"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    {editingProject ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
