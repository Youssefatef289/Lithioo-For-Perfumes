import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiSave, FiCheck } from 'react-icons/fi';
import { useAdminLang } from '../../contexts/AdminLangContext';
import { useToast } from '../../components/ui/Toast';
import { supabase, isSupabaseConfigured } from '../../../lib/supabaseClient';
import { fetchSections } from '../../../services/sections';
import {
  Button,
  Input,
  Textarea,
  Select,
  Switch,
  Tabs,
  ImageUploader,
  Card,
  Skeleton,
} from '../../components/ui';

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, isRTL, language } = useAdminLang();
  const toast = useToast();

  const isEditing = Boolean(id && id !== 'new');
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  // Lookups
  const [brands, setBrands] = useState([]);
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);

  // Multi-section selection
  const [selectedSectionIds, setSelectedSectionIds] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    slug: '',
    name_en: '',
    name_ar: '',
    brand_id: '',
    section_id: '',
    category_id: '',
    base_price: '',
    sale_price: '',
    discount_percent: 0,
    discount_label: '',
    offer_link: '',
    hide_sizes: true,
    description_en: '',
    description_ar: '',
    ingredients_en: '',
    ingredients_ar: '',
    benefits_en: '',
    benefits_ar: '',
    image_url: '',
    image_hover_url: '',
    detail_images: '',
    stock_status: 'in_stock', // 'in_stock' | 'low_stock' | 'out_of_stock'
    in_stock: true,
    is_featured: false,
    is_new: false,
    is_active: true,
    sort_order: 0,
  });

  // Size Variants State
  const [sizeRows, setSizeRows] = useState([
    { size_id: '30ml', label_en: '30 ml', label_ar: '30 مل', price: '300', in_stock: true },
    { size_id: '50ml', label_en: '50 ml', label_ar: '50 مل', price: '450', in_stock: true },
    { size_id: '100ml', label_en: '100 ml', label_ar: '100 مل', price: '650', in_stock: true },
  ]);

  // Load Lookups & Product Data
  useEffect(() => {
    async function init() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      try {
        const [brandRes, sectionRes, catRes] = await Promise.all([
          supabase.from('brands').select('id, slug, name_en').order('name_en'),
          fetchSections(),
          supabase.from('categories').select('id, slug, name_en'),
        ]);

        if (brandRes.data) setBrands(brandRes.data);
        if (sectionRes) setSections(sectionRes);
        if (catRes.data) setCategories(catRes.data);

        if (isEditing) {
          // Fetch existing product
          const { data: prod } = await supabase
            .from('products')
            .select('*, product_sizes(*)')
            .or(`id.eq.${id},slug.eq.${id}`)
            .single();

          if (prod) {
            setFormData({
              slug: prod.slug || '',
              name_en: prod.name_en || '',
              name_ar: prod.name_ar || '',
              brand_id: prod.brand_id || '',
              section_id: prod.section_id || '',
              category_id: prod.category_id || '',
              base_price: prod.base_price ?? '',
              sale_price: prod.sale_price ?? '',
              discount_percent: prod.discount_percent ?? 0,
              discount_label: prod.discount_label || '',
              offer_link: prod.offer_link || '',
              hide_sizes: prod.hide_sizes !== false,
              description_en: prod.description_en || '',
              description_ar: prod.description_ar || '',
              ingredients_en: (prod.ingredients_en || []).join(', '),
              ingredients_ar: (prod.ingredients_ar || []).join(', '),
              benefits_en: (prod.benefits_en || []).join(', '),
              benefits_ar: (prod.benefits_ar || []).join(', '),
              image_url: prod.image_url || '',
              image_hover_url: prod.image_hover_url || '',
              detail_images: (prod.detail_images || []).join('\n'),
              stock_status: prod.stock_status || (prod.in_stock ? 'in_stock' : 'out_of_stock'),
              in_stock: prod.in_stock !== false,
              is_featured: Boolean(prod.is_featured),
              is_new: Boolean(prod.is_new),
              is_active: prod.is_active !== false,
              sort_order: prod.sort_order || 0,
            });

            // Fetch joined sections from section_products
            const { data: sps } = await supabase
              .from('section_products')
              .select('section_id')
              .eq('product_id', prod.id);

            const initialSecs = (sps || []).map((sp) => sp.section_id);
            if (prod.section_id && !initialSecs.includes(prod.section_id)) {
              initialSecs.push(prod.section_id);
            }
            setSelectedSectionIds(initialSecs);

            if (prod.product_sizes && prod.product_sizes.length > 0) {
              setSizeRows(
                prod.product_sizes.map((ps) => ({
                  size_id: ps.size_id,
                  label_en: ps.label_en,
                  label_ar: ps.label_ar || '',
                  price: String(ps.price),
                  in_stock: ps.in_stock !== false,
                }))
              );
            }
          }
        }
      } catch (err) {
        console.error('ProductFormPage init error:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id, isEditing]);

  const handleChange = (field, val) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: val };
      if (field === 'name_en' && !isEditing && !prev.slugModified) {
        next.slug = val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      }
      return next;
    });
  };

  const toggleSection = (sectionId) => {
    setSelectedSectionIds((prev) => {
      if (prev.includes(sectionId)) {
        return prev.filter((s) => s !== sectionId);
      }
      return [...prev, sectionId];
    });
  };

  // Upload image to Supabase Storage bucket 'products'
  const uploadToStorage = async (file) => {
    if (!file || !isSupabaseConfigured) return null;
    const ext = file.name.split('.').pop();
    const cleanFileName = `product-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

    // Try 'products' bucket first, fallback to 'product-images'
    let uploadRes = await supabase.storage.from('products').upload(cleanFileName, file);
    let bucketName = 'products';

    if (uploadRes.error) {
      uploadRes = await supabase.storage.from('product-images').upload(cleanFileName, file);
      bucketName = 'product-images';
    }

    if (uploadRes.error) {
      throw uploadRes.error;
    }

    const { data } = supabase.storage.from(bucketName).getPublicUrl(cleanFileName);
    return data?.publicUrl;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name_en) {
      toast({ message: language === 'ar' ? 'اسم المنتج بالإنجليزي مطلوب' : 'Name (EN) is required', type: 'warning' });
      return;
    }
    setSaving(true);

    try {
      if (!isSupabaseConfigured) {
        toast({
          message: language === 'ar' ? 'تم الحفظ محلياً' : 'Saved (offline mode)',
          type: 'success',
        });
        navigate('/admin/products');
        return;
      }

      const primarySectionId = selectedSectionIds[0] || formData.section_id || null;
      const inStockValue = formData.stock_status !== 'out_of_stock';

      const payload = {
        slug: formData.slug || formData.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name_en: formData.name_en,
        name_ar: formData.name_ar || null,
        brand_id: formData.brand_id || null,
        section_id: primarySectionId,
        category_id: formData.category_id || null,
        base_price: formData.base_price !== '' ? Number(formData.base_price) : null,
        sale_price: formData.sale_price !== '' ? Number(formData.sale_price) : null,
        discount_percent: Math.max(0, Math.min(100, Number(formData.discount_percent) || 0)),
        discount_label: formData.discount_label?.trim() || null,
        offer_link: formData.offer_link?.trim() || null,
        hide_sizes: formData.hide_sizes,
        description_en: formData.description_en || null,
        description_ar: formData.description_ar || null,
        ingredients_en: formData.ingredients_en
          ? formData.ingredients_en.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        ingredients_ar: formData.ingredients_ar
          ? formData.ingredients_ar.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        benefits_en: formData.benefits_en
          ? formData.benefits_en.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        benefits_ar: formData.benefits_ar
          ? formData.benefits_ar.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        image_url: formData.image_url || null,
        image_hover_url: formData.image_hover_url || null,
        detail_images: formData.detail_images
          ? formData.detail_images.split('\n').map((s) => s.trim()).filter(Boolean)
          : [],
        stock_status: formData.stock_status,
        in_stock: inStockValue,
        is_featured: formData.is_featured,
        is_new: formData.is_new,
        is_active: formData.is_active,
        sort_order: Number(formData.sort_order) || 0,
        updated_at: new Date().toISOString(),
      };

      let productId = id;
      if (isEditing) {
        const { error } = await supabase.from('products').update(payload).or(`id.eq.${id},slug.eq.${id}`);
        if (error) throw error;
      } else {
        const { data: inserted, error } = await supabase
          .from('products')
          .insert(payload)
          .select('id')
          .single();
        if (error) throw error;
        productId = inserted.id;
      }

      // Sync section_products join table
      if (productId) {
        await supabase.from('section_products').delete().eq('product_id', productId);
        if (selectedSectionIds.length > 0) {
          const spRows = selectedSectionIds.map((secId, i) => ({
            section_id: secId,
            product_id: productId,
            position: i,
          }));
          await supabase.from('section_products').insert(spRows);
        }
      }

      // Upsert sizes if hide_sizes is false
      if (!formData.hide_sizes && productId) {
        await supabase.from('product_sizes').delete().eq('product_id', productId);
        const sizesToInsert = sizeRows.map((sr) => ({
          product_id: productId,
          size_id: sr.size_id,
          label_en: sr.label_en,
          label_ar: sr.label_ar || null,
          price: Number(sr.price) || 0,
          in_stock: sr.in_stock,
        }));
        await supabase.from('product_sizes').insert(sizesToInsert);
      }

      toast({ message: t.products.save + ' ' + (language === 'ar' ? 'بنجاح' : 'successfully'), type: 'success' });
      navigate('/admin/products');
    } catch (err) {
      console.error('Failed to save product:', err);
      toast({ message: err.message || t.common.error, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: 'general', label: t.products.tabGeneral || (language === 'ar' ? 'عام' : 'General') },
    { key: 'pricing', label: t.products.tabPricing || (language === 'ar' ? 'الأسعار والعروض' : 'Pricing & Offers') },
    { key: 'content', label: t.products.tabContent || (language === 'ar' ? 'المحتوى والوصف' : 'Content & Description') },
    { key: 'media', label: t.products.tabMedia || (language === 'ar' ? 'الصور والميديا' : 'Media') },
    { key: 'visibility', label: t.products.tabVisibility || (language === 'ar' ? 'المخزون والحالة' : 'Inventory & Status') },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="rounded-xl border border-neutral-200 p-2 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-400"
          >
            {isRTL ? <FiArrowRight size={18} /> : <FiArrowLeft size={18} />}
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {isEditing ? formData.name_en || t.products.edit : t.products.new}
            </h1>
            <p className="text-xs text-neutral-500 font-mono">{formData.slug || 'new-product'}</p>
          </div>
        </div>

        <Button type="submit" loading={saving} variant="primary">
          <FiSave size={16} />
          {t.products.save}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />

      {/* Tab Panels */}
      <Card>
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label={t.products.nameEn}
                required
                value={formData.name_en}
                onChange={(e) => handleChange('name_en', e.target.value)}
              />
              <Input
                label={t.products.nameAr}
                value={formData.name_ar}
                onChange={(e) => handleChange('name_ar', e.target.value)}
                dir="rtl"
              />
              <Input
                label={t.products.slug}
                required
                value={formData.slug}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, slug: e.target.value, slugModified: true }));
                }}
                hint="Unique identifier used in URLs"
              />
              <Select
                label={t.products.brand}
                value={formData.brand_id}
                onChange={(e) => handleChange('brand_id', e.target.value)}
              >
                <option value="">{language === 'ar' ? 'اختر البراند' : 'Select Brand'}</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name_en}
                  </option>
                ))}
              </Select>

              <Select
                label={language === 'ar' ? 'التصنيف' : 'Category'}
                value={formData.category_id}
                onChange={(e) => handleChange('category_id', e.target.value)}
              >
                <option value="">{language === 'ar' ? 'اختر التصنيف' : 'Select Category'}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_en}
                  </option>
                ))}
              </Select>
            </div>

            {/* Multi-Section Selector */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4 dark:border-neutral-800 dark:bg-neutral-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-neutral-900 dark:text-white">
                  {t.products.sections || (language === 'ar' ? 'أقسام العرض بالمتجر' : 'Store Sections')}
                </label>
                <span className="text-xs text-neutral-500">
                  {selectedSectionIds.length} {language === 'ar' ? 'أقسام مختارة' : 'selected'}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {t.products.sectionsHint ||
                  (language === 'ar'
                    ? 'يمكن للمنتج أن يظهر في قسم واحد أو أكثر (نسائي، رجالي، أصلي، إلخ)'
                    : 'A product can belong to one or more sections (Women, Men, Original, etc.)')}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {sections.map((s) => {
                  const isSelected = selectedSectionIds.includes(s.id);
                  const label = language === 'ar' && s.name_ar ? s.name_ar : s.name_en;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSection(s.id)}
                      className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition border ${
                        isSelected
                          ? 'border-brand bg-brand text-white shadow-sm'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:border-brand/60 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                      }`}
                    >
                      {isSelected ? <FiCheck size={14} /> : <span className="h-3.5 w-3.5 rounded-full border border-neutral-400" />}
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-neutral-100 p-4 dark:border-neutral-800">
              <Switch
                label={t.products.hideSizes}
                checked={formData.hide_sizes}
                onChange={(val) => handleChange('hide_sizes', val)}
              />
              <p className="mt-1 text-xs text-neutral-400">
                {language === 'ar'
                  ? 'عند التفعيل، يباع المنتج بسعر أساسي موحد بدون الحاجة لاختيار حجم.'
                  : 'When active, the product is sold at a single fixed price without size choices.'}
              </p>
            </div>

            {formData.hide_sizes ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-xl">
                <Input
                  label={t.products.price || (language === 'ar' ? 'السعر الأساسي (ج.م)' : 'Base Price (EGP)')}
                  type="number"
                  value={formData.base_price}
                  onChange={(e) => handleChange('base_price', e.target.value)}
                  placeholder="2300"
                  required
                />
                <Input
                  label={t.products.salePrice || (language === 'ar' ? 'سعر الخصم / العرض (اختياري)' : 'Sale Price (Optional)')}
                  type="number"
                  value={formData.sale_price}
                  onChange={(e) => handleChange('sale_price', e.target.value)}
                  placeholder="1950"
                  hint={language === 'ar' ? 'إذا وُجد سعر خصم، سيظهر للمشتري بدلاً من الأساسي' : 'If set, storefront shows this discounted price'}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                  {language === 'ar' ? 'أسعار الأحجام' : 'Size Variant Prices'}
                </h3>
                <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-100 dark:divide-neutral-800 dark:border-neutral-800">
                  {sizeRows.map((row, idx) => (
                    <div key={row.size_id} className="flex items-center gap-4 p-3">
                      <span className="w-20 font-bold text-sm text-neutral-800 dark:text-neutral-200">
                        {row.label_en}
                      </span>
                      <Input
                        type="number"
                        value={row.price}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSizeRows((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, price: val } : r))
                          );
                        }}
                        placeholder="Price"
                        className="w-32"
                      />
                      <Switch
                        label={t.products.stock}
                        checked={row.in_stock}
                        onChange={(val) => {
                          setSizeRows((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, in_stock: val } : r))
                          );
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Offers & Discount Banner Information */}
            <div className="grid max-w-xl grid-cols-1 gap-4 rounded-xl border border-dashed border-brand/40 bg-brand/5 p-4 sm:grid-cols-2">
              <Input
                label={t.products.discountPercent || (language === 'ar' ? 'نسبة الخصم (%)' : 'Discount (%)')}
                type="number"
                min="0"
                max="100"
                value={formData.discount_percent}
                onChange={(e) => handleChange('discount_percent', e.target.value)}
                hint={language === 'ar' ? 'نسبة إضافية تظهر كبادج' : 'Badge percentage'}
              />
              <Input
                label={language === 'ar' ? 'عنوان العرض' : 'Offer label'}
                value={formData.discount_label}
                onChange={(e) => handleChange('discount_label', e.target.value)}
                placeholder={language === 'ar' ? 'عرض خاص' : 'Special Offer'}
              />
              <div className="sm:col-span-2">
                <Input
                  label={t.products.offerLink || (language === 'ar' ? 'رابط العرض (اختياري)' : 'Offer Link (Optional)')}
                  value={formData.offer_link}
                  onChange={(e) => handleChange('offer_link', e.target.value)}
                  placeholder="https://..."
                  hint={language === 'ar' ? 'رابط مخصص للحملة الإعلانية أو العرض' : 'Custom landing or campaign link'}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Textarea
                label={t.products.descEn}
                rows={4}
                value={formData.description_en}
                onChange={(e) => handleChange('description_en', e.target.value)}
              />
              <Textarea
                label={t.products.descAr}
                rows={4}
                value={formData.description_ar}
                onChange={(e) => handleChange('description_ar', e.target.value)}
                dir="rtl"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label={t.products.ingEn || (language === 'ar' ? 'المكونات (EN)' : 'Ingredients (EN)')}
                value={formData.ingredients_en}
                onChange={(e) => handleChange('ingredients_en', e.target.value)}
                hint="Vanilla, Rose, Musk"
              />
              <Input
                label={t.products.ingAr || (language === 'ar' ? 'المكونات (AR)' : 'Ingredients (AR)')}
                value={formData.ingredients_ar}
                onChange={(e) => handleChange('ingredients_ar', e.target.value)}
                dir="rtl"
                hint="فانيليا، ورد، مسك"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label={t.products.benEn || (language === 'ar' ? 'المميزات (EN)' : 'Benefits (EN)')}
                value={formData.benefits_en}
                onChange={(e) => handleChange('benefits_en', e.target.value)}
                hint="Long lasting, High sillage"
              />
              <Input
                label={t.products.benAr || (language === 'ar' ? 'المميزات (AR)' : 'Benefits (AR)')}
                value={formData.benefits_ar}
                onChange={(e) => handleChange('benefits_ar', e.target.value)}
                dir="rtl"
              />
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <ImageUploader
                label={t.products.mainImage || (language === 'ar' ? 'الصورة الرئيسية' : 'Main Image')}
                value={formData.image_url}
                onChange={async (file, preview) => {
                  if (file) {
                    try {
                      const publicUrl = await uploadToStorage(file);
                      if (publicUrl) {
                        handleChange('image_url', publicUrl);
                        toast({ message: language === 'ar' ? 'تم رفع الصورة بنجاح إلى Supabase products' : 'Image uploaded to Supabase products', type: 'success' });
                        return;
                      }
                    } catch (uploadErr) {
                      console.error('Storage upload error:', uploadErr);
                      toast({ message: uploadErr.message, type: 'error' });
                    }
                  }
                  handleChange('image_url', preview || '');
                }}
                onDelete={() => handleChange('image_url', '')}
              />
              <Input
                placeholder="Or paste image URL"
                value={formData.image_url}
                onChange={(e) => handleChange('image_url', e.target.value)}
                className="mt-2 text-xs"
              />
            </div>

            <div>
              <ImageUploader
                label={t.products.hoverImage || (language === 'ar' ? 'صورة التحويم (Hover)' : 'Hover Image')}
                value={formData.image_hover_url}
                onChange={async (file, preview) => {
                  if (file) {
                    try {
                      const publicUrl = await uploadToStorage(file);
                      if (publicUrl) {
                        handleChange('image_hover_url', publicUrl);
                        return;
                      }
                    } catch (uploadErr) {
                      console.error('Storage upload error:', uploadErr);
                    }
                  }
                  handleChange('image_hover_url', preview || '');
                }}
                onDelete={() => handleChange('image_hover_url', '')}
              />
              <Input
                placeholder="Or paste hover image URL"
                value={formData.image_hover_url}
                onChange={(e) => handleChange('image_hover_url', e.target.value)}
                className="mt-2 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <Textarea
                label={t.products.gallery || (language === 'ar' ? 'معرض الصور الإضافية' : 'Detail Gallery Images')}
                rows={3}
                value={formData.detail_images}
                onChange={(e) => handleChange('detail_images', e.target.value)}
                hint="One image URL per line"
              />
            </div>
          </div>
        )}

        {activeTab === 'visibility' && (
          <div className="space-y-4 max-w-sm">
            <Select
              label={t.products.stockStatus || (language === 'ar' ? 'حالة المخزون' : 'Stock Status')}
              value={formData.stock_status}
              onChange={(e) => handleChange('stock_status', e.target.value)}
            >
              <option value="in_stock">{t.products.inStock || (language === 'ar' ? 'متوفر' : 'In Stock')}</option>
              <option value="low_stock">{t.products.lowStock || (language === 'ar' ? 'كمية محدودة' : 'Low Stock')}</option>
              <option value="out_of_stock">{t.products.outOfStock || (language === 'ar' ? 'نافد' : 'Out of Stock')}</option>
            </Select>

            <Switch
              label={t.products.active || (language === 'ar' ? 'نشط / ظاهر في المتجر' : 'Active / Visible in Store')}
              checked={formData.is_active}
              onChange={(val) => handleChange('is_active', val)}
            />
            <Switch
              label={t.products.featured || (language === 'ar' ? 'منتج مميز' : 'Featured')}
              checked={formData.is_featured}
              onChange={(val) => handleChange('is_featured', val)}
            />
            <Switch
              label={language === 'ar' ? 'جديد (علامة New)' : 'Mark as New'}
              checked={formData.is_new}
              onChange={(val) => handleChange('is_new', val)}
            />
            <Input
              label={language === 'ar' ? 'ترتيب الظهور' : 'Sort Order'}
              type="number"
              value={formData.sort_order}
              onChange={(e) => handleChange('sort_order', e.target.value)}
            />
          </div>
        )}
      </Card>
    </form>
  );
}
