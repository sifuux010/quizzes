import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/Navbar";
import { toast } from "sonner";
import { Eye, EyeOff, UserPlus, LogIn } from "lucide-react";

const StudentEntry = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Form states
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    phone: "",
    wilaya: "",
    password: "",
    confirmPassword: ""
  });

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/backend/api/student_login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const result = await response.json();

      if (result.success) {
        // Store student info in localStorage
        localStorage.setItem("studentId", result.student.id);
        localStorage.setItem("studentName", result.student.name);
        localStorage.setItem("studentEmail", result.student.email);
        localStorage.setItem("studentPhone", result.student.phone || "");

        toast.success(`${t('auth.welcome_back')}, ${result.student.name}!`);


        const searchParams = new URLSearchParams(window.location.search);
        const redirectUrl = searchParams.get('redirect');
        navigate(redirectUrl || "/");
      } else {
        toast.error(result.error || t('auth.login_failed'));
      }
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signupData.password !== signupData.confirmPassword) {
      toast.error(t('auth.password_mismatch'));
      return;
    }

    if (signupData.password.length < 6) {
      toast.error(t('auth.password_too_short'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/backend/api/student_signup.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: signupData.name,
          email: signupData.email,
          phone: signupData.phone,
          wilaya: signupData.wilaya,
          password: signupData.password
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Store student info in localStorage
        localStorage.setItem("studentId", result.student.id);
        localStorage.setItem("studentName", result.student.name);
        localStorage.setItem("studentEmail", result.student.email);
        localStorage.setItem("studentPhone", result.student.phone || "");

        toast.success(`${t('auth.welcome')}, ${result.student.name}!`);


        const searchParams = new URLSearchParams(window.location.search);
        const redirectUrl = searchParams.get('redirect');
        navigate(redirectUrl || "/");
      } else {
        toast.error(result.error || t('auth.signup_failed'));
      }
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary/5 to-background">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{t("student.title")}</CardTitle>

            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login" className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    {t('auth.login')}
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    {t('auth.signup')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4 mt-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">{t("auth.email")}</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder={t("auth.email_placeholder")}
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">{t("auth.password")}</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showLoginPassword ? "text" : "password"}
                          placeholder={t("auth.password_placeholder")}
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                        >
                          {showLoginPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                      {isLoading ? t('common.loading') : t('auth.login')}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4 mt-6">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">{t("auth.name")}</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder={t("auth.name_placeholder")}
                        value={signupData.name}
                        onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">{t("auth.email")}</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder={t("auth.email_placeholder")}
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-wilaya">{t("auth.wilaya")}</Label>
                      <Select
                        onValueChange={(value) => setSignupData({ ...signupData, wilaya: value })}
                        value={signupData.wilaya}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("auth.wilaya_placeholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Alger">Alger</SelectItem>
                          <SelectItem value="Oran">Oran</SelectItem>
                          <SelectItem value="Constantine">Constantine</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">{t("auth.phone")}</Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder={t("auth.phone_placeholder")}
                        value={signupData.phone}
                        onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">{t("auth.password")}</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showSignupPassword ? "text" : "password"}
                          placeholder={t("auth.password_placeholder")}
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                        >
                          {showSignupPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">{t("auth.confirm_password")}</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder={t("auth.confirm_password_placeholder")}
                          value={signupData.confirmPassword}
                          onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                      {isLoading ? t('common.loading') : t('auth.signup')}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Quick Start removed */}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentEntry;
