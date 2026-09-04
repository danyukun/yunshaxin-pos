import { useState, useMemo } from 'react';
import {
  Plus, Users, X, Pencil,
  MapPin, Tag, ShoppingBag, ChevronRight, Check,
  Phone, Home, Building2, Trash2, Gift, Calendar,
  Package,
} from 'lucide-react';
import {
  useAppStore, getMemberTier,
  type Member, type MemberAddress, type MemberCoupon,
} from '../../data/AppContext';

const uid = () => Math.random().toString(36).slice(2, 9);
const todayStr = () => new Date().toISOString().slice(0, 10);

const IMPORTANT_LEVELS = [
  { level: 1 as const, label: '普通重要', stars: '⭐',    color: 'text-yellow-600', bg: 'bg-yellow-50',  border: 'border-yellow-200' },
  { level: 2 as const, label: '核心客户', stars: '⭐⭐',  color: 'text-orange-600', bg: 'bg-orange-50',  border: 'border-orange-200' },
  { level: 3 as const, label: '超级VIP',  stars: '⭐⭐⭐', color: 'text-red-600',    bg: 'bg-red-50',     border: 'border-red-200'    },
];
function getImportantInfo(level?: 1 | 2 | 3) {
  return IMPORTANT_LEVELS.find(l => l.level === level) ?? IMPORTANT_LEVELS[0];
}

interface FilterState {
  storeId: string; isMember: string; tierName: string;
  importantFilter: string; wechat: string;
}
const EMPTY_FILTER: FilterState = { storeId: '', isMember: '', tierName: '', importantFilter: '', wechat: '' };

const INPUT_CLS = `w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl
  focus:outline-none focus:border-orange-400 bg-white`;

