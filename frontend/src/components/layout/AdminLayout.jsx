import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../common/Button";

const navItems = [
  { label: "Dashboard", to: "/admin/dashboard", icon: DashboardIcon },
  { label: "Contact Requests", to: "/admin/requests", icon: MailIcon },
  {
    label: "Student Profiles",
    to: "/admin/student-profiles",
    matchPrefixes: ["/admin/student-profiles", "/admin/students/"],
    icon: UsersIcon,
  },
  { label: "Create Student", to: "/admin/students/create", icon: PlusIcon },
];

function DashboardIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 15h7v6H3z"
      />
    </svg>
  );
}

function MailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function UsersIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17 20h5V8l-9-5-9 5v12h5"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 20v-6a3 3 0 016 0v6"
      />
    </svg>
  );
}

function PlusIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 5v14M5 12h14"
      />
    </svg>
  );
}

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const renderNavLinks = (onNavigate) =>
    navItems.map((item) => {
      const prefixes = item.matchPrefixes || [item.to];
      const isActive = prefixes.some((prefix) =>
        location.pathname.startsWith(prefix)
      );
      const Icon = item.icon;
      return (
        <Link
          key={item.to}
          to={item.to}
          onClick={() => onNavigate?.()}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
            isActive
              ? "bg-primary text-white shadow-md"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Icon className="h-4 w-4" />
          {item.label}
        </Link>
      );
    });

  return (
    <div className="h-screen bg-gray-50">
      <div className="flex h-full overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden h-full w-64 flex-shrink-0 flex-col border-r border-gray-200 bg-white p-6 md:flex">
          <div className="mb-8">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
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
                    d="M4 7.5L12 3l8 4.5M4 7.5V16.5L12 21l8-4.5V7.5M4 7.5l8 4.5 8-4.5"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 12V21"
                  />
                </svg>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                Immigration CRM
              </span>
            </Link>
          </div>

          <nav className="flex-1 space-y-2">{renderNavLinks()}</nav>

          <div className="mt-8 space-y-3 text-sm text-gray-600">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Signed in as
              </p>
              <p className="mt-1 font-medium text-gray-900">
                {user?.username || "Admin"}
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </aside>

        {/* Mobile sidebar */}
        <div
          className={`fixed inset-0 z-40 bg-gray-900/40 transition-opacity md:hidden ${
            mobileNavOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={() => setMobileNavOpen(false)}
        ></div>
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white p-6 shadow-lg transition md:hidden ${
            mobileNavOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-8 flex items-center justify-between">
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-2"
              onClick={() => setMobileNavOpen(false)}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
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
                    d="M4 7.5L12 3l8 4.5M4 7.5V16.5L12 21l8-4.5V7.5M4 7.5l8 4.5 8-4.5"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 12V21"
                  />
                </svg>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                Immigration CRM
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="rounded-md p-2 text-gray-500 hover:text-gray-900"
              aria-label="Close sidebar"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <nav className="space-y-2">{renderNavLinks(() => setMobileNavOpen(false))}</nav>
          <div className="mt-6 space-y-3 text-sm text-gray-600">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Signed in as
              </p>
              <p className="mt-1 font-medium text-gray-900">
                {user?.username || "Admin"}
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </aside>

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              aria-label="Open navigation"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <span className="text-base font-semibold text-gray-900">
              Admin Panel
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-medium text-primary hover:text-blue-700"
            >
              Logout
            </button>
          </header>

          <main className="flex-1 overflow-y-auto bg-gray-50 px-4 py-6 md:px-8 md:py-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
