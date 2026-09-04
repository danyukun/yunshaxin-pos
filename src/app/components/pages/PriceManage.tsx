import { useState, useMemo } from 'react';
import {
  Plus, Search, Pencil, Trash2, X, ChevronDown,
  Globe, ImagePlus, Package, Percent,
  Smartphone, Share2, Clock,
} from 'lucide-react';
import { useAppStore, type CatalogItem } from '../../data/AppContext';

// ─── Types ───────────────────────────────────────────────────────────────────
type HangArea   = '滑杆斜区' | '大件区' | '折叠区';
type ItemStatus = 'active' | 'inactive';
type FormTab    = 'basic' | 'price' | 'sales';

interface SKUVariant { id: string; name: string; regularPrice: number; onlinePrice: number; }
interface SKUForm    { id: string; name: string; regularPrice: string; onlinePrice: string; }

interface ClothingItem {
  id: string; storeId: string; name: string; mnemonicCode: string; categoryId: string;
  regularPrice: number; onlinePrice: number;
  washCycleDays: number; hangArea: HangArea; status: ItemStatus;
  allowDiscount: boolean; onMiniProgram: boolean; inDistribution: boolean;
  isBundle: boolean; bundleCount: number;
  hasSKU: boolean; skus: SKUVariant[];
}

interface ItemForm {
  name: string; mnemonicCode: string; categoryId: string; storeIds: string[];
  regularPrice: string; onlinePrice: string;
  washCycleDays: string; hangArea: HangArea; status: ItemStatus;
  allowDiscount: boolean; onMiniProgram: boolean; inDistribution: boolean;
  isBundle: boolean; bundleCount: string;
  hasSKU: boolean; skus: SKUForm[];
}

interface Category { id: string; code: string; name: string; color: string; }

// ─── Constants ────────────────────────────────────────────────────────────────
const STORES    = [{ id: 's1', name: '云奢品工厂店' }, { id: 's2', name: '万象城分店' }, { id: 's3', name: '学府街旗舰店' }];
const HANG_AREAS: HangArea[] = ['滑杆斜区', '大件区', '折叠区'];
const COLOR_POOL = ['#3b82f6','#fd780f','#22c55e','#a855f7','#ec4899','#14b8a6','#6366f1','#eab308','#ef4444','#0ea5e9'];

const HANG_STYLE: Record<string, { bg: string; color: string }> = {
  '滑杆斜区': { bg: '#fff3e8', color: '#fd780f' },
  '大件区':   { bg: '#eff6ff', color: '#2563eb' },
  '折叠区':   { bg: '#f0fdf4', color: '#16a34a' },
};
const DEFAULT_HS = { bg: '#f3f4f6', color: '#6b7280' };

const WASH_CYCLE: Record<string, number> = {
  A: 3, B: 4, C: 3, D: 7, E: 2, F: 5, G: 5, H: 1, R: 0,
};

const INIT_CATEGORIES: Category[] = [
  { id: 'A', code: 'A', name: '拼单团购', color: '#3b82f6' },
  { id: 'B', code: 'B', name: '上衣外套', color: '#fd780f' },
  { id: 'C', code: 'C', name: '裤子裙子', color: '#22c55e' },
  { id: 'D', code: 'D', name: '皮衣皮具', color: '#a855f7' },
  { id: 'E', code: 'E', name: '小件饰品', color: '#ec4899' },
  { id: 'F', code: 'F', name: '家纺家居', color: '#14b8a6' },
  { id: 'G', code: 'G', name: '鞋类洗护', color: '#6366f1' },
  { id: 'H', code: 'H', name: '单独熨烫', color: '#eab308' },
  { id: 'R', code: 'R', name: '商品销售', color: '#ef4444' },
];

// ─── Mock Base Data ───────────────────────────────────────────────────────────
type BaseDef = { name: string; mnemonicCode: string; categoryId: string; regularPrice: number; hangArea: HangArea; status: ItemStatus; };

