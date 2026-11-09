import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiCopy,
  FiChevronDown,
  FiPackage,
  FiTag,
  FiPause,
  FiPlay,
} from 'react-icons/fi';
import { useAdminLang } from '../../contexts/AdminLangContext';
import { useToast } from '../../components/ui/Toast';
import { supabase, isSupabaseConfigured } from '../../../lib/supabaseClient';
import { allProducts } from '../../../data/products';
import { BRAND_LOGOS } from '../../../data/brands';
import {
  fetchSections,
  fetchOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  setSectionProducts,
} from '../../../services/sections';
import { subscribeToProducts } from '../../../services/products';
import {
  Button,
  Input,
  Textarea,
  Select,
  Switch,
  DataTable,
  ConfirmDialog,
  Tabs,
  Badge,
  Modal,
  ImageUploader,
} from '../../components/ui';

export default function ProductsPage() {
  const { t, language, isRTL } = useAdminLang();
  const toast = useToast();
  const navigate = useNavigate();

  // Active Section Tab: 'all' | 'women' | 'men' | 'original' | 'offers'
  const [activeTab, setActiveTab] = useState('all');

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sections, setSections] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');

  // New action dropdown
  const [showNewMenu, setShowNewMenu] = useState(false);

  // Offer Section Modal State
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [savingOffer, setSavingOffer] = useState(false);
  const [offerForm, setOfferForm] = useState({
    title_ar: '',
    title_en: '',
    description_ar: '',
    description_en: '',
    image_url: '',
    section_id: '',
    start_date: '',
    end_date: '',
    discount_percentage: '',
    offer_link: '',
    is_active: true,
    selectedProductIds: [],
  });

  // Deletion targets
  const [deleteProductTarget, setDeleteProductTarget] = useState(null);
  const [deleteOfferTarget, setDeleteOfferTarget] = useState(null);

  // Load products, brands, sections, and offers
  const loadData = useCallback(async () => {
    setLoading(true);
    if (!isSupabaseConfigured) {
      setProducts(
        allProducts.map((p) => ({
          id: p.id,
          slug: p.id,
          name_en: p.name || p.nameEn,
          name_ar: p.nameAr,
          brand_name: p.brand,
          section_slug: p.section,
          sections: [p.section],
          base_price: p.price,
          sale_price: null,
          in_stock: p.inStock !== false,
          is_active: true,
          image_url: p.image,
        }))
      );
      setBrands(BRAND_LOGOS.map((b) => ({ slug: b.id, name_en: b.name })));
      setLoading(false);
      return;
    }

    try {
      const [prodRes, brandRes, sectionList, offerList] = await Promise.all([
        supabase
          .from('products')
          .select(`
            id, slug, name_en, name_ar, base_price, sale_price, discount_percent,
            hide_sizes, in_stock, stock_status, is_active, is_featured, image_url, sort_order,
            brands:brand_id ( id, slug, name_en, name_ar ),
            sections:section_id ( id, slug, name_en, name_ar ),
            section_products ( section_id, sections:section_id ( id, slug, name_en, name_ar ) )
          `)
          .order('sort_order', { ascending: true }),
        supabase.from('brands').select('id, slug, name_en').order('name_en'),
        fetchSections(),
        fetchOffers(),
      ]);

      if (brandRes.data) setBrands(brandRes.data);
      if (sectionList) setSections(sectionList);
      if (offerList) setOffers(offerList);

      const flatProds = (prodRes.data || []).map((p) => {
        const primarySection = p.sections?.slug;
        const linked = (p.section_products || []).map((sp) => sp.sections?.slug).filter(Boolean);
        const allSecSlugs = Array.from(new Set([primarySection, ...linked].filter(Boolean)));

        return {
          ...p,
          brand_name: p.brands?.name_en || '—',
          brand_slug: p.brands?.slug,
          section_slug: primarySection || allSecSlugs[0] || '—',
          all_sections: allSecSlugs,
        };
      });

      if (flatProds.length > 0) {
        setProducts(flatProds);
      } else {
        setProducts(
          allProducts.map((p) => ({
            id: p.id,
            slug: p.id,
            name_en: p.name || p.nameEn,
            name_ar: p.nameAr,
            brand_name: p.brand,
            section_slug: p.section,
            sections: [p.section],
            all_sections: [p.section],
            base_price: p.price,
            sale_price: null,
            in_stock: p.inStock !== false,
            is_active: true,
            image_url: p.image,
          }))
        );
      }
    } catch (err) {
      console.error('ProductsPage loadData error:', err);
      setProducts(
        allProducts.map((p) => ({
          id: p.id,
          slug: p.id,
          name_en: p.name || p.nameEn,
          name_ar: p.nameAr,
          brand_name: p.brand,
          section_slug: p.section,
          sections: [p.section],
          all_sections: [p.section],
          base_price: p.price,
          sale_price: null,
          in_stock: p.inStock !== false,
          is_active: true,
          image_url: p.image,
        }))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Realtime synchronization: Listen to products, sections, offers
  useEffect(() => {
    const unsub = subscribeToProducts(() => {
      loadData();
    });
    return unsub;
  }, [loadData]);

  // Section Counts
  const counts = useMemo(() => {
    const res = {
      all: products.length,
      women: 0,
      men: 0,
      original: 0,
      offers: offers.length,
    };

    products.forEach((p) => {
      const secs = p.all_sections || [p.section_slug];
      if (secs.includes('women')) res.women += 1;
      if (secs.includes('men')) res.men += 1;
      if (secs.includes('original') || secs.includes('new-luxury')) res.original += 1;
    });

    return res;
  }, [products, offers]);

  // Tabs Definition
  const sectionTabs = [
    { key: 'all',      label: t.products.tabAll || (language === 'ar' ? 'الكل' : 'All'), count: counts.all },
    { key: 'women',    label: t.products.tabWomen || (language === 'ar' ? 'نسائي' : 'Women'), count: counts.women },
    { key: 'men',      label: t.products.tabMen || (language === 'ar' ? 'رجالي' : 'Men'), count: counts.men },
    { key: 'original', label: t.products.tabOriginal || (language === 'ar' ? 'أصلي' : 'Original'), count: counts.original },
    { key: 'offers',   label: t.products.tabOffers || (language === 'ar' ? 'العروض والأقسام' : 'Offers & Sections'), count: counts.offers },
  ];

  // Filtered Products for current tab
  const filteredProducts = useMemo(() => {
    if (activeTab === 'offers') return [];

    return products.filter((p) => {
      // Tab check
      if (activeTab !== 'all') {
        const secs = p.all_sections || [p.section_slug];
        if (activeTab === 'original') {
          if (!secs.includes('original') && !secs.includes('new-luxury')) return false;
        } else if (!secs.includes(activeTab)) {
          return false;
        }
      }

      // Search check
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.name_en?.toLowerCase().includes(q) ||
        p.name_ar?.toLowerCase().includes(q) ||
        p.brand_name?.toLowerCase().includes(q);

      // Brand check
      const matchBrand =
        selectedBrand === 'all' ||
        p.brand_slug === selectedBrand ||
        p.brand_name === selectedBrand;

      return matchSearch && matchBrand;
    });
  }, [products, activeTab, search, selectedBrand]);

  // Toggle in_stock
  const handleToggleStock = async (prod, nextVal) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === prod.id ? { ...p, in_stock: nextVal } : p))
    );
    if (isSupabaseConfigured) {
      await supabase
        .from('products')
        .update({
          in_stock: nextVal,
          stock_status: nextVal ? 'in_stock' : 'out_of_stock',
        })
        .eq('id', prod.id);
    }
  };

  // Toggle is_active
  const handleToggleActive = async (prod, nextVal) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === prod.id ? { ...p, is_active: nextVal } : p))
    );
    if (isSupabaseConfigured) {
      await supabase
        .from('products')
        .update({ is_active: nextVal })
        .eq('id', prod.id);
    }
  };

  // Delete product
  const handleDeleteProduct = async () => {
    if (!deleteProductTarget) return;
    const target = deleteProductTarget;
    setDeleteProductTarget(null);
    setProducts((prev) => prev.filter((p) => p.id !== target.id));

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('products').delete().eq('id', target.id);
      if (error) {
        toast({ message: t.common.error, type: 'error' });
        loadData();
      } else {
        toast({ message: language === 'ar' ? 'تم حذف المنتج بنجاح' : 'Product deleted', type: 'success' });
      }
    }
  };

  // Duplicate product
  const handleDuplicate = async (prod) => {
    if (!isSupabaseConfigured) return;
    const newSlug = `${prod.slug}-copy-${Date.now().toString().slice(-4)}`;
    const copy = {
      slug: newSlug,
      name_en: `${prod.name_en} (Copy)`,
      name_ar: prod.name_ar ? `${prod.name_ar} (نسخة)` : null,
      base_price: prod.base_price,
      sale_price: prod.sale_price,
      hide_sizes: prod.hide_sizes,
      in_stock: prod.in_stock,
      is_active: false,
      image_url: prod.image_url,
    };
    const { error } = await supabase.from('products').insert(copy);
    if (!error) {
      toast({ message: language === 'ar' ? 'تم تكرار المنتج' : 'Product duplicated', type: 'success' });
      loadData();
    }
  };

  // --- Offers Management ---
  const handleOpenOfferModal = (offer = null) => {
    if (offer) {
      setEditingOffer(offer);
      setOfferForm({
        title_ar: offer.title_ar || '',
        title_en: offer.title_en || '',
        description_ar: offer.description_ar || '',
        description_en: offer.description_en || '',
        image_url: offer.image_url || '',
        section_id: offer.section_id || '',
        start_date: offer.start_date ? offer.start_date.slice(0, 10) : '',
        end_date: offer.end_date ? offer.end_date.slice(0, 10) : '',
        discount_percentage: offer.discount_percentage ? String(offer.discount_percentage) : '',
        offer_link: offer.offer_link || '',
        is_active: offer.is_active !== false,
        selectedProductIds: [],
      });
    } else {
      setEditingOffer(null);
      setOfferForm({
        title_ar: '',
        title_en: '',
        description_ar: '',
        description_en: '',
        image_url: '',
        section_id: sections[0]?.id || '',
        start_date: new Date().toISOString().slice(0, 10),
        end_date: '',
        discount_percentage: '',
        offer_link: '',
        is_active: true,
        selectedProductIds: [],
      });
    }
    setOfferModalOpen(true);
    setShowNewMenu(false);
  };

  const handleSaveOffer = async (e) => {
    e.preventDefault();
    if (!offerForm.title_ar && !offerForm.title_en) {
      toast({ message: language === 'ar' ? 'عنوان العرض مطلوب' : 'Offer title is required', type: 'warning' });
      return;
    }
    setSavingOffer(true);

    try {
      const payload = {
        title_ar: offerForm.title_ar || offerForm.title_en,
        title_en: offerForm.title_en || offerForm.title_ar,
        description_ar: offerForm.description_ar || null,
        description_en: offerForm.description_en || null,
        image_url: offerForm.image_url || null,
        section_id: offerForm.section_id || null,
        start_date: offerForm.start_date ? new Date(offerForm.start_date).toISOString() : null,
        end_date: offerForm.end_date ? new Date(offerForm.end_date).toISOString() : null,
        discount_percentage: offerForm.discount_percentage ? Number(offerForm.discount_percentage) : null,
        offer_link: offerForm.offer_link || null,
        is_active: offerForm.is_active,
      };

      if (editingOffer) {
        await updateOffer(editingOffer.id, payload);
        toast({ message: language === 'ar' ? 'تم تحديث قسم العرض' : 'Offer section updated', type: 'success' });
      } else {
        await createOffer(payload);
        if (offerForm.selectedProductIds.length > 0 && offerForm.section_id) {
          await setSectionProducts(offerForm.section_id, offerForm.selectedProductIds);
        }
        toast({ message: language === 'ar' ? 'تم إنشاء قسم العرض بنجاح' : 'Offer section created', type: 'success' });
      }

      setOfferModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Error saving offer:', err);
      toast({ message: err.message || t.common.error, type: 'error' });
    } finally {
      setSavingOffer(false);
    }
  };

  const handleToggleOfferActive = async (offer) => {
    const nextVal = !offer.is_active;
    setOffers((prev) =>
      prev.map((o) => (o.id === offer.id ? { ...o, is_active: nextVal } : o))
    );
    try {
      await updateOffer(offer.id, { is_active: nextVal });
      toast({
        message: nextVal
          ? language === 'ar' ? 'تم تفعيل العرض' : 'Offer activated'
          : language === 'ar' ? 'تم إيقاف العرض مؤقتاً' : 'Offer paused',
        type: 'info',
      });
    } catch (err) {
      loadData();
    }
  };

  const handleDeleteOffer = async () => {
    if (!deleteOfferTarget) return;
    const target = deleteOfferTarget;
    setDeleteOfferTarget(null);
    setOffers((prev) => prev.filter((o) => o.id !== target.id));
    try {
      await deleteOffer(target.id);
      toast({ message: language === 'ar' ? 'تم حذف العرض' : 'Offer deleted', type: 'success' });
    } catch (err) {
      loadData();
    }
  };

  // Columns for Products DataTable
  const productColumns = [
    {
      key: 'image_url',
      label: language === 'ar' ? 'الصورة' : 'Image',
      width: 'w-14',
      render: (val, row) => (
        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800">
          {val ? (
            <img src={val} alt={row.name_en} className="h-full w-full object-contain" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-300">
              —
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'name_en',
      label: t.products.name,
      render: (val, row) => (
        <div>
          <Link
            to={`/admin/products/${row.id || row.slug}`}
            className="font-semibold text-neutral-900 hover:text-brand dark:text-white"
          >
            {val}
          </Link>
          {row.name_ar && (
            <p className="text-xs text-neutral-500 line-clamp-1" dir="rtl">
              {row.name_ar}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'brand_name',
      label: t.products.brand,
      render: (val) => <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">{val}</span>,
    },
    {
      key: 'all_sections',
      label: t.products.section,
      render: (val, row) => {
        const secs = row.all_sections || [row.section_slug];
        return (
          <div className="flex flex-wrap gap-1">
            {secs.map((s) => (
              <Badge key={s} color={s === 'women' ? 'pink' : s === 'men' ? 'blue' : s === 'original' ? 'purple' : 'gray'}>
                {s}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      key: 'base_price',
      label: t.products.price,
      render: (val, row) => (
        <div className="flex flex-col">
          {row.sale_price ? (
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-brand">
                {Number(row.sale_price).toLocaleString()} {t.common.egp}
              </span>
              <span className="text-xs text-neutral-400 line-through">
                {Number(val).toLocaleString()}
              </span>
            </div>
          ) : (
            <span className="font-semibold text-neutral-900 dark:text-white">
              {val ? `${Number(val).toLocaleString()} ${t.common.egp}` : '—'}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'in_stock',
      label: t.products.stock,
      render: (val, row) => (
        <Switch checked={val} onChange={(next) => handleToggleStock(row, next)} />
      ),
    },
    {
      key: 'is_active',
      label: t.products.active,
      render: (val, row) => (
        <Switch checked={val} onChange={(next) => handleToggleActive(row, next)} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & "+ New" Action Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {t.products.title}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {language === 'ar'
              ? 'إدارة المنتجات والأقسام والعروض وتحديثها المباشر في المتجر'
              : 'Manage products, sections & offers with live sync to storefront'}
          </p>
        </div>

        {/* "+ New" Dropdown Button */}
        <div className="relative">
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowNewMenu((p) => !p)}
            className="flex items-center gap-2"
          >
            <FiPlus size={16} />
            <span>{t.products.addNew || '+ New'}</span>
            <FiChevronDown size={14} className={showNewMenu ? 'rotate-180 transition' : 'transition'} />
          </Button>

          {showNewMenu && (
            <div
              className={`absolute top-full mt-2 w-56 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-700 dark:bg-neutral-800 z-50 ${
                isRTL ? 'start-0' : 'end-0'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setShowNewMenu(false);
                  navigate(`/admin/products/new${activeTab !== 'all' && activeTab !== 'offers' ? `?section=${activeTab}` : ''}`);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 hover:text-brand dark:text-neutral-200 dark:hover:bg-neutral-700/60"
              >
                <FiPackage size={16} className="text-brand" />
                <div className="text-start">
                  <p>{t.products.addProduct || (language === 'ar' ? 'إضافة منتج' : 'Add product')}</p>
                  <p className="text-[10px] text-neutral-400 font-normal">
                    {language === 'ar' ? 'ربط بـ نسائي، رجالي، أصلي' : 'Link to sections'}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleOpenOfferModal()}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 hover:text-brand dark:text-neutral-200 dark:hover:bg-neutral-700/60"
              >
                <FiTag size={16} className="text-emerald-500" />
                <div className="text-start">
                  <p>{t.products.addOfferSection || (language === 'ar' ? 'إضافة قسم عروض' : 'Add offer section')}</p>
                  <p className="text-[10px] text-neutral-400 font-normal">
                    {language === 'ar' ? 'صورة، تواريخ، ومنتجات العرض' : 'With banner & dates'}
                  </p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs with Counts: All, Women, Men, Original, Offers */}
      <Tabs tabs={sectionTabs} activeKey={activeTab} onChange={setActiveTab} />

      {/* Offers Tab View */}
      {activeTab === 'offers' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              {language === 'ar' ? 'أقسام العروض الترويجية' : 'Offer Sections'} ({offers.length})
            </h2>
            <Button size="sm" variant="primary" onClick={() => handleOpenOfferModal()}>
              <FiPlus size={14} />
              {t.products.createOffer || (language === 'ar' ? 'إنشاء قسم عروض' : 'Create offer section')}
            </Button>
          </div>

          {offers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 p-12 text-center dark:border-neutral-800">
              <FiTag size={32} className="mx-auto text-neutral-400" />
              <p className="mt-2 text-sm text-neutral-500">
                {language === 'ar' ? 'لا توجد عروض حالياً. أنشئ قسماً ترويجياً جديداً يظهر بالمتجر.' : 'No active offers. Create a new offer section for the storefront.'}
              </p>
              <Button size="sm" variant="outline" className="mt-4" onClick={() => handleOpenOfferModal()}>
                {t.products.createOffer || '+ New Offer'}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {offers.map((offer) => {
                const title = language === 'ar' ? offer.title_ar || offer.title_en : offer.title_en || offer.title_ar;
                const desc = language === 'ar' ? offer.description_ar : offer.description_en;
                return (
                  <div
                    key={offer.id}
                    className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    {offer.image_url ? (
                      <div className="mb-3 h-36 w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                        <img src={offer.image_url} alt={title} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="mb-3 flex h-28 w-full items-center justify-center rounded-xl bg-brand/10 text-brand">
                        <FiTag size={28} />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-neutral-900 dark:text-white">{title}</h3>
                      <Badge color={offer.is_active ? 'green' : 'gray'}>
                        {offer.is_active
                          ? language === 'ar' ? 'نشط' : 'Active'
                          : language === 'ar' ? 'متوقف' : 'Paused'}
                      </Badge>
                    </div>

                    {desc && <p className="mt-1 text-xs text-neutral-500 line-clamp-2">{desc}</p>}

                    {offer.discount_percentage && (
                      <p className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {language === 'ar' ? `خصم: ${offer.discount_percentage}%` : `Discount: ${offer.discount_percentage}%`}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleOfferActive(offer)}
                          className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-brand dark:hover:bg-neutral-800"
                          title={offer.is_active ? 'Pause' : 'Activate'}
                        >
                          {offer.is_active ? <FiPause size={15} /> : <FiPlay size={15} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenOfferModal(offer)}
                          className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-brand dark:hover:bg-neutral-800"
                          title="Edit"
                        >
                          <FiEdit2 size={15} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setDeleteOfferTarget(offer)}
                        className="rounded-lg p-2 text-neutral-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40"
                        title="Delete"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Products List for Tab */
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative">
              <Input
                placeholder={t.products.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ps-9"
              />
              <FiSearch className="absolute start-3 top-3 text-neutral-400" size={16} />
            </div>

            <Select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
              <option value="all">{language === 'ar' ? 'كل البراندات' : 'All Brands'}</option>
              {brands.map((b) => (
                <option key={b.slug || b.id} value={b.slug || b.name_en}>
                  {b.name_en}
                </option>
              ))}
            </Select>
          </div>

          {/* DataTable */}
          <DataTable
            columns={productColumns}
            data={filteredProducts}
            loading={loading}
            actions={(row) => (
              <div className="flex items-center gap-1">
                <Link to={`/admin/products/${row.id || row.slug}`}>
                  <button
                    type="button"
                    className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-brand dark:hover:bg-neutral-800"
                    title={t.common.edit}
                  >
                    <FiEdit2 size={14} />
                  </button>
                </Link>
                <button
                  type="button"
                  onClick={() => handleDuplicate(row)}
                  className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-brand dark:hover:bg-neutral-800"
                  title={t.products.duplicate}
                >
                  <FiCopy size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteProductTarget(row)}
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40"
                  title={t.common.delete}
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            )}
            emptyMessage={t.common.empty}
          />
        </div>
      )}

      {/* Offer Section Modal (Create / Edit) */}
      <Modal
        isOpen={offerModalOpen}
        onClose={() => setOfferModalOpen(false)}
        title={editingOffer ? t.products.editOffer || 'Edit Offer' : t.products.createOffer || 'Add Offer Section'}
        size="lg"
      >
        <form onSubmit={handleSaveOffer} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label={t.products.offerTitleAr || 'Offer Title (Arabic)'}
              value={offerForm.title_ar}
              onChange={(e) => setOfferForm((p) => ({ ...p, title_ar: e.target.value }))}
              dir="rtl"
              required
            />
            <Input
              label={t.products.offerTitleEn || 'Offer Title (English)'}
              value={offerForm.title_en}
              onChange={(e) => setOfferForm((p) => ({ ...p, title_en: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Textarea
              label={t.products.offerDescAr || 'Description (Arabic)'}
              rows={2}
              value={offerForm.description_ar}
              onChange={(e) => setOfferForm((p) => ({ ...p, description_ar: e.target.value }))}
              dir="rtl"
            />
            <Textarea
              label={t.products.offerDescEn || 'Description (English)'}
              rows={2}
              value={offerForm.description_en}
              onChange={(e) => setOfferForm((p) => ({ ...p, description_en: e.target.value }))}
            />
          </div>

          {/* Banner Image Upload to Storage 'products' */}
          <ImageUploader
            label={language === 'ar' ? 'صورة بانر العرض (Supabase products)' : 'Offer Banner Image (products bucket)'}
            value={offerForm.image_url}
            onChange={async (file, preview) => {
              if (file && isSupabaseConfigured) {
                const ext = file.name.split('.').pop();
                const path = `offer-${Date.now()}.${ext}`;
                let res = await supabase.storage.from('products').upload(path, file);
                let bName = 'products';
                if (res.error) {
                  res = await supabase.storage.from('product-images').upload(path, file);
                  bName = 'product-images';
                }
                if (!res.error) {
                  const { data } = supabase.storage.from(bName).getPublicUrl(path);
                  setOfferForm((p) => ({ ...p, image_url: data?.publicUrl }));
                  return;
                }
              }
              setOfferForm((p) => ({ ...p, image_url: preview || '' }));
            }}
            onDelete={() => setOfferForm((p) => ({ ...p, image_url: '' }))}
          />
          <Input
            placeholder="Or paste banner image URL"
            value={offerForm.image_url}
            onChange={(e) => setOfferForm((p) => ({ ...p, image_url: e.target.value }))}
            className="text-xs"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label={t.products.discountPercent || 'Discount (%)'}
              type="number"
              min="0"
              max="100"
              value={offerForm.discount_percentage}
              onChange={(e) => setOfferForm((p) => ({ ...p, discount_percentage: e.target.value }))}
              placeholder="20"
            />
            <Input
              label={t.products.startDate || 'Start Date'}
              type="date"
              value={offerForm.start_date}
              onChange={(e) => setOfferForm((p) => ({ ...p, start_date: e.target.value }))}
            />
            <Input
              label={t.products.endDate || 'End Date'}
              type="date"
              value={offerForm.end_date}
              onChange={(e) => setOfferForm((p) => ({ ...p, end_date: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label={language === 'ar' ? 'القسم المرتبط' : 'Associated Section'}
              value={offerForm.section_id}
              onChange={(e) => setOfferForm((p) => ({ ...p, section_id: e.target.value }))}
            >
              <option value="">{language === 'ar' ? 'بدون قسم محدد' : 'None / Standalone'}</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {language === 'ar' && s.name_ar ? s.name_ar : s.name_en}
                </option>
              ))}
            </Select>

            <Input
              label={t.products.offerLink || 'Campaign Link (Optional)'}
              value={offerForm.offer_link}
              onChange={(e) => setOfferForm((p) => ({ ...p, offer_link: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          {/* Product checklist if creating a new section */}
          {!editingOffer && (
            <div className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800 space-y-2">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                {t.products.productsIncluded || (language === 'ar' ? 'المنتجات المشمولة في هذا العرض' : 'Products Included')}
              </label>
              <div className="max-h-36 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
                {products.slice(0, 30).map((prod) => {
                  const isChecked = offerForm.selectedProductIds.includes(prod.id);
                  return (
                    <label
                      key={prod.id}
                      className="flex cursor-pointer items-center justify-between py-1.5 text-xs text-neutral-700 hover:text-brand dark:text-neutral-300"
                    >
                      <span>{prod.name_en} {prod.name_ar ? `(${prod.name_ar})` : ''}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setOfferForm((p) => ({
                            ...p,
                            selectedProductIds: isChecked
                              ? p.selectedProductIds.filter((x) => x !== prod.id)
                              : [...p.selectedProductIds, prod.id],
                          }));
                        }}
                        className="rounded text-brand focus:ring-brand"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Switch
              label={language === 'ar' ? 'نشط الآن' : 'Active'}
              checked={offerForm.is_active}
              onChange={(val) => setOfferForm((p) => ({ ...p, is_active: val }))}
            />
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOfferModalOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button type="submit" variant="primary" loading={savingOffer}>
                {t.common.save}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Product Delete Confirm */}
      <ConfirmDialog
        isOpen={Boolean(deleteProductTarget)}
        title={t.common.delete}
        message={t.products.deleteConfirm}
        confirmLabel={t.common.delete}
        cancelLabel={t.common.cancel}
        onConfirm={handleDeleteProduct}
        onClose={() => setDeleteProductTarget(null)}
      />

      {/* Offer Delete Confirm */}
      <ConfirmDialog
        isOpen={Boolean(deleteOfferTarget)}
        title={t.products.deleteOffer || 'Delete Offer'}
        message={language === 'ar' ? 'هل أنت متأكد من حذف هذا العرض الترويجي؟' : 'Are you sure you want to delete this offer section?'}
        confirmLabel={t.common.delete}
        cancelLabel={t.common.cancel}
        onConfirm={handleDeleteOffer}
        onClose={() => setDeleteOfferTarget(null)}
      />
    </div>
  );
}
