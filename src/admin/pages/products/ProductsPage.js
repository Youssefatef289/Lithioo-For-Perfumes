import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiCopy,
  FiAlertTriangle,
} from 'react-icons/fi';
import { useAdminLang } from '../../contexts/AdminLangContext';
import { useToast } from '../../components/ui/Toast';
import { supabase, isSupabaseConfigured } from '../../../lib/supabaseClient';
import { allProducts } from '../../../data/products';
import { BRAND_LOGOS } from '../../../data/brands';
import {
  Button,
  Input,
  Select,
  Switch,
  DataTable,
  ConfirmDialog,
  Tabs,
  Badge,
} from '../../components/ui';

export default function ProductsPage() {
  const { t, language } = useAdminLang();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'audit'
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');

  // Selection & Bulk
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Load products & brands
  const loadData = useCallback(async () => {
    setLoading(true);
    if (!isSupabaseConfigured) {
      // Offline fallback using static products
      setProducts(
        allProducts.map((p) => ({
          id: p.id,
          slug: p.id,
          name_en: p.name || p.nameEn,
          name_ar: p.nameAr,
          brand_name: p.brand,
          section_slug: p.section,
          base_price: p.price,
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
      // Fetch products
      const { data: prods, error: prodErr } = await supabase
        .from('products')
        .select(`
          id, slug, name_en, name_ar, base_price, hide_sizes, in_stock, is_active, is_featured, image_url, sort_order,
          brands:brand_id ( id, slug, name_en, name_ar ),
          sections:section_id ( id, slug, name_en )
        `)
        .order('sort_order', { ascending: true });

      if (prodErr) throw prodErr;

      const flatProds = (prods || []).map((p) => ({
        ...p,
        brand_name: p.brands?.name_en || '—',
        brand_slug: p.brands?.slug,
        section_slug: p.sections?.slug,
      }));
      setProducts(flatProds);

      // Fetch brands
      const { data: bList } = await supabase.from('brands').select('id, slug, name_en').order('name_en');
      if (bList) setBrands(bList);

      // Fetch sections
      const { data: sList } = await supabase.from('sections').select('id, slug, name_en').order('sort_order');
      if (sList) setSections(sList);
    } catch (err) {
      console.error(err);
      toast({ message: t.common.error, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [t.common.error, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Toggle in_stock
  const handleToggleStock = async (prod, nextVal) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === prod.id ? { ...p, in_stock: nextVal } : p))
    );
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('products')
        .update({ in_stock: nextVal })
        .eq('id', prod.id);
      if (error) {
        toast({ message: t.common.error, type: 'error' });
        loadData();
      }
    }
  };

  // Toggle is_active
  const handleToggleActive = async (prod, nextVal) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === prod.id ? { ...p, is_active: nextVal } : p))
    );
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('products')
        .update({ is_active: nextVal })
        .eq('id', prod.id);
      if (error) {
        toast({ message: t.common.error, type: 'error' });
        loadData();
      }
    }
  };

  // Delete product
  const handleDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    setProducts((prev) => prev.filter((p) => p.id !== target.id));

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('products').delete().eq('id', target.id);
      if (error) {
        toast({ message: t.common.error, type: 'error' });
        loadData();
      } else {
        toast({ message: language === 'ar' ? 'تم حذف المنتج' : 'Product deleted', type: 'success' });
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

  // Bulk Actions
  const handleBulkUpdate = async (field, value) => {
    if (selectedIds.length === 0 || !isSupabaseConfigured) return;
    const { error } = await supabase
      .from('products')
      .update({ [field]: value })
      .in('id', selectedIds);

    if (error) {
      toast({ message: t.common.error, type: 'error' });
    } else {
      toast({
        message: language === 'ar' ? 'تم التحديث بنجاح' : 'Bulk update successful',
        type: 'success',
      });
      setSelectedIds([]);
      loadData();
    }
  };

  // Filtered list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.name_en?.toLowerCase().includes(q) ||
        p.name_ar?.toLowerCase().includes(q) ||
        p.brand_name?.toLowerCase().includes(q);

      const matchBrand =
        selectedBrand === 'all' ||
        p.brand_slug === selectedBrand ||
        p.brand_name === selectedBrand;

      const matchSection =
        selectedSection === 'all' || p.section_slug === selectedSection;

      return matchSearch && matchBrand && matchSection;
    });
  }, [products, search, selectedBrand, selectedSection]);

  // Audit list
  const auditProducts = useMemo(() => {
    return products.filter((p) => {
      const noPrice = !p.base_price || Number(p.base_price) === 0;
      const noImage = !p.image_url;
      const noArabic = !p.name_ar;
      return noPrice || noImage || noArabic;
    });
  }, [products]);

  const columns = [
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
      key: 'section_slug',
      label: t.products.section,
      render: (val) => (
        <Badge color="gray">{val || '—'}</Badge>
      ),
    },
    {
      key: 'base_price',
      label: t.products.price,
      render: (val) => (
        <span className="font-semibold text-neutral-900 dark:text-white">
          {val ? `${Number(val).toLocaleString()} ${t.common.egp}` : (
            <span className="text-neutral-400 text-xs">
              {language === 'ar' ? 'أحجام متعددة' : 'Size variants'}
            </span>
          )}
        </span>
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
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {t.products.title} ({products.length})
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {language === 'ar' ? 'إدارة كتالوج المنتجات والأسعار والمخزون' : 'Manage catalog products, prices and stock'}
          </p>
        </div>

        <Link to="/admin/products/new">
          <Button variant="primary" size="md">
            <FiPlus size={16} />
            {t.products.new}
          </Button>
        </Link>
      </div>

      {/* Main Tabs (List vs Audit) */}
      <Tabs
        tabs={[
          { key: 'list', label: language === 'ar' ? 'جميع المنتجات' : 'All Products', count: products.length },
          { key: 'audit', label: t.products.tabAudit, count: auditProducts.length },
        ]}
        activeKey={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'list' ? (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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

            <Select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
              <option value="all">{language === 'ar' ? 'كل الأقسام' : 'All Sections'}</option>
              {sections.length > 0 ? (
                sections.map((s) => (
                  <option key={s.id || s.slug} value={s.slug}>
                    {s.name_en}
                  </option>
                ))
              ) : (
                <>
                  <option value="men">Men Section</option>
                  <option value="women">Women Section</option>
                  <option value="special">Oriental Section</option>
                  <option value="original">Original Section</option>
                  <option value="new-luxury">New Luxury</option>
                  <option value="new-diverse">New & Diverse</option>
                </>
              )}
            </Select>
          </div>

          {/* Bulk Action Bar (When Rows Selected) */}
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-brand/10 p-3 text-sm text-brand dark:bg-brand/20">
              <span className="font-semibold">
                {selectedIds.length} {language === 'ar' ? 'منتجات محددة:' : 'selected:'}
              </span>
              <Button size="xs" variant="secondary" onClick={() => handleBulkUpdate('is_active', true)}>
                {t.products.bulkActivate}
              </Button>
              <Button size="xs" variant="secondary" onClick={() => handleBulkUpdate('is_active', false)}>
                {t.products.bulkDeactivate}
              </Button>
              <Button size="xs" variant="secondary" onClick={() => handleBulkUpdate('in_stock', true)}>
                {t.products.bulkInStock}
              </Button>
              <Button size="xs" variant="secondary" onClick={() => handleBulkUpdate('in_stock', false)}>
                {t.products.bulkOutStock}
              </Button>
            </div>
          )}

          {/* DataTable */}
          <DataTable
            columns={columns}
            data={filteredProducts}
            loading={loading}
            selected={selectedIds}
            onSelectChange={setSelectedIds}
            actions={(row) => (
              <div className="flex items-center justify-end gap-1">
                <Link to={`/admin/products/${row.id || row.slug}`}>
                  <button className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-brand dark:hover:bg-neutral-800">
                    <FiEdit2 size={15} />
                  </button>
                </Link>
                <button
                  onClick={() => handleDuplicate(row)}
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-blue-600 dark:hover:bg-neutral-800"
                  title={t.products.duplicate}
                >
                  <FiCopy size={15} />
                </button>
                <button
                  onClick={() => setDeleteTarget(row)}
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-red-600 dark:hover:bg-neutral-800"
                  title={t.products.delete}
                >
                  <FiTrash2 size={15} />
                </button>
              </div>
            )}
            emptyMessage={t.common.empty}
          />
        </div>
      ) : (
        /* Audit Tab */
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
            <div className="flex items-center gap-2 font-bold mb-1">
              <FiAlertTriangle />
              {t.products.auditTitle}
            </div>
            <p className="text-xs">
              {language === 'ar'
                ? 'قائمة بالمنتجات التي تحتاج مراجعة (سعر صفر/مفقود، صورة مفقودة، أو اسم عربي غير مكتمل).'
                : 'Products requiring attention (missing price, missing image, or missing Arabic translation).'}
            </p>
          </div>

          <DataTable
            columns={[
              ...columns.slice(0, 2),
              {
                key: 'issues',
                label: language === 'ar' ? 'الملاحظات' : 'Issues',
                render: (_, row) => (
                  <div className="flex flex-wrap gap-1">
                    {(!row.base_price || Number(row.base_price) === 0) && (
                      <Badge color="red">{t.products.auditZeroPrice}</Badge>
                    )}
                    {!row.image_url && <Badge color="red">{t.products.auditNoImage}</Badge>}
                    {!row.name_ar && <Badge color="red">{t.products.auditNoArabic}</Badge>}
                  </div>
                ),
              },
            ]}
            data={auditProducts}
            loading={loading}
            actions={(row) => (
              <Link to={`/admin/products/${row.id || row.slug}`}>
                <Button size="xs" variant="outline">
                  {t.products.edit}
                </Button>
              </Link>
            )}
          />
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t.products.delete}
        message={t.products.deleteConfirm}
        confirmLabel={t.common.delete}
        dangerous
      />
    </div>
  );
}

