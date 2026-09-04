import { useState } from 'react';
import {
  Plus, Pencil, Trash2, X, Check,
  Gift, Tag, Megaphone, Ticket, Users, Bell,
  Calendar, ChevronDown, ChevronUp, Info, Store,
} from 'lucide-react';

/* ══════════════════════════════════════
   类型定义
══════════════════════════════════════ */
type RuleType = 'gift' | 'discount';
type PageTab  = 'gift' | 'discount' | 'activity' | 'coupon' | 'member' | 'notify';

interface GiftTier     { id: string; minAmount: number; bonusAmount: number; couponIds: string[]; }
interface DiscountTier { id: string; minAmount: number; discountRate: number; }

interface BaseRule {
  id: string; name: string; enabled: boolean;
  categories: string[]; storeIds: string[];
  hasExpiry: boolean; startDate?: string; endDate?: string;
}
interface GiftRule     extends BaseRule { type: 'gift';     tiers: GiftTier[];     }
interface DiscountRule extends BaseRule { type: 'discount'; tiers: DiscountTier[]; }
type RechargeRule = GiftRule | DiscountRule;

/* ══════════════════════════════════════
   常量
══════════════════════════════════════ */
const CATEGORIES = [
  { id: 'top',     label: '上衣/衬衣' },
  { id: 'bottom',  label: '裤子/裙子' },
  { id: 'coat',    label: '外套/大衣' },
  { id: 'suit',    label: '西装/正装' },
  { id: 'down',    label: '羽绒服'    },
  { id: 'leather', label: '皮衣/皮草' },
  { id: 'home',    label: '家纺/窗帘' },
  { id: 'wedding', label: '婚纱/礼服' },
  { id: 'bags',    label: '鞋包/配件' },
];

const STORES = [
  { id: 's1', label: '总店（旗舰）' },
  { id: 's2', label: '分店·东区'   },
  { id: 's3', label: '分店·西区'   },
];

const COUPONS = [
  { id: 'cp1', label: '满100减20元券' },
  { id: 'cp2', label: '西装护理8折券' },
  { id: 'cp3', label: '免费取送券'    },
  { id: 'cp4', label: '羽绒服清洗券'  },
  { id: 'cp5', label: '皮具护理券'    },
];

const PAGE_TABS: { id: PageTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'gift',     label: '充值赠送', icon: Gift       },
  { id: 'discount', label: '充值打折', icon: Tag        },
  { id: 'activity', label: '活动管理', icon: Megaphone  },
  { id: 'coupon',   label: '优惠券',   icon: Ticket     },
  { id: 'member',   label: '会员营销', icon: Users      },
  { id: 'notify',   label: '消息推送', icon: Bell       },
];

const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

/* ══════════════════════════════════════
   Mock 初始数据
══════════════════════════════════════ */
const INIT_RULES: RechargeRule[] = [
  {
    id: 'r1', type: 'gift', name: '新春充值赠送活动', enabled: true,
    tiers: [
      { id: 't1', minAmount: 100,  bonusAmount: 10,  couponIds: []            },
      { id: 't2', minAmount: 500,  bonusAmount: 60,  couponIds: ['cp1']       },
      { id: 't3', minAmount: 1000, bonusAmount: 150, couponIds: ['cp1','cp3'] },
    ],
    categories: ['all'], storeIds: ['all'],
    hasExpiry: true, startDate: '2025-01-20', endDate: '2025-02-28',
  },
  {
    id: 'r2', type: 'gift', name: '会员专属充值礼包', enabled: false,
    tiers: [
      { id: 't4', minAmount: 200,  bonusAmount: 30,  couponIds: ['cp2']       },
      { id: 't5', minAmount: 1000, bonusAmount: 200, couponIds: ['cp2','cp4'] },
    ],
    categories: ['suit','leather','wedding'], storeIds: ['s1'],
    hasExpiry: false,
  },
  {
    id: 'r3', type: 'discount', name: '高端服装护理折扣', enabled: true,
    tiers: [
      { id: 't6', minAmount: 500,  discountRate: 9   },
      { id: 't7', minAmount: 1000, discountRate: 8.5 },
      { id: 't8', minAmount: 2000, discountRate: 8   },
    ],
    categories: ['suit','leather','wedding','down'], storeIds: ['all'],
    hasExpiry: false,
  },
  {
    id: 'r4', type: 'discount', name: '春季家纺护理折扣', enabled: false,
    tiers: [
      { id: 't9',  minAmount: 300, discountRate: 9.5 },
      { id: 't10', minAmount: 800, discountRate: 9   },
    ],
    categories: ['home'], storeIds: ['s1','s2'],
    hasExpiry: true, startDate: '2025-03-01', endDate: '2025-05-31',
  },
];

