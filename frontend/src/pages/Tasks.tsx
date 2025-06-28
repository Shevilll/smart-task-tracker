"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.tsx";
import { api } from "../services/api.ts";
import {
  Plus,
  Edit,
  Trash2,
  CheckSquare,
  Clock,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

interface Task {
  id: number;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  due_date: string;
  project: {
    id: number;
    title: string;
  };
  assigned_to: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
}

interface Project {
  id: number;
  title: string;
}

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

const Tasks: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isAdmin, user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState("all");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo" as "todo" | "in_progress" | "done",
    due_date: "",
    project: "",
    assigned_to: "",
  });

  useEffect(() => {
    fetchTasks();
    if (isAdmin) {
      fetchProjects();
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchTasks = async () => {
    try {
      const response = await api.get("/tasks/");
      setTasks(response.data.results || response.data);
    } catch (error) {
      toast.error("Failed to fetch tasks");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects/");
      setProjects(response.data.results || response.data);
    } catch (error) {
      toast.error("Failed to fetch projects");
    }
  };

  const fetchUsers = async () => {
    try {
      // For now, we'll use the current user and create a mock list
      // In a real app, you'd have an endpoint to fetch all users
      const mockUsers = [
        {
          id: 2,
          username: "john_doe",
          first_name: "John",
          last_name: "Doe",
        },
        {
          id: 3,
          username: "jane_smith",
          first_name: "Jane",
          last_name: "Smith",
        },
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error("Failed to fetch users");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.project ||
      !formData.assigned_to ||
      !formData.due_date
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        due_date: formData.due_date + "T00:00:00Z", // Add time component
        project: Number.parseInt(formData.project),
        assigned_to: Number.parseInt(formData.assigned_to),
      };

      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}/`, submitData);
        toast.success("Task updated successfully");
      } else {
        await api.post("/tasks/", submitData);
        toast.success("Task created successfully");
      }

      resetForm();
      fetchTasks();
    } catch (error: any) {
      console.error("Error saving task:", error);
      if (error.response?.data) {
        const errorMessage = Object.values(error.response.data)
          .flat()
          .join(", ");
        toast.error(`Failed to save task: ${errorMessage}`);
      } else {
        toast.error("Failed to save task");
      }
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      due_date: task.due_date.split("T")[0],
      project: task.project.id.toString(),
      assigned_to: task.assigned_to.id.toString(),
    });
    setShowCreateModal(true);
  };

  const handleStatusUpdate = async (taskId: number, newStatus: string) => {
    try {
      await api.patch(`/tasks/${taskId}/`, { status: newStatus });
      toast.success("Task status updated");
      fetchTasks();
    } catch (error) {
      toast.error("Failed to update task status");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await api.delete(`/tasks/${id}/`);
        toast.success("Task deleted successfully");
        fetchTasks();
      } catch (error) {
        toast.error("Failed to delete task");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      status: "todo",
      due_date: "",
      project: "",
      assigned_to: "",
    });
    setEditingTask(null);
    setShowCreateModal(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "todo":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "done":
        return <CheckSquare className="h-5 w-5 text-green-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "done":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status !== "done";
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    if (filter === "overdue") return isOverdue(task.due_date, task.status);
    return task.status === filter;
  });

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
          <h1 className="text-3xl font-bold text-gray-800">Tasks</h1>
          <p className="text-gray-600 mt-1">
            {isAdmin
              ? "Manage all tasks in your organization"
              : "View and update your assigned tasks"}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 shadow-md transition-colors"
          >
            <Plus size={20} />
            <span className="font-medium">Create Task</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-md ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          All Tasks
        </button>
        <button
          onClick={() => setFilter("todo")}
          className={`px-4 py-2 rounded-md ${
            filter === "todo"
              ? "bg-yellow-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Todo
        </button>
        <button
          onClick={() => setFilter("in_progress")}
          className={`px-4 py-2 rounded-md ${
            filter === "in_progress"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          In Progress
        </button>
        <button
          onClick={() => setFilter("done")}
          className={`px-4 py-2 rounded-md ${
            filter === "done"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Done
        </button>
        <button
          onClick={() => setFilter("overdue")}
          className={`px-4 py-2 rounded-md ${
            filter === "overdue"
              ? "bg-red-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Overdue
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div key={task.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getStatusIcon(task.status)}
                  <h3 className="text-lg font-semibold text-gray-800">
                    {task.title}
                  </h3>
                  {isOverdue(task.due_date, task.status) && (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  )}
                </div>

                <p className="text-gray-600 mb-3">{task.description}</p>

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Project: {task.project.title}</span>
                  <span>
                    Assigned to: {task.assigned_to.first_name}{" "}
                    {task.assigned_to.last_name}
                  </span>
                  <span>
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status.replace("_", " ").toUpperCase()}
                    </span>

                    {/* Contributors can only update status */}
                    {!isAdmin && (
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusUpdate(task.id, e.target.value)
                        }
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="todo">Todo</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    )}

                    {/* Admins can also update status inline */}
                    {isAdmin && (
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusUpdate(task.id, e.target.value)
                        }
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="todo">Todo</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    )}
                  </div>

                  {/* Admin edit/delete buttons - always show for admins */}
                  {isAdmin && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(task)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit Task"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete Task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-8">
          <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No tasks found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === "all" ? (
              isAdmin ? (
                <>
                  No tasks available. <br />
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="text-blue-600 hover:text-blue-500 underline mt-2 inline-block"
                  >
                    Create your first task
                  </button>
                </>
              ) : (
                "No tasks assigned to you."
              )
            ) : (
              `No ${filter.replace("_", " ")} tasks found.`
            )}
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && isAdmin && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingTask ? "Edit Task" : "Create New Task"}
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
                  />
                </div>

                <div>
                  <label
                    htmlFor="project"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Project *
                  </label>
                  <select
                    id="project"
                    value={formData.project}
                    onChange={(e) =>
                      setFormData({ ...formData, project: e.target.value })
                    }
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="assigned_to"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Assigned To *
                  </label>
                  <select
                    id="assigned_to"
                    value={formData.assigned_to}
                    onChange={(e) =>
                      setFormData({ ...formData, assigned_to: e.target.value })
                    }
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.first_name} {user.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as any,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="due_date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Due Date *
                  </label>
                  <input
                    type="date"
                    id="due_date"
                    value={formData.due_date}
                    onChange={(e) =>
                      setFormData({ ...formData, due_date: e.target.value })
                    }
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    {editingTask ? "Update" : "Create"}
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

export default Tasks;
