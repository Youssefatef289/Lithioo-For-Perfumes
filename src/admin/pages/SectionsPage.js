import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { Button, Card, Input } from '../components/ui';
import { useAdminLang } from '../contexts/AdminLangContext';

export default function SectionsPage() {
  const { language } = useAdminLang();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ slug: '', name_en: '', name_ar: '', sort_order: 0 });
  const [loading, setLoading] = useState(true);
  const load = async () => {
    if (!isSupabaseConfigured) return setLoading(false);
    const { data } = await supabase.from('sections').select('*').order('sort_order');
    setRows(data ?? []); setLoading(false);
  };
  useEffect(() => { load(); }, []);
  const save = async (event) => {
    event.preventDefault();
    const slug = form.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!slug || !form.name_en.trim()) return;
    const { error } = await supabase.from('sections').upsert({ ...form, slug, sort_order: Number(form.sort_order) || 0 }, { onConflict: 'slug' });
    if (!error) { setForm({ slug: '', name_en: '', name_ar: '', sort_order: 0 }); load(); }
  };
  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold dark:text-white">{language === 'ar' ? 'الأقسام' : 'Sections'}</h1><p className="text-sm text-neutral-500">{language === 'ar' ? 'إضافة وترتيب أقسام المتجر' : 'Add and organize storefront sections.'}</p></div>
    <Card><form onSubmit={save} className="grid gap-3 sm:grid-cols-4"><Input required placeholder="Slug" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })}/><Input required placeholder="Name (EN)" value={form.name_en} onChange={e => setForm({ ...form, name_en: e.target.value })}/><Input placeholder="الاسم بالعربية" value={form.name_ar} onChange={e => setForm({ ...form, name_ar: e.target.value })}/><Button type="submit">{language === 'ar' ? 'إضافة قسم' : 'Add section'}</Button></form></Card>
    <Card>{loading ? '…' : <div className="space-y-2">{rows.map(row => <div key={row.id} className="flex items-center justify-between border-b py-3 last:border-0"><div><b className="dark:text-white">{language === 'ar' ? row.name_ar || row.name_en : row.name_en}</b><p className="text-xs text-neutral-500">/{row.slug}</p></div><span className="text-xs text-neutral-500">#{row.sort_order}</span></div>)}</div>}</Card>
  </div>;
}