/* ══════════════════════════════════════
   表单数据结构
══════════════════════════════════════ */
interface TierDraft {
  id: string;
  minAmount: string;
  bonusAmount: string;
  discountRate: string;
  couponIds: string[];
}
interface FormDraft {
  name: string;
  tiers: TierDraft[];
  allCategories: boolean;
  categories: string[];
  allStores: boolean;
  storeIds: string[];
  hasExpiry: boolean;
  startDate: string;
  endDate: string;
}

function emptyForm(type: RuleType): FormDraft {
  return {
    name: '',
    tiers: [{ id: genId(), minAmount: '', bonusAmount: '', discountRate: '', couponIds: [] }],
    allCategories: type === 'gift',
    categories: [],
    allStores: true,
    storeIds: [],
    hasExpiry: false,
    startDate: '',
    endDate: '',
  };
}

function ruleToForm(rule: RechargeRule): FormDraft {
  return {
    name: rule.name,
    tiers: rule.tiers.map(t => ({
      id: t.id,
      minAmount:    String(t.minAmount),
      bonusAmount:  rule.type === 'gift'     ? String((t as GiftTier).bonusAmount)    : '',
      discountRate: rule.type === 'discount' ? String((t as DiscountTier).discountRate) : '',
      couponIds:    rule.type === 'gift'     ? (t as GiftTier).couponIds              : [],
    })),
    allCategories: rule.categories.includes('all'),
    categories:    rule.categories.filter(c => c !== 'all'),
    allStores:     rule.storeIds.includes('all'),
    storeIds:      rule.storeIds.filter(s => s !== 'all'),
    hasExpiry:     rule.hasExpiry,
    startDate:     rule.startDate ?? '',
    endDate:       rule.endDate   ?? '',
  };
}

function formToRule(draft: FormDraft, type: RuleType, editId: string, prevEnabled: boolean): RechargeRule {
  const base: BaseRule = {
    id: editId,
    name: draft.name.trim(),
    enabled: prevEnabled,
    categories: draft.allCategories ? ['all'] : draft.categories,
    storeIds:   draft.allStores      ? ['all'] : draft.storeIds,
    hasExpiry:  draft.hasExpiry,
    startDate:  draft.hasExpiry ? draft.startDate : undefined,
    endDate:    draft.hasExpiry ? draft.endDate   : undefined,
  };
  const sorted = [...draft.tiers].sort((a, b) => parseFloat(a.minAmount) - parseFloat(b.minAmount));
  if (type === 'gift') {
    return {
      ...base, type: 'gift',
      tiers: sorted.map(t => ({
        id: t.id,
        minAmount:   parseFloat(t.minAmount),
        bonusAmount: parseFloat(t.bonusAmount),
        couponIds:   t.couponIds,
      })),
    };
  }
  return {
    ...base, type: 'discount',
    tiers: sorted.map(t => ({
      id: t.id,
      minAmount:    parseFloat(t.minAmount),
      discountRate: parseFloat(t.discountRate),
    })),
  };
}

/* ══════════════════════════════════════
   小型通用组件
══════════════════════════════════════ */
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onChange(!checked); }}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${checked ? '' : 'bg-slate-200'}`}
      style={checked ? { backgroundColor: '#fd780f' } : {}}
    >
      <span className={`h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
    </button>
  );
}

