import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { studentService } from "../../services/authService";
import Navbar from "../../components/layout/Navbar";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        if (user?.aiKey) {
          const [studentData, filesData] = await Promise.all([
            studentService.getStudentByKey(user.aiKey),
            studentService.getStudentFiles(user.aiKey),
          ]);
          setStudent(studentData);
          setFiles(filesData.files || []);
        }
      } catch (err) {
        setError("Failed to load student data");
        console.error("Error fetching student data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user?.aiKey]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Loading size="lg" text="Loading your dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's your immigration journey overview
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <Card>
              <Card.Header>
                <h2 className="text-xl font-semibold">Your Profile</h2>
              </Card.Header>
              <Card.Body>
                {student?.profile && Object.keys(student.profile).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(student.profile).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <dt className="text-sm font-medium text-gray-500 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </dt>
                        <dd className="text-sm text-gray-900">
                          {value || "Not provided"}
                        </dd>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">
                      No profile information available yet.
                    </p>
                    <p className="text-sm text-gray-400">
                      Upload your documents to get started with AI processing.
                    </p>
                  </div>
                )}
              </Card.Body>
              <Card.Footer>
                <Link to="/student/profile">
                  <Button variant="outline">View Full Profile</Button>
                </Link>
              </Card.Footer>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold">Quick Actions</h3>
              </Card.Header>
              <Card.Body className="space-y-3">
                <Link to="/student/profile" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    View Profile
                  </Button>
                </Link>
                <Link to="/student/documents" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Upload Documents
                  </Button>
                </Link>
                <Link to="/student/change-password" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Change Password
                  </Button>
                </Link>
              </Card.Body>
            </Card>

            {/* Documents */}
            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold">Your Documents</h3>
              </Card.Header>
              <Card.Body>
                {files.length > 0 ? (
                  <div className="space-y-2">
                    {files.slice(0, 3).map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm text-gray-700 truncate">
                          {file.name}
                        </span>
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-blue-700 text-sm"
                        >
                          View
                        </a>
                      </div>
                    ))}
                    {files.length > 3 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{files.length - 3} more documents
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No documents uploaded yet
                  </p>
                )}
              </Card.Body>
            </Card>
          </div>
        </div>

        {error && (
          <div className="mt-8">
            <Card>
              <Card.Body>
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              </Card.Body>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
