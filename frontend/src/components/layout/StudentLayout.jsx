import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../common/Button";

const navItems = [
  { label: "Dashboard", to: "/student/dashboard", icon: DashboardIcon },
  { label: "Profile", to: "/student/profile", icon: UserIcon },
  { label: "Documents", to: "/student/documents", icon: FolderIcon },
  { label: "Change Password", to: "/student/change-password", icon: LockIcon },
];

function DashboardIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13h8V3H3zm10 8h8V3h-8zm-10 0h8v-6H3z" />
    </svg>
  );
}

function UserIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function FolderIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" />
    </svg>
  );
}

function LockIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v4h8z"
      />
    </svg>
  );
}

const StudentLayout = ({ children }) => {
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
      const isActive = location.pathname.startsWith(item.to);
      const Icon = item.icon;
      return (
        <Link
          key={item.to}
          to={item.to}
          onClick={() => onNavigate?.()}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
            isActive ? "bg-secondary text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
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
        <aside className="hidden h-full w-64 flex-shrink-0 flex-col border-r border-gray-200 bg-white p-6 md:flex">
          <div className="mb-8">
            <Link to="/student/dashboard" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7.5L12 3l8 4.5M4 7.5V16.5L12 21l8-4.5V7.5M4 7.5l8 4.5 8-4.5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 12V21" />
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
                {user?.username || user?.contactInfo?.name || "Student"}
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </aside>

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
              to="/student/dashboard"
              className="flex items-center gap-2"
              onClick={() => setMobileNavOpen(false)}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7.5L12 3l8 4.5M4 7.5V16.5L12 21l8-4.5V7.5M4 7.5l8 4.5 8-4.5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 12V21" />
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
              aria-label="Close navigation"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="space-y-2">
            {renderNavLinks(() => setMobileNavOpen(false))}
          </nav>
          <div className="mt-6 space-y-3 text-sm text-gray-600">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Signed in as
              </p>
              <p className="mt-1 font-medium text-gray-900">
                {user?.username || user?.contactInfo?.name || "Student"}
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
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-base font-semibold text-gray-900">Student Portal</span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-medium text-secondary hover:text-indigo-600"
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

export default StudentLayout;
