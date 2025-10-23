import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";
import Button from "../../components/common/Button";
import ViewToggle from "../../components/common/ViewToggle";
import StudentCard from "../../components/admin/StudentCard";
import StudentListItem from "../../components/admin/StudentListItem";
import { useViewMode } from "../../hooks/useViewMode";
import { studentService } from "../../services/authService";

const StudentProfiles = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useViewMode(
    "studentProfiles_viewMode",
    ["card", "list"],
    "card"
  );

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await studentService.getAllStudents();
        setStudents(data);
      } catch (err) {
        console.error("Failed to load students:", err);
        setError(
          err.response?.data?.message ||
            "Unable to load the student list right now."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return students;

    return students.filter((student) => {
      const name =
        student.contactInfo?.name ||
        student.username ||
        student.email ||
        "unknown";
      const email = student.contactInfo?.email || student.email || "";
      return (
        name.toLowerCase().includes(normalized) ||
        email.toLowerCase().includes(normalized)
      );
    });
  }, [search, students]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-96 items-center justify-center">
          <Loading size="lg" text="Loading student profiles..." />
        </div>
      </AdminLayout>
    );
  }

  if (!students.length) {
    return (
      <AdminLayout>
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <Card>
            <Card.Body className="text-center space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">
                No students found
              </h2>
              <p className="text-sm text-gray-600">
                Once you add students to the system, their profiles will appear
                here.
              </p>
              <div className="flex justify-center">
                <Link to="/admin/students/create" className="inline-block">
                  <Button variant="primary">Create Student</Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Student Profiles
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Browse all students and open their full profile with a single
              click.
            </p>
          </div>
          <div className="flex gap-3">
            <input
              type="search"
              placeholder="Search by name or email..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 sm:w-72"
            />
            <ViewToggle
              currentView={viewMode}
              onViewChange={setViewMode}
              views={["card", "list"]}
              storageKey="studentProfiles_viewMode"
            />
            <Link to="/admin/students/create">
              <Button variant="primary">Add Student</Button>
            </Link>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <Card.Body>
              <p className="text-sm text-red-700">{error}</p>
            </Card.Body>
          </Card>
        )}

        {filteredStudents.length ? (
          <>
            {viewMode === "card" && (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredStudents.map((student) => (
                  <StudentPreviewCard
                    key={student._id}
                    student={student}
                    onOpen={() => navigate(`/admin/students/${student._id}`)}
                  />
                ))}
              </div>
            )}

            {viewMode === "list" && (
              <div className="space-y-4">
                {filteredStudents.map((student) => (
                  <StudentListItem
                    key={student._id}
                    student={student}
                    onStatusChange={() =>
                      navigate(`/admin/students/${student._id}`)
                    }
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <Card>
            <Card.Body className="py-16 text-center text-sm text-gray-500">
              No students match your search.
            </Card.Body>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default StudentProfiles;

const StudentPreviewCard = ({ student, onOpen }) => {
  const name =
    student.contactInfo?.name || student.username || "Unnamed Student";
  const email =
    student.email || student.contactInfo?.email || "Not provided yet";
  const phone = student.contactInfo?.phone || "Not provided yet";
  const dob =
    student.profile?.dateOfBirth || student.profile?.dob || "Not provided yet";
  const created = student.createdAt
    ? new Date(student.createdAt).toLocaleDateString()
    : "Unknown";

  const statusClasses =
    student.status === "active"
      ? "bg-green-100 text-green-700"
      : student.status === "pending"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-gray-100 text-gray-700";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="text-left transition hover:-translate-y-1 hover:shadow-lg"
    >
      <Card className="h-full border border-gray-200">
        <Card.Body className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Student
              </p>
              <h3 className="mt-1 text-xl font-semibold text-gray-900">
                {name}
              </h3>
              <p className="text-xs text-gray-500">Joined {created}</p>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClasses}`}
            >
              {student.status || "Unknown"}
            </span>
          </div>

          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Email
              </p>
              <p className="mt-1 break-all">{email}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Phone
              </p>
              <p className="mt-1">{phone}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Date of Birth
              </p>
              <p className="mt-1">{dob}</p>
            </div>
          </div>
        </Card.Body>
      </Card>
    </button>
  );
};
