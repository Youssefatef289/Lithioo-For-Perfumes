import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiEye, FiEyeOff, FiLock, FiUser, FiAlertCircle } from 'react-icons/fi';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useAdminLang } from '../contexts/AdminLangContext';
import { Button, Input, Card } from '../components/ui';
import { isAllowedAdminUsername, ALLOWED_ADMIN_USERNAME } from '../auth/usernameToEmail';

const MAX_FAILED_ATTEMPTS = 5;
const THROTTLE_SECONDS = 30;

export default function LoginPage() {
  const { signIn } = useAdminAuth();
  const { t, language } = useAdminLang();
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

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (cooldown > 0) return;

    const cleanUsername = username.trim();
    if (!cleanUsername || !password) return;

    setErrorMsg('');

    // Strict validation: Only admin_lithioo is allowed
    if (!isAllowedAdminUsername(cleanUsername)) {
      setErrorMsg(
        language === 'ar'
          ? `اسم المستخدم غير مصرح به. تسجيل الدخول مقتصر على حساب ${ALLOWED_ADMIN_USERNAME} فقط.`
          : `Unauthorized username. Access is restricted to ${ALLOWED_ADMIN_USERNAME} only.`
      );
      return;
    }

    setLoading(true);

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
      } else if (res.error === 'unauthorized_user') {
        setErrorMsg(
          language === 'ar'
            ? `اسم المستخدم غير مصرح به. تسجيل الدخول مقتصر على حساب ${ALLOWED_ADMIN_USERNAME} فقط.`
            : `Unauthorized username. Access is restricted to ${ALLOWED_ADMIN_USERNAME} only.`
        );
      } else {
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
        {/* Header with Logo */}
        <div className="mb-6 text-center">
          <Link to="/" className="inline-block mb-3 transition-transform hover:scale-105" title="Lithioo Store">
            <img
              src="/image/logo/leithioo-logo-gold.png"
              alt="Lithioo Perfumes"
              className="mx-auto h-16 w-auto object-contain drop-shadow"
            />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Lithioo Perfumes
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {language === 'ar' ? 'لوحة تحكم المشرف' : 'Admin Dashboard Portal'}
          </p>
        </div>

        {/* Card */}
        <Card className="shadow-xl border border-neutral-200/80 dark:border-neutral-800">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              {t.login?.signIn || (language === 'ar' ? 'تسجيل الدخول' : 'Sign In')}
            </h2>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              {language === 'ar'
                ? 'أدخل بيانات حساب المشرف للمتابعة'
                : 'Enter your administrator credentials to continue'}
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-none bg-red-50 p-3 text-xs font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800/40">
              <FiAlertCircle className="shrink-0" size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSignIn} autoComplete="off" className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                {t.login?.username || (language === 'ar' ? 'اسم المستخدم' : 'Username')}
              </label>
              <div className="relative">
                <Input
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={ALLOWED_ADMIN_USERNAME}
                  className="ps-9"
                  disabled={isLocked || loading}
                />
                <FiUser className="absolute start-3 top-3 text-neutral-400" size={16} />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                {t.login?.password || (language === 'ar' ? 'كلمة المرور' : 'Password')}
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
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
                : t.login?.signIn || (language === 'ar' ? 'تسجيل الدخول' : 'Sign In')}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
