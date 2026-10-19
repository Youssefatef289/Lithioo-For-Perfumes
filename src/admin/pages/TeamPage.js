import React, { useState, useEffect, useCallback } from 'react';
import {
  FiUserPlus,
  FiShield,
  FiEdit2,
  FiKey,
  FiTrash2,
  FiCopy,
  FiCheck,
  FiRefreshCw,
  FiAlertCircle,
  FiInfo,
} from 'react-icons/fi';
import { z } from 'zod';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useAdminLang } from '../contexts/AdminLangContext';
import { useToast } from '../components/ui/Toast';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { Button, Input, Select, Switch, Card, Modal, ConfirmDialog, Skeleton } from '../components/ui';
import { validatePhone, normalizePhone } from '../auth/usernameToEmail';

const MOCK_PROFILES = [
  {
    id: 'mock-1',
    full_name: 'Admin User',
    username: 'admin',
    phone: '01012345678',
    role: 'admin',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    full_name: 'Store Manager',
    username: 'manager_sara',
    phone: '01123456789',
    role: 'manager',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'mock-3',
    full_name: 'Ahmed Staff',
    username: 'ahmed_ops',
    phone: '01234567890',
    role: 'staff',
    is_active: false,
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
];

// Zod schemas
const createUserSchema = z.object({
  full_name: z.string().trim().min(2, { message: 'invalid_name' }),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,30}$/, { message: 'invalid_username' }),
  phone: z.string().refine((val) => validatePhone(val), { message: 'invalid_phone' }),
  password: z.string().min(8, { message: 'weak_password' }),
  role: z.enum(['admin', 'manager', 'staff']),
});

const updateUserSchema = z.object({
  full_name: z.string().trim().min(2, { message: 'invalid_name' }),
  phone: z.string().refine((val) => !val || validatePhone(val), { message: 'invalid_phone' }),
  role: z.enum(['admin', 'manager', 'staff']),
});

const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: 'weak_password' }),
});

