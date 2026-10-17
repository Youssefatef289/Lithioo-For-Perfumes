import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useAdminLang } from '../contexts/AdminLangContext';
import { useToast } from '../components/ui/Toast';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { HERO_SLIDES, HERO_MOBILE_BG } from '../../data/heroSlider';
import {
  Button,
  Input,
  Textarea,
  Select,
  Switch,
  Modal,
  ConfirmDialog,
  Card,
  ImageUploader,
} from '../components/ui';

export default function HeroPage() {
  const { t, language } = useAdminLang();
  const toast = useToast();

  const [slides, setSlides] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    image_url: '',
    mobile_image_url: '',
    text_en: '',
    text_ar: '',
    image_position: 'center center',
    sort_order: 1,
    is_active: true,
  });

  const loadSlides = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setSlides(
        HERO_SLIDES.map((s, i) => ({
          id: String(s.id),
          image_url: s.image,
          mobile_image_url: HERO_MOBILE_BG,
          text_en: s.line1,
          text_ar: s.line1,
          image_position: s.imagePosition,
          sort_order: i + 1,
          is_active: true,
        }))
      );
      return;
    }

    try {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      setSlides(data || []);
    } catch (err) {
      console.error(err);
      toast({ message: t.common.error, type: 'error' });
    }
  }, [t.common.error, toast]);

  useEffect(() => {
    loadSlides();
  }, [loadSlides]);

  const openNew = () => {
    setEditingSlide(null);
    setForm({
      image_url: '',
      mobile_image_url: '',
      text_en: '',
      text_ar: '',
      image_position: 'center center',
      sort_order: slides.length + 1,
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEdit = (slide) => {
    setEditingSlide(slide);
    setForm({
      image_url: slide.image_url || '',
      mobile_image_url: slide.mobile_image_url || '',
      text_en: slide.text_en || '',
      text_ar: slide.text_ar || '',
      image_position: slide.image_position || 'center center',
      sort_order: slide.sort_order || 1,
      is_active: slide.is_active !== false,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.image_url) {
      toast({ message: 'Desktop image is required', type: 'warning' });
      return;
    }
    setSaving(true);

    try {
      if (!isSupabaseConfigured) {
        toast({ message: t.common.save, type: 'success' });
        setModalOpen(false);
        return;
      }

      const payload = {
        image_url: form.image_url,
        mobile_image_url: form.mobile_image_url || null,
        text_en: form.text_en || null,
        text_ar: form.text_ar || null,
        image_position: form.image_position,
        sort_order: Number(form.sort_order) || 1,
        is_active: form.is_active,
      };

      if (editingSlide) {
        const { error } = await supabase
          .from('hero_slides')
          .update(payload)
          .eq('id', editingSlide.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('hero_slides').insert(payload);
        if (error) throw error;
      }

      toast({ message: t.hero.save, type: 'success' });
      setModalOpen(false);
      loadSlides();
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
        const { error } = await supabase
          .from('hero_slides')
          .delete()
          .eq('id', deleteTarget.id);
        if (error) throw error;
      }
      toast({ message: language === 'ar' ? 'تم الحذف' : 'Slide deleted', type: 'success' });
      setDeleteTarget(null);
      loadSlides();
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
            {t.hero.title} ({slides.length})
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {language === 'ar' ? 'إدارة صور ونصوص البانر الرئيسي في الصفحة الرئيسية' : 'Manage homepage hero carousel slides'}
          </p>
        </div>

        <Button variant="primary" size="md" onClick={openNew}>
          <FiPlus size={16} />
          {t.hero.new}
        </Button>
      </div>

      {/* Slides List */}
      <div className="space-y-4">
        {slides.map((s) => (
          <Card key={s.id} className="flex flex-col sm:flex-row items-center gap-4">
            <div className="h-24 w-44 flex-shrink-0 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800">
              <img
                src={s.image_url}
                alt="Slide"
                className="h-full w-full object-cover"
                style={{ objectPosition: s.image_position }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  #{s.sort_order}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase ${
                    s.is_active ? 'text-emerald-600' : 'text-neutral-400'
                  }`}
                >
                  {s.is_active ? t.products.active : 'Inactive'}
                </span>
              </div>
              <p className="mt-1 font-semibold text-sm text-neutral-900 dark:text-white line-clamp-1">
                {s.text_en || '(No English text)'}
              </p>
              {s.text_ar && (
                <p className="text-xs text-neutral-500 line-clamp-1" dir="rtl">
                  {s.text_ar}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openEdit(s)}
                className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-brand dark:hover:bg-neutral-800"
              >
                <FiEdit2 size={16} />
              </button>
              <button
                onClick={() => setDeleteTarget(s)}
                className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-red-500 dark:hover:bg-neutral-800"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSlide ? t.products.edit : t.hero.new}
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button variant="primary" loading={saving} onClick={handleSave}>
              {t.hero.save}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <ImageUploader
            label={t.hero.imageUrl}
            value={form.image_url}
            onChange={async (file, preview) => {
              if (file && isSupabaseConfigured) {
                const ext = file.name.split('.').pop();
                const path = `hero-${Date.now()}.${ext}`;
                const { error } = await supabase.storage.from('hero').upload(path, file);
                if (!error) {
                  const { data } = supabase.storage.from('hero').getPublicUrl(path);
                  setForm((p) => ({ ...p, image_url: data.publicUrl }));
                } else {
                  setForm((p) => ({ ...p, image_url: preview }));
                }
              } else {
                setForm((p) => ({ ...p, image_url: preview }));
              }
            }}
          />
          <Input
            placeholder="Or enter desktop image URL"
            value={form.image_url}
            onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))}
            className="text-xs"
          />

          <Input
            label={t.hero.mobileUrl}
            placeholder="/image/hero/hero-mobile.png"
            value={form.mobile_image_url}
            onChange={(e) => setForm((p) => ({ ...p, mobile_image_url: e.target.value }))}
          />

          <Textarea
            label={t.hero.textEn}
            rows={2}
            value={form.text_en}
            onChange={(e) => setForm((p) => ({ ...p, text_en: e.target.value }))}
          />

          <Textarea
            label={t.hero.textAr}
            rows={2}
            value={form.text_ar}
            onChange={(e) => setForm((p) => ({ ...p, text_ar: e.target.value }))}
            dir="rtl"
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label={t.hero.position}
              value={form.image_position}
              onChange={(e) => setForm((p) => ({ ...p, image_position: e.target.value }))}
            >
              <option value="center center">Center Center</option>
              <option value="center top">Center Top</option>
              <option value="center bottom">Center Bottom</option>
            </Select>

            <Input
              label={t.hero.sortOrder}
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
        message={language === 'ar' ? 'حذف هذه الشريحة نهائياً؟' : 'Delete this hero slide?'}
        confirmLabel={t.common.delete}
        dangerous
      />
    </div>
  );
}

