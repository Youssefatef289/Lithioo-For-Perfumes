import React, { useState, useEffect, useCallback } from 'react';
import { FiUserPlus, FiShield, FiSave, FiCopy, FiCheck } from 'react-icons/fi';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useAdminLang } from '../contexts/AdminLangContext';
import { useToast } from '../components/ui/Toast';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { Card, Button, Select, Badge, Skeleton } from '../components/ui';

export default function TeamPage() {
  const { isAdmin, profile: myProfile } = useAdminAuth();
  const { t, language } = useAdminLang();
  const toast = useToast();

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    if (!isSupabaseConfigured) {
      setProfiles([
        {
          id: 'admin-local',
          full_name: 'Super Admin',
          role: 'admin',
          created_at: new Date().toISOString(),
        },
      ]);
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
      console.error(err);
      toast({ message: t.common.error, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [t.common.error, toast]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('profiles')
          .update({ role: newRole })
          .eq('id', userId);
        if (error) throw error;
      }
      setProfiles((prev) =>
        prev.map((p) => (p.id === userId ? { ...p, role: newRole } : p))
      );
      toast({ message: language === 'ar' ? 'تم تحديث الدور' : 'Role updated', type: 'success' });
    } catch (err) {
      toast({ message: err.message || t.common.error, type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  const sqlSnippet = `INSERT INTO profiles (id, full_name, role)
VALUES ('<PASTE_USER_UUID_HERE>', 'User Name', 'manager');`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          {t.team.title} ({profiles.length})
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {language === 'ar' ? 'إدارة صلاحيات المشرفين والموظفين' : 'Manage administrator and staff roles'}
        </p>
      </div>

      {/* Profiles List */}
      <Card>
        <h2 className="mb-4 text-base font-bold text-neutral-900 dark:text-white">
          {language === 'ar' ? 'الأعضاء الحاليون' : 'Current Team Members'}
        </h2>

        {loading ? (
          <Skeleton lines={4} />
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {profiles.map((p) => {
              const isMe = p.id === myProfile?.id;
              return (
                <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-neutral-900 dark:text-white">
                        {p.full_name || 'Staff User'}
                      </p>
                      {isMe && (
                        <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-bold text-brand">
                          {language === 'ar' ? 'أنت' : 'You'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 font-mono">{p.id}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge color={p.role === 'admin' ? 'brand' : p.role === 'manager' ? 'blue' : 'gray'}>
                      {p.role}
                    </Badge>

                    {!isMe && (
                      <Select
                        value={p.role}
                        disabled={updatingId === p.id}
                        onChange={(e) => handleRoleChange(p.id, e.target.value)}
                        className="w-32 text-xs"
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="staff">Staff</option>
                      </Select>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Invite Instructions */}
      <Card className="space-y-3 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
          <FiUserPlus className="text-brand" />
          {t.team.invite}
        </div>
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          {language === 'ar'
            ? 'لإضافة عضو جديد إلى الفريق بأمان، اتبع الخطوات التالية:'
            : 'To add a new team member securely, follow these steps:'}
        </p>
        <ol className="list-decimal list-inside text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
          <li>
            {language === 'ar'
              ? 'توجه إلى لوحة تحكم Supabase ← قسم Authentication ← Users واضغط "Invite User" أو "Create User".'
              : 'Go to Supabase Dashboard → Authentication → Users and click "Invite User" or "Create User".'}
          </li>
          <li>
            {language === 'ar'
              ? 'انسخ المعرف الفريد (User UUID) للمستخدم الجديد.'
              : 'Copy the unique User UUID.'}
          </li>
          <li>
            {language === 'ar'
              ? 'قم بتشغيل استعلام SQL التالي في SQL Editor لتعيين صلاحية المستخدم:'
              : 'Run the following SQL snippet in the Supabase SQL Editor to assign their role:'}
          </li>
        </ol>

        <div className="relative mt-2 rounded-xl bg-neutral-900 p-3 font-mono text-xs text-neutral-200">
          <pre className="overflow-x-auto">{sqlSnippet}</pre>
          <button
            onClick={handleCopySql}
            className="absolute end-3 top-3 rounded-lg bg-neutral-800 p-1.5 text-neutral-300 hover:text-white"
            title="Copy SQL"
          >
            {copied ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
          </button>
        </div>
      </Card>
    </div>
  );
}

