import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useAdminLang } from '../contexts/AdminLangContext';
import { useToast } from '../components/ui/Toast';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { BRAND_LOGOS } from '../../data/brands';
import {
  Button,
  Input,
  Switch,
  Modal,
  ConfirmDialog,
  Card,
  ImageUploader,
} from '../components/ui';

export default function BrandsPage() {
  const { t, language } = useAdminLang();
  const toast = useToast();

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [form, setForm] = useState({
    slug: '',
    name_en: '',
    name_ar: '',
    logo_url: '',
    starting_price_override: '',
    sort_order: 0,
    is_active: true,
  });

  const loadBrands = useCallback(async () => {
    setLoading(true);
    if (!isSupabaseConfigured) {
      setBrands(
        BRAND_LOGOS.map((b, i) => ({
          id: b.id,
          slug: b.id,
          name_en: b.name,
          name_ar: b.nameAr,
          logo_url: b.logo,
          starting_price_override: b.startingPrice || null,
          sort_order: i + 1,
          is_active: true,
        }))
      );
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      setBrands(data || []);
    } catch (err) {
      console.error(err);
      toast({ message: t.common.error, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [t.common.error, toast]);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  const openNew = () => {
    setEditingBrand(null);
    setForm({
      slug: '',
      name_en: '',
      name_ar: '',
      logo_url: '',
      starting_price_override: '',
      sort_order: brands.length + 1,
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEdit = (brand) => {
    setEditingBrand(brand);
    setForm({
      slug: brand.slug || '',
      name_en: brand.name_en || '',
      name_ar: brand.name_ar || '',
      logo_url: brand.logo_url || '',
      starting_price_override: brand.starting_price_override ?? '',
      sort_order: brand.sort_order || 0,
      is_active: brand.is_active !== false,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name_en) return;
    setSaving(true);

    try {
      if (!isSupabaseConfigured) {
        toast({ message: t.common.save, type: 'success' });
        setModalOpen(false);
        return;
      }

      const payload = {
        slug: form.slug || form.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name_en: form.name_en,
        name_ar: form.name_ar || form.name_en,
        logo_url: form.logo_url || null,
        starting_price_override:
          form.starting_price_override !== ''
            ? Number(form.starting_price_override)
            : null,
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
      };

      if (editingBrand) {
        const { error } = await supabase
          .from('brands')
          .update(payload)
          .eq('id', editingBrand.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('brands').insert(payload);
        if (error) throw error;
      }

      toast({ message: t.brands.save, type: 'success' });
      setModalOpen(false);
      loadBrands();
    } catch (err) {
      toast({ message: err.message || t.common.error, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('brands').delete().eq('id', deleteTarget.id);
        if (error) throw error;
      }
      toast({ message: language === 'ar' ? 'تم الحذف' : 'Brand deleted', type: 'success' });
      setDeleteTarget(null);
      loadBrands();
    } catch (err) {
      toast({ message: err.message || t.common.error, type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {t.brands.title} ({brands.length})
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {language === 'ar' ? 'إدارة البراندات واللوجوهات وأسعار البداية' : 'Manage brand logos and starting prices'}
          </p>
        </div>

        <Button variant="primary" size="md" onClick={openNew}>
          <FiPlus size={16} />
          {t.brands.new}
        </Button>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {brands.map((b) => (
          <Card key={b.id || b.slug} className="flex flex-col justify-between">
            <div>
              <div className="flex h-24 w-full items-center justify-center rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800">
                {b.logo_url ? (
                  <img
                    src={b.logo_url}
                    alt={b.name_en}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-neutral-400 font-bold">{b.name_en}</span>
                )}
              </div>

              <div className="mt-3">
                <h3 className="font-bold text-neutral-900 dark:text-white">{b.name_en}</h3>
                {b.name_ar && (
                  <p className="text-xs text-neutral-500" dir="rtl">
                    {b.name_ar}
                  </p>
                )}
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
                <span>
                  {language === 'ar' ? 'يبدأ من:' : 'From:'}{' '}
                  <strong className="text-neutral-800 dark:text-neutral-200">
                    {b.starting_price_override
                      ? `${b.starting_price_override} ${t.common.egp}`
                      : language === 'ar'
                      ? 'تلقائي'
                      : 'Auto'}
                  </strong>
                </span>
                <span>#{b.sort_order}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
              <span
                className={`text-[10px] font-bold uppercase ${
                  b.is_active ? 'text-emerald-600' : 'text-neutral-400'
                }`}
              >
                {b.is_active ? t.products.active : 'Inactive'}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(b)}
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-brand dark:hover:bg-neutral-800"
                >
                  <FiEdit2 size={15} />
                </button>
                <button
                  onClick={() => setDeleteTarget(b)}
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-red-500 dark:hover:bg-neutral-800"
                >
                  <FiTrash2 size={15} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit / New Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBrand ? t.products.edit : t.brands.new}
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button variant="primary" loading={saving} onClick={handleSave}>
              {t.brands.save}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label={t.brands.nameEn}
            required
            value={form.name_en}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                name_en: e.target.value,
                slug: editingBrand
                  ? p.slug
                  : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              }))
            }
          />

          <Input
            label={t.brands.nameAr}
            value={form.name_ar}
            onChange={(e) => setForm((p) => ({ ...p, name_ar: e.target.value }))}
            dir="rtl"
          />

          <Input
            label={t.brands.slug}
            required
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
          />

          <ImageUploader
            label={t.brands.logo}
            value={form.logo_url}
            onChange={async (file, preview) => {
              if (file && isSupabaseConfigured) {
                const ext = file.name.split('.').pop();
                const path = `brand-${Date.now()}.${ext}`;
                const { error } = await supabase.storage
                  .from('brand-logos')
                  .upload(path, file);
                if (!error) {
                  const { data } = supabase.storage.from('brand-logos').getPublicUrl(path);
                  setForm((p) => ({ ...p, logo_url: data.publicUrl }));
                } else {
                  setForm((p) => ({ ...p, logo_url: preview }));
                }
              } else {
                setForm((p) => ({ ...p, logo_url: preview }));
              }
            }}
          />
          <Input
            placeholder="Or enter logo image URL"
            value={form.logo_url}
            onChange={(e) => setForm((p) => ({ ...p, logo_url: e.target.value }))}
            className="text-xs"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t.brands.startPrice}
              type="number"
              value={form.starting_price_override}
              onChange={(e) =>
                setForm((p) => ({ ...p, starting_price_override: e.target.value }))
              }
              placeholder="Auto if empty"
            />
            <Input
              label={t.brands.sortOrder}
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm((p) => ({ ...p, sort_order: e.target.value }))}
            />
          </div>

          <Switch
            label={t.products.active}
            checked={form.is_active}
            onChange={(val) => setForm((p) => ({ ...p, is_active: val }))}
          />
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t.products.delete}
        message={language === 'ar' ? 'هل أنت متأكد من حذف هذا البراند؟' : 'Delete this brand permanently?'}
        confirmLabel={t.common.delete}
        dangerous
      />
    </div>
  );
}

