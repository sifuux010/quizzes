import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ResultDetailsPage = () => {
  const { attemptId } = useParams();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'en' | 'fr' | 'ar';
  const [attempt, setAttempt] = useState<any>(null);
  const [debug, setDebug] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/backend/api/get_result_details.php?id=${attemptId}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Failed to fetch result details');

        setAttempt(data.attempt); // ✅ fixed
        setDebug(data.debug);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [attemptId]);

  if (isLoading) return <div className="text-center p-8">{t('common.loading')}</div>;
  if (error) return <div className="text-center p-8 text-red-600">{t('common.error')}: {error}</div>;
  if (!attempt) return null;

  // ✅ Safe multilingual getter
  const getText = (value: any) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value[currentLang] || value.en || value.fr || Object.values(value)[0];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-8 bg-gradient-to-b from-white to-slate-50 min-h-screen"
    >
      <div className="mb-6 flex items-center justify-between">
        <Button asChild variant="outline">
          <Link to="/admin/results" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t('admin.back_to_results')}
          </Link>
        </Button>
      </div>

      <Card className="mb-8 shadow-md border-blue-300">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-blue-700">
            {getText(attempt.quiz_title)}
          </CardTitle>
          <CardDescription>
            {t('admin.attempt_by')} <span className="font-semibold">{attempt.student_name}</span> {t('admin.on')}{' '}
            {new Date(attempt.completed_at).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge className="text-lg px-4 py-2 bg-blue-600 text-white rounded-full shadow-sm">
            {attempt.score_percentage}%
          </Badge>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {attempt.details.map((item: any, index: number) => (
          <Card key={item.question_id} className="border border-slate-200 hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <p className="font-semibold text-gray-800">
                  {index + 1}. {getText(item.question_text)}
                </p>
                {item.is_correct ? (
                  <Check className="h-6 w-6 text-green-500" />
                ) : (
                  <X className="h-6 w-6 text-red-500" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {item.options.map((option: any, i: number) => {
                const isSelected = i === item.selected_option_index;
                const isCorrect = i === item.correct_option_index;

                return (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border transition-all duration-150 ${isCorrect
                      ? 'bg-green-100 border-green-400'
                      : isSelected
                        ? 'bg-red-100 border-red-400'
                        : 'bg-white border-gray-200'
                      }`}
                  >
                    {getText(option)}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>


    </motion.div>
  );
};

export default ResultDetailsPage;
