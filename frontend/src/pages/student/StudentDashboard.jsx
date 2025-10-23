import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { studentService } from "../../services/authService";
import StudentLayout from "../../components/layout/StudentLayout";
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
      <StudentLayout>
        <div className="flex h-96 items-center justify-center">
          <Loading size="lg" text="Loading your dashboard..." />
        </div>
      </StudentLayout>
    );
  }

  const documentsUploaded = files.length;
  const extractedFields = student?.profile
    ? Object.keys(student.profile).length
    : 0;
  const lastUpdated = student?.updatedAt
    ? new Date(student.updatedAt).toLocaleDateString()
    : "Not yet";

  return (
    <StudentLayout>
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.username}!
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Keep track of your immigration documents and profile progress
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <StatsCard
            title="Documents Uploaded"
            value={documentsUploaded}
            icon={
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V7z"
                />
              </svg>
            }
            accent="secondary"
          />
          <StatsCard
            title="Profile Fields Captured"
            value={extractedFields}
            icon={
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6M4 7h16"
                />
              </svg>
            }
            accent="primary"
          />
          <StatsCard
            title="Last Updated"
            value={lastUpdated}
            icon={
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 12A9 9 0 113 12a9 9 0 0118 0z"
                />
              </svg>
            }
            accent="success"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <Card.Header>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Profile Overview
                  </h2>
                  <p className="text-sm text-gray-600">
                    Keep your information up to date for faster processing
                  </p>
                </div>
                <Link to="/student/profile">
                  <Button variant="outline" size="sm">
                    View Full Profile
                  </Button>
                </Link>
              </div>
            </Card.Header>
            <Card.Body>
              {student?.profile && Object.keys(student.profile).length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {Object.entries(student.profile).slice(0, 6).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {value || "Not provided"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-gray-200 p-8 text-center">
                  <p className="text-sm text-gray-600">
                    No profile information extracted yet. Upload documents to begin populating your profile automatically.
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>

          <div className="space-y-6">
            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h3>
              </Card.Header>
              <Card.Body className="space-y-3">
                <Link to="/student/profile" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    View Profile
                  </Button>
                </Link>
                <Link to="/student/documents" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    Manage Documents
                  </Button>
                </Link>
                <Link to="/student/change-password" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    Change Password
                  </Button>
                </Link>
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Documents
                </h3>
              </Card.Header>
              <Card.Body>
                {files.length ? (
                  <div className="space-y-2">
                {files.slice(0, 4).map((file) => (
                  <div
                    key={file.id || file.name}
                    className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                  >
                    <span className="truncate pr-2">{file.name}</span>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-secondary hover:text-indigo-600"
                    >
                      View
                        </a>
                      </div>
                    ))}
                    {files.length > 4 && (
                      <p className="text-xs text-gray-500">
                        +{files.length - 4} more in your library
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    You haven't uploaded any documents yet.
                  </p>
                )}
              </Card.Body>
              <Card.Footer>
                <Link to="/student/documents">
                  <Button variant="primary" size="sm" className="w-full">
                    Go to Documents
                  </Button>
                </Link>
              </Card.Footer>
            </Card>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <Card.Body>
              <p className="text-sm text-red-700">{error}</p>
            </Card.Body>
          </Card>
        )}
      </div>
    </StudentLayout>
  );
};

const StatsCard = ({ title, value, icon, accent = "primary" }) => {
  const accentClass =
    accent === "secondary"
      ? "bg-secondary/10 text-secondary"
      : accent === "success"
      ? "bg-success/10 text-success"
      : "bg-primary/10 text-primary";

  return (
    <Card>
      <Card.Body>
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accentClass}`}>
            {icon}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {title}
            </p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default StudentDashboard;
