import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import { studentService } from "../../services/authService";

const EMPTY_CONTACT = { name: "", email: "", phone: "", message: "" };

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("pending");
  const [contactInfo, setContactInfo] = useState(EMPTY_CONTACT);

  const profileEntries = useMemo(() => {
    if (!student?.profile || !Object.keys(student.profile).length) {
      return [];
    }

    const priorityMap = {
      fullName: 1,
      firstName: 1,
      lastName: 1,
      name: 1,
      dateOfBirth: 1,
      dob: 1,
      nationality: 1,
      passportNumber: 1,
      passport: 1,
      gender: 1,
      maritalStatus: 1,
      email: 2,
      phone: 2,
      phoneNumber: 2,
      address: 2,
      city: 2,
      state: 2,
      country: 2,
      postalCode: 2,
      zipCode: 2,
      education: 3,
      degree: 3,
      university: 3,
      college: 3,
      institution: 3,
      graduationDate: 3,
      fieldOfStudy: 3,
      major: 3,
      gpa: 3,
      workExperience: 4,
      jobTitle: 4,
      company: 4,
      employer: 4,
      yearsOfExperience: 4,
      occupation: 4,
      position: 4,
      salary: 4,
      visaType: 5,
      visaStatus: 5,
      arrivalDate: 5,
      departureDate: 5,
      immigrationStatus: 5,
      travelHistory: 5,
    };

    const formatLabel = (key) =>
      key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (letter) => letter.toUpperCase())
        .trim();

    const formatValue = (value) => {
      if (Array.isArray(value)) {
        return value.join(", ");
      }
      if (typeof value === "object" && value !== null) {
        // Format objects in a readable way instead of JSON
        return Object.entries(value)
          .map(([key, val]) => `${formatLabel(key)}: ${val}`)
          .join(", ");
      }
      return value ?? "Not provided";
    };

    return Object.entries(student.profile)
      .sort(([keyA], [keyB]) => {
        const priorityA = priorityMap[keyA] || 999;
        const priorityB = priorityMap[keyB] || 999;
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        return keyA.localeCompare(keyB);
      })
      .map(([key, value]) => ({
        key,
        label: formatLabel(key),
        value: formatValue(value),
      }));
  }, [student?.profile]);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await studentService.getStudentById(id);
        setStudent(data);
        setStatus(data.status || "pending");
        setContactInfo({ ...EMPTY_CONTACT, ...data.contactInfo });

        if (data.aiKey) {
          try {
            const filesResponse = await studentService.getStudentFiles(
              data.aiKey
            );
            setDocuments(filesResponse.files || []);
          } catch (docsError) {
            console.error("Failed to load student documents:", docsError);
            setDocuments([]);
          }
        } else {
          setDocuments([]);
        }
      } catch (err) {
        console.error("Failed to load student:", err);
        setError(
          err.response?.data?.message || "Unable to load student details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  const handleContactChange = (event) => {
    const { name, value } = event.target;
    setContactInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!student) return;

    setSaving(true);
    setError("");

    try {
      await studentService.updateStudent(student._id, {
        status,
        contactInfo,
      });
      const refreshed = await studentService.getStudentById(student._id);
      setStudent(refreshed);
      setStatus(refreshed.status || status);
      setContactInfo({ ...EMPTY_CONTACT, ...refreshed.contactInfo });
    } catch (err) {
      console.error("Failed to update student:", err);
      setError(
        err.response?.data?.message || "Failed to update student details."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !student ||
      !window.confirm(
        "Are you sure you want to delete this student? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await studentService.deleteStudent(student._id);
      navigate("/admin/student-profiles", { replace: true });
    } catch (err) {
      console.error("Failed to delete student:", err);
      setError(err.response?.data?.message || "Failed to delete student.");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-96 items-center justify-center">
          <Loading size="lg" text="Loading student details..." />
        </div>
      </AdminLayout>
    );
  }

  if (!student) {
    return (
      <AdminLayout>
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <Card>
            <Card.Body>
              <p className="text-center text-gray-600">
                Student not found.{" "}
                <Link
                  to="/admin/students"
                  className="text-primary hover:text-blue-700"
                >
                  Return to students
                </Link>
                .
              </p>
            </Card.Body>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <Link
            to="/admin/students"
            className="text-sm font-medium text-primary hover:text-blue-700"
          >
            ← Back to students
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">
            {student.contactInfo?.name || student.username || "Unnamed Student"}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Created on{" "}
            {student.createdAt
              ? new Date(student.createdAt).toLocaleDateString()
              : "Unknown"}
          </p>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <Card.Body>
              <p className="text-sm text-red-700">{error}</p>
            </Card.Body>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <Card.Header>
              <h2 className="text-xl font-semibold">
                Account & Contact Details
              </h2>
            </Card.Header>
            <Card.Body>
              <form className="space-y-6" onSubmit={handleSave}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(event) => setStatus(event.target.value)}
                      className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <input
                      value={student.username || "Not assigned"}
                      readOnly
                      className="mt-2 w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-600 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Contact Name
                    </label>
                    <input
                      name="name"
                      value={contactInfo.name}
                      onChange={handleContactChange}
                      className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Contact Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={contactInfo.email}
                      onChange={handleContactChange}
                      className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      name="phone"
                      value={contactInfo.phone}
                      onChange={handleContactChange}
                      className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      AI Key
                    </label>
                    <input
                      value={student.aiKey || "Not generated"}
                      readOnly
                      className="mt-2 w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-600 shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    value={contactInfo.message}
                    onChange={handleContactChange}
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="Add or update notes about this student..."
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={saving}
                    disabled={saving}
                  >
                    Save changes
                  </Button>
                </div>
              </form>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold">Account Summary</h2>
            </Card.Header>
            <Card.Body className="space-y-4 text-sm text-gray-600">
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">Status</span>
                <span className="capitalize">{student.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">
                  First Login Pending
                </span>
                <span>{student.isFirstLogin ? "Yes" : "No"}</span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Email</span>
                <p className="mt-1 break-all">
                  {student.email || "Not assigned"}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-900">Last Updated</span>
                <p className="mt-1">
                  {student.updatedAt
                    ? new Date(student.updatedAt).toLocaleString()
                    : "Unknown"}
                </p>
              </div>
            </Card.Body>
          </Card>
        </div>

        <Card>
          <Card.Header>
            <h2 className="text-xl font-semibold">Profile Data</h2>
          </Card.Header>
          <Card.Body>
            {profileEntries.length ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {profileEntries.map((entry) => (
                  <div key={entry.label}>
                    <p className="text-sm font-medium text-gray-500">
                      {entry.label}
                    </p>
                    <p className="mt-1 text-sm text-gray-900">{entry.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No profile data captured yet. Once documents are processed,
                extracted data will appear here.
              </p>
            )}
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h2 className="text-xl font-semibold">Documents</h2>
          </Card.Header>
          <Card.Body>
            {documents.length ? (
              <div className="space-y-3">
                {documents.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="truncate font-medium text-gray-900">
                        {file.name}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {file.mimeType} •{" "}
                        {file.size
                          ? `${Math.round(file.size / 1024)} KB`
                          : "Unknown size"}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                      >
                        View
                      </a>
                      <a
                        href={file.url}
                        download={file.name}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No documents available yet. Uploads completed by the student
                will appear here automatically.
              </p>
            )}
          </Card.Body>
        </Card>
        <Card className="border-red-200">
          <Card.Body className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-red-600">
                Delete Student
              </h3>
              <p className="text-sm text-gray-600">
                Removing a student will revoke their access and delete their
                record.
              </p>
            </div>
            <Button variant="danger" onClick={handleDelete}>
              Delete Student
            </Button>
          </Card.Body>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default StudentDetail;
