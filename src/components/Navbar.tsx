import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogOut, User, Menu, X, Home, BookOpen, Trophy, Settings } from "lucide-react";
import { LanguageToggle } from "./LanguageToggle";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import logoImg from "@/assets/logo.png";
import teacherImg from "@/assets/teacher.png";
import sidebarBg from "@/assets/6068294.jpg";

export const Navbar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const studentName = localStorage.getItem("studentName");
  const studentId = localStorage.getItem("studentId");
  const [showNav, setShowNav] = useState(true);
  const lastScrollY = useRef(0);

  const handleLogout = () => {
    localStorage.removeItem("studentId");
    localStorage.removeItem("studentName");
    localStorage.removeItem("studentEmail");
    localStorage.removeItem("studentPhone");
    toast.success(t("auth.logged_out"));
    navigate("/student-entry");
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      if (y > lastScrollY.current && y > 64) {
        setShowNav(false);
      } else {
        setShowNav(true);
      }
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { to: "/", label: t("nav.home"), icon: Home },
    // { to: "/quizzes", label: t("nav.quizzes"), icon: BookOpen },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={showNav ? { y: 0, opacity: 1 } : { y: -80, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="sticky top-0 z-50 w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 shadow-sm"
      >
        <div className="container max-w-7xl mx-auto flex h-20 items-center justify-between px-6">
          {/* Logo Section */}
          <Link to="/" className="flex items-center">
            <div className="relative">
              <img src={logoImg} alt="Logo" className="h-[95px] w-auto" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="relative group flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageToggle />

            {studentName ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                  <img src={teacherImg} alt="Trainer" className="w-8 h-8 rounded-full object-cover" />
                  <span className="text-sm font-medium text-gray-900">{studentName}</span>
                </div>
                <Button
                  onClick={handleLogout}
                  className="gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <LogOut className="h-4 w-4" />
                  {t("auth.logout")}
                </Button>
              </div>
            ) : (
              <Link to="/student-entry">
                <Button className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all">
                  <User className="h-4 w-4" />
                  {t("auth.login")}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            <LanguageToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-blue-50"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 md:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Sidebar Header */}
                <div className="relative px-6 py-6 bg-cover bg-center" style={{ backgroundImage: `url(${sidebarBg})` }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeMobileMenu}
                    className="absolute top-4 right-4 p-2 hover:bg-white/20 text-white"
                  >
                    <X className="h-5 w-5" />
                  </Button>

                  {studentName ? (
                    <div className="flex items-center gap-3 mt-8">
                      <img src={teacherImg} alt="Trainer" className="w-16 h-16 rounded-full object-cover ring-4 ring-white/30" />
                      <div className="text-white">
                        <p className="font-semibold text-lg">{studentName}</p>
                        <p className="text-sm text-blue-100">Trainer</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-white mt-8">
                      <h3 className="text-xl font-bold mb-1">Welcome</h3>
                      <p className="text-sm text-blue-100">Please login to continue</p>
                    </div>
                  )}
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-6">
                  <div className="space-y-2 px-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={closeMobileMenu}
                        className="flex items-center gap-4 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                          <link.icon className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <span>{link.label}</span>
                      </Link>
                    ))}

                    {!studentName && (
                      <Link
                        to="/student-entry"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-4 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                          <User className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <span>{t("auth.login")}</span>
                      </Link>
                    )}
                  </div>



                </div>

                {/* Logout Button (if logged in) */}
                {studentName && (
                  <div className="p-4 border-t border-gray-200">
                    <Button
                      onClick={handleLogout}
                      className="w-full justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <LogOut className="h-4 w-4" />
                      {t("auth.logout")}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};