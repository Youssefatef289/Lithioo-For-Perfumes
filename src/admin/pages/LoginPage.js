import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiEye, FiEyeOff, FiLock, FiUser, FiAlertCircle } from 'react-icons/fi';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useAdminLang } from '../contexts/AdminLangContext';
import { Button, Input, Card } from '../components/ui';

const MAX_FAILED_ATTEMPTS = 5;
const THROTTLE_SECONDS = 30;

export default function LoginPage() {
  const { signIn } = useAdminAuth();
  const { language } = useAdminLang();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Throttle state
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  const from = location.state?.from?.pathname || '/admin';

  // Countdown timer for cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cooldown > 0) return;

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || !password) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await signIn(cleanUsername, password);

      if (res.ok) {
        setFailedAttempts(0);
        navigate(from, { replace: true });
      } else if (res.error === 'account_disabled') {
        setErrorMsg(
          language === 'ar'
            ? 'الحساب معطل أو غير مصرح له بالدخول.'
            : 'Account disabled or not authorized.'
        );
      } else {
        // Generic invalid credentials message
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        if (newAttempts >= MAX_FAILED_ATTEMPTS) {
          setCooldown(THROTTLE_SECONDS);
          setErrorMsg(
            language === 'ar'
              ? `تم تجاوز عدد المحاولات المسموحة. يرجى الانتظار ${THROTTLE_SECONDS} ثانية.`
              : `Too many failed attempts. Please wait ${THROTTLE_SECONDS} seconds.`
          );
        } else {
          setErrorMsg(
            language === 'ar'
              ? 'اسم المستخدم أو كلمة المرور غير صحيحة.'
              : 'Invalid username or password.'
          );
        }
      }
    } catch (err) {
      setErrorMsg(
        language === 'ar'
          ? 'اسم المستخدم أو كلمة المرور غير صحيحة.'
          : 'Invalid username or password.'
      );
    } finally {
      setLoading(false);
    }
  };

  const isLocked = cooldown > 0;

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12 dark:bg-neutral-950">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand font-black text-2xl shadow-inner">
            L
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Lithioo Perfumes
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {language === 'ar' ? 'لوحة تحكم المشرف' : 'Admin Dashboard Login'}
          </p>
        </div>

        <Card className="shadow-lg border border-neutral-200/80 dark:border-neutral-800">
          {errorMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
              <FiAlertCircle className="shrink-0" size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username field */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                {language === 'ar' ? 'اسم المستخدم' : 'Username'}
              </label>
              <div className="relative">
                <Input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder={language === 'ar' ? 'اسم المستخدم' : 'username'}
                  className="ps-9"
                  disabled={isLocked || loading}
                />
                <FiUser className="absolute start-3 top-3 text-neutral-400" size={16} />
              </div>
            </div>

            {/* Password field with show/hide toggle */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                {language === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="ps-9 pe-10"
                  disabled={isLocked || loading}
                />
                <FiLock className="absolute start-3 top-3 text-neutral-400" size={16} />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute end-3 top-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit button with loading and cooldown */}
            <Button
              type="submit"
              loading={loading}
              disabled={isLocked || !username.trim() || !password}
              className="w-full mt-2"
            >
              {isLocked
                ? language === 'ar'
                  ? `انتظر ${cooldown} ثانية...`
                  : `Wait ${cooldown}s...`
                : language === 'ar'
                ? 'تسجيل الدخول'
                : 'Sign In'}
            </Button>
          </form>

          {/* Password reset notice */}
          <div className="mt-6 border-t border-neutral-100 pt-4 text-center dark:border-neutral-800">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {language === 'ar'
                ? 'نسيت كلمة المرور؟ تواصل مع مدير النظام لإعادة تعيينها.'
                : 'Forgot password? Contact the admin to reset your password.'}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}