const BASE: BaseDef[] = [
  { name:'任意3件',   mnemonicCode:'RY3', categoryId:'A', regularPrice:68,  hangArea:'折叠区',   status:'active' },
  { name:'任意5件',   mnemonicCode:'RY5', categoryId:'A', regularPrice:99,  hangArea:'折叠区',   status:'active' },
  { name:'任意10件',  mnemonicCode:'R10', categoryId:'A', regularPrice:188, hangArea:'折叠区',   status:'active' },
  { name:'衬衫',      mnemonicCode:'CS',  categoryId:'B', regularPrice:15,  hangArea:'滑杆斜区', status:'active' },
  { name:'T恤',       mnemonicCode:'TX',  categoryId:'B', regularPrice:10,  hangArea:'滑杆斜区', status:'active' },
  { name:'西装上衣',  mnemonicCode:'XZ',  categoryId:'B', regularPrice:30,  hangArea:'滑杆斜区', status:'active' },
  { name:'风衣',      mnemonicCode:'FY',  categoryId:'B', regularPrice:45,  hangArea:'滑杆斜区', status:'active' },
  { name:'棉长大衣',  mnemonicCode:'MD',  categoryId:'B', regularPrice:55,  hangArea:'大件区',   status:'active' },
  { name:'羽绒服长',  mnemonicCode:'YC',  categoryId:'B', regularPrice:52,  hangArea:'大件区',   status:'active' },
  { name:'羽绒服短',  mnemonicCode:'YD',  categoryId:'B', regularPrice:32,  hangArea:'大件区',   status:'active' },
  { name:'羊绒大衣',  mnemonicCode:'YR',  categoryId:'B', regularPrice:65,  hangArea:'大件区',   status:'active' },
  { name:'针织毛衣',  mnemonicCode:'ZM',  categoryId:'B', regularPrice:25,  hangArea:'折叠区',   status:'active' },
  { name:'卫衣',      mnemonicCode:'WY',  categoryId:'B', regularPrice:18,  hangArea:'滑杆斜区', status:'inactive'},
  { name:'西裤',      mnemonicCode:'XK',  categoryId:'C', regularPrice:20,  hangArea:'滑杆斜区', status:'active' },
  { name:'牛仔裤',    mnemonicCode:'NK',  categoryId:'C', regularPrice:18,  hangArea:'滑杆斜区', status:'active' },
  { name:'休闲裤',    mnemonicCode:'XP',  categoryId:'C', regularPrice:15,  hangArea:'滑杆斜区', status:'active' },
  { name:'半身裙',    mnemonicCode:'BQ',  categoryId:'C', regularPrice:18,  hangArea:'滑杆斜区', status:'active' },
  { name:'连衣裙',    mnemonicCode:'LQ',  categoryId:'C', regularPrice:25,  hangArea:'滑杆斜区', status:'active' },
  { name:'羽绒裙',    mnemonicCode:'YQ',  categoryId:'C', regularPrice:30,  hangArea:'大件区',   status:'inactive'},
  { name:'皮衣',      mnemonicCode:'PY',  categoryId:'D', regularPrice:80,  hangArea:'滑杆斜区', status:'active' },
  { name:'皮夹克',    mnemonicCode:'PJ',  categoryId:'D', regularPrice:75,  hangArea:'滑杆斜区', status:'active' },
  { name:'皮包清洁',  mnemonicCode:'PB',  categoryId:'D', regularPrice:45,  hangArea:'折叠区',   status:'active' },
  { name:'皮带',      mnemonicCode:'PD',  categoryId:'D', regularPrice:20,  hangArea:'折叠区',   status:'active' },
  { name:'皮鞋护理',  mnemonicCode:'PX',  categoryId:'D', regularPrice:35,  hangArea:'折叠区',   status:'active' },
  { name:'领带',      mnemonicCode:'LD',  categoryId:'E', regularPrice:15,  hangArea:'折叠区',   status:'active' },
  { name:'丝巾',      mnemonicCode:'SJ',  categoryId:'E', regularPrice:12,  hangArea:'折叠区',   status:'active' },
  { name:'手套',      mnemonicCode:'ST',  categoryId:'E', regularPrice:10,  hangArea:'折叠区',   status:'active' },
  { name:'帽子',      mnemonicCode:'MZ',  categoryId:'E', regularPrice:10,  hangArea:'折叠区',   status:'inactive'},
  { name:'被子(单人)',mnemonicCode:'BD',  categoryId:'F', regularPrice:40,  hangArea:'大件区',   status:'active' },
  { name:'被子(双人)',mnemonicCode:'BS',  categoryId:'F', regularPrice:60,  hangArea:'大件区',   status:'active' },
  { name:'窗帘(每㎡)',mnemonicCode:'CL',  categoryId:'F', regularPrice:8,   hangArea:'大件区',   status:'active' },
  { name:'毛毯',      mnemonicCode:'MT',  categoryId:'F', regularPrice:35,  hangArea:'大件区',   status:'active' },
  { name:'床单',      mnemonicCode:'CC',  categoryId:'F', regularPrice:20,  hangArea:'大件区',   status:'active' },
  { name:'枕套',      mnemonicCode:'ZT',  categoryId:'F', regularPrice:8,   hangArea:'折叠区',   status:'active' },
  { name:'运动鞋',    mnemonicCode:'YX',  categoryId:'G', regularPrice:25,  hangArea:'折叠区',   status:'active' },
  { name:'皮鞋抛光',  mnemonicCode:'PG',  categoryId:'G', regularPrice:35,  hangArea:'折叠区',   status:'active' },
  { name:'休闲鞋',    mnemonicCode:'XX',  categoryId:'G', regularPrice:20,  hangArea:'折叠区',   status:'active' },
  { name:'高跟鞋',    mnemonicCode:'GG',  categoryId:'G', regularPrice:30,  hangArea:'折叠区',   status:'active' },
  { name:'靴子',      mnemonicCode:'XZI', categoryId:'G', regularPrice:45,  hangArea:'折叠区',   status:'inactive'},
  { name:'衬衫熨烫',  mnemonicCode:'CY',  categoryId:'H', regularPrice:10,  hangArea:'滑杆斜区', status:'active' },
  { name:'裤子熨烫',  mnemonicCode:'KY',  categoryId:'H', regularPrice:10,  hangArea:'滑杆斜区', status:'active' },
  { name:'西装熨烫',  mnemonicCode:'XY',  categoryId:'H', regularPrice:20,  hangArea:'滑杆斜区', status:'active' },
  { name:'大衣熨烫',  mnemonicCode:'DY',  categoryId:'H', regularPrice:25,  hangArea:'大件区',   status:'active' },
  { name:'衣物防尘袋',mnemonicCode:'FB',  categoryId:'R', regularPrice:5,   hangArea:'折叠区',   status:'active' },
  { name:'去污剂',    mnemonicCode:'QW',  categoryId:'R', regularPrice:15,  hangArea:'折叠区',   status:'active' },
  { name:'护理套餐',  mnemonicCode:'HL',  categoryId:'R', regularPrice:28,  hangArea:'折叠区',   status:'active' },
];

function buildItems(): ClothingItem[] {
  const result: ClothingItem[] = [];
  let n = 1;
  STORES.forEach((store, si) => {
    const d = si === 1 ? 2 : si === 2 ? -1 : 0;
    BASE.forEach(b => {
      const rp = Math.max(1, b.regularPrice + d);
      result.push({
        id: `i${n++}`, storeId: store.id,
        name: b.name, mnemonicCode: b.mnemonicCode, categoryId: b.categoryId,
        regularPrice: rp,
        onlinePrice: Math.round(rp * 1.1),
        washCycleDays: WASH_CYCLE[b.categoryId] ?? 3,
        hangArea: b.hangArea, status: b.status,
        allowDiscount: b.categoryId !== 'A',
        onMiniProgram: true,
        inDistribution: ['B', 'D', 'G'].includes(b.categoryId),
        isBundle: b.categoryId === 'A',
        bundleCount: b.categoryId === 'A' ? parseInt(b.name.replace(/[^0-9]/g,'')) || 3 : 1,
        hasSKU: false, skus: [],
      });
    });
  });
  return result;
}

