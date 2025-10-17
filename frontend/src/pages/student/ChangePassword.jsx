import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";

const ChangePassword = () => {
  const { changePassword, updateUser, user } = useAuth();
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    setStatus({ type: "", message: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formValues.newPassword !== formValues.confirmPassword) {
      setStatus({
        type: "error",
        message: "The new passwords do not match.",
      });
      return;
    }

    setSubmitting(true);

    const response = await changePassword(
      formValues.currentPassword,
      formValues.newPassword
    );

    if (response.success) {
      updateUser({ ...user, isFirstLogin: false });
      setStatus({
        type: "success",
        message: "Password updated. Redirecting to your dashboard...",
      });

      setTimeout(() => {
        navigate("/student/dashboard", { replace: true });
      }, 1500);
    } else {
      setStatus({
        type: "error",
        message: response.error,
      });
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Update Your Password
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            Your account uses a temporary password. Please create a permanent
            one to continue.
          </p>
        </div>

        <Card className="bg-white border border-gray-100 shadow-lg">
          <Card.Body>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {status.message && (
                <div
                  className={`rounded-md border px-4 py-3 text-sm ${
                    status.type === "success"
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {status.message}
                </div>
              )}

              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Current (Temporary) Password
                </label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                  value={formValues.currentPassword}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  minLength={6}
                  value={formValues.newPassword}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  value={formValues.confirmPassword}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  loading={submitting}
                  disabled={submitting}
                >
                  Save Password
                </Button>
              </div>
            </form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default ChangePassword;