function AddressTab({ member, onUpdate }: { member: Member; onUpdate: (m: Member) => void }) {
  const [editing, setEditing] = useState<MemberAddress | null>(null);
  const [form, setForm] = useState<Omit<MemberAddress, 'id'>>({ label: '', address: '', phone: '', isDefault: false });
  const [showForm, setShowForm] = useState(false);

  const openAdd = () => {
    setForm({ label: '家', address: '', phone: member.phone, isDefault: member.addresses.length === 0 });
    setEditing(null);
    setShowForm(true);
  };
  const openEdit = (a: MemberAddress) => {
    setForm({ label: a.label, address: a.address, phone: a.phone, isDefault: a.isDefault });
    setEditing(a);
    setShowForm(true);
  };
  const save = () => {
    if (!form.address.trim()) return;
    let addrs = [...member.addresses];
    if (editing) {
      addrs = addrs.map(a => a.id === editing.id ? { ...a, ...form } : a);
    } else {
      addrs = [...addrs, { id: uid(), ...form }];
    }
    if (form.isDefault) addrs = addrs.map(a => ({ ...a, isDefault: a.id === (editing?.id ?? addrs[addrs.length - 1].id) }));
    onUpdate({ ...member, addresses: addrs });
    setShowForm(false);
  };
  const remove = (id: string) => {
    onUpdate({ ...member, addresses: member.addresses.filter(a => a.id !== id) });
  };
  const setDefault = (id: string) => {
    onUpdate({ ...member, addresses: member.addresses.map(a => ({ ...a, isDefault: a.id === id })) });
  };

  const LABEL_OPTS = ['家', '公司', '学校', '其他'];

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">{member.addresses.length > 0 ? `共 ${member.addresses.length} 个地址` : '暂无地址'}</p>
        <button onClick={openAdd}
          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-white"
          style={{ backgroundColor: '#fd780f' }}>
          <Plus className="size-3" />新增地址
        </button>
      </div>

      {member.addresses.map(a => (
        <div key={a.id} className={`rounded-xl border p-3 ${a.isDefault ? 'border-orange-200 bg-orange-50/40' : 'border-slate-200 bg-white'}`}>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: a.isDefault ? '#fff3e8' : '#f8fafc' }}>
              {a.label === '家' ? <Home className="size-3.5 text-orange-400" /> :
               a.label === '公司' ? <Building2 className="size-3.5 text-slate-400" /> :
               <MapPin className="size-3.5 text-slate-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs text-slate-700">{a.label}</span>
                {a.isDefault && <span className="text-[10px] px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: '#fd780f' }}>默认</span>}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{a.address}</p>
              {a.phone && <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1"><Phone className="size-2.5" />{a.phone}</p>}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {!a.isDefault && (
                <button onClick={() => setDefault(a.id)}
                  className="text-[10px] text-slate-400 hover:text-orange-500 px-2 py-1 rounded-lg hover:bg-orange-50 transition-colors">
                  设为默认
                </button>
              )}
              <button onClick={() => openEdit(a)} className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                <Pencil className="size-3.5" />
              </button>
              <button onClick={() => remove(a.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {member.addresses.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-8 text-slate-300">
          <MapPin className="size-8 mb-2" />
          <p className="text-sm">暂无收货地址</p>
        </div>
      )}

      {showForm && (
        <div className="rounded-xl border border-orange-200 bg-orange-50/30 p-4 space-y-3">
          <p className="text-xs text-slate-600">{editing ? '编辑地址' : '新增地址'}</p>
          <div className="flex gap-2">
            {LABEL_OPTS.map(l => (
              <button key={l} onClick={() => setForm(f => ({ ...f, label: l }))}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${form.label === l ? 'text-white border-transparent' : 'border-slate-200 text-slate-600'}`}
                style={form.label === l ? { backgroundColor: '#fd780f' } : {}}>
                {l}
              </button>
            ))}
          </div>
          <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            placeholder="详细地址" className={INPUT_CLS} />
          <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="联系电话" className={INPUT_CLS} />
          <label className="flex items-center gap-2 cursor-pointer">
            <button onClick={() => setForm(f => ({ ...f, isDefault: !f.isDefault }))}
              className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${form.isDefault ? '' : 'bg-slate-200'}`}
              style={form.isDefault ? { backgroundColor: '#fd780f' } : {}}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isDefault ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
            <span className="text-xs text-slate-600">设为默认地址</span>
          </label>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2 border border-slate-200 rounded-xl text-xs text-slate-600 hover:bg-slate-50">取消</button>
            <button onClick={save} className="flex-1 py-2 rounded-xl text-xs text-white" style={{ backgroundColor: '#fd780f' }}>保存</button>
          </div>
        </div>
      )}
    </div>
  );
}

function CouponTab({ member, onUpdate }: { member: Member; onUpdate: (m: Member) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<MemberCoupon, 'id'>>({ name: '', amount: 0, minSpend: 0, expiry: '' });

  const save = () => {
    if (!form.name.trim() || !form.expiry) return;
    onUpdate({ ...member, coupons: [...member.coupons, { id: uid(), ...form }] });
    setShowForm(false);
    setForm({ name: '', amount: 0, minSpend: 0, expiry: '' });
  };
  const remove = (id: string) => {
    onUpdate({ ...member, coupons: member.coupons.filter(c => c.id !== id) });
  };

  const today = todayStr();
  const expired = (c: MemberCoupon) => c.expiry < today;

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">{member.coupons.length > 0 ? `共 ${member.coupons.length} 张优惠券` : '暂无优惠券'}</p>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-white"
          style={{ backgroundColor: '#fd780f' }}>
          <Plus className="size-3" />发放优惠券
        </button>
      </div>

      {member.coupons.map(c => {
        const isExpired = expired(c);
        return (
          <div key={c.id} className={`rounded-xl border p-3 flex items-center gap-3 ${isExpired ? 'border-slate-100 bg-slate-50 opacity-60' : 'border-orange-100 bg-orange-50/30'}`}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: isExpired ? '#f1f5f9' : '#fff3e8' }}>
              <Gift className={`size-5 ${isExpired ? 'text-slate-400' : 'text-orange-400'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-800 truncate">{c.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-mono" style={{ color: isExpired ? '#94a3b8' : '#fd780f' }}>-￥{c.amount}</span>
                {c.minSpend > 0 && <span className="text-[10px] text-slate-400">满￥{c.minSpend}可用</span>}
                <span className={`text-[10px] flex items-center gap-0.5 ${isExpired ? 'text-red-400' : 'text-slate-400'}`}>
                  <Calendar className="size-2.5" />{isExpired ? `已过期 ${c.expiry}` : `${c.expiry} 到期`}
                </span>
              </div>
            </div>
            <button onClick={() => remove(c.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
              <Trash2 className="size-3.5" />
            </button>
          </div>
        );
      })}

      {member.coupons.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-8 text-slate-300">
          <Gift className="size-8 mb-2" />
          <p className="text-sm">暂无优惠券</p>
        </div>
      )}

      {showForm && (
        <div className="rounded-xl border border-orange-200 bg-orange-50/30 p-4 space-y-3">
          <p className="text-xs text-slate-600">发放优惠券</p>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="优惠券名称，如：满100减20" className={INPUT_CLS} />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">优惠金额（元）</label>
              <input type="number" min="0" step="0.5" value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
                className={INPUT_CLS} />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">最低消费（0=无门槛）</label>
              <input type="number" min="0" step="0.5" value={form.minSpend}
                onChange={e => setForm(f => ({ ...f, minSpend: parseFloat(e.target.value) || 0 }))}
                className={INPUT_CLS} />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-slate-500 mb-1 block">有效期至</label>
            <input type="date" value={form.expiry} onChange={e => setForm(f => ({ ...f, expiry: e.target.value }))}
              className={INPUT_CLS} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2 border border-slate-200 rounded-xl text-xs text-slate-600 hover:bg-slate-50">取消</button>
            <button onClick={save} className="flex-1 py-2 rounded-xl text-xs text-white" style={{ backgroundColor: '#fd780f' }}>发放</button>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderHistoryTab({ member }: { member: Member }) {
  const { orders } = useAppStore();

  const memberOrders = useMemo(() => {
    return orders
      .filter(o =>
        o.customerName === member.name ||
        (member.phone.length >= 7 &&
          o.phone.startsWith(member.phone.slice(0, 3)) &&
          o.phone.endsWith(member.phone.slice(-4)))
      )
      .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
  }, [orders, member]);

  const STATUS_CN: Record<string, string> = {
    received: '已收衣', sent_wash: '已送洗', factory_in: '已入厂',
    washing: '洗涤中', ironing: '熨烫', factory_out: '已出厂',
    store_in: '已入库', on_shelf: '已上架', completed: '已完成',
    cancelled: '已退单', compensated: '已退赔',
  };
  const getOrderStatus = (o: typeof orders[0]) => {
    const statuses = o.garments.map(g => g.status);
    if (statuses.every(s => s === 'completed')) return { label: '已完成', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    if (statuses.some(s => s === 'cancelled')) return { label: '部分退单', color: 'text-red-500 bg-red-50 border-red-200' };
    if (statuses.some(s => s === 'factory_out' || s === 'store_in' || s === 'on_shelf')) return { label: '洗涤完成', color: 'text-orange-600 bg-orange-50 border-orange-200' };
    if (statuses.some(s => s === 'washing' || s === 'factory_in' || s === 'ironing')) return { label: '洗涤中', color: 'text-sky-600 bg-sky-50 border-sky-200' };
    return { label: STATUS_CN[statuses[0]] ?? statuses[0], color: 'text-slate-500 bg-slate-50 border-slate-200' };
  };

  const totalSpent = memberOrders.reduce((s, o) => s + o.totalAmount, 0);

  return (
    <div className="p-4 space-y-3">
      {memberOrders.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl p-3 text-center" style={{ backgroundColor: '#fff3e8' }}>
            <p className="text-[10px] text-slate-500 mb-0.5">历史消费总额</p>
            <p className="text-base" style={{ color: '#fd780f' }}>￥{totalSpent.toFixed(2)}</p>
          </div>
          <div className="rounded-xl p-3 text-center bg-slate-50">
            <p className="text-[10px] text-slate-500 mb-0.5">历史订单数</p>
            <p className="text-base text-slate-800">{memberOrders.length} 单</p>
          </div>
        </div>
      )}

      {memberOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-slate-300">
          <Package className="size-8 mb-2" />
          <p className="text-sm">暂无消费记录</p>
        </div>
      ) : memberOrders.map(o => {
        const st = getOrderStatus(o);
        const garmentCount = o.garments.filter(g => !g.isAttachmentRow).length;
        return (
          <div key={o.id} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-500 font-mono">#{o.orderNo}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${st.color}`}>{st.label}</span>
                  {o.isHang && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-600">挂账</span>}
                  <span className="text-[10px] text-slate-400">
                    {o.type === 'A' ? '到店' : o.type === 'B' ? '送货上门' : '上门取件'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">{o.receivedAt} · {garmentCount}件衣物</p>
              </div>
              <span className="text-sm flex-shrink-0" style={{ color: '#fd780f' }}>￥{o.totalAmount.toFixed(2)}</span>
            </div>
            {o.garments.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                {o.garments.filter(g => !g.isAttachmentRow).slice(0, 4).map(g => (
                  <span key={g.id} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    {g.type}{g.color ? ` · ${g.color}` : ''}
                  </span>
                ))}
                {o.garments.filter(g => !g.isAttachmentRow).length > 4 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">
                    +{o.garments.filter(g => !g.isAttachmentRow).length - 4}件
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function BasicInfoTab({ member, onUpdate }: { member: Member; onUpdate: (m: Member) => void }) {
  const { memberTiers, stores } = useAppStore();
  const tier = getMemberTier(member.totalSpent, memberTiers);

  const [form, setForm] = useState({
    name: member.name, phone: member.phone,
    isImportant: member.isImportant ?? false,
    importantLevel: member.importantLevel,
    isFollowWechat: member.isFollowWechat ?? false,
    storeId: member.storeId ?? '',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    onUpdate({
      ...member,
      name: form.name.trim(), phone: form.phone.trim(),
      isImportant: form.isImportant,
      importantLevel: form.isImportant ? form.importantLevel : undefined,
      isFollowWechat: form.isFollowWechat,
      storeId: form.storeId || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="rounded-xl p-4 grid grid-cols-2 gap-3" style={{ backgroundColor: '#fff3e8' }}>
        <div>
          <p className="text-[10px] text-slate-500 mb-0.5">会员等级</p>
          <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-medium ${tier.badge}`}>{tier.name}</span>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 mb-0.5">账户余额</p>
          <p className="text-sm text-slate-800">￥{member.balance.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 mb-0.5">累计消费</p>
          <p className="text-sm" style={{ color: '#fd780f' }}>￥{member.totalSpent.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 mb-0.5">注册日期</p>
          <p className="text-xs text-slate-600">{member.registrationDate}</p>
        </div>
      </div>

      <div>
        <label className="block text-xs text-slate-500 mb-1.5">手机号</label>
        <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={INPUT_CLS} />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1.5">姓名</label>
        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={INPUT_CLS} />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1.5">所属门店</label>
        <select value={form.storeId} onChange={e => setForm(f => ({ ...f, storeId: e.target.value }))} className={INPUT_CLS}>
          <option value="">不限门店</option>
          {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="flex items-center justify-between py-1">
        <div>
          <p className="text-sm text-slate-700">关注微信公众号</p>
          <p className="text-[10px] text-slate-400">客户是否已关注门店公众号</p>
        </div>
        <button onClick={() => setForm(f => ({ ...f, isFollowWechat: !f.isFollowWechat }))}
          className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${form.isFollowWechat ? 'bg-green-500' : 'bg-slate-200'}`}>
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isFollowWechat ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-sm text-slate-700">重要客户标记</p>
            <p className="text-[10px] text-slate-400">标记为重要客户并设置等级</p>
          </div>
          <button onClick={() => setForm(f => ({ ...f, isImportant: !f.isImportant }))}
            className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${form.isImportant ? '' : 'bg-slate-200'}`}
            style={form.isImportant ? { backgroundColor: '#fd780f' } : {}}>
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isImportant ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
        {form.isImportant && (
          <div className="grid grid-cols-3 gap-2">
            {IMPORTANT_LEVELS.map(l => (
              <button key={l.level} onClick={() => setForm(f => ({ ...f, importantLevel: l.level }))}
                className={`py-2.5 px-1 rounded-xl border-2 text-center transition-all ${
                  form.importantLevel === l.level ? `${l.bg} ${l.border} ${l.color}` : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}>
                <div className="text-sm mb-0.5">{l.stars}</div>
                <div className="text-[10px]">{l.label}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <button onClick={handleSave} disabled={!form.name.trim() || !form.phone.trim()}
        className="w-full py-2.5 rounded-xl text-sm text-white flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
        style={{ backgroundColor: saved ? '#10b981' : '#fd780f' }}>
        {saved ? <><Check className="size-4" />已保存</> : '保存修改'}
      </button>
    </div>
  );
}

type DetailTab = 'basic' | 'address' | 'coupon' | 'orders';

function MemberDetailPanel({ member, onUpdate, onClose }: {
  member: Member;
  onUpdate: (m: Member) => void;
  onClose: () => void;
}) {
  const { memberTiers } = useAppStore();
  const [tab, setTab] = useState<DetailTab>('basic');
  const tier = getMemberTier(member.totalSpent, memberTiers);

  const TABS: { key: DetailTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'basic',   label: '基本信息', icon: Users },
    { key: 'address', label: '地址',     icon: MapPin },
    { key: 'coupon',  label: '优惠券',   icon: Tag },
    { key: 'orders',  label: '消费记录', icon: ShoppingBag },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-shrink-0 px-4 py-4 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
            style={{ backgroundColor: tier.color }}>
            {member.name.slice(0, 1)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-slate-800">{member.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-lg font-medium ${tier.badge}`}>{tier.name}</span>
              {member.isImportant && member.importantLevel && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium
                  ${getImportantInfo(member.importantLevel).bg}
                  ${getImportantInfo(member.importantLevel).color}
                  ${getImportantInfo(member.importantLevel).border}`}>
                  {getImportantInfo(member.importantLevel).stars}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{member.phone}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg flex-shrink-0 transition-colors">
            <X className="size-4 text-slate-400" />
          </button>
        </div>

        <div className="flex gap-0.5 mt-3 bg-slate-100 rounded-xl p-0.5">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs transition-all ${
                  tab === t.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}>
                <Icon className="size-3" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'basic'   && <BasicInfoTab    member={member} onUpdate={onUpdate} />}
        {tab === 'address' && <AddressTab      member={member} onUpdate={onUpdate} />}
        {tab === 'coupon'  && <CouponTab       member={member} onUpdate={onUpdate} />}
        {tab === 'orders'  && <OrderHistoryTab member={member} />}
      </div>
    </div>
  );
}

export default function MemberManagement({ searchQuery = '' }: { searchQuery?: string }) {
  const { members, setMembers, memberTiers, stores } = useAppStore();

  const [filter, setFilter] = useState<FilterState>(EMPTY_FILTER);
  const setF = (key: keyof FilterState, val: string) => setFilter(f => ({ ...f, [key]: val }));

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedMember = selectedId ? members.find(m => m.id === selectedId) ?? null : null;

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', phone: '', storeId: '' });

  const filtered = useMemo(() => {
    const q = searchQuery.trim();
    return members.filter(m => {
      if (q && !m.name.includes(q) && !m.phone.includes(q)) return false;
      if (filter.storeId && m.storeId !== filter.storeId) return false;
      if (filter.isMember === 'yes' && m.balance <= 0) return false;
      if (filter.isMember === 'no'  && m.balance > 0)  return false;
      const tier = getMemberTier(m.totalSpent, memberTiers);
      if (filter.tierName && tier.name !== filter.tierName) return false;
      if (filter.importantFilter === 'no' && m.isImportant) return false;
      if (filter.importantFilter !== '' && filter.importantFilter !== 'no') {
        const lvl = parseInt(filter.importantFilter);
        if (!m.isImportant || m.importantLevel !== lvl) return false;
      }
      if (filter.wechat === 'yes' && !m.isFollowWechat) return false;
      if (filter.wechat === 'no'  &&  m.isFollowWechat) return false;
      return true;
    });
  }, [members, searchQuery, filter, memberTiers]);

  const activeFilterCount = Object.values(filter).filter(v => v !== '').length;

  const handleUpdate = (updated: Member) => {
    setMembers(members.map(m => m.id === updated.id ? updated : m));
  };

  const handleCreate = () => {
    if (!createForm.name.trim() || !createForm.phone.trim()) return;
    const m: Member = {
      id: uid(), name: createForm.name.trim(), phone: createForm.phone.trim(),
      balance: 0, totalSpent: 0, registrationDate: todayStr(),
      addresses: [], coupons: [],
      storeId: createForm.storeId || undefined,
    };
    setMembers([...members, m]);
    setShowCreate(false);
    setCreateForm({ name: '', phone: '', storeId: '' });
    setSelectedId(m.id);
  };

  const memberCount    = members.filter(m => m.balance > 0).length;
  const importantCount = members.filter(m => m.isImportant).length;

  return (
    <div className="-m-4 sm:-m-5 lg:-m-6 flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>

      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fff3e8' }}>
              <Users className="size-5" style={{ color: '#fd780f' }} />
            </div>
            <div>
              <h2 className="text-base text-slate-800">客户管理</h2>
              <p className="text-xs text-slate-400">{members.length} 名客户 · {memberCount} 名会员 · {importantCount} 名重要客户</p>
            </div>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-white"
            style={{ backgroundColor: '#fd780f' }}>
            <Plus className="size-4" /><span className="hidden sm:inline">新建客户</span><span className="sm:hidden">新增</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {searchQuery && (
            <span className="text-xs text-orange-600 bg-orange-50 rounded-lg px-3 py-1.5 border border-orange-100 flex-shrink-0">
              搜索「{searchQuery}」· {filtered.length} 条
            </span>
          )}

          <div className="flex items-center gap-1.5 flex-wrap flex-1">
            <select value={filter.storeId} onChange={e => setF('storeId', e.target.value)}
              className={`h-8 px-2 text-xs border rounded-lg outline-none focus:border-orange-400 bg-white transition-colors ${filter.storeId ? 'border-orange-300 text-orange-600' : 'border-slate-200 text-slate-600'}`}>
              <option value="">全部门店</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            <select value={filter.tierName} onChange={e => setF('tierName', e.target.value)}
              className={`h-8 px-2 text-xs border rounded-lg outline-none focus:border-orange-400 bg-white transition-colors ${filter.tierName ? 'border-orange-300 text-orange-600' : 'border-slate-200 text-slate-600'}`}>
              <option value="">全部等级</option>
              {memberTiers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>

            <select value={filter.isMember} onChange={e => setF('isMember', e.target.value)}
              className={`h-8 px-2 text-xs border rounded-lg outline-none focus:border-orange-400 bg-white transition-colors ${filter.isMember ? 'border-orange-300 text-orange-600' : 'border-slate-200 text-slate-600'}`}>
              <option value="">是否会员</option>
              <option value="yes">有余额会员</option>
              <option value="no">无余额</option>
            </select>

            <select value={filter.importantFilter} onChange={e => setF('importantFilter', e.target.value)}
              className={`h-8 px-2 text-xs border rounded-lg outline-none focus:border-orange-400 bg-white transition-colors ${filter.importantFilter ? 'border-orange-300 text-orange-600' : 'border-slate-200 text-slate-600'}`}>
              <option value="">全部重要度</option>
              <option value="no">非重要客户</option>
              {IMPORTANT_LEVELS.map(l => <option key={l.level} value={String(l.level)}>{l.stars} {l.label}</option>)}
            </select>

            <select value={filter.wechat} onChange={e => setF('wechat', e.target.value)}
              className={`h-8 px-2 text-xs border rounded-lg outline-none focus:border-orange-400 bg-white transition-colors ${filter.wechat ? 'border-orange-300 text-orange-600' : 'border-slate-200 text-slate-600'}`}>
              <option value="">微信关注</option>
              <option value="yes">已关注</option>
              <option value="no">未关注</option>
            </select>

            {activeFilterCount > 0 && (
              <button onClick={() => setFilter(EMPTY_FILTER)}
                className="h-8 px-3 text-xs rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center gap-1 transition-colors">
                <X className="size-3" />清除筛选({activeFilterCount})
              </button>
            )}
          </div>

          <span className="text-xs text-slate-400 flex-shrink-0">{filtered.length} 条结果</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        <div className={`flex flex-col overflow-hidden transition-all ${selectedMember ? 'w-full lg:w-96 lg:flex-shrink-0' : 'flex-1'}`}>
          <div className="flex-1 overflow-y-auto">
            <div className="hidden lg:block">
              <table className="w-full">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                  <tr>
                    {['客户', '手机号', '等级', '余额', '消费额', '门店', ''].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-[10px] text-slate-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(m => {
                    const tier = getMemberTier(m.totalSpent, memberTiers);
                    const store = stores.find(s => s.id === m.storeId);
                    const isSelected = selectedId === m.id;
                    return (
                      <tr key={m.id}
                        onClick={() => setSelectedId(isSelected ? null : m.id)}
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-orange-50' : 'hover:bg-slate-50'}`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                              style={{ backgroundColor: tier.color }}>{m.name.slice(0, 1)}</div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm text-slate-800">{m.name}</span>
                                {m.isImportant && m.importantLevel && (
                                  <span className={`text-[9px] px-1 py-0.5 rounded border ${getImportantInfo(m.importantLevel).bg} ${getImportantInfo(m.importantLevel).color} ${getImportantInfo(m.importantLevel).border}`}>
                                    {getImportantInfo(m.importantLevel).stars}
                                  </span>
                                )}
                              </div>
                              {m.isFollowWechat && <span className="text-[9px] text-green-600">微信关注</span>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">{m.phone}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-0.5 rounded-lg ${tier.badge}`}>{tier.name}</span>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-800">￥{m.balance.toFixed(2)}</td>
                        <td className="py-3 px-4 text-sm" style={{ color: '#fd780f' }}>￥{m.totalSpent.toFixed(2)}</td>
                        <td className="py-3 px-4 text-xs text-slate-400">{store?.name ?? '—'}</td>
                        <td className="py-3 px-4">
                          <ChevronRight className={`size-4 transition-transform ${isSelected ? 'text-orange-400 rotate-90' : 'text-slate-300'}`} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden divide-y divide-slate-100">
              {filtered.map(m => {
                const tier = getMemberTier(m.totalSpent, memberTiers);
                const store = stores.find(s => s.id === m.storeId);
                return (
                  <div key={m.id} onClick={() => setSelectedId(m.id)}
                    className="p-4 hover:bg-slate-50 transition-colors cursor-pointer active:bg-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
                        style={{ backgroundColor: tier.color }}>{m.name.slice(0, 1)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm text-slate-800">{m.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-lg ${tier.badge}`}>{tier.name}</span>
                          {m.isImportant && m.importantLevel && (
                            <span className={`text-[10px] px-1 py-0.5 rounded border ${getImportantInfo(m.importantLevel).bg} ${getImportantInfo(m.importantLevel).color} ${getImportantInfo(m.importantLevel).border}`}>
                              {getImportantInfo(m.importantLevel).stars}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{m.phone} · {store?.name ?? '—'}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm text-slate-800">￥{m.balance.toFixed(2)}</p>
                        <p className="text-xs" style={{ color: '#fd780f' }}>消费 ￥{m.totalSpent.toFixed(2)}</p>
                      </div>
                      <ChevronRight className="size-4 text-slate-300 flex-shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-slate-300">
                <Users className="size-8 mb-2" />
                <p className="text-sm">未找到符合条件的客户</p>
              </div>
            )}
          </div>
        </div>

        {selectedMember && (
          <>
            <div className="hidden lg:flex flex-col flex-1 border-l border-slate-200 overflow-hidden">
              <MemberDetailPanel
                key={selectedMember.id}
                member={selectedMember}
                onUpdate={handleUpdate}
                onClose={() => setSelectedId(null)}
              />
            </div>
            <div className="lg:hidden fixed inset-0 z-40 bg-white flex flex-col" style={{ top: '4rem' }}>
              <MemberDetailPanel
                key={selectedMember.id}
                member={selectedMember}
                onUpdate={handleUpdate}
                onClose={() => setSelectedId(null)}
              />
            </div>
          </>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-base text-slate-800">新建客户</h3>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="size-5 text-slate-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">手机号 *</label>
                <input type="tel" value={createForm.phone} onChange={e => setCreateForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="请输入手机号" className={INPUT_CLS} autoFocus />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">姓名 *</label>
                <input value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="请输入姓名" className={INPUT_CLS} />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">所属门店</label>
                <select value={createForm.storeId} onChange={e => setCreateForm(f => ({ ...f, storeId: e.target.value }))} className={INPUT_CLS}>
                  <option value="">不限门店</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowCreate(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">取消</button>
                <button onClick={handleCreate} disabled={!createForm.name.trim() || !createForm.phone.trim()}
                  className="flex-1 py-3 rounded-xl text-sm text-white disabled:opacity-40"
                  style={{ backgroundColor: '#fd780f' }}>创建客户</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
