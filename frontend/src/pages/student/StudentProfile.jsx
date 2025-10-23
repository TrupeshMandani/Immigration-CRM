import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { studentService } from "../../services/authService";
import StudentLayout from "../../components/layout/StudentLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import Toast from "../../components/common/Toast";
import ProfileFieldDisplay from "../../components/student/ProfileFieldDisplay";

const StudentProfile = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [refreshing, setRefreshing] = useState(false);

  const prioritizedProfileEntries = useMemo(() => {
    if (!student?.profile || typeof student.profile !== "object") {
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

    return Object.entries(student.profile)
      .sort(([keyA], [keyB]) => {
        const priorityA = priorityMap[keyA] || 999;
        const priorityB = priorityMap[keyB] || 999;
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        return keyA.localeCompare(keyB);
      })
      .map(([key, value]) => [key, value])
      .filter(([, value]) =>
        Array.isArray(value)
          ? value.length > 0
          : value !== undefined && value !== null && value !== ""
      );
  }, [student?.profile]);

  const fetchStudentData = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      if (user?.aiKey) {
        const studentData = await studentService.getStudentByKey(user.aiKey);
        setStudent(studentData);

        if (showRefresh) {
          setToast({
            show: true,
            message: "Profile updated successfully!",
            type: "success",
          });
        }
      }
    } catch (err) {
      setError("Failed to load profile data");
      console.error("Error fetching student data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [user?.aiKey]);

  // Listen for storage events to detect uploads from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "profile_updated" && e.newValue) {
        fetchStudentData(true);
        localStorage.removeItem("profile_updated");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleRefresh = () => {
    fetchStudentData(true);
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex h-96 items-center justify-center">
          <Loading size="lg" text="Loading your profile..." />
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="">
          <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
          <p className="mt-2 text-sm text-gray-600">
            View and manage your immigration information
          </p>
        </div>

        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold">Contact Information</h2>
            </Card.Header>
            <Card.Body>
              {student?.contactInfo ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <ProfileField
                    label="Full Name"
                    value={student.contactInfo.name || "Not provided"}
                  />
                  <ProfileField
                    label="Email"
                    value={student.contactInfo.email || "Not provided"}
                  />
                  <ProfileField
                    label="Phone"
                    value={student.contactInfo.phone || "Not provided"}
                  />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </p>
                    <span
                      className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        student.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {student.status?.charAt(0).toUpperCase() +
                        student.status?.slice(1)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">
                  No contact information available
                </p>
              )}
            </Card.Body>
          </Card>

          {/* AI Extracted Profile */}
          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold">
                AI Extracted Information
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Information automatically extracted from your uploaded documents
              </p>
            </Card.Header>
            <Card.Body>
              {prioritizedProfileEntries.length ? (
                <dl className="divide-y divide-gray-200">
                  {prioritizedProfileEntries.map(([key, value]) => (
                    <ProfileFieldDisplay key={key} label={key} value={value} />
                  ))}
                </dl>
              ) : (
                <div className="text-center py-8">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No profile data
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Upload your documents to get started with AI processing.
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Account Information */}
          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold">Account Information</h2>
            </Card.Header>
            <Card.Body>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <ProfileField
                  label="Username"
                  value={user?.username || "Unknown"}
                />
                <ProfileField
                  label="Student ID"
                  value={student?.aiKey || "Unknown"}
                />
                <ProfileField
                  label="Account Created"
                  value={
                    student?.createdAt
                      ? new Date(student.createdAt).toLocaleDateString()
                      : "Unknown"
                  }
                />
                <ProfileField
                  label="Last Updated"
                  value={
                    student?.updatedAt
                      ? new Date(student.updatedAt).toLocaleDateString()
                      : "Unknown"
                  }
                />
              </div>
            </Card.Body>
            <Card.Footer>
              <div className="flex space-x-3">
                <Link to="/student/change-password">
                  <Button variant="outline">Change Password</Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <>
                      <Loading size="sm" />
                      Refreshing...
                    </>
                  ) : (
                    "Refresh Profile"
                  )}
                </Button>
              </div>
            </Card.Footer>
          </Card>
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

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />
    </StudentLayout>
  );
};

const ProfileField = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
      {label}
    </p>
    <p className="mt-1 text-sm text-gray-900">{value}</p>
  </div>
);

export default StudentProfile;