const INIT_ITEMS = buildItems();

// ─── Helpers ──────────────────────────────────────────────────────────────────
const alpha = (hex: string, a: number) => {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
};

const emptyForm = (catId = 'B', storeId = 's1'): ItemForm => ({
  name:'', mnemonicCode:'', categoryId: catId, storeIds:[storeId],
  regularPrice:'', onlinePrice:'',
  washCycleDays:'3', hangArea:'滑杆斜区', status:'active',
  allowDiscount: true, onMiniProgram: true, inDistribution: false,
  isBundle: false, bundleCount:'1',
  hasSKU: false, skus:[],
});

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      className="relative w-9 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0"
      style={{ backgroundColor: checked ? '#fd780f' : '#d1d5db' }}
    >
      <div
        className="absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform"
        style={{ transform: `translateX(${checked ? '17px' : '2px'})` }}
      />
    </div>
  );
}

// ─── Toggle Row ───────────────────────────────────────────────────────────────
function ToggleRow({ icon: Icon, label, sub, checked, onChange, children }:
  { icon: React.ElementType; label: string; sub?: string; checked: boolean; onChange: () => void; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="size-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fff3e8' }}>
          <Icon className="size-3.5" style={{ color: '#fd780f' }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-gray-700">{label}</p>
          {sub && <p className="text-xs text-gray-400">{sub}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {children}
        <ToggleSwitch checked={checked} onChange={onChange} />
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{title}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PriceManage({ searchQuery = '' }: { searchQuery?: string }) {
  const { setCatalog } = useAppStore();
  const [selectedStore, setSelectedStore] = useState('s1');
  const [selectedCat,   setSelectedCat]   = useState('all');
  const [search,        setSearch]         = useState('');
  const effectiveSearch = searchQuery || search;
  const [categories, setCategories]        = useState<Category[]>(INIT_CATEGORIES);
  const [items,      setItems]             = useState<ClothingItem[]>(INIT_ITEMS);
  const [storeOpen,  setStoreOpen]         = useState(false);

  // Modals
  const [showAddCat,    setShowAddCat]    = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem,   setEditingItem]   = useState<ClothingItem | null>(null);
  const [deletingId,    setDeletingId]    = useState<string | null>(null);
  const [formTab,       setFormTab]       = useState<FormTab>('basic');

  // Forms
  const [itemForm, setItemForm] = useState<ItemForm>(emptyForm());
  const [catForm,  setCatForm]  = useState({ name: '' });
  const [catErr,   setCatErr]   = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ── Computed ──────────────────────────────────────────────────────────────
  const storeItems = useMemo(() => items.filter(i => i.storeId === selectedStore), [items, selectedStore]);

  const filteredItems = useMemo(() => {
    let list = storeItems;
    if (selectedCat !== 'all') list = list.filter(i => i.categoryId === selectedCat);
    if (effectiveSearch.trim()) {
      const q = effectiveSearch.trim().toLowerCase();
      list = list.filter(i => i.name.toLowerCase().includes(q) || i.mnemonicCode.toLowerCase().includes(q));
    }
    return list;
  }, [storeItems, selectedCat, search, searchQuery]);

  const counts = useMemo(() => {
    const c: Record<string,number> = {};
    storeItems.forEach(i => { c[i.categoryId] = (c[i.categoryId]||0)+1; });
    return c;
  }, [storeItems]);

  const totalCount  = storeItems.length;
  const getCat      = (id: string) => categories.find(c => c.id === id);
  const currentStore = STORES.find(s => s.id === selectedStore)!;

  // ── Item Modal ────────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingItem(null);
    setItemForm(emptyForm(selectedCat !== 'all' ? selectedCat : 'B', selectedStore));
    setFormErrors({});
    setFormTab('basic');
    setShowItemModal(true);
  };

  const openEdit = (item: ClothingItem) => {
    setEditingItem(item);
    setItemForm({
      name: item.name, mnemonicCode: item.mnemonicCode,
      categoryId: item.categoryId, storeIds: [item.storeId],
      regularPrice: String(item.regularPrice),
      onlinePrice: String(item.onlinePrice), washCycleDays: String(item.washCycleDays),
      hangArea: item.hangArea, status: item.status,
      allowDiscount: item.allowDiscount, onMiniProgram: item.onMiniProgram,
      inDistribution: item.inDistribution, isBundle: item.isBundle,
      bundleCount: String(item.bundleCount),
      hasSKU: item.hasSKU,
      skus: item.skus.map(s => ({
        id: s.id, name: s.name,
        regularPrice: String(s.regularPrice),
        onlinePrice: String(s.onlinePrice),
      })),
    });
    setFormErrors({});
    setFormTab('basic');
    setShowItemModal(true);
  };

  const validate = (): boolean => {
    const e: Record<string,string> = {};
    if (!itemForm.name.trim())         e.name = '请输入衣物名称';
    if (!itemForm.mnemonicCode.trim()) e.mnemonicCode = '请输入助记码';
    if (!editingItem && itemForm.storeIds.length === 0) e.storeIds = '请至少选择一个门店';
    if (!itemForm.hasSKU) {
      if (!itemForm.regularPrice || +itemForm.regularPrice <= 0) e.regularPrice = '请输入价格';
    } else {
      if (itemForm.skus.length === 0) e.skus = '请至少添加一个规格';
      itemForm.skus.forEach((s, i) => {
        if (!s.name.trim()) e[`sku_name_${i}`] = `规格${i+1}名称不能为空`;
        if (!s.regularPrice || +s.regularPrice <= 0) e[`sku_rp_${i}`] = `规格${i+1}价格无效`;
      });
    }
    setFormErrors(e);
    // Switch to first tab with errors
    const hasBasicErr  = !!(e.name || e.mnemonicCode || e.storeIds);
    const hasPriceErr  = !!(e.regularPrice || e.skus || Object.keys(e).some(k => k.startsWith('sku_')));
    if (hasBasicErr) setFormTab('basic');
    else if (hasPriceErr) setFormTab('price');
    return Object.keys(e).length === 0;
  };

  const saveItem = () => {
    if (!validate()) return;
    const buildItem = (storeId: string, id?: string): ClothingItem => ({
      id: id ?? `i${Date.now()}-${storeId}`,
      storeId, name: itemForm.name.trim(),
      mnemonicCode: itemForm.mnemonicCode.trim().toUpperCase(),
      categoryId: itemForm.categoryId,
      regularPrice: itemForm.hasSKU ? 0 : +itemForm.regularPrice,
      onlinePrice:  itemForm.hasSKU ? 0 : (+itemForm.onlinePrice || 0),
      washCycleDays: +itemForm.washCycleDays || 3,
      hangArea: itemForm.hangArea, status: itemForm.status,
      allowDiscount: itemForm.allowDiscount, onMiniProgram: itemForm.onMiniProgram,
      inDistribution: itemForm.inDistribution,
      isBundle: itemForm.isBundle, bundleCount: +itemForm.bundleCount || 1,
      hasSKU: itemForm.hasSKU,
      skus: itemForm.skus.map(s => ({
        id: s.id, name: s.name.trim(),
        regularPrice: +s.regularPrice, onlinePrice: +s.onlinePrice || 0,
      })),
    });

    let nextItems: ClothingItem[];
    if (editingItem) {
      nextItems = items.map(i => i.id !== editingItem.id ? i : buildItem(editingItem.storeId, editingItem.id));
    } else {
      const added = itemForm.storeIds.map(sid => buildItem(sid));
      nextItems = [...items, ...added];
    }
    setItems(nextItems);
    // 同步到全局 Context（s1 门店数据供下单页读取）
    const syncCatalog = (list: ClothingItem[]): CatalogItem[] =>
      list.filter(i=>i.storeId==='s1').map(i=>({
        id:i.id, name:i.name, mnemonicCode:i.mnemonicCode,
        categoryId:i.categoryId,
        price:i.hasSKU?(i.skus[0]?.regularPrice??0):i.regularPrice,
        status:i.status,
        serviceCycleHours: i.washCycleDays * 24,
      }));
    setCatalog(syncCatalog(nextItems));
    setShowItemModal(false);
  };

  const deleteItem = (id: string) => {
    const next = items.filter(i => i.id !== id);
    setItems(next);
    setCatalog(next.filter(i=>i.storeId==='s1').map(i=>({
      id:i.id, name:i.name, mnemonicCode:i.mnemonicCode, categoryId:i.categoryId,
      price:i.hasSKU?(i.skus[0]?.regularPrice??0):i.regularPrice, status:i.status,
      serviceCycleHours: i.washCycleDays * 24,
    })));
    setDeletingId(null);
  };
  const toggleStatus = (id: string) => {
    setItems(prev => prev.map(i => i.id !== id ? i : { ...i, status: i.status === 'active' ? 'inactive' : 'active' }));
  };

  // SKU
  const addSKU    = () => setItemForm(f => ({ ...f, skus: [...f.skus, { id:`sku-${Date.now()}`, name:'', regularPrice:'', onlinePrice:'' }] }));
  const removeSKU = (id: string) => setItemForm(f => ({ ...f, skus: f.skus.filter(s => s.id !== id) }));
  const updateSKU = (id: string, field: keyof SKUForm, val: string) =>
    setItemForm(f => ({ ...f, skus: f.skus.map(s => s.id === id ? { ...s, [field]: val } : s) }));

  // Category
  const addCategory = () => {
    const name = catForm.name.trim();
    if (!name) { setCatErr('请输入分类名称'); return; }
    // Auto-generate code: find next unused single letter A-Z, else use numeric suffix
    const usedCodes = new Set(categories.map(c => c.code));
    const alphabet  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let autoCode = '';
    for (const ch of alphabet) {
      if (!usedCodes.has(ch)) { autoCode = ch; break; }
    }
    if (!autoCode) {
      let n = 1;
      while (usedCodes.has(`X${n}`)) n++;
      autoCode = `X${n}`;
    }
    setCategories(prev => [...prev, { id: autoCode, code: autoCode, name, color: COLOR_POOL[prev.length % COLOR_POOL.length] }]);
    setShowAddCat(false);
  };

  // ── Field helpers ─────────────────────────────────────────────────────────
  const setF = (key: keyof ItemForm, val: unknown) => setItemForm(f => ({ ...f, [key]: val }));
  const errCls = (key: string) => formErrors[key] ? 'border-red-300 focus:ring-red-400' : 'border-gray-200 focus:ring-orange-400';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full -m-4 sm:-m-5 lg:-m-6 overflow-hidden">

      {/* ── Top Bar ── */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-3.5 bg-white border-b border-gray-200 flex-shrink-0">
        {/* Store selector */}
        <div className="relative">
          <button onClick={() => setStoreOpen(v => !v)}
            className="flex items-center gap-2 pl-3.5 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 shadow-sm active:scale-95 transition-all">
            <span className="size-2 rounded-full" style={{ backgroundColor: '#fd780f' }} />
            <span className="max-w-[120px] truncate">{currentStore.name}</span>
            <ChevronDown className={`size-3.5 text-gray-400 transition-transform ${storeOpen ? 'rotate-180' : ''}`} />
          </button>
          {storeOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setStoreOpen(false)} />
              <div className="absolute top-full left-0 mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 z-20 min-w-[160px]">
                {STORES.map(s => (
                  <button key={s.id} onClick={() => { setSelectedStore(s.id); setStoreOpen(false); setSelectedCat('all'); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 active:scale-[0.98] transition-all"
                    style={{ color: s.id === selectedStore ? '#fd780f' : '#374151' }}>
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: s.id === selectedStore ? '#fd780f' : 'transparent' }} />
                    {s.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex-1" />
        <button onClick={() => { setCatForm({ name:'' }); setCatErr(''); setShowAddCat(true); }}
          className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 active:scale-95 transition-all whitespace-nowrap">
          <Plus className="size-4" /><span className="hidden sm:inline">新增分类</span><span className="sm:hidden">分类</span>
        </button>
        <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-white hover:opacity-90 active:scale-95 transition-all whitespace-nowrap" style={{ backgroundColor: '#fd780f' }}>
          <Plus className="size-4" /><span className="hidden sm:inline">新增衣物</span><span className="sm:hidden">衣物</span>
        </button>
      </div>

      {/* ── Mobile Category Tabs ── */}
      <div className="sm:hidden flex gap-1.5 overflow-x-auto px-4 py-2.5 bg-white border-b border-gray-200 flex-shrink-0" style={{ scrollbarWidth:'none' }}>
        {[{ id:'all', code:'全', name:'全部', color:'#64748b' }, ...categories].map(cat => {
          const count = cat.id === 'all' ? totalCount : (counts[cat.id]||0);
          const active = selectedCat === cat.id;
          return (
            <button key={cat.id} onClick={() => setSelectedCat(cat.id)}
              className="flex-shrink-0 px-3 py-1 rounded-full text-xs border transition-all"
              style={{ backgroundColor: active ? cat.color : 'white', color: active ? 'white' : '#6b7280', borderColor: active ? cat.color : '#e5e7eb' }}>
              {cat.name}&nbsp;({count})
            </button>
          );
        })}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Desktop Sidebar */}
        <div className="hidden sm:flex flex-col w-48 lg:w-52 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
          {/* All */}
          <button onClick={() => setSelectedCat('all')}
            className="flex items-center justify-between px-4 py-2.5 text-sm transition-colors border-r-2"
            style={selectedCat === 'all' ? { color:'#fd780f', borderColor:'#fd780f', backgroundColor:'#fff8f3', fontWeight:500 } : { color:'#4b5563', borderColor:'transparent' }}
            onMouseEnter={e => { if (selectedCat!=='all') (e.currentTarget as HTMLElement).style.backgroundColor='#f9fafb'; }}
            onMouseLeave={e => { if (selectedCat!=='all') (e.currentTarget as HTMLElement).style.backgroundColor=''; }}>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full flex-shrink-0" style={{ backgroundColor: selectedCat==='all' ? '#fd780f' : '#d1d5db' }} />
              <span>全部</span>
            </div>
            <span className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: selectedCat==='all' ? '#fff3e8' : '#f3f4f6', color: selectedCat==='all' ? '#fd780f' : '#9ca3af' }}>
              {totalCount}
            </span>
          </button>

          {categories.map(cat => {
            const active = selectedCat === cat.id;
            const count  = counts[cat.id] || 0;
            return (
              <button key={cat.id} onClick={() => setSelectedCat(cat.id)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors border-r-2"
                style={active ? { color:cat.color, borderColor:cat.color, backgroundColor:alpha(cat.color,.07), fontWeight:500 } : { color:'#4b5563', borderColor:'transparent' }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor='#f9fafb'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor=''; }}>
                <span className="size-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="flex-1 text-left truncate">{cat.name}</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: active ? alpha(cat.color,.15) : '#f3f4f6', color: active ? cat.color : '#9ca3af' }}>
                  {count}
                </span>
              </button>
            );
          })}

          <div className="mt-auto p-3 border-t border-gray-100">
            <button onClick={() => { setCatForm({ name:'' }); setCatErr(''); setShowAddCat(true); }}
              className="w-full flex items-center gap-1 justify-center py-2 text-xs text-gray-400 hover:text-gray-600 border border-dashed border-gray-200 rounded-lg hover:border-gray-300">
              <Plus className="size-3" />新增分类
            </button>
          </div>
        </div>

        {/* ── Table/Cards ── */}
        <div className="flex-1 overflow-auto bg-gray-50">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
              <ImagePlus className="size-10 stroke-1" />
              <p className="text-sm">暂无衣物数据</p>
              <button onClick={openAdd} className="px-4 py-2 rounded-lg text-sm text-white" style={{ backgroundColor:'#fd780f' }}>+ 新增衣物</button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-200 sticky top-0 z-10">
                      <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium w-14">图片</th>
                      <th className="text-left px-3 py-3 text-xs text-gray-500 font-medium">名称</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium w-36">价格</th>
                      <th className="text-center px-3 py-3 text-xs text-gray-500 font-medium w-28">挂区</th>
                      <th className="text-center px-3 py-3 text-xs text-gray-500 font-medium w-20">状态</th>
                      <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium w-20">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredItems.map(item => {
                      const cat = getCat(item.categoryId);
                      const hs  = HANG_STYLE[item.hangArea] ?? DEFAULT_HS;
                      const store = STORES.find(s => s.id === item.storeId);
                      const minSKUPrice = item.hasSKU && item.skus.length > 0 ? Math.min(...item.skus.map(s => s.regularPrice)) : null;
                      return (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          {/* Image */}
                          <td className="px-4 py-3">
                            <div className="size-10 rounded-lg bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-orange-300 transition-colors group">
                              <ImagePlus className="size-4 text-gray-300 group-hover:text-orange-400 transition-colors" />
                            </div>
                          </td>
                          {/* Name */}
                          <td className="px-3 py-3">
                            <p className="text-gray-800">{item.name}</p>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">{item.mnemonicCode}</p>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {cat && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full"
                                  style={{ backgroundColor: alpha(cat.color,.1), color: cat.color }}>
                                  {cat.name}
                                </span>
                              )}
                              {store && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                                  {store.name}
                                </span>
                              )}
                              {item.hasSKU && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600">多规格</span>
                              )}
                              {item.isBundle && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600">{item.bundleCount}件套</span>
                              )}
                            </div>
                          </td>
                          {/* Price */}
                          <td className="px-4 py-3">
                            {item.hasSKU && item.skus.length > 0 ? (
                              <div>
                                <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">{item.skus.length}款规格</span>
                                <p className="text-xs text-gray-400 mt-1">起 ¥{minSKUPrice}</p>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-0.5">
                                <span className="text-sm text-gray-700 tabular-nums">¥{item.regularPrice}</span>
                                {item.onlinePrice > 0 && (
                                  <span className="flex items-center gap-0.5 text-xs text-blue-500 tabular-nums">
                                    <Globe className="size-2.5 flex-shrink-0" />¥{item.onlinePrice}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          {/* Hang area + cycle */}
                          <td className="px-3 py-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="inline-block px-2 py-0.5 rounded-full text-xs whitespace-nowrap"
                                style={{ backgroundColor:hs.bg, color:hs.color }}>{item.hangArea}</span>
                              {item.washCycleDays > 0 && (
                                <span className="flex items-center gap-0.5 text-xs text-gray-400">
                                  <Clock className="size-2.5" />{item.washCycleDays}天
                                </span>
                              )}
                            </div>
                          </td>
                          {/* Status */}
                          <td className="px-3 py-3 text-center">
                            <button onClick={() => toggleStatus(item.id)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors"
                              style={{ backgroundColor: item.status==='active' ? '#f0fdf4' : '#f3f4f6', color: item.status==='active' ? '#16a34a' : '#9ca3af' }}>
                              <span className="size-1.5 rounded-full" style={{ backgroundColor: item.status==='active' ? '#22c55e' : '#d1d5db' }} />
                              {item.status==='active' ? '上架' : '下架'}
                            </button>
                          </td>
                          {/* Actions */}
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Pencil className="size-3.5" /></button>
                              <button onClick={() => setDeletingId(item.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="size-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden p-3 flex flex-col gap-2">
                {filteredItems.map(item => {
                  const cat   = getCat(item.categoryId);
                  const hs    = HANG_STYLE[item.hangArea] ?? DEFAULT_HS;
                  const store = STORES.find(s => s.id === item.storeId);
                  const minSKUPrice = item.hasSKU && item.skus.length > 0 ? Math.min(...item.skus.map(s => s.regularPrice)) : null;
                  return (
                    <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3.5">
                      <div className="flex items-start gap-3">
                        {/* Image placeholder */}
                        <div className="size-12 rounded-xl bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center flex-shrink-0">
                          <ImagePlus className="size-5 text-gray-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm text-gray-800">{item.name}</p>
                              <p className="text-xs text-gray-400 font-mono mt-0.5">{item.mnemonicCode}</p>
                            </div>
                            {/* Price */}
                            <div className="text-right flex-shrink-0">
                              {item.hasSKU && minSKUPrice !== null ? (
                                <div>
                                  <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full">{item.skus.length}款</span>
                                  <p className="text-xs text-gray-400 mt-1">起¥{minSKUPrice}</p>
                                </div>
                              ) : (
                                <div className="flex flex-col items-end gap-0.5">
                                  <span className="text-sm text-gray-700">¥{item.regularPrice}</span>
                                  {item.onlinePrice > 0 && <span className="flex items-center gap-0.5 text-xs text-blue-500"><Globe className="size-2.5" />¥{item.onlinePrice}</span>}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            {cat && <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor:alpha(cat.color,.1), color:cat.color }}>{cat.name}</span>}
                            {store && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{store.name}</span>}
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor:hs.bg, color:hs.color }}>{item.hangArea}</span>
                            <button onClick={() => toggleStatus(item.id)}
                              className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                              style={{ backgroundColor: item.status==='active' ? '#f0fdf4' : '#f3f4f6', color: item.status==='active' ? '#16a34a' : '#9ca3af' }}>
                              <span className="size-1.5 rounded-full" style={{ backgroundColor: item.status==='active' ? '#22c55e' : '#d1d5db' }} />
                              {item.status==='active' ? '上架' : '下架'}
                            </button>
                            <div className="ml-auto flex gap-1">
                              <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"><Pencil className="size-3.5" /></button>
                              <button onClick={() => setDeletingId(item.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="size-3.5" /></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg flex flex-col max-h-[92vh]">

            {/* Modal Header */}
            <div className="flex-shrink-0 border-b border-gray-100">
              <div className="flex items-center justify-between px-5 pt-4 pb-3">
                <h2 className="text-base font-semibold text-gray-800">{editingItem ? '编辑衣物' : '新增衣物'}</h2>
                <button onClick={() => setShowItemModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="size-4 text-gray-500" /></button>
              </div>
              {/* Tabs */}
              <div className="flex px-5 gap-0">
                {([['basic','基础信息'],['price','价格规格'],['sales','销售设置']] as [FormTab,string][]).map(([key,label]) => {
                  const hasErr = key==='basic' ? !!(formErrors.name||formErrors.mnemonicCode||formErrors.storeIds)
                    : key==='price' ? !!(formErrors.regularPrice||formErrors.memberPrice||formErrors.skus||Object.keys(formErrors).some(k=>k.startsWith('sku_')))
                    : false;
                  return (
                    <button key={key} onClick={() => setFormTab(key)}
                      className={`flex items-center gap-1 px-4 py-2.5 text-sm border-b-2 transition-colors ${formTab===key ? 'border-orange-500 font-medium' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                      style={formTab===key ? { color:'#fd780f' } : undefined}>
                      {label}
                      {hasErr && <span className="size-1.5 rounded-full bg-red-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-4">

              {/* ── Tab: 基础信息 ── */}
              {formTab === 'basic' && (
                <>
                  {/* Image upload placeholder */}
                  <div className="flex items-center gap-3">
                    <div className="size-16 rounded-xl bg-gray-100 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-colors flex-shrink-0 group">
                      <ImagePlus className="size-5 text-gray-300 group-hover:text-orange-400 transition-colors" />
                      <span className="text-xs text-gray-300 mt-1 group-hover:text-orange-400 transition-colors">上传图片</span>
                    </div>
                    <div className="text-xs text-gray-400 leading-relaxed">
                      <p>支持 JPG / PNG 格式</p>
                      <p>建议尺寸 200×200px</p>
                      <p className="text-gray-300">（图片上传功能待接入后端）</p>
                    </div>
                  </div>

                  <SectionHeader title="基本信息" />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">衣物名称 <span className="text-red-400">*</span></label>
                      <input value={itemForm.name} onChange={e => setF('name', e.target.value)} placeholder="如 羽绒服"
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${errCls('name')}`} />
                      {formErrors.name && <p className="text-xs text-red-400 mt-1">{formErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">助记码 <span className="text-red-400">*</span></label>
                      <input value={itemForm.mnemonicCode} onChange={e => setF('mnemonicCode', e.target.value.toUpperCase())} placeholder="如 YR"
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 font-mono uppercase ${errCls('mnemonicCode')}`} />
                      {formErrors.mnemonicCode && <p className="text-xs text-red-400 mt-1">{formErrors.mnemonicCode}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">所属分类 <span className="text-red-400">*</span></label>
                    <select value={itemForm.categoryId} onChange={e => setF('categoryId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">
                      {editingItem ? '所属门店' : <>所属门店 <span className="text-red-400">*</span> <span className="text-gray-400 font-normal">（多选，批量创建）</span></>}
                    </label>
                    {editingItem ? (
                      <div className="flex flex-wrap gap-2">
                        {STORES.filter(s => s.id === editingItem.storeId).map(s => (
                          <span key={s.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-gray-200 bg-gray-50 text-gray-600">
                            <span className="size-2 rounded-full" style={{ backgroundColor:'#fd780f' }} />{s.name}
                          </span>
                        ))}
                        <span className="text-xs text-gray-400 self-center">如需更换门店，请删除后重新创建</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap gap-2">
                          {STORES.map(s => {
                            const checked = itemForm.storeIds.includes(s.id);
                            return (
                              <button key={s.id} type="button"
                                onClick={() => setF('storeIds', checked ? itemForm.storeIds.filter(id => id!==s.id) : [...itemForm.storeIds, s.id])}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border-2 transition-all"
                                style={{ backgroundColor: checked ? '#fff8f3' : 'white', borderColor: checked ? '#fd780f' : '#e5e7eb', color: checked ? '#fd780f' : '#6b7280' }}>
                                <div className={`size-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${checked ? 'border-orange-500' : 'border-gray-300'}`}
                                  style={checked ? { backgroundColor:'#fd780f', borderColor:'#fd780f' } : undefined}>
                                  {checked && <svg className="size-2.5 text-white" fill="none" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                </div>
                                {s.name}
                              </button>
                            );
                          })}
                        </div>
                        {formErrors.storeIds && <p className="text-xs text-red-400 mt-1">{formErrors.storeIds}</p>}
                      </>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">洗护周期</label>
                    <div className="flex items-center gap-2">
                      <input type="number" min="0" max="30" value={itemForm.washCycleDays} onChange={e => setF('washCycleDays', e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-center" />
                      <span className="text-sm text-gray-500">天</span>
                      <span className="text-xs text-gray-400">（0 = 即时完成）</span>
                    </div>
                  </div>
                </>
              )}

              {/* ── Tab: 价格规格 ── */}
              {formTab === 'price' && (
                <>
                  <SectionHeader title="规格设置" />
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-700">启用多规格 SKU</p>
                      <p className="text-xs text-gray-400 mt-0.5">开启后可设置尺码/材质等独立规格及价格</p>
                    </div>
                    <ToggleSwitch checked={itemForm.hasSKU} onChange={() => setF('hasSKU', !itemForm.hasSKU)} />
                  </div>

                  {!itemForm.hasSKU ? (
                    <>
                      <SectionHeader title="价格设置" />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1.5">价格 <span className="text-red-400">*</span></label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">¥</span>
                            <input type="number" min="0" step="0.5" placeholder="0" value={itemForm.regularPrice} onChange={e => setF('regularPrice', e.target.value)}
                              className={`w-full pl-5 pr-2 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${errCls('regularPrice')}`} />
                          </div>
                          {formErrors.regularPrice && <p className="text-xs text-red-400 mt-1">{formErrors.regularPrice}</p>}
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1.5 flex items-center gap-0.5"><Globe className="size-3 text-blue-400" />线上价</label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-blue-400">¥</span>
                            <input type="number" min="0" step="0.5" placeholder="0" value={itemForm.onlinePrice} onChange={e => setF('onlinePrice', e.target.value)}
                              className="w-full pl-5 pr-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <SectionHeader title="规格 SKU 列表" />
                      {/* SKU Header */}
                      {itemForm.skus.length > 0 && (
                        <div className="grid gap-1" style={{ gridTemplateColumns:'1fr 80px 80px 28px' }}>
                          <span className="text-xs text-gray-400 px-1">规格名称</span>
                          <span className="text-xs text-gray-400 text-center">价格</span>
                          <span className="text-xs text-gray-400 text-center">线上价</span>
                          <span />
                        </div>
                      )}
                      <div className="flex flex-col gap-2">
                        {itemForm.skus.map((sku, i) => (
                          <div key={sku.id} className="grid gap-1.5 items-start" style={{ gridTemplateColumns:'1fr 80px 80px 28px' }}>
                            <div>
                              <input value={sku.name} onChange={e => updateSKU(sku.id,'name',e.target.value)} placeholder={`规格${i+1}`}
                                className={`w-full px-2.5 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-400 ${formErrors[`sku_name_${i}`] ? 'border-red-300' : 'border-gray-200'}`} />
                            </div>
                            {(['regularPrice','onlinePrice'] as (keyof SKUForm)[]).map((field,fi) => (
                              <div key={field} className="relative">
                                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: fi===1 ? '#60a5fa' : '#9ca3af' }}>¥</span>
                                <input type="number" min="0" step="0.5" placeholder="0" value={sku[field]} onChange={e => updateSKU(sku.id,field,e.target.value)}
                                  className={`w-full pl-4 pr-1 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-400 ${formErrors[`sku_rp_${i}`] && field==='regularPrice' ? 'border-red-300' : 'border-gray-200'}`} />
                              </div>
                            ))}
                            <button onClick={() => removeSKU(sku.id)} className="self-center p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors">
                              <X className="size-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      {formErrors.skus && <p className="text-xs text-red-400">{formErrors.skus}</p>}
                      <button onClick={addSKU}
                        className="flex items-center gap-1.5 text-sm py-2 px-3 border border-dashed border-gray-200 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors w-full justify-center">
                        <Plus className="size-3.5" />添加规格
                      </button>
                    </>
                  )}

                  <SectionHeader title="折扣设置" />
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-lg flex items-center justify-center" style={{ backgroundColor:'#fff3e8' }}>
                        <Percent className="size-3.5" style={{ color:'#fd780f' }} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-700">允许折扣</p>
                        <p className="text-xs text-gray-400">此衣物可参与会员折扣和活动优惠</p>
                      </div>
                    </div>
                    <ToggleSwitch checked={itemForm.allowDiscount} onChange={() => setF('allowDiscount', !itemForm.allowDiscount)} />
                  </div>
                </>
              )}

              {/* ── Tab: 销售设置 ── */}
              {formTab === 'sales' && (
                <>
                  <SectionHeader title="挂区设置" />
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">挂区类型 <span className="text-red-400">*</span></label>
                    <div className="flex gap-2">
                      {HANG_AREAS.map(area => {
                        const hs  = HANG_STYLE[area] ?? DEFAULT_HS;
                        const sel = itemForm.hangArea === area;
                        return (
                          <button key={area} type="button" onClick={() => setF('hangArea', area)}
                            className="flex-1 py-2.5 rounded-xl text-xs border-2 transition-all"
                            style={{ backgroundColor: sel ? hs.bg : 'white', color: sel ? hs.color : '#9ca3af', borderColor: sel ? hs.color : '#e5e7eb' }}>
                            {area}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <SectionHeader title="销售属性" />

                  <ToggleRow icon={Package} label="多件套餐" sub="开启后客户可按套餐件数收单" checked={itemForm.isBundle} onChange={() => setF('isBundle', !itemForm.isBundle)}>
                    {itemForm.isBundle && (
                      <div className="flex items-center gap-1">
                        <input type="number" min="1" max="99" value={itemForm.bundleCount} onChange={e => setF('bundleCount', e.target.value)}
                          className="w-14 px-2 py-1 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-1 focus:ring-orange-400" />
                        <span className="text-xs text-gray-500">件</span>
                      </div>
                    )}
                  </ToggleRow>

                  <div className="border-t border-gray-100" />

                  <ToggleRow icon={Smartphone} label="上架小程序" sub="在微信小程序客户端展示此服务" checked={itemForm.onMiniProgram} onChange={() => setF('onMiniProgram', !itemForm.onMiniProgram)} />

                  <div className="border-t border-gray-100" />

                  <ToggleRow icon={Share2} label="参与分销" sub="允许分销员推广并获得佣金" checked={itemForm.inDistribution} onChange={() => setF('inDistribution', !itemForm.inDistribution)} />

                  <SectionHeader title="上架状态" />
                  <div className="flex gap-2">
                    {(['active','inactive'] as ItemStatus[]).map(s => {
                      const sel = itemForm.status === s;
                      return (
                        <button key={s} type="button" onClick={() => setF('status', s)}
                          className="flex-1 py-2.5 rounded-xl text-sm border-2 flex items-center justify-center gap-2 transition-all"
                          style={{ backgroundColor: sel ? (s==='active' ? '#f0fdf4' : '#f9fafb') : 'white', color: sel ? (s==='active' ? '#16a34a' : '#9ca3af') : '#9ca3af', borderColor: sel ? (s==='active' ? '#22c55e' : '#d1d5db') : '#e5e7eb' }}>
                          <span className="size-2 rounded-full" style={{ backgroundColor: s==='active' ? '#22c55e' : '#d1d5db' }} />
                          {s==='active' ? '上架' : '下架'}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 flex gap-2 px-5 py-4 border-t border-gray-100">
              <button onClick={() => setShowItemModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={saveItem} className="flex-1 py-2.5 rounded-xl text-sm text-white hover:opacity-90" style={{ backgroundColor:'#fd780f' }}>
                {editingItem ? '保存修改' : `确认新增${!editingItem && itemForm.storeIds.length > 1 ? `（${itemForm.storeIds.length}家门店）` : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-800">新增分类</h2>
              <button onClick={() => setShowAddCat(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="size-4 text-gray-500" /></button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">分类名称 <span className="text-red-400">*</span></label>
                <input type="text" placeholder="如 婚纱礼服" value={catForm.name} onChange={e => { setCatForm({ name: e.target.value }); setCatErr(''); }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" autoFocus />
              </div>
              {catErr && <p className="text-xs text-red-400">{catErr}</p>}
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowAddCat(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={addCategory} className="flex-1 py-2.5 rounded-xl text-sm text-white hover:opacity-90" style={{ backgroundColor:'#fd780f' }}>确认新增</button>
            </div>
          </div>
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 text-center">
            <div className="size-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="size-5 text-red-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 mb-1.5">确认删除此衣物？</h3>
            <p className="text-sm text-gray-400 mb-5">删除后价格数据将无法恢复</p>
            <div className="flex gap-2">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={() => deleteItem(deletingId)} className="flex-1 py-2.5 rounded-xl text-sm text-white bg-red-500 hover:bg-red-600">确认删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
