import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiTrash2, FiStar } from 'react-icons/fi';
import { useAdminLang } from '../contexts/AdminLangContext';
import { useToast } from '../components/ui/Toast';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { CUSTOMER_REVIEW_IMAGES } from '../../data/customerReviews';
import {
  Button,
  Input,
  Select,
  Switch,
  Modal,
  ConfirmDialog,
  Card,
  ImageUploader,
} from '../components/ui';

export default function ReviewsPage() {
  const { t, language } = useAdminLang();
  const toast = useToast();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    image_url: '',
    customer_name: '',
    rating: 5,
    sort_order: 1,
    is_active: true,
  });

  const loadReviews = useCallback(async () => {
    setLoading(true);
    if (!isSupabaseConfigured) {
      setReviews(
        CUSTOMER_REVIEW_IMAGES.map((img, i) => ({
          id: String(i + 1),
          image_url: img,
          customer_name: null,
          rating: 5,
          sort_order: i + 1,
          is_active: true,
        }))
      );
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('customer_reviews')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error(err);
      toast({ message: t.common.error, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [t.common.error, toast]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.image_url) {
      toast({ message: 'Review image is required', type: 'warning' });
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
        customer_name: form.customer_name || null,
        rating: Number(form.rating) || 5,
        sort_order: Number(form.sort_order) || 1,
        is_active: form.is_active,
      };

      const { error } = await supabase.from('customer_reviews').insert(payload);
      if (error) throw error;

      toast({ message: t.reviews.save, type: 'success' });
      setModalOpen(false);
      loadReviews();
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
          .from('customer_reviews')
          .delete()
          .eq('id', deleteTarget.id);
        if (error) throw error;
      }
      toast({ message: language === 'ar' ? 'تم الحذف' : 'Review deleted', type: 'success' });
      setDeleteTarget(null);
      loadReviews();
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
            {t.reviews.title} ({reviews.length})
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {language === 'ar'
              ? 'إدارة لقطات شاشة تقييمات العملاء ومحادثات الواتساب'
              : 'Manage customer review screenshots and feedback'}
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setForm({
              image_url: '',
              customer_name: '',
              rating: 5,
              sort_order: reviews.length + 1,
              is_active: true,
            });
            setModalOpen(true);
          }}
        >
          <FiPlus size={16} />
          {t.reviews.new}
        </Button>
      </div>

      {/* Grid of Reviews */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {reviews.map((r) => (
          <Card key={r.id} className="p-3 flex flex-col justify-between">
            <div className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
              <img
                src={r.image_url}
                alt="Customer Review"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
              <span className="font-bold">#{r.sort_order}</span>
              <button
                onClick={() => setDeleteTarget(r)}
                className="rounded p-1 text-neutral-400 hover:text-red-500"
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Upload Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t.reviews.new}
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button variant="primary" loading={saving} onClick={handleSave}>
              {t.reviews.save}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <ImageUploader
            label={t.reviews.image}
            value={form.image_url}
            onChange={async (file, preview) => {
              if (file && isSupabaseConfigured) {
                const ext = file.name.split('.').pop();
                const path = `review-${Date.now()}.${ext}`;
                const { error } = await supabase.storage.from('reviews').upload(path, file);
                if (!error) {
                  const { data } = supabase.storage.from('reviews').getPublicUrl(path);
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
            placeholder="Or enter image URL"
            value={form.image_url}
            onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))}
            className="text-xs"
          />

          <Input
            label={t.reviews.name}
            value={form.customer_name}
            onChange={(e) => setForm((p) => ({ ...p, customer_name: e.target.value }))}
            placeholder="Optional"
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label={t.reviews.rating}
              value={form.rating}
              onChange={(e) => setForm((p) => ({ ...p, rating: e.target.value }))}
            >
              <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
              <option value="4">⭐⭐⭐⭐ (4/5)</option>
              <option value="3">⭐⭐⭐ (3/5)</option>
            </Select>

            <Input
              label={t.reviews.sort}
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

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t.products.delete}
        message={language === 'ar' ? 'حذف هذه المراجعة؟' : 'Delete this review?'}
        confirmLabel={t.common.delete}
        dangerous
      />
    </div>
  );
}

