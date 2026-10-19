import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiEye, FiEyeOff, FiLock, FiUser, FiPhone, FiUserCheck, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useAdminLang } from '../contexts/AdminLangContext';
import { Button, Input, Card } from '../components/ui';
import { validateUsername, validatePhone, normalizePhone } from '../auth/usernameToEmail';

const MAX_FAILED_ATTEMPTS = 5;
const THROTTLE_SECONDS = 30;

export default function LoginPage() {
  const { signIn, signUp } = useAdminAuth();
  const { t, language } = useAdminLang();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'signin' | 'signup'
  const [mode, setMode] = useState('signin');

  // Sign in fields
  const [signInUsername, setSignInUsername] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPass, setShowSignInPass] = useState(false);

  // Sign up fields
  const [signUpFullName, setSignUpFullName] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPass, setSignUpConfirmPass] = useState('');
  const [showSignUpPass, setShowSignUpPass] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  const switchMode = (newMode) => {
    setMode(newMode);
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Handle Sign In Submit
  const handleSignIn = async (e) => {
    e.preventDefault();
    if (cooldown > 0) return;

    const cleanUsername = signInUsername.trim().toLowerCase();
    if (!cleanUsername || !signInPassword) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await signIn(cleanUsername, signInPassword);

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

  // Handle Sign Up Submit
  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const fullName = signUpFullName.trim();
    const cleanUsername = signUpUsername.trim();
    const cleanPhone = normalizePhone(signUpPhone);
    const pass = signUpPassword;
    const confirmPass = signUpConfirmPass;

    if (!fullName || !cleanUsername || !cleanPhone || !pass || !confirmPass) {
      setErrorMsg(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة.' : 'Please fill all required fields.');
      return;
    }

    if (!validateUsername(cleanUsername)) {
      setErrorMsg(
        language === 'ar'
          ? 'اسم المستخدم يجب ألا يقل عن حرفين.'
          : 'Username must be at least 2 characters.'
      );
      return;
    }

    if (!validatePhone(cleanPhone)) {
      setErrorMsg(
        language === 'ar'
          ? 'رقم هاتف غير صالح. يجب أن يكون رقماً مصرياً صحيحاً (مثال: 01012345678).'
          : 'Invalid phone number. Must be a valid Egyptian mobile number (e.g. 01012345678).'
      );
      return;
    }

    if (pass.length < 6) {
      setErrorMsg(language === 'ar' ? 'يجب ألا تقل كلمة المرور عن 6 أحرف.' : 'Password must be at least 6 characters.');
      return;
    }

    if (pass !== confirmPass) {
      setErrorMsg(language === 'ar' ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await signUp({
        fullName,
        username: cleanUsername,
        phone: cleanPhone,
        password: pass,
        role: 'admin',
      });

      if (res.ok) {
        setSuccessMsg(language === 'ar' ? 'تم إنشاء الحساب بنجاح! جاري تحويلك للوحة التحكم...' : 'Account created successfully! Redirecting…');
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1200);
      } else if (res.error === 'username_taken_or_invalid') {
        setErrorMsg(language === 'ar' ? 'اسم المستخدم هذا مستخدم بالفعل. يرجى اختيار اسم آخر.' : 'This username is already taken. Please choose another one.');
      } else {
        setErrorMsg(language === 'ar' ? 'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة ثانية.' : 'Failed to create account. Please try again.');
      }
    } catch (err) {
      setErrorMsg(language === 'ar' ? 'حدث خطأ في الخادم.' : 'Server error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const isLocked = cooldown > 0;

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12 dark:bg-neutral-950">
      <div className="w-full max-w-md">
        {/* Header with Logo above brand name */}
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
          {/* Mode Switcher Tabs */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800/60">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`rounded-lg py-2 text-xs font-semibold transition ${
                mode === 'signin'
                  ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-white'
                  : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              {t.login?.signIn || (language === 'ar' ? 'تسجيل الدخول' : 'Sign In')}
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`rounded-lg py-2 text-xs font-semibold transition ${
                mode === 'signup'
                  ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-white'
                  : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              {t.login?.signUp || (language === 'ar' ? 'إنشاء حساب جديد' : 'Create Account')}
            </button>
          </div>

          {/* Error & Success Messages */}
          {errorMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
              <FiAlertCircle className="shrink-0" size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
              <FiCheckCircle className="shrink-0" size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ── FORM 1: SIGN IN ────────────────────────────────────── */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  {t.login?.username || (language === 'ar' ? 'اسم المستخدم' : 'Username')}
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    required
                    value={signInUsername}
                    onChange={(e) => setSignInUsername(e.target.value)}
                    placeholder={language === 'ar' ? 'اسم المستخدم (مثال: admin)' : 'username (e.g. admin)'}
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
                    type={showSignInPass ? 'text' : 'password'}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className="ps-9 pe-10"
                    disabled={isLocked || loading}
                  />
                  <FiLock className="absolute start-3 top-3 text-neutral-400" size={16} />
                  <button
                    type="button"
                    onClick={() => setShowSignInPass((s) => !s)}
                    className="absolute end-3 top-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                    title={showSignInPass ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showSignInPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                loading={loading}
                disabled={isLocked || !signInUsername.trim() || !signInPassword}
                className="w-full mt-2"
              >
                {isLocked
                  ? language === 'ar'
                    ? `انتظر ${cooldown} ثانية...`
                    : `Wait ${cooldown}s...`
                  : t.login?.signIn || (language === 'ar' ? 'تسجيل الدخول' : 'Sign In')}
              </Button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-xs font-medium text-brand hover:underline"
                >
                  {t.login?.noAccount || (language === 'ar' ? 'ليس لديك حساب؟ إنشاء حساب مشرف جديد' : "Don't have an account? Create one")}
                </button>
              </div>
            </form>
          )}

          {/* ── FORM 2: SIGN UP ────────────────────────────────────── */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  {t.login?.fullName || (language === 'ar' ? 'الاسم الكامل' : 'Full Name')}
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    required
                    value={signUpFullName}
                    onChange={(e) => setSignUpFullName(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: أحمد محمد' : 'e.g. John Doe'}
                    className="ps-9"
                    disabled={loading}
                  />
                  <FiUserCheck className="absolute start-3 top-3 text-neutral-400" size={16} />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  {t.login?.username || (language === 'ar' ? 'اسم المستخدم' : 'Username')}
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    required
                    value={signUpUsername}
                    onChange={(e) => setSignUpUsername(e.target.value)}
                    placeholder={language === 'ar' ? 'اسم المستخدم' : 'username'}
                    className="ps-9"
                    disabled={loading}
                  />
                  <FiUser className="absolute start-3 top-3 text-neutral-400" size={16} />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  {t.login?.phone || (language === 'ar' ? 'رقم الهاتف' : 'Phone Number')}
                </label>
                <div className="relative">
                  <Input
                    type="tel"
                    required
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value)}
                    placeholder="01012345678"
                    className="ps-9 font-mono"
                    disabled={loading}
                  />
                  <FiPhone className="absolute start-3 top-3 text-neutral-400" size={16} />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  {t.login?.password || (language === 'ar' ? 'كلمة المرور' : 'Password')}
                </label>
                <div className="relative">
                  <Input
                    type={showSignUpPass ? 'text' : 'password'}
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="••••••••"
                    className="ps-9 pe-10"
                    disabled={loading}
                  />
                  <FiLock className="absolute start-3 top-3 text-neutral-400" size={16} />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPass((s) => !s)}
                    className="absolute end-3 top-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                    title={showSignUpPass ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showSignUpPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  {t.login?.confirmPassword || (language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password')}
                </label>
                <div className="relative">
                  <Input
                    type={showSignUpPass ? 'text' : 'password'}
                    required
                    value={signUpConfirmPass}
                    onChange={(e) => setSignUpConfirmPass(e.target.value)}
                    placeholder="••••••••"
                    className="ps-9"
                    disabled={loading}
                  />
                  <FiLock className="absolute start-3 top-3 text-neutral-400" size={16} />
                </div>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full mt-2"
              >
                {t.login?.signUp || (language === 'ar' ? 'إنشاء حساب المشرف' : 'Create Admin Account')}
              </Button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="text-xs font-medium text-brand hover:underline"
                >
                  {t.login?.haveAccount || (language === 'ar' ? 'لديك حساب بالفعل؟ تسجيل الدخول' : 'Already have an account? Sign In')}
                </button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}