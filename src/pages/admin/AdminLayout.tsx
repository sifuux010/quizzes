import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FileText, Users, LogOut, BookOpen, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageToggle } from "@/components/LanguageToggle";
import { toast } from "sonner";
import logoImg from "@/assets/logo.png";

const SidebarContent = ({ onLinkClick }: { onLinkClick: () => void }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    toast.success(t("admin.logout"));
    navigate("/admin");
    onLinkClick();
  };

  const menuItems = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: t("admin.dashboard") },
    { path: "/admin/results", icon: FileText, label: t("admin.results") },
    { path: "/admin/students", icon: Users, label: t("admin.students") },
  ];

  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border-r border-slate-200/50">
      <div className="flex h-36 items-center gap-2 px-6">
        <img src={logoImg} alt="Logo" className="h-[220px] w-auto" />
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => (
          <Link key={item.path} to={item.path} onClick={onLinkClick}>
            <Button
              variant={location.pathname === item.path ? "default" : "ghost"}
              className="w-full justify-start gap-2 font-['Poppins']"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
      <div className="p-4">
        <Button onClick={handleLogout} variant="outline" className="w-full justify-start gap-2 font-['Poppins']">
          <LogOut className="h-5 w-5" />
          {t("admin.logout")}
        </Button>
      </div>
    </div>
  );
};

const AdminLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("isAdminLoggedIn")) {
      navigate("/admin");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background font-['Poppins']">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 z-40 h-screen w-64">
        <SidebarContent onLinkClick={() => {}} />
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
              className="fixed left-0 top-0 z-50 h-screen w-72 lg:hidden"
            >
              <SidebarContent onLinkClick={() => setIsSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-background/95 backdrop-blur px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold font-['Poppins']">{t("admin.title")}</h1>
          </div>
          <LanguageToggle />
        </header>
        <main className="p-6 font-['Poppins']">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
