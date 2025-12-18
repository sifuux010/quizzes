import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FileText, Users, LogOut, Menu, Clock, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageToggle } from "@/components/LanguageToggle";
import { toast } from "sonner";
import logoImg from "@/assets/logo.png";
import { isTokenExpired, logout, getTokenRemainingTime, getAdminUsername } from "@/utils/auth";

const SidebarContent = ({ onLinkClick }: { onLinkClick: () => void }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const adminUsername = getAdminUsername();

  const handleLogout = () => {
    logout();
    toast.success(t("admin.logout"));
    navigate("/admin");
    onLinkClick();
  };

  const menuItems = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: t("admin.dashboard"), color: "blue" },
    { path: "/admin/results", icon: FileText, label: t("admin.results"), color: "purple" },
    { path: "/admin/students", icon: Users, label: t("admin.students"), color: "green" },
  ];

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Logo Section */}
      <div className="flex items-center justify-center px-6 pt-4 pb-2">
        <img src={logoImg} alt="Logo" className="h-40 w-auto" />
      </div>

      {/* Admin Info */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
          <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {adminUsername ? adminUsername.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">
              {adminUsername || 'Admin'}
            </p>
            <p className="text-xs text-indigo-600 font-medium">Administrator</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} onClick={onLinkClick}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 h-12 px-4 font-medium transition-all ${isActive
                    ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <div className={`p-2 rounded-lg ${isActive
                    ? item.color === 'blue' ? 'bg-blue-100' :
                      item.color === 'purple' ? 'bg-purple-100' :
                        'bg-green-100'
                    : 'bg-gray-100'
                    }`}>
                    <item.icon className={`h-4 w-4 ${isActive
                      ? item.color === 'blue' ? 'text-blue-600' :
                        item.color === 'purple' ? 'text-purple-600' :
                          'text-green-600'
                      : 'text-gray-500'
                      }`} />
                  </div>
                  <span className="flex-1 text-left">{item.label}</span>
                  {isActive && (
                    <ChevronRight className="h-4 w-4 text-indigo-600" />
                  )}
                </Button>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start gap-3 h-12 px-4 font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all"
        >
          <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-red-100">
            <LogOut className="h-4 w-4" />
          </div>
          <span>{t("admin.logout")}</span>
        </Button>
      </div>
    </div>
  );
};

const AdminLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  // Check token expiry on mount and periodically
  useEffect(() => {
    const checkAuth = () => {
      if (isTokenExpired()) {
        logout();
        toast.error("Session expired. Please login again.");
        navigate("/admin");
        return false;
      }
      return true;
    };

    // Initial check
    if (!checkAuth()) return;

    // Check every 30 seconds
    const interval = setInterval(() => {
      if (!checkAuth()) {
        clearInterval(interval);
      } else {
        setRemainingTime(getTokenRemainingTime());
      }
    }, 30000);

    // Update remaining time every second for display
    const timeInterval = setInterval(() => {
      setRemainingTime(getTokenRemainingTime());
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 font-['Poppins']">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 z-40 h-screen w-72 shadow-lg">
        <SidebarContent onLinkClick={() => { }} />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 z-50 h-screen w-72 lg:hidden shadow-2xl"
            >
              <SidebarContent onLinkClick={() => setIsSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-white/95 backdrop-blur px-6 border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-indigo-50"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 font-['Poppins']">{t("admin.title")}</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Session Timer */}
            {remainingTime > 0 && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm ${remainingTime < 300 ? 'bg-red-100 text-red-700 border border-red-200' :
                remainingTime < 900 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                  'bg-green-100 text-green-700 border border-green-200'
                }`}>
                <Clock className="h-4 w-4" />
                <span>
                  {Math.floor(remainingTime / 60)}:{String(remainingTime % 60).padStart(2, '0')}
                </span>
              </div>
            )}
            <LanguageToggle />
          </div>
        </header>
        <main className="p-6 font-['Poppins']">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;