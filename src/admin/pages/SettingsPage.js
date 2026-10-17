import React, { useState, useEffect } from 'react';
import { FiSave } from 'react-icons/fi';
import { useAdminLang } from '../contexts/AdminLangContext';
import { useToast } from '../components/ui/Toast';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { fetchSettings, clearSettingsCache } from '../../services/settings';
import { Button, Input, Card, Skeleton } from '../components/ui';

export default function SettingsPage() {
  const { t, language } = useAdminLang();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    store_name: 'Lithioo Perfumes',
    whatsapp_number: '201064307053',
    phone_display: '+20 10 6430 7053',
    email: 'laithymohamed9@gmail.com',
    address_en: '',
    address_ar: '',
    map_url: '',
    facebook_url: '',
    instagram_url: '',
    shipping_fee: '0',
    free_shipping_threshold: '0',
  });

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const data = await fetchSettings();
        if (data) {
          setSettings((prev) => ({
            ...prev,
            ...data,
            shipping_fee: String(data.shipping_fee ?? 0),
            free_shipping_threshold: String(data.free_shipping_threshold ?? 0),
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleChange = (key, val) => {
    setSettings((p) => ({ ...p, [key]: val }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isSupabaseConfigured) {
        const rows = Object.entries(settings).map(([key, value]) => ({
          key,
          value:
            key === 'shipping_fee' || key === 'free_shipping_threshold'
              ? Number(value)
              : value,
        }));

        for (const row of rows) {
          await supabase.from('site_settings').upsert(row, { onConflict: 'key' });
        }
        clearSettingsCache();
      }

      toast({ message: t.settings.save, type: 'success' });
    } catch (err) {
      toast({ message: err.message || t.common.error, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {t.settings.title}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {language === 'ar' ? 'معلومات التواصل، روابط التواصل، ورسوم الشحن' : 'Store contact info, social links and shipping rates'}
          </p>
        </div>

        <Button type="submit" loading={saving} variant="primary">
          <FiSave size={16} />
          {t.settings.save}
        </Button>
      </div>

      {/* Store Identity & Contact */}
      <Card className="space-y-4">
        <h2 className="text-base font-bold text-neutral-900 dark:text-white">
          {language === 'ar' ? 'بيانات المتجر والتواصل' : 'Store Identity & Contact'}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={t.settings.storeName}
            value={settings.store_name}
            onChange={(e) => handleChange('store_name', e.target.value)}
          />
          <Input
            label={t.settings.email}
            type="email"
            value={settings.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
          <Input
            label={t.settings.whatsapp}
            value={settings.whatsapp_number}
            onChange={(e) => handleChange('whatsapp_number', e.target.value)}
            hint="Without '+' or spaces (e.g. 201064307053)"
          />
          <Input
            label={t.settings.phone}
            value={settings.phone_display}
            onChange={(e) => handleChange('phone_display', e.target.value)}
            hint="Formatted display (e.g. +20 10 6430 7053)"
          />
        </div>
      </Card>

      {/* Address & Location */}
      <Card className="space-y-4">
        <h2 className="text-base font-bold text-neutral-900 dark:text-white">
          {language === 'ar' ? 'العنوان والموقع الجغرافي' : 'Address & Location'}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={t.settings.addressEn}
            value={settings.address_en}
            onChange={(e) => handleChange('address_en', e.target.value)}
          />
          <Input
            label={t.settings.addressAr}
            value={settings.address_ar}
            onChange={(e) => handleChange('address_ar', e.target.value)}
            dir="rtl"
          />
          <div className="sm:col-span-2">
            <Input
              label={t.settings.mapUrl}
              value={settings.map_url}
              onChange={(e) => handleChange('map_url', e.target.value)}
              placeholder="https://maps.google.com/..."
            />
          </div>
        </div>
      </Card>

      {/* Social Media Links */}
      <Card className="space-y-4">
        <h2 className="text-base font-bold text-neutral-900 dark:text-white">
          {language === 'ar' ? 'حسابات التواصل الاجتماعي' : 'Social Media Links'}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={t.settings.facebook}
            value={settings.facebook_url}
            onChange={(e) => handleChange('facebook_url', e.target.value)}
          />
          <Input
            label={t.settings.instagram}
            value={settings.instagram_url}
            onChange={(e) => handleChange('instagram_url', e.target.value)}
          />
        </div>
      </Card>

      {/* Shipping Rates */}
      <Card className="space-y-4">
        <h2 className="text-base font-bold text-neutral-900 dark:text-white">
          {language === 'ar' ? 'سياسة الشحن والتوصيل' : 'Shipping Policy'}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={t.settings.shipping}
            type="number"
            value={settings.shipping_fee}
            onChange={(e) => handleChange('shipping_fee', e.target.value)}
            hint="Set 0 for free shipping by default"
          />
          <Input
            label={t.settings.freeShipping}
            type="number"
            value={settings.free_shipping_threshold}
            onChange={(e) => handleChange('free_shipping_threshold', e.target.value)}
            hint="Order total in EGP to trigger free delivery"
          />
        </div>
      </Card>
    </form>
  );
}

