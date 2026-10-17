import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useAdminLang } from '../contexts/AdminLangContext';
import { Button, Input, Card } from '../components/ui';

export default function LoginPage() {
  const { signIn, signUp, sendPasswordReset, authError } = useAdminAuth();
  const { t } = useAdminLang();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const from = location.state?.from?.pathname || '/admin';

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const ok = await signIn(email.trim(), password);
      if (ok) {
        navigate(from, { replace: true });
      } else {
        setErrorMsg(authError || t.login.error);
      }
    } catch (err) {
      setErrorMsg(err.message || t.login.error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    if (password !== confirmPassword) {
      setErrorMsg(t.login.passwordMismatch || 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const ok = await signUp(email.trim(), password, fullName.trim(), 'admin');
      if (ok) {
        setSuccessMsg(t.login.accountCreated || 'Account created successfully!');
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1000);
      } else {
        setErrorMsg(authError || 'Failed to create account.');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const ok = await sendPasswordReset(email.trim());
      if (ok) {
        setResetSent(true);
      } else {
        setErrorMsg('Failed to send reset email.');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12 dark:bg-neutral-950">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand font-black text-2xl shadow-inner">
            L
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Lithioo Perfumes
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {t.login.title}
          </p>
        </div>

        <Card className="shadow-lg">
          {/* Tabs for Sign In vs Sign Up */}
          {!showForgot && !resetSent && (
            <div className="mb-6 flex rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg('');
                }}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
                  mode === 'signin'
                    ? 'bg-white text-neutral-900 shadow dark:bg-neutral-700 dark:text-white'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                {t.login.signIn}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg('');
                }}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
                  mode === 'signup'
                    ? 'bg-white text-neutral-900 shadow dark:bg-neutral-700 dark:text-white'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                {t.login.signUp}
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
              {successMsg}
            </div>
          )}

          {resetSent ? (
            <div className="text-center py-4 space-y-4">
              <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                {t.login.resetSent}
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setResetSent(false);
                  setShowForgot(false);
                }}
              >
                {t.login.signIn}
              </Button>
            </div>
          ) : showForgot ? (
            <form onSubmit={handleReset} className="space-y-4">
              <Input
                label={t.login.email}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
              <Button type="submit" loading={loading} className="w-full">
                {t.login.forgotPass}
              </Button>
              <button
                type="button"
                onClick={() => setShowForgot(false)}
                className="w-full text-center text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                {t.common.cancel}
              </button>
            </form>
          ) : mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <Input
                label={t.login.email}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
              <Input
                label={t.login.password}
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-xs text-brand hover:underline"
                >
                  {t.login.forgotPass}
                </button>
              </div>

              <Button type="submit" loading={loading} className="w-full">
                {t.login.signIn}
              </Button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg('');
                  }}
                  className="text-xs text-neutral-600 hover:text-brand dark:text-neutral-400"
                >
                  {t.login.noAccount}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <Input
                label={t.login.fullName}
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="مدير المتجر"
              />
              <Input
                label={t.login.email}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
              <Input
                label={t.login.password}
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <Input
                label={t.login.confirmPassword}
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />

              <Button type="submit" loading={loading} className="w-full">
                {t.login.signUp}
              </Button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg('');
                  }}
                  className="text-xs text-neutral-600 hover:text-brand dark:text-neutral-400"
                >
                  {t.login.haveAccount}
                </button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