function PillToggle({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
        active ? 'text-white border-transparent' : 'text-slate-500 border-slate-200 hover:border-slate-300 bg-white'
      }`}
      style={active ? { backgroundColor: '#fd780f' } : {}}
    >
      {label}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-slate-500 mb-2">{children}</p>;
}

const inputCls = 'h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all';

/* ══════════════════════════════════════
   RuleCard
══════════════════════════════════════ */
function RuleCard({ rule, onToggle, onEdit, onDelete }: {
  rule: RechargeRule;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isGift = rule.type === 'gift';
  const cats = rule.categories.includes('all')
    ? [{ id: 'all', label: '全部分类' }]
    : CATEGORIES.filter(c => rule.categories.includes(c.id));
  const showCats = cats.slice(0, 3);
  const storeLabel = rule.storeIds.includes('all')
    ? '全部门店'
    : STORES.filter(s => rule.storeIds.includes(s.id)).map(s => s.label).join('、');
  const validLabel = rule.hasExpiry
    ? `${rule.startDate} 至 ${rule.endDate}`
    : '长期有效';

  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${!rule.enabled ? 'opacity-65' : ''}`}>
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: isGift ? '#fff3e8' : '#f0f4ff' }}>
          {isGift
            ? <Gift    className="size-3.5" style={{ color: '#fd780f' }} />
            : <Tag     className="size-3.5" style={{ color: '#4f6ef7' }} />
          }
        </div>
        <span className="text-sm text-slate-800 flex-1 truncate min-w-0">{rule.name}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="hidden sm:block text-xs text-slate-400">{rule.enabled ? '已启用' : '已停用'}</span>
          <ToggleSwitch checked={rule.enabled} onChange={onToggle} />
          <div className="w-px h-4 bg-slate-200 mx-0.5" />
          <button onClick={onEdit}
            className="p-1.5 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-colors">
            <Pencil className="size-3.5" />
          </button>
          <button onClick={onDelete}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Tiers */}
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-xs text-slate-400 mb-2">充值阶梯</p>
        <div className="flex flex-wrap gap-2">
          {isGift
            ? (rule as GiftRule).tiers.map(t => (
                <div key={t.id} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-50 border border-orange-100">
                  <span className="text-xs text-slate-600">充满¥{t.minAmount}</span>
                  <span className="text-xs text-slate-300 mx-0.5">→</span>
                  <span className="text-xs" style={{ color: '#fd780f' }}>赠¥{t.bonusAmount}</span>
                  {t.couponIds.length > 0 && (
                    <span className="text-xs text-orange-400 ml-0.5">+{t.couponIds.length}券</span>
                  )}
                </div>
              ))
            : (rule as DiscountRule).tiers.map(t => (
                <div key={t.id} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100">
                  <span className="text-xs text-slate-600">充满¥{t.minAmount}</span>
                  <span className="text-xs text-slate-300 mx-0.5">→</span>
                  <span className="text-xs text-indigo-500">享{t.discountRate}折</span>
                </div>
              ))
          }
        </div>
      </div>

      {/* Meta */}
      <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="flex items-start gap-1.5">
          <span className="text-xs text-slate-400 flex-shrink-0 mt-0.5">适用分类</span>
          <div className="flex flex-wrap gap-1">
            {showCats.map(c => (
              <span key={c.id} className={`text-xs px-2 py-0.5 rounded-full ${
                c.id === 'all' ? 'bg-orange-50 text-orange-500' : 'bg-slate-100 text-slate-500'
              }`}>{c.label}</span>
            ))}
            {cats.length > 3 && <span className="text-xs text-slate-400 self-center">+{cats.length - 3}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 flex-shrink-0">适用门店</span>
          <span className="text-xs text-slate-600">{storeLabel}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 flex-shrink-0">有效期</span>
          <span className={`text-xs ${rule.hasExpiry ? 'text-slate-600' : 'text-emerald-600'}`}>{validLabel}</span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   AddEditModal
══════════════════════════════════════ */
function AddEditModal({ type, editId, initialForm, onSave, onClose }: {
  type: RuleType;
  editId?: string;
  initialForm: FormDraft;
  onSave: (draft: FormDraft) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormDraft>(initialForm);
  const [error, setError] = useState('');
  const [expandedTierId, setExpandedTierId] = useState<string | null>(null);

  const isGift = type === 'gift';

  /* ── Tier helpers ── */
  const addTier = () => setForm(f => ({
    ...f,
    tiers: [...f.tiers, { id: genId(), minAmount: '', bonusAmount: '', discountRate: '', couponIds: [] }],
  }));

  const removeTier = (id: string) =>
    setForm(f => ({ ...f, tiers: f.tiers.filter(t => t.id !== id) }));

  const updateTier = (id: string, patch: Partial<TierDraft>) =>
    setForm(f => ({ ...f, tiers: f.tiers.map(t => t.id === id ? { ...t, ...patch } : t) }));

  const toggleTierCoupon = (tierId: string, couponId: string) => {
    setForm(f => ({
      ...f,
      tiers: f.tiers.map(t => {
        if (t.id !== tierId) return t;
        const has = t.couponIds.includes(couponId);
        return { ...t, couponIds: has ? t.couponIds.filter(c => c !== couponId) : [...t.couponIds, couponId] };
      }),
    }));
  };

  /* ── Category / Store helpers ── */
  const toggleCat = (id: string) => {
    setForm(f => {
      const has = f.categories.includes(id);
      return { ...f, categories: has ? f.categories.filter(c => c !== id) : [...f.categories, id] };
    });
  };
  const toggleStore = (id: string) => {
    setForm(f => {
      const has = f.storeIds.includes(id);
      return { ...f, storeIds: has ? f.storeIds.filter(s => s !== id) : [...f.storeIds, id] };
    });
  };

  /* ── Validation ── */
  const validate = (): string | null => {
    if (!form.name.trim()) return '请输入规则名称';
    if (form.tiers.length === 0) return '请至少添加一个充值阶梯';
    for (const t of form.tiers) {
      if (!t.minAmount || isNaN(parseFloat(t.minAmount)) || parseFloat(t.minAmount) <= 0)
        return '阶梯充值金额须大于 0';
      if (isGift) {
        if (!t.bonusAmount || isNaN(parseFloat(t.bonusAmount)) || parseFloat(t.bonusAmount) <= 0)
          return '赠送金额须大于 0';
      } else {
        const r = parseFloat(t.discountRate);
        if (isNaN(r) || r < 1 || r > 9.9) return '折扣须在 1 ~ 9.9 折之间';
      }
    }
    const amounts = form.tiers.map(t => parseFloat(t.minAmount));
    if (new Set(amounts).size !== amounts.length) return '各阶梯充值金额不能重复';
    if (!isGift && form.categories.length === 0) return '充值打折须选择至少一个适用分类';
    if (!form.allStores && form.storeIds.length === 0) return '请选择至少一个适用门店';
    if (form.hasExpiry) {
      if (!form.startDate || !form.endDate) return '请填写完整的有效期日期';
      if (new Date(form.startDate) >= new Date(form.endDate)) return '结束日期须晚于开始日期';
    }
    return null;
  };

  const handleSave = () => {
    const err = validate();
    if (err) { setError(err); return; }
    onSave(form);
  };

  /* ── JSX ── */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.38)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">

        {/* Sticky header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: isGift ? '#fff3e8' : '#f0f4ff' }}>
              {isGift
                ? <Gift className="size-3.5" style={{ color: '#fd780f' }} />
                : <Tag  className="size-3.5" style={{ color: '#4f6ef7' }} />
              }
            </div>
            <span className="text-sm text-slate-800">
              {editId ? '编辑' : '新增'}{isGift ? '充值赠送' : '充值打折'}规则
            </span>
          </div>
          <button onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="size-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* ① 规则名称 */}
          <div>
            <SectionLabel>规则名称 <span className="text-red-400">*</span></SectionLabel>
            <input type="text" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder={isGift ? '如：春节充值赠送活动' : '如：高端服装护理折扣'}
              className={`w-full ${inputCls}`} />
          </div>

          {/* ② 充值阶梯 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <SectionLabel>充值阶梯 <span className="text-red-400">*</span></SectionLabel>
              {isGift && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Info className="size-3" />升档后旧余额自动合并享新折扣
                </span>
              )}
            </div>
            <div className="space-y-2.5">
              {form.tiers.map((tier, idx) => (
                <div key={tier.id} className={`rounded-xl border ${isGift ? 'border-orange-100 bg-orange-50/40' : 'border-indigo-100 bg-indigo-50/40'} overflow-hidden`}>
                  {/* Tier main row */}
                  <div className="flex items-center gap-2 p-3 flex-wrap">
                    <span className="text-xs text-slate-400 flex-shrink-0">第{idx + 1}档</span>
                    <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-xs text-slate-500">充满</span>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">¥</span>
                          <input type="number" min="0" value={tier.minAmount}
                            onChange={e => updateTier(tier.id, { minAmount: e.target.value })}
                            placeholder="0"
                            className={`w-24 ${inputCls} pl-6 text-xs`} />
                        </div>
                        <span className="text-xs text-slate-500">元</span>
                      </div>
                      <span className="text-xs text-slate-400">→</span>
                      {isGift ? (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-xs text-slate-500">赠送</span>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">¥</span>
                            <input type="number" min="0" value={tier.bonusAmount}
                              onChange={e => updateTier(tier.id, { bonusAmount: e.target.value })}
                              placeholder="0"
                              className={`w-24 ${inputCls} pl-6 text-xs`} />
                          </div>
                          <span className="text-xs text-slate-500">元</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-xs text-slate-500">享</span>
                          <input type="number" min="1" max="9.9" step="0.1" value={tier.discountRate}
                            onChange={e => updateTier(tier.id, { discountRate: e.target.value })}
                            placeholder="9"
                            className={`w-20 ${inputCls} text-xs`} />
                          <span className="text-xs text-slate-500">折优惠</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {isGift && (
                        <button
                          onClick={() => setExpandedTierId(expandedTierId === tier.id ? null : tier.id)}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg text-slate-500 hover:bg-white border border-slate-200 bg-white/60 transition-colors"
                        >
                          <span>赠券</span>
                          {tier.couponIds.length > 0 && (
                            <span className="text-orange-500">({tier.couponIds.length})</span>
                          )}
                          {expandedTierId === tier.id
                            ? <ChevronUp className="size-3" />
                            : <ChevronDown className="size-3" />
                          }
                        </button>
                      )}
                      {form.tiers.length > 1 && (
                        <button onClick={() => removeTier(tier.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white transition-colors">
                          <X className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Coupon selection (expandable) */}
                  {isGift && expandedTierId === tier.id && (
                    <div className="px-3 pb-3 border-t border-orange-100">
                      <p className="text-xs text-slate-400 mt-2 mb-2">选择赠送优惠券（可多选）</p>
                      <div className="flex flex-wrap gap-2">
                        {COUPONS.map(cp => {
                          const active = tier.couponIds.includes(cp.id);
                          return (
                            <button key={cp.id} onClick={() => toggleTierCoupon(tier.id, cp.id)}
                              className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                                active
                                  ? 'text-white border-transparent'
                                  : 'text-slate-500 border-slate-200 bg-white hover:border-slate-300'
                              }`}
                              style={active ? { backgroundColor: '#fd780f' } : {}}>
                              {cp.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button onClick={addTier}
                className="w-full py-2 rounded-xl border border-dashed border-slate-300 text-xs text-slate-400 hover:border-orange-300 hover:text-orange-400 transition-colors">
                + 添加阶梯
              </button>
            </div>
          </div>

          {/* ③ 适用衣物分类 */}
          <div>
            <SectionLabel>
              适用衣物分类 <span className="text-red-400">*</span>
              {!isGift && <span className="text-slate-400 ml-1 font-normal">（折扣仅对勾选分类生效）</span>}
            </SectionLabel>
            {isGift && (
              <div className="mb-2">
                <PillToggle
                  active={form.allCategories}
                  label="全部分类"
                  onClick={() => setForm(f => ({ ...f, allCategories: !f.allCategories, categories: [] }))}
                />
              </div>
            )}
            {(!isGift || !form.allCategories) && (
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <PillToggle key={cat.id}
                    active={form.categories.includes(cat.id)}
                    label={cat.label}
                    onClick={() => toggleCat(cat.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ④ 适用门店 */}
          <div>
            <SectionLabel>适用门店</SectionLabel>
            <div className="mb-2">
              <PillToggle
                active={form.allStores}
                label="全部门店"
                onClick={() => setForm(f => ({ ...f, allStores: !f.allStores, storeIds: [] }))}
              />
            </div>
            {!form.allStores && (
              <div className="flex flex-wrap gap-2">
                {STORES.map(s => (
                  <PillToggle key={s.id}
                    active={form.storeIds.includes(s.id)}
                    label={s.label}
                    onClick={() => toggleStore(s.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ⑤ 有效期 */}
          <div>
            <SectionLabel>有效期</SectionLabel>
            <div className="flex gap-2 mb-2 flex-wrap">
              <PillToggle active={!form.hasExpiry} label="长期有效"
                onClick={() => setForm(f => ({ ...f, hasExpiry: false }))} />
              <PillToggle active={form.hasExpiry}  label="限时活动"
                onClick={() => setForm(f => ({ ...f, hasExpiry: true  }))} />
            </div>
            {form.hasExpiry && (
              <div className="flex items-center gap-2 flex-wrap">
                <input type="date" value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  className={`flex-1 min-w-[130px] ${inputCls}`} />
                <span className="text-xs text-slate-400">至</span>
                <input type="date" value={form.endDate}
                  onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  className={`flex-1 min-w-[130px] ${inputCls}`} />
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
              <X className="size-3.5 text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Sticky footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100 flex-shrink-0">
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-100 transition-colors">
            取消
          </button>
          <button onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-white transition-all active:scale-95"
            style={{ backgroundColor: '#fd780f' }}>
            <Check className="size-3.5" />
            {editId ? '保存修改' : '确认新增'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   Coming Soon 占位页
══════════════════════════════════════ */
function ComingSoon({ icon: Icon, title, desc }: {
  icon: React.FC<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
        style={{ backgroundColor: '#fff3e8' }}>
        <Icon className="size-6" style={{ color: '#fd780f' }} />
      </div>
      <p className="text-sm text-slate-700 mb-1">{title}</p>
      <p className="text-xs text-slate-400 mb-4">{desc}</p>
      <span className="px-4 py-1.5 rounded-full text-xs text-white" style={{ backgroundColor: '#fd780f' }}>
        功能开发中，敬请期待
      </span>
    </div>
  );
}

/* ══════════════════════════════════════
   主组件
══════════════════════════════════════ */
export default function MarketingManage() {
  const [activeTab, setActiveTab] = useState<PageTab>('gift');
  const [rules, setRules] = useState<RechargeRule[]>(INIT_RULES);

  const [modal, setModal] = useState<{
    open: boolean; type: RuleType; editId?: string; form: FormDraft;
  }>({ open: false, type: 'gift', form: emptyForm('gift') });

  const [delConfirm, setDelConfirm] = useState<{ id: string; name: string } | null>(null);

  const giftRules    = rules.filter(r => r.type === 'gift');
  const discountRules = rules.filter(r => r.type === 'discount');

  /* ── Handlers ── */
  const openAdd = (type: RuleType) => {
    setModal({ open: true, type, form: emptyForm(type) });
  };

  const openEdit = (rule: RechargeRule) => {
    setModal({ open: true, type: rule.type, editId: rule.id, form: ruleToForm(rule) });
  };

  const handleToggle = (id: string) => {
    const target = rules.find(r => r.id === id)!;
    const type   = target.type;
    // Only one rule enabled per type
    setRules(r => r.map(rule => {
      if (rule.type !== type) return rule;
      return { ...rule, enabled: rule.id === id ? !target.enabled : false };
    }));
  };

  const handleSave = (draft: FormDraft) => {
    const isNew = !modal.editId;
    const id    = modal.editId ?? genId();
    const prev  = isNew ? false : (rules.find(r => r.id === id)?.enabled ?? false);
    const newRule = formToRule(draft, modal.type, id, prev);
    setRules(r => isNew ? [...r, newRule] : r.map(rule => rule.id === id ? newRule : rule));
    setModal(m => ({ ...m, open: false }));
  };

  const handleDelete = () => {
    if (!delConfirm) return;
    setRules(r => r.filter(rule => rule.id !== delConfirm.id));
    setDelConfirm(null);
  };

  /* ── Render rule list ── */
  const renderRuleList = (type: RuleType) => {
    const list = type === 'gift' ? giftRules : discountRules;
    const activeCount = list.filter(r => r.enabled).length;
    return (
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">共 {list.length} 条规则</span>
            {activeCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-500">
                {activeCount} 条启用中
              </span>
            )}
          </div>
          <button onClick={() => openAdd(type)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-white transition-all active:scale-95"
            style={{ backgroundColor: '#fd780f' }}>
            <Plus className="size-3.5" />
            新增规则
          </button>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <Info className="size-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400 leading-relaxed">
            {type === 'gift'
              ? '同类型规则同时仅一条生效，启用新规则将自动停用其他规则。充值赠送余额可按规则设定的适用分类消费。'
              : '同类型规则同时仅一条生效。折扣仅对规则中勾选的衣物分类生效，升档后旧余额自动合并享新折扣。'
            }
          </p>
        </div>

        {/* Rule cards */}
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 bg-white rounded-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: '#fff3e8' }}>
              {type === 'gift' ? <Gift className="size-5" style={{ color: '#fd780f' }} /> : <Tag className="size-5" style={{ color: '#fd780f' }} />}
            </div>
            <p className="text-sm text-slate-500 mb-1">暂无规则</p>
            <p className="text-xs text-slate-400">点击右上角「新增规则」开始配置</p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map(rule => (
              <RuleCard
                key={rule.id}
                rule={rule}
                onToggle={() => handleToggle(rule.id)}
                onEdit={() => openEdit(rule)}
                onDelete={() => setDelConfirm({ id: rule.id, name: rule.name })}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ── JSX ── */
  return (
    <div className="max-w-3xl mx-auto">
      {/* Page header */}
      <div className="mb-5 lg:mb-6">
        <h1 className="text-xl text-slate-800">营销管理</h1>
        <p className="text-sm text-slate-400 mt-0.5">充值规则 · 活动配置 · 优惠券 · 会员营销</p>
      </div>

      {/* Tab bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-5">
        <div className="overflow-x-auto">
          <div className="flex min-w-max border-b border-gray-100">
            {PAGE_TABS.map(tab => {
              const Icon   = tab.icon;
              const active = activeTab === tab.id;
              const isFunctional = tab.id === 'gift' || tab.id === 'discount';
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-5 py-3.5 text-sm whitespace-nowrap transition-colors ${
                    active ? 'text-orange-500' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}>
                  <Icon className="size-3.5" />
                  {tab.label}
                  {!isFunctional && (
                    <span className="text-[9px] px-1 py-0.5 rounded bg-slate-100 text-slate-400">即将</span>
                  )}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                      style={{ backgroundColor: '#fd780f' }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="p-4 sm:p-5">
          {activeTab === 'gift'     && renderRuleList('gift')}
          {activeTab === 'discount' && renderRuleList('discount')}
          {activeTab === 'activity' && <ComingSoon icon={Megaphone} title="活动管理" desc="限时折扣、满减、买赠等促销活动配置" />}
          {activeTab === 'coupon'   && <ComingSoon icon={Ticket}    title="优惠券管理" desc="发放和追踪现金券、折扣券、品类专享券" />}
          {activeTab === 'member'   && <ComingSoon icon={Users}     title="会员营销" desc="定向向指定会员群体推送专属优惠" />}
          {activeTab === 'notify'   && <ComingSoon icon={Bell}      title="消息推送" desc="短信 / 微信通知新活动与到期提醒" />}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal.open && (
        <AddEditModal
          type={modal.type}
          editId={modal.editId}
          initialForm={modal.form}
          onSave={handleSave}
          onClose={() => setModal(m => ({ ...m, open: false }))}
        />
      )}

      {/* Delete Confirm */}
      {delConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: '#fff1f0' }}>
              <Trash2 className="size-5 text-red-400" />
            </div>
            <p className="text-sm text-slate-800 mb-1">确认删除</p>
            <p className="text-xs text-slate-400 mb-5">
              即将删除「<span className="text-slate-600">{delConfirm.name}</span>」，不可撤销
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDelConfirm(null)}
                className="flex-1 py-2 rounded-xl text-sm text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors">
                取消
              </button>
              <button onClick={handleDelete}
                className="flex-1 py-2 rounded-xl text-sm text-white bg-red-400 hover:bg-red-500 transition-colors">
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
