import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, BookOpen, Trophy, Award, Users, GraduationCap, Menu, X } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import step1Img from "@/assets/2152.jpg";
import step2Img from "@/assets/4772.jpg";
import step3Img from "@/assets/paper_2.jpg";
import assesmentImg from "@/assets/assesment.png";
import secondLogo from "@/assets/secondlogo.png";

const Landing = () => {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const heroTitle = t("landing.hero_title");
  const titleParts = heroTitle.split(" ");
  const firstPart = titleParts.slice(0, -2).join(" ");
  const lastTwoWords = titleParts.slice(-2).join(" ");
  const isRTL = i18n.language?.startsWith("ar");






  const steps = [
    {
      img: step1Img,
      title: t("landing.step1_title"),
      description: t("landing.step1_desc"),
    },
    {
      img: step2Img,
      title: t("landing.step2_title"),
      description: t("landing.step2_desc"),
    },
    {
      img: step3Img,
      title: t("landing.step3_title"),
      description: t("landing.step3_desc"),
    },
  ];

  const features = [
    {
      icon: GraduationCap,
      title: t("landing.feature1_title"),
      description: t("landing.feature1_desc")
    },
    {
      icon: Award,
      title: t("landing.feature2_title"),
      description: t("landing.feature2_desc")
    },
    {
      icon: Users,
      title: t("landing.feature3_title"),
      description: t("landing.feature3_desc")
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-cyan-50">

      <Navbar />

      {/* Hero Section */}
      <section
        id="home"
        className="flex-1 mt-4 flex items-center justify-center px-4 pt-0 pb-16 md:pb-24 relative overflow-hidden bg-white"
      >
        <div className="container max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left side content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-4 bg-cyan-500/10 text-cyan-700 pl-4 pr-5 py-2.5 rounded-full text-sm font-medium">
                <img src={secondLogo} alt="Logo" className="h-12 w-auto" />
                <span>{t("landing.ministry_badge")}</span>
              </div>

              <div className="space-y-4">
                <h1 className="heading-display text-5xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                  {firstPart}
                  {firstPart && lastTwoWords ? " " : ""}
                  {lastTwoWords && (
                    <>
                      <span className="text-slate-900">{lastTwoWords.split(' ')[0]}</span>
                      {" "}
                      <span className="relative inline-block">
                        <span className="relative z-10 text-[#FDD240]">{lastTwoWords.split(' ')[1]}</span>
                        <svg
                          className="absolute left-0 w-full -bottom-2"
                          height="12"
                          viewBox="0 0 200 12"
                          preserveAspectRatio="none"
                        >
                          <path
                            d="M0,7 Q50,2 100,7 T200,7"
                            fill="none"
                            stroke="#FDD240"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                    </>
                  )}
                </h1>
                <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                  {t("landing.hero_subtitle")}
                </p>
              </div>

              <div className="flex flex-row gap-3">
                <Button
                  size="lg"
                  className="group relative bg-cyan-500 hover:bg-cyan-600 text-white h-14 px-8 text-base md:text-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30 hover:-translate-y-0.5"
                  onClick={() => {
                    const isLoggedIn = localStorage.getItem("studentId");
                    if (isLoggedIn) {
                      window.location.href = "/quiz/cba_trainer_potential";
                    } else {
                      window.location.href = "/student-entry?redirect=/quiz/cba_trainer_potential";
                    }
                  }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="hidden sm:inline">{t("landing.cta_button")}</span>
                    <span className="sm:hidden">{t("landing.cta_button_short")}</span>
                    <svg
                      className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Button>
              </div>

            </div>

            {/* Right side image */}
            <div className="relative flex justify-center items-center mt-10 lg:mt-0">
              <div className="relative w-full max-w-md">
                <motion.img
                  src="/heroImage.png"
                  alt="Hero illustration"
                  className="relative z-10 w-full h-auto rounded-3xl will-change-transform"
                  initial={{ scale: 0, opacity: 0.8 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 2.0, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true, amount: 0.3 }}
                />
              </div>
            </div>

          </div>
        </div>


      </section>


      {/* How It Works Section */}
      <section id="programs" className="py-20 px-4 relative">
        {/* Ocean Wave Border Top */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180">
          <svg className="relative block w-full h-16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="fill-cyan-500/20"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" className="fill-cyan-500/30"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-cyan-500/40"></path>
          </svg>
        </div>

        <div className="container max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block bg-cyan-500/10 text-cyan-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              {t("landing.process_badge")}
            </div>
            <h2 className="heading-display text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {t("landing.how_it_works")}
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              {t("landing.process_subtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-cyan-500 to-transparent -translate-x-1/2 z-0"></div>
                )}

                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all h-full bg-white rounded-2xl relative z-10 hover:scale-105">
                  <CardContent className="pt-8 pb-6 text-center space-y-4">
                    <div className="relative inline-block">
                      <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden shadow-lg">
                        <img src={step.img} alt={step.title as string} className="w-20 h-20 object-cover" />
                      </div>
                      <div className="absolute -top-2 -right-2 bg-cyan-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                        {index + 1}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl overflow-hidden">
              <CardContent className="p-8 md:p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  {/* Left: Assessment Image */}
                  <div className="order-1 md:order-1">
                    <img
                      src={assesmentImg}
                      alt="Assessment"
                      className="w-full h-auto "
                    />
                  </div>
                  {/* Right: Text and Button */}
                  <div className={`order-2 md:order-2 text-center ${isRTL ? 'md:text-right' : 'md:text-left'} space-y-4`}>
                    <h2 className="heading-display text-3xl md:text-4xl font-bold text-white">
                      {t("landing.cta_title")}
                    </h2>
                    <p className="text-cyan-50 text-lg">
                      {t("landing.cta_subtitle")}
                    </p>
                    <Button
                      size="lg"
                      className="bg-white text-cyan-600 hover:bg-cyan-50 shadow-xl h-14 px-10 text-lg rounded-xl font-semibold hover:scale-105 transition-all"
                      onClick={() => {
                        const isLoggedIn = localStorage.getItem("studentId");
                        if (isLoggedIn) {
                          window.location.href = "/quiz/cba_trainer_potential";
                        } else {
                          window.location.href = "/student-entry?redirect=/quiz/cba_trainer_potential";
                        }
                      }}
                    >
                      {t("landing.cta_button_alt")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-8 px-4 border-t bg-white/80 backdrop-blur-sm">
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-slate-600">
              <GraduationCap className="h-5 w-5 text-cyan-600" />
              <span className="font-medium">{t("landing.footer_ministry")}</span>
            </div>
            <p className="text-sm text-slate-600">{t("landing.footer_copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;