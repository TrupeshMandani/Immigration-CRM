import { Link } from "react-router-dom";
import Button from "../common/Button";

const StudentListItem = ({ student, onStatusChange }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-blue-600">
              {student.contactInfo?.name?.charAt(0) ||
                student.username?.charAt(0) ||
                "S"}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {student.contactInfo?.name ||
                  student.username ||
                  "Unknown Student"}
              </h3>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                  student.status
                )}`}
              >
                {student.status?.toUpperCase() || "ACTIVE"}
              </span>
              {student.priority && (
                <span
                  className={`text-xs font-medium ${getPriorityColor(
                    student.priority
                  )}`}
                >
                  {student.priority.toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4 mt-1">
              <p className="text-sm text-gray-600">{student.email}</p>
              {student.contactInfo?.phone && (
                <p className="text-sm text-gray-600">
                  {student.contactInfo.phone}
                </p>
              )}
              <p className="text-sm text-gray-500">
                ID: {student.studentId || "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">
              Joined: {new Date(student.createdAt).toLocaleDateString()}
            </p>
            {student.applications && student.applications.length > 0 && (
              <p className="text-xs text-gray-500">
                {student.applications.length} Application(s)
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Link to={`/admin/students/${student._id}`}>
              <Button variant="secondary" size="sm">
                View
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              Message
            </Button>
            <div className="flex items-center space-x-1">
              <button
                onClick={() =>
                  onStatusChange && onStatusChange(student._id, "active")
                }
                className="p-1 text-green-600 hover:text-green-800"
                title="Activate"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
              <button
                onClick={() =>
                  onStatusChange && onStatusChange(student._id, "inactive")
                }
                className="p-1 text-red-600 hover:text-red-800"
                title="Deactivate"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentListItem;