function generateSecurePassword(length = 12) {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*';
  let pass = '';
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

export default function TeamPage() {
  const { isAdmin, profile: myProfile } = useAdminAuth();
  const { t, language } = useAdminLang();
  const toast = useToast();

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [resettingUser, setResettingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  // Form states
  const [addForm, setAddForm] = useState({
    full_name: '',
    username: '',
    phone: '',
    password: '',
    role: 'staff',
  });
  const [addFormErrors, setAddFormErrors] = useState({});
  const [addFormSubmitting, setAddFormSubmitting] = useState(false);
  const [copiedAddPass, setCopiedAddPass] = useState(false);

  const [editForm, setEditForm] = useState({ full_name: '', phone: '', role: 'staff' });
  const [editFormErrors, setEditFormErrors] = useState({});
  const [editFormSubmitting, setEditFormSubmitting] = useState(false);

  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [copiedResetPass, setCopiedResetPass] = useState(false);

  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Error message mapper
  const getFriendlyError = useCallback((errCode) => {
    if (!errCode) return t.common.error;
    if (t.team.errors && t.team.errors[errCode]) {
      return t.team.errors[errCode];
    }
    if (errCode === 'invalid_name') {
      return language === 'ar' ? 'الاسم يجب أن لا يقل عن حرفين.' : 'Name must be at least 2 characters.';
    }
    return errCode;
  }, [t.common.error, t.team.errors, language]);

  // Parse error response from supabase edge function
  const parseEdgeFunctionError = async (res) => {
    let errCode = null;
    if (res.error) {
      try {
        if (res.error.context && typeof res.error.context.json === 'function') {
          const body = await res.error.context.json();
          errCode = body?.error;
        }
      } catch (_) {}
      if (!errCode) errCode = res.error.message;
    } else if (res.data && res.data.error) {
      errCode = res.data.error;
    }
    return errCode;
  };

  // Load profiles from DB
  const loadProfiles = useCallback(async () => {
    setLoading(true);
    if (!isSupabaseConfigured) {
      setProfiles(MOCK_PROFILES);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      console.error('Failed to load profiles:', err);
      toast({ message: t.common.error, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [t.common.error, toast]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  // Handle toggle active
  const handleToggleActive = async (user) => {
    if (user.id === myProfile?.id) {
      toast({ message: t.team.cannotModifySelf, type: 'error' });
      return;
    }

    const nextActive = !user.is_active;
    setTogglingId(user.id);

    // Optimistic UI update
    setProfiles((prev) =>
      prev.map((p) => (p.id === user.id ? { ...p, is_active: nextActive } : p))
    );

    if (!isSupabaseConfigured) {
      toast({ message: t.team.successUpdate, type: 'success' });
      setTogglingId(null);
      return;
    }

    try {
      const res = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'set_active',
          user_id: user.id,
          is_active: nextActive,
        },
      });

      const errCode = await parseEdgeFunctionError(res);
      if (errCode) {
        // Rollback
        setProfiles((prev) =>
          prev.map((p) => (p.id === user.id ? { ...p, is_active: user.is_active } : p))
        );
        toast({ message: getFriendlyError(errCode), type: 'error' });
      } else {
        toast({ message: t.team.successUpdate, type: 'success' });
      }
    } catch (err) {
      // Rollback
      setProfiles((prev) =>
        prev.map((p) => (p.id === user.id ? { ...p, is_active: user.is_active } : p))
      );
      toast({ message: t.common.error, type: 'error' });
    } finally {
      setTogglingId(null);
    }
  };

  // ── ADD USER HANDLERS ──────────────────────────────────────
  const handleOpenAdd = () => {
    const generated = generateSecurePassword();
    setAddForm({
      full_name: '',
      username: '',
      phone: '',
      password: generated,
      role: 'staff',
    });
    setAddFormErrors({});
    setShowAddModal(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    setAddFormErrors({});

    const normalizedData = {
      ...addForm,
      username: addForm.username.trim().toLowerCase(),
      phone: normalizePhone(addForm.phone),
    };

    const validation = createUserSchema.safeParse(normalizedData);
    if (!validation.success) {
      const fieldErrors = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0];
        fieldErrors[field] = getFriendlyError(issue.message);
      });
      setAddFormErrors(fieldErrors);
      return;
    }

    setAddFormSubmitting(true);

    if (!isSupabaseConfigured) {
      const newUser = {
        id: `mock-${Date.now()}`,
        ...normalizedData,
        is_active: true,
        created_at: new Date().toISOString(),
      };
      setProfiles((prev) => [...prev, newUser]);
      toast({ message: t.team.successCreate, type: 'success' });
      setShowAddModal(false);
      setAddFormSubmitting(false);
      return;
    }

    try {
      const res = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'create',
          username: normalizedData.username,
          phone: normalizedData.phone,
          password: normalizedData.password,
          full_name: normalizedData.full_name,
          role: normalizedData.role,
        },
      });

      const errCode = await parseEdgeFunctionError(res);
      if (errCode) {
        toast({ message: getFriendlyError(errCode), type: 'error' });
      } else {
        toast({ message: t.team.successCreate, type: 'success' });
        setShowAddModal(false);
        loadProfiles();
      }
    } catch (err) {
      toast({ message: t.common.error, type: 'error' });
    } finally {
      setAddFormSubmitting(false);
    }
  };

  // ── EDIT USER HANDLERS ─────────────────────────────────────
  const handleOpenEdit = (user) => {
    if (user.id === myProfile?.id) {
      toast({ message: t.team.cannotModifySelf, type: 'error' });
      return;
    }
    setEditingUser(user);
    setEditForm({
      full_name: user.full_name || '',
      phone: user.phone || '',
      role: user.role || 'staff',
    });
    setEditFormErrors({});
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setEditFormErrors({});

    const normalizedData = {
      ...editForm,
      phone: normalizePhone(editForm.phone),
    };

    const validation = updateUserSchema.safeParse(normalizedData);
    if (!validation.success) {
      const fieldErrors = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0];
        fieldErrors[field] = getFriendlyError(issue.message);
      });
      setEditFormErrors(fieldErrors);
      return;
    }

    setEditFormSubmitting(true);

    if (!isSupabaseConfigured) {
      setProfiles((prev) =>
        prev.map((p) => (p.id === editingUser.id ? { ...p, ...normalizedData } : p))
      );
      toast({ message: t.team.successUpdate, type: 'success' });
      setEditingUser(null);
      setEditFormSubmitting(false);
      return;
    }

    try {
      const res = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'update',
          user_id: editingUser.id,
          full_name: normalizedData.full_name,
          phone: normalizedData.phone,
          role: normalizedData.role,
        },
      });

      const errCode = await parseEdgeFunctionError(res);
      if (errCode) {
        toast({ message: getFriendlyError(errCode), type: 'error' });
      } else {
        toast({ message: t.team.successUpdate, type: 'success' });
        setEditingUser(null);
        loadProfiles();
      }
    } catch (err) {
      toast({ message: t.common.error, type: 'error' });
    } finally {
      setEditFormSubmitting(false);
    }
  };

  // ── RESET PASSWORD HANDLERS ────────────────────────────────
  const handleOpenReset = (user) => {
    if (user.id === myProfile?.id) {
      toast({ message: t.team.cannotModifySelf, type: 'error' });
      return;
    }
    setResettingUser(user);
    setResetPasswordVal(generateSecurePassword());
    setResetError('');
  };

  const handleSubmitReset = async (e) => {
    e.preventDefault();
    setResetError('');

    const validation = resetPasswordSchema.safeParse({ password: resetPasswordVal });
    if (!validation.success) {
      setResetError(getFriendlyError(validation.error.issues[0].message));
      return;
    }

    setResetSubmitting(true);

    if (!isSupabaseConfigured) {
      toast({ message: t.team.successReset, type: 'success' });
      setResettingUser(null);
      setResetSubmitting(false);
      return;
    }

    try {
      const res = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'reset_password',
          user_id: resettingUser.id,
          password: resetPasswordVal,
        },
      });

      const errCode = await parseEdgeFunctionError(res);
      if (errCode) {
        setResetError(getFriendlyError(errCode));
      } else {
        toast({ message: t.team.successReset, type: 'success' });
        setResettingUser(null);
      }
    } catch (err) {
      setResetError(t.common.error);
    } finally {
      setResetSubmitting(false);
    }
  };

  // ── DELETE USER HANDLERS ───────────────────────────────────
  const handleOpenDelete = (user) => {
    if (user.id === myProfile?.id) {
      toast({ message: t.team.cannotModifySelf, type: 'error' });
      return;
    }
    setDeletingUser(user);
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setDeleteSubmitting(true);

    if (!isSupabaseConfigured) {
      setProfiles((prev) => prev.filter((p) => p.id !== deletingUser.id));
      toast({ message: t.team.successDelete, type: 'success' });
      setDeletingUser(null);
      setDeleteSubmitting(false);
      return;
    }

    try {
      const res = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'delete',
          user_id: deletingUser.id,
        },
      });

      const errCode = await parseEdgeFunctionError(res);
      if (errCode) {
        toast({ message: getFriendlyError(errCode), type: 'error' });
      } else {
        toast({ message: t.team.successDelete, type: 'success' });
        setDeletingUser(null);
        loadProfiles();
      }
    } catch (err) {
      toast({ message: t.common.error, type: 'error' });
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Helper for role styling
  const renderRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            {t.team.admin}
          </span>
        );
      case 'manager':
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {t.team.manager}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
            {t.team.staff}
          </span>
        );
    }
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (_) {
      return dateStr;
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <FiShield size={36} className="text-red-500 mb-2" />
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
          {language === 'ar' ? 'غير مصرح' : 'Access Restricted'}
        </h2>
        <p className="text-sm text-neutral-500">
          {language === 'ar'
            ? 'صفحة إدارة الفريق مخصصة للمدير العام (Admin) فقط.'
            : 'Team management is available to Super Admins only.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {t.team.title} ({profiles.length})
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {language === 'ar'
              ? 'إدارة حسابات فريق العمل، الصلاحيات وكلمات المرور'
              : 'Manage team accounts, roles, access status, and credentials'}
          </p>
        </div>

        <Button onClick={handleOpenAdd} className="flex items-center gap-2 self-start sm:self-auto">
          <FiUserPlus size={16} />
          <span>{t.team.addUser}</span>
        </Button>
      </div>

      {/* Supabase unconfigured warning banner */}
      {!isSupabaseConfigured && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          <FiInfo size={18} className="shrink-0" />
          <span>
            {language === 'ar'
              ? 'تنبيه: مشروع Supabase غير متصل حالياً. يتم عرض بيانات افتراضية لمعاينة واجهة إدارة الفريق.'
              : 'Notice: Supabase is not configured. Displaying mock data for team management preview.'}
          </span>
        </div>
      )}

      {/* Profiles Table Card */}
      <Card className="overflow-hidden p-0 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
        {loading ? (
          <div className="p-6">
            <Skeleton lines={5} />
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <FiShield size={32} className="text-neutral-400 mb-2" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{t.common.empty}</p>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-start">
                <thead className="border-b border-neutral-100 bg-neutral-50/80 text-xs uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800/40 dark:text-neutral-400">
                  <tr>
                    <th className="px-5 py-3.5 text-start">{t.team.name}</th>
                    <th className="px-4 py-3.5 text-start">{t.team.username}</th>
                    <th className="px-4 py-3.5 text-start">{t.team.phone}</th>
                    <th className="px-4 py-3.5 text-start">{t.team.role}</th>
                    <th className="px-4 py-3.5 text-center">{t.team.status}</th>
                    <th className="px-4 py-3.5 text-start">{t.team.createdAt}</th>
                    <th className="px-5 py-3.5 text-end">{t.team.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {profiles.map((p) => {
                    const isMe = p.id === myProfile?.id;
                    return (
                      <tr
                        key={p.id}
                        className={`transition hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30 ${
                          !p.is_active ? 'opacity-60 bg-neutral-50/30 dark:bg-neutral-900/20' : ''
                        }`}
                      >
                        {/* Name + Me badge */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-neutral-900 dark:text-white">
                              {p.full_name || '—'}
                            </span>
                            {isMe && (
                              <span className="rounded-md bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">
                                {language === 'ar' ? 'أنت' : 'You'}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Username */}
                        <td className="px-4 py-4 font-mono text-xs text-neutral-600 dark:text-neutral-300">
                          {p.username ? `@${p.username}` : '—'}
                        </td>

                        {/* Phone */}
                        <td className="px-4 py-4 font-mono text-xs text-neutral-600 dark:text-neutral-300">
                          {p.phone || '—'}
                        </td>

                        {/* Role badge */}
                        <td className="px-4 py-4">{renderRoleBadge(p.role)}</td>

                        {/* Active Switch */}
                        <td className="px-4 py-4 text-center">
                          <div className="inline-flex items-center justify-center">
                            <Switch
                              checked={Boolean(p.is_active)}
                              disabled={isMe || togglingId === p.id}
                              onChange={() => handleToggleActive(p)}
                            />
                          </div>
                        </td>

                        {/* Created Date */}
                        <td className="px-4 py-4 text-xs text-neutral-500 dark:text-neutral-400">
                          {formatDate(p.created_at)}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-end">
                          <div className="flex items-center justify-end gap-1.5">
                            {isMe ? (
                              <span className="text-xs text-neutral-400 italic">
                                {language === 'ar' ? 'حسابك الحالي' : 'Current user'}
                              </span>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(p)}
                                  className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition"
                                  title={t.team.editUser}
                                >
                                  <FiEdit2 size={15} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenReset(p)}
                                  className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
                                  title={t.team.resetPassword}
                                >
                                  <FiKey size={15} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenDelete(p)}
                                  className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                                  title={t.common.delete}
                                >
                                  <FiTrash2 size={15} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 md:hidden">
              {profiles.map((p) => {
                const isMe = p.id === myProfile?.id;
                return (
                  <div key={p.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-neutral-900 dark:text-white">
                            {p.full_name || '—'}
                          </span>
                          {isMe && (
                            <span className="rounded-md bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">
                              {language === 'ar' ? 'أنت' : 'You'}
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-xs text-neutral-500 mt-0.5">
                          {p.username ? `@${p.username}` : '—'} · {p.phone || '—'}
                        </p>
                      </div>
                      <div>{renderRoleBadge(p.role)}</div>
                    </div>

                    <div className="flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-500">
                          {p.is_active ? t.team.active : t.team.inactive}
                        </span>
                        <Switch
                          checked={Boolean(p.is_active)}
                          disabled={isMe || togglingId === p.id}
                          onChange={() => handleToggleActive(p)}
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        {!isMe && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(p)}
                              title={t.team.editUser}
                            >
                              <FiEdit2 size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenReset(p)}
                              className="text-amber-600 hover:text-amber-700"
                              title={t.team.resetPassword}
                            >
                              <FiKey size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDelete(p)}
                              className="text-red-600 hover:text-red-700"
                              title={t.common.delete}
                            >
                              <FiTrash2 size={14} />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* ── MODAL 1: ADD USER ───────────────────────────────────── */}
      <Modal
        open={showAddModal}
        onClose={() => !addFormSubmitting && setShowAddModal(false)}
        title={t.team.addUser}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowAddModal(false)}
              disabled={addFormSubmitting}
            >
              {t.common.cancel}
            </Button>
            <Button
              onClick={handleSubmitAdd}
              loading={addFormSubmitting}
            >
              {t.team.addUser}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmitAdd} className="space-y-4">
          {/* Full Name */}
          <Input
            label={t.team.name}
            required
            placeholder={language === 'ar' ? 'مثال: أحمد محمد' : 'e.g. John Doe'}
            value={addForm.full_name}
            onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
            error={addFormErrors.full_name}
          />

          {/* Username */}
          <Input
            label={t.team.username}
            required
            autoCapitalize="none"
            spellCheck="false"
            placeholder={language === 'ar' ? 'اسم المستخدم (أحرف صغيرة)' : 'username'}
            value={addForm.username}
            onChange={(e) => setAddForm({ ...addForm, username: e.target.value.toLowerCase() })}
            hint={language === 'ar' ? 'أحرف إنجليزية صغيرة وأرقام وشرطة سفلية فقط (3-30)' : '3-30 lowercase characters, numbers or underscores'}
            error={addFormErrors.username}
          />

          {/* Phone Number */}
          <Input
            label={t.team.phone}
            type="tel"
            required
            placeholder="01012345678"
            value={addForm.phone}
            onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
            hint={language === 'ar' ? 'رقم هاتف محمول مصري (11 رقم يبدأ بـ 01)' : 'Egyptian mobile phone number (e.g. 01012345678)'}
            error={addFormErrors.phone}
          />

          {/* Password with generator & copy */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t.team.password}
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  required
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  error={addFormErrors.password}
                  className="font-mono text-sm"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => {
                  const pass = generateSecurePassword();
                  setAddForm({ ...addForm, password: pass });
                }}
                title={t.team.generatePassword}
                className="shrink-0 flex items-center gap-1.5"
              >
                <FiRefreshCw size={14} />
                <span className="hidden sm:inline">{language === 'ar' ? 'توليد' : 'Generate'}</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => {
                  navigator.clipboard.writeText(addForm.password);
                  setCopiedAddPass(true);
                  setTimeout(() => setCopiedAddPass(false), 2000);
                }}
                title={t.team.copyPassword}
                className="shrink-0 flex items-center gap-1.5"
              >
                {copiedAddPass ? <FiCheck className="text-emerald-500" size={14} /> : <FiCopy size={14} />}
                <span className="hidden sm:inline">
                  {copiedAddPass ? t.team.copied : t.team.copyPassword}
                </span>
              </Button>
            </div>
            <p className="text-xs text-neutral-400">
              {language === 'ar' ? 'يجب ألا يقل عن 8 أحرف. يرجى نسخ كلمة المرور وإعطاؤها للمستخدم.' : 'Min 8 chars. Please copy and securely share this password with the user.'}
            </p>
          </div>

          {/* Role */}
          <Select
            label={t.team.role}
            value={addForm.role}
            onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
          >
            <option value="staff">{t.team.staff}</option>
            <option value="manager">{t.team.manager}</option>
            <option value="admin">{t.team.admin}</option>
          </Select>
        </form>
      </Modal>

      {/* ── MODAL 2: EDIT USER ──────────────────────────────────── */}
      <Modal
        open={Boolean(editingUser)}
        onClose={() => !editFormSubmitting && setEditingUser(null)}
        title={t.team.editUser}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setEditingUser(null)}
              disabled={editFormSubmitting}
            >
              {t.common.cancel}
            </Button>
            <Button
              onClick={handleSubmitEdit}
              loading={editFormSubmitting}
            >
              {t.team.save}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <div className="rounded-xl bg-neutral-50 p-3 text-xs text-neutral-600 dark:bg-neutral-800/50 dark:text-neutral-400">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {t.team.username}:
            </span>{' '}
            <span className="font-mono font-medium">@{editingUser?.username}</span>
          </div>

          <Input
            label={t.team.name}
            required
            value={editForm.full_name}
            onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
            error={editFormErrors.full_name}
          />

          <Input
            label={t.team.phone}
            type="tel"
            value={editForm.phone}
            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            hint={language === 'ar' ? 'رقم هاتف محمول مصري' : 'Egyptian mobile number'}
            error={editFormErrors.phone}
          />

          <Select
            label={t.team.role}
            value={editForm.role}
            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
          >
            <option value="staff">{t.team.staff}</option>
            <option value="manager">{t.team.manager}</option>
            <option value="admin">{t.team.admin}</option>
          </Select>
        </form>
      </Modal>

      {/* ── MODAL 3: RESET PASSWORD ─────────────────────────────── */}
      <Modal
        open={Boolean(resettingUser)}
        onClose={() => !resetSubmitting && setResettingUser(null)}
        title={t.team.resetPassword}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setResettingUser(null)}
              disabled={resetSubmitting}
            >
              {t.common.cancel}
            </Button>
            <Button
              onClick={handleSubmitReset}
              loading={resetSubmitting}
            >
              {t.team.resetPassword}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmitReset} className="space-y-4">
          <div className="rounded-xl bg-neutral-50 p-3 text-xs text-neutral-600 dark:bg-neutral-800/50 dark:text-neutral-400">
            <div>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {t.team.name}:
              </span>{' '}
              {resettingUser?.full_name}
            </div>
            <div className="mt-1">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {t.team.username}:
              </span>{' '}
              <span className="font-mono font-medium">@{resettingUser?.username}</span>
            </div>
          </div>

          {resetError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
              <FiAlertCircle className="shrink-0" size={16} />
              <span>{resetError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t.team.newPassword}
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  required
                  value={resetPasswordVal}
                  onChange={(e) => setResetPasswordVal(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setResetPasswordVal(generateSecurePassword())}
                title={t.team.generatePassword}
                className="shrink-0 flex items-center gap-1.5"
              >
                <FiRefreshCw size={14} />
                <span className="hidden sm:inline">{language === 'ar' ? 'توليد' : 'Generate'}</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => {
                  navigator.clipboard.writeText(resetPasswordVal);
                  setCopiedResetPass(true);
                  setTimeout(() => setCopiedResetPass(false), 2000);
                }}
                title={t.team.copyPassword}
                className="shrink-0 flex items-center gap-1.5"
              >
                {copiedResetPass ? <FiCheck className="text-emerald-500" size={14} /> : <FiCopy size={14} />}
                <span className="hidden sm:inline">
                  {copiedResetPass ? t.team.copied : t.team.copyPassword}
                </span>
              </Button>
            </div>
            <p className="text-xs text-neutral-400">
              {language === 'ar'
                ? 'يجب أن لا تقل كلمة المرور عن 8 أحرف.'
                : 'Password must be at least 8 characters long.'}
            </p>
          </div>
        </form>
      </Modal>

      {/* ── MODAL 4: DELETE CONFIRM ─────────────────────────────── */}
      <ConfirmDialog
        open={Boolean(deletingUser)}
        onClose={() => !deleteSubmitting && setDeletingUser(null)}
        onConfirm={handleConfirmDelete}
        title={language === 'ar' ? 'تأكيد حذف المستخدم' : 'Confirm Delete User'}
        message={`${t.team.confirmDelete} (${deletingUser?.full_name || ''} - @${deletingUser?.username || ''})`}
        confirmLabel={deleteSubmitting ? t.common.loading : t.common.delete}
        dangerous
      />
    </div>
  );
}
