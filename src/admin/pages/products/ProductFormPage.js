import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiSave } from 'react-icons/fi';
import { useAdminLang } from '../../contexts/AdminLangContext';
import { useToast } from '../../components/ui/Toast';
import { supabase, isSupabaseConfigured } from '../../../lib/supabaseClient';
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

  // Form State
  const [formData, setFormData] = useState({
    slug: '',
    name_en: '',
    name_ar: '',
    brand_id: '',
    section_id: '',
    category_id: '',
    base_price: '',
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
        const [{ data: b }, { data: s }, { data: c }] = await Promise.all([
          supabase.from('brands').select('id, slug, name_en').order('name_en'),
          supabase.from('sections').select('id, slug, name_en').order('sort_order'),
          supabase.from('categories').select('id, slug, name_en'),
        ]);
        if (b) setBrands(b);
        if (s) setSections(s);
        if (c) setCategories(c);

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
              in_stock: prod.in_stock !== false,
              is_featured: Boolean(prod.is_featured),
              is_new: Boolean(prod.is_new),
              is_active: prod.is_active !== false,
              sort_order: prod.sort_order || 0,
            });

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
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id, isEditing]);

  const handleChange = (field, val) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: val };
      // Auto-generate slug from English name if not editing
      if (field === 'name_en' && !isEditing && !prev.slugModified) {
        next.slug = val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      }
      return next;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name_en) {
      toast({ message: 'Name (EN) is required', type: 'warning' });
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

      const payload = {
        slug: formData.slug || formData.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name_en: formData.name_en,
        name_ar: formData.name_ar || null,
        brand_id: formData.brand_id || null,
        section_id: formData.section_id || null,
        category_id: formData.category_id || null,
        base_price: formData.base_price !== '' ? Number(formData.base_price) : null,
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
        in_stock: formData.in_stock,
        is_featured: formData.is_featured,
        is_new: formData.is_new,
        is_active: formData.is_active,
        sort_order: Number(formData.sort_order) || 0,
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

      toast({ message: t.products.saved, type: 'success' });
      navigate('/admin/products');
    } catch (err) {
      console.error(err);
      toast({ message: err.message || t.common.error, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: 'general', label: t.products.tabGeneral },
    { key: 'pricing', label: t.products.tabPricing },
    { key: 'content', label: t.products.tabContent },
    { key: 'media', label: t.products.tabMedia },
    { key: 'visibility', label: t.products.tabVisibility },
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
              label={t.products.section}
              value={formData.section_id}
              onChange={(e) => handleChange('section_id', e.target.value)}
            >
              <option value="">{language === 'ar' ? 'اختر القسم' : 'Select Section'}</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name_en}
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
                  ? 'عند التفعيل، يباع المنتج بسعر ثابت واحد (بدون اختيار حجم 30/50/100 مل).'
                  : 'When active, the product is sold at a single fixed price without size choices.'}
              </p>
            </div>

            {formData.hide_sizes ? (
              <div className="max-w-xs">
                <Input
                  label={t.products.basePrice}
                  type="number"
                  value={formData.base_price}
                  onChange={(e) => handleChange('base_price', e.target.value)}
                  placeholder="2300"
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
                label={t.products.ingEn}
                value={formData.ingredients_en}
                onChange={(e) => handleChange('ingredients_en', e.target.value)}
                hint="Vanilla, Rose, Musk"
              />
              <Input
                label={t.products.ingAr}
                value={formData.ingredients_ar}
                onChange={(e) => handleChange('ingredients_ar', e.target.value)}
                dir="rtl"
                hint="فانيليا، ورد، مسك"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label={t.products.benEn}
                value={formData.benefits_en}
                onChange={(e) => handleChange('benefits_en', e.target.value)}
                hint="Long lasting, High sillage"
              />
              <Input
                label={t.products.benAr}
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
                label={t.products.mainImage}
                value={formData.image_url}
                onChange={async (file, preview) => {
                  if (file && isSupabaseConfigured) {
                    const ext = file.name.split('.').pop();
                    const path = `product-${Date.now()}.${ext}`;
                    const { error } = await supabase.storage
                      .from('product-images')
                      .upload(path, file);
                    if (!error) {
                      const { data } = supabase.storage
                        .from('product-images')
                        .getPublicUrl(path);
                      handleChange('image_url', data.publicUrl);
                    } else {
                      handleChange('image_url', preview);
                    }
                  } else {
                    handleChange('image_url', preview);
                  }
                }}
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
                label={t.products.hoverImage}
                value={formData.image_hover_url}
                onChange={async (file, preview) => {
                  if (file && isSupabaseConfigured) {
                    const ext = file.name.split('.').pop();
                    const path = `product-hover-${Date.now()}.${ext}`;
                    const { error } = await supabase.storage
                      .from('product-images')
                      .upload(path, file);
                    if (!error) {
                      const { data } = supabase.storage
                        .from('product-images')
                        .getPublicUrl(path);
                      handleChange('image_hover_url', data.publicUrl);
                    } else {
                      handleChange('image_hover_url', preview);
                    }
                  } else {
                    handleChange('image_hover_url', preview);
                  }
                }}
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
                label={t.products.gallery}
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
            <Switch
              label={t.products.stock}
              checked={formData.in_stock}
              onChange={(val) => handleChange('in_stock', val)}
            />
            <Switch
              label={t.products.active}
              checked={formData.is_active}
              onChange={(val) => handleChange('is_active', val)}
            />
            <Switch
              label={t.products.featured}
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

