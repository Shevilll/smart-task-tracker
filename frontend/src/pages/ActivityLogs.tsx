"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { api } from "../services/api.ts";
import { Activity, Clock, User, Calendar } from "lucide-react";
import toast from "react-hot-toast";

interface ActivityLog {
  id: number;
  task: {
    id: number;
    title: string;
    project: {
      title: string;
    };
  };
  previous_assignee: {
    first_name: string;
    last_name: string;
  } | null;
  previous_status: string;
  previous_due_date: string | null;
  updated_at: string;
  updated_by: {
    first_name: string;
    last_name: string;
  } | null;
}

const ActivityLogs: React.FC = () => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      const response = await api.get("/activity-logs/");
      setActivityLogs(response.data.results || response.data);
    } catch (error) {
      toast.error("Failed to fetch activity logs");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Activity className="h-8 w-8 text-purple-600" />
        <h1 className="text-3xl font-bold text-gray-800">Activity Logs</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Recent Task Changes
          </h2>
          <p className="text-sm text-gray-600">
            Track the last known state of each task before the most recent
            update
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {activityLogs.map((log) => (
            <div key={log.id} className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      {log.task.title}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {formatDate(log.updated_at)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">
                    Project: {log.task.project.title}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Previous Assignee */}
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Previous Assignee
                        </span>
                      </div>
                      <p className="text-sm text-gray-900">
                        {log.previous_assignee
                          ? `${log.previous_assignee.first_name} ${log.previous_assignee.last_name}`
                          : "Not assigned"}
                      </p>
                    </div>

                    {/* Previous Status */}
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="flex items-center space-x-2 mb-1">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Previous Status
                        </span>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          log.previous_status
                        )}`}
                      >
                        {log.previous_status
                          ? log.previous_status.replace("_", " ").toUpperCase()
                          : "Unknown"}
                      </span>
                    </div>

                    {/* Previous Due Date */}
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="flex items-center space-x-2 mb-1">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Previous Due Date
                        </span>
                      </div>
                      <p className="text-sm text-gray-900">
                        {log.previous_due_date
                          ? new Date(log.previous_due_date).toLocaleDateString()
                          : "Not set"}
                      </p>
                    </div>
                  </div>

                  {log.updated_by && (
                    <div className="mt-3 text-xs text-gray-500">
                      Last updated by: {log.updated_by.first_name}{" "}
                      {log.updated_by.last_name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {activityLogs.length === 0 && (
          <div className="text-center py-8">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No activity logs
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Activity logs will appear here when tasks are updated.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
