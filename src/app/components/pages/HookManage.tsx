import { useState, useMemo } from 'react';
import {
  Plus, Pencil, Trash2, X, Check, Search,
  Network, ArrowLeft, Package, User, Calendar,
  Hash, MapPin, AlertCircle,
} from 'lucide-react';
import {
  useAppStore, buildHookSlots,
  type HookZone, type HookSlot, type HookSlotStatus,
} from '../../data/AppContext';

/* ══════════════════════════════════════
   状态配置（用于详情面板、统计标签）
══════════════════════════════════════ */
const STATUS_CFG: Record<HookSlotStatus, { label: string; badge: string; dot: string }> = {
  free:      { label: '空闲',  badge: 'bg-slate-100 text-slate-500',     dot: 'bg-slate-300'   },
  washing:   { label: '洗涤中', badge: 'bg-blue-100 text-blue-600',      dot: 'bg-blue-400'    },
  ready:     { label: '待取',  badge: 'bg-orange-100 text-orange-600',   dot: 'bg-orange-400'  },
  collected: { label: '已取',  badge: 'bg-emerald-100 text-emerald-600', dot: 'bg-emerald-400' },
};

/* ══════════════════════════════════════
   超期判断
══════════════════════════════════════ */
function parseReceivedDate(dateStr: string): number {
  // 格式 'MM-DD'，年份取当前年份
  const year = new Date().getFullYear();
  const [m, d] = dateStr.split('-').map(Number);
  return new Date(year, m - 1, d).getTime();
}

function computeOverdue(slot: HookSlot): boolean {
  if (slot.status === 'free' || slot.status === 'collected') return false;
  if (!slot.receivedAt || !slot.serviceCycleHours) return false;
  return Date.now() > parseReceivedDate(slot.receivedAt) + slot.serviceCycleHours * 3_600_000;
}

const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

/* ══════════════════════════════════════
   SlotCell — 三色：灰/绿/红
══════════════════════════════════════ */
function SlotCell({ slot, onClick }: { slot: HookSlot; onClick: (s: HookSlot) => void }) {
  const occupied = slot.status !== 'free';
  const overdue  = computeOverdue(slot);

  let cellBg: string, cellBorder: string, textColor: string, dotColor: string;
  if (!occupied) {
    cellBg = 'bg-slate-50'; cellBorder = 'border-dashed border-slate-200';
    textColor = 'text-slate-400'; dotColor = 'bg-slate-300';
  } else if (overdue) {
    cellBg = 'bg-red-50'; cellBorder = 'border-red-300';
    textColor = 'text-red-600'; dotColor = 'bg-red-400';
  } else {
    cellBg = 'bg-emerald-50'; cellBorder = 'border-emerald-200';
    textColor = 'text-emerald-700'; dotColor = 'bg-emerald-400';
  }

  return (
    <button
      onClick={() => occupied && onClick(slot)}
      title={occupied ? `${slot.garmentType} · ${slot.customerName}${overdue ? ' ⚠超期' : ''}` : '空闲'}
      className={[
        'relative w-[52px] h-[66px] rounded-xl border flex flex-col items-center justify-center gap-0.5',
        'transition-all duration-150',
        cellBg, cellBorder,
        occupied
          ? 'cursor-pointer hover:scale-[1.06] hover:shadow-lg hover:shadow-black/10'
          : 'cursor-default',
      ].join(' ')}
    >
      {/* Status dot */}
      <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${dotColor}`} />

      {/* Overdue icon */}
      {overdue && (
        <span className="absolute top-1 left-1">
          <AlertCircle className="size-2.5 text-red-400" />
        </span>
      )}

      {/* Slot label */}
      <span
        className={`text-[11px] leading-none ${textColor}`}
        style={{ maxWidth: 46, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {slot.label}
      </span>

      {/* Garment type (occupied) */}
      {occupied && slot.garmentType ? (
        <span
          className={`text-[9px] leading-tight text-center px-0.5 ${textColor} opacity-80`}
          style={{ maxWidth: 46, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
        >
          {slot.garmentType}
        </span>
      ) : (
        <span className="text-[9px] text-slate-300">空</span>
      )}
    </button>
  );
}

/* ══════════════════════════════════════
   ZoneCard
══════════════════════════════════════ */
function ZoneCard({ zone, slots, searchQuery, onEdit, onDelete, onSlotClick }: {
  zone: HookZone;
  slots: HookSlot[];
  searchQuery: string;
  onEdit: () => void;
  onDelete: () => void;
  onSlotClick: (s: HookSlot) => void;
}) {
  const stats = useMemo(() => ({
    free:      slots.filter(s => s.status === 'free').length,
    washing:   slots.filter(s => s.status === 'washing').length,
    ready:     slots.filter(s => s.status === 'ready').length,
    collected: slots.filter(s => s.status === 'collected').length,
    overdue:   slots.filter(s => computeOverdue(s)).length,
  }), [slots]);

  const displayed = searchQuery
    ? slots.filter(s =>
        s.label.includes(searchQuery) ||
        s.orderId?.includes(searchQuery) ||
        s.orderNo?.includes(searchQuery) ||
        s.customerName?.includes(searchQuery) ||
        s.garmentType?.includes(searchQuery)
      )
    : slots;

  if (searchQuery && displayed.length === 0) return null;

  const StatsBadges = () => (
    <>
      {stats.overdue > 0 && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 flex items-center gap-1">
          <AlertCircle className="size-3" />超期 {stats.overdue}
        </span>
      )}
      {(['washing', 'ready', 'collected'] as const).map(st =>
        stats[st] > 0 ? (
          <span key={st} className={`text-xs px-2 py-0.5 rounded-full ${STATUS_CFG[st].badge}`}>
            {STATUS_CFG[st].label} {stats[st]}
          </span>
        ) : null
      )}
      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">
        空闲 {stats.free}
      </span>
    </>
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: '#fff3e8' }}>
          <MapPin className="size-3.5" style={{ color: '#fd780f' }} />
        </div>
        <span className="text-sm text-slate-800">{zone.name}</span>
        <span className="text-xs text-slate-400">（{zone.capacity} 点位）</span>

        {/* Desktop stats */}
        <div className="hidden sm:flex items-center gap-1.5 ml-auto flex-shrink-0 flex-wrap">
          <StatsBadges />
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 sm:ml-3">
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

      {/* Mobile stats strip */}
      <div className="sm:hidden flex items-center gap-1.5 px-4 py-2 bg-slate-50/60 border-b border-slate-100 flex-wrap">
        <StatsBadges />
      </div>

      {/* Slot grid */}
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {displayed.map(slot => (
            <SlotCell key={slot.id} slot={slot} onClick={onSlotClick} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   Detail Panel（衣物详情抽屉）
══════════════════════════════════════ */
function DetailPanel({ slot, onClose, onMarkCollected }: {
  slot: HookSlot;
  onClose: () => void;
  onMarkCollected: (slotId: string) => void;
}) {
  const cfg = STATUS_CFG[slot.status];
  const overdue = computeOverdue(slot);
  const steps = [
    { label: '已收衣',  done: true,                                                  note: slot.receivedAt },
    { label: '洗涤中',  done: ['washing','ready','collected'].includes(slot.status), note: slot.status === 'washing' ? '处理中' : undefined },
    { label: '待取件',  done: ['ready','collected'].includes(slot.status),           note: slot.status === 'ready' ? '可取件' : undefined },
    { label: '已取走',  done: slot.status === 'collected',                           note: slot.status === 'collected' ? '完成' : undefined },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1 bg-black/25 backdrop-blur-[1px]" onClick={onClose} />
      <div className="w-full sm:w-80 lg:w-96 bg-white shadow-2xl flex flex-col">
        {/* Drawer header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100 flex-shrink-0">
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <ArrowLeft className="size-4" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-800">衣物详情</p>
            <p className="text-xs text-slate-400">挂点 {slot.label}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {overdue && (
              <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600 flex items-center gap-1">
                <AlertCircle className="size-3" />已超期
              </span>
            )}
            <span className={`text-xs px-2.5 py-1 rounded-full flex-shrink-0 ${cfg.badge}`}>
              {cfg.label}
            </span>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Overdue warning */}
          {overdue && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200">
              <AlertCircle className="size-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-red-700">洗护周期已超期</p>
                {slot.serviceCycleHours && (
                  <p className="text-xs text-red-500 mt-0.5">
                    规定周期 {slot.serviceCycleHours}h，收衣日期 {slot.receivedAt}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Garment banner */}
          <div className={`rounded-xl p-4 flex items-center gap-3 border ${
            overdue ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'
          }`}>
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
              <Package className={`size-5 ${overdue ? 'text-red-500' : 'text-emerald-600'}`} />
            </div>
            <div>
              <p className={`text-sm ${overdue ? 'text-red-700' : 'text-emerald-700'}`}>
                {slot.garmentType ?? '未知衣物'}
              </p>
              {slot.garmentColor && <p className="text-xs text-slate-400">{slot.garmentColor}</p>}
            </div>
          </div>

          {/* Detail rows */}
          <div className="bg-slate-50 rounded-xl overflow-hidden divide-y divide-slate-100">
            <DetailRow icon={Hash}     label="订单号"   value={slot.orderId ?? slot.orderNo ?? '—'} />
            <DetailRow icon={User}     label="客户"     value={slot.customerName ?? '—'} />
            <DetailRow icon={MapPin}   label="挂点"     value={slot.label} />
            <DetailRow icon={Calendar} label="收衣日期" value={slot.receivedAt ?? '—'} />
            <DetailRow icon={Calendar} label="预计完成" value={slot.expectedAt ?? '—'} />
            {slot.serviceCycleHours != null && (
              <DetailRow icon={Calendar} label="洗护周期" value={`${slot.serviceCycleHours} 小时`} />
            )}
          </div>

          {/* Progress steps */}
          <div>
            <p className="text-xs text-slate-400 mb-3">处理进度</p>
            <div className="relative pl-2">
              <div className="absolute left-[13px] top-2 bottom-2 w-px bg-slate-200" />
              <div className="space-y-4">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3 relative">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-colors ${
                      step.done ? 'shadow-sm' : 'bg-slate-200'
                    }`} style={step.done ? { backgroundColor: '#fd780f' } : {}}>
                      {step.done && <Check className="size-3 text-white" />}
                    </div>
                    <span className={`text-xs flex-1 ${step.done ? 'text-slate-700' : 'text-slate-400'}`}>
                      {step.label}
                    </span>
                    {step.note && <span className="text-xs text-slate-400">{step.note}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action footer */}
        <div className="flex-shrink-0 p-4 border-t border-slate-100 space-y-2">
          {slot.status === 'ready' && (
            <button
              onClick={() => { onMarkCollected(slot.id); onClose(); }}
              className="w-full py-2.5 rounded-xl text-sm text-white font-normal transition-all active:scale-[0.98]"
              style={{ backgroundColor: '#fd780f' }}
            >
              标记已取走（释放挂点）
            </button>
          )}
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors">
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: React.FC<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-3.5 py-2.5">
      <Icon className="size-3.5 text-slate-400 flex-shrink-0" />
      <span className="text-xs text-slate-400 w-16 flex-shrink-0">{label}</span>
      <span className="text-xs text-slate-700 flex-1 text-right">{value}</span>
    </div>
  );
}

/* ══════════════════════════════════════
   主组件
══════════════════════════════════════ */
export default function HookManage() {
  /* ─ AppContext ─ */
  const { hookZones, setHookZones, hookSlots, setHookSlots, categories } = useAppStore();

  const getZoneSlots = (zoneId: string) => hookSlots.filter(s => s.zoneId === zoneId);

  /* ─ UI state ─ */
  const [searchQuery,  setSearchQuery]  = useState('');
  const [selectedSlot, setSelectedSlot] = useState<HookSlot | null>(null);

  /* ─ Add/Edit modal ─ */
  const [modal, setModal] = useState<{ open: boolean; mode: 'add' | 'edit'; editId?: string }>({
    open: false, mode: 'add',
  });
  const [fName,        setFName]        = useState('');
  const [fCapacity,    setFCapacity]    = useState('');
  const [fCategoryIds, setFCategoryIds] = useState<string[]>([]);
  const [fError,       setFError]       = useState('');

  /* ─ Delete confirm ─ */
  const [delConfirm, setDelConfirm] = useState<{ id: string; name: string } | null>(null);

  /* ─ Global stats ─ */
  const totalStats = useMemo(() => ({
    total:    hookSlots.length,
    free:     hookSlots.filter(s => s.status === 'free').length,
    occupied: hookSlots.filter(s => s.status !== 'free').length,
    overdue:  hookSlots.filter(s => computeOverdue(s)).length,
  }), [hookSlots]);

  /* ─ Capacity-reduction warning ─ */
  const capacityWarning = useMemo(() => {
    if (modal.mode !== 'edit' || !modal.editId) return null;
    const cap = parseInt(fCapacity);
    if (isNaN(cap)) return null;
    const slots = getZoneSlots(modal.editId);
    const removed = slots.slice(cap).filter(s => s.status !== 'free');
    return removed.length > 0
      ? `将移除末尾 ${removed.length} 个已占用点位，操作不可撤销`
      : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fCapacity, modal]);

  /* ── Handlers ── */
  const openAdd = () => {
    setFName(''); setFCapacity('10'); setFCategoryIds([]); setFError('');
    setModal({ open: true, mode: 'add' });
  };
  const openEdit = (zone: HookZone) => {
    setFName(zone.name);
    setFCapacity(String(zone.capacity));
    setFCategoryIds(zone.categoryIds ?? []);
    setFError('');
    setModal({ open: true, mode: 'edit', editId: zone.id });
  };

  const handleSaveZone = () => {
    const cap = parseInt(fCapacity);
    if (!fName.trim())                     { setFError('请输入挂点名称'); return; }
    if (isNaN(cap) || cap < 1 || cap > 50) { setFError('点位数量需在 1 ~ 50 之间'); return; }

    if (modal.mode === 'add') {
      const id = genId();
      const newZone: HookZone = { id, name: fName.trim(), capacity: cap, categoryIds: fCategoryIds };
      const newZones = [...hookZones, newZone];
      const newSlots = buildHookSlots(newZones, hookSlots);
      setHookZones(newZones);
      setHookSlots(newSlots);
    } else {
      const prev = hookZones.find(z => z.id === modal.editId)!;
      const updated: HookZone = { ...prev, name: fName.trim(), capacity: cap, categoryIds: fCategoryIds };
      const newZones = hookZones.map(z => z.id === modal.editId ? updated : z);
      // Rebuild slots for updated zone, keeping existing slot data
      const existingForZone = hookSlots.filter(s => s.zoneId === prev.id);
      const rebuiltForZone = buildHookSlots([updated], existingForZone);
      const newSlots = [
        ...hookSlots.filter(s => s.zoneId !== modal.editId),
        ...rebuiltForZone,
      ];
      setHookZones(newZones);
      setHookSlots(newSlots);
    }
    setModal(m => ({ ...m, open: false }));
  };

  const handleDeleteZone = () => {
    if (!delConfirm) return;
    setHookZones(hookZones.filter(z => z.id !== delConfirm.id));
    setHookSlots(hookSlots.filter(s => s.zoneId !== delConfirm.id));
    setDelConfirm(null);
  };

  /* 取件完成 → 释放挂点（设为 free） */
  const handleMarkCollected = (slotId: string) => {
    setHookSlots(hookSlots.map(sl =>
      sl.id === slotId
        ? {
            id: sl.id, zoneId: sl.zoneId, zoneName: sl.zoneName,
            label: sl.label, status: 'free' as const,
          }
        : sl
    ));
  };

  /* 切换关联品类 */
  const toggleCategory = (catId: string) => {
    setFCategoryIds(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const formValid = () => {
    const cap = parseInt(fCapacity);
    return fName.trim() !== '' && !isNaN(cap) && cap >= 1 && cap <= 50;
  };

  /* ══ JSX ══ */
  return (
    <div className="space-y-5 lg:space-y-6">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="flex-1">
          <h1 className="text-lg sm:text-xl text-slate-800">挂点管理</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            共 {hookZones.length} 个区域 · {totalStats.total} 个点位
          </p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white self-start transition-all active:scale-[0.97]"
          style={{ backgroundColor: '#fd780f' }}>
          <Plus className="size-4" />
          新增挂点
        </button>
      </div>

      {/* ── Stats + Search ── */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        {/* 三色图例 */}
        <div className="flex items-center gap-3 sm:gap-5 flex-wrap bg-white rounded-xl px-4 py-2.5 border border-slate-100 shadow-sm flex-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-slate-500">已占用</span>
            <span className="text-xs text-slate-700">{totalStats.occupied}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-xs text-slate-500">已超期</span>
            <span className="text-xs text-slate-700">{totalStats.overdue}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-300" />
            <span className="text-xs text-slate-500">空闲</span>
            <span className="text-xs text-slate-700">{totalStats.free}</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative sm:w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索挂点、订单号、客户"
            className="w-full h-9 pl-9 pr-8 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Zone list ── */}
      {hookZones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ backgroundColor: '#fff3e8' }}>
            <Network className="size-7" style={{ color: '#fd780f' }} />
          </div>
          <p className="text-sm text-slate-600 mb-1">暂无挂点区域</p>
          <p className="text-xs text-slate-400">点击右上角「新增挂点」开始配置</p>
        </div>
      ) : (
        <div className="space-y-4">
          {hookZones.map(zone => (
            <ZoneCard
              key={zone.id}
              zone={zone}
              slots={getZoneSlots(zone.id)}
              searchQuery={searchQuery}
              onEdit={() => openEdit(zone)}
              onDelete={() => setDelConfirm({ id: zone.id, name: zone.name })}
              onSlotClick={setSelectedSlot}
            />
          ))}
        </div>
      )}

      {/* ══ Add/Edit Zone Modal ══ */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <span className="text-sm text-slate-800">
                {modal.mode === 'add' ? '新增挂点区域' : '修改挂点区域'}
              </span>
              <button onClick={() => setModal(m => ({ ...m, open: false }))}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <X className="size-4" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">
                  挂点名称 <span className="text-red-400">*</span>
                </label>
                <input type="text" value={fName}
                  onChange={e => { setFName(e.target.value); setFError(''); }}
                  placeholder="如：输送线、折叠区、VIP 专区"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>

              {/* Capacity */}
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">
                  点位数量 <span className="text-red-400">*</span>
                  <span className="ml-1 text-slate-400 font-normal">（1 – 50）</span>
                </label>
                <input type="number" min="1" max="50" value={fCapacity}
                  onChange={e => { setFCapacity(e.target.value); setFError(''); }}
                  placeholder="10"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
                <p className="text-xs text-slate-400 mt-1.5">
                  点位按「区域名称-序号」自动命名，如 {fName || '输送线'}-1、{fName || '输送线'}-2 …
                </p>
              </div>

              {/* Category multi-select */}
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">
                  关联品类
                  <span className="ml-1 text-slate-400 font-normal">（不选则接受所有品类）</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map(cat => {
                    const selected = fCategoryIds.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className={[
                          'px-2.5 py-1 rounded-lg text-xs border transition-all',
                          selected
                            ? 'text-white border-transparent'
                            : 'text-slate-500 border-slate-200 hover:border-slate-300 bg-white',
                        ].join(' ')}
                        style={selected ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
                      >
                        {cat.code} {cat.name}
                      </button>
                    );
                  })}
                </div>
                {fCategoryIds.length > 0 && (
                  <p className="text-xs text-slate-400 mt-1.5">
                    已选 {fCategoryIds.length} 个品类，此区域仅接受对应衣物上挂
                  </p>
                )}
              </div>

              {/* Capacity reduction warning */}
              {capacityWarning && (
                <div className="flex gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <span className="text-amber-500 flex-shrink-0">⚠</span>
                  <p className="text-xs text-amber-700">{capacityWarning}</p>
                </div>
              )}

              {/* Validation error */}
              {fError && <p className="text-xs text-red-400">{fError}</p>}
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">
              <button onClick={() => setModal(m => ({ ...m, open: false }))}
                className="px-4 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-100 transition-colors">
                取消
              </button>
              <button onClick={handleSaveZone} disabled={!formValid()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-white transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#fd780f' }}>
                <Check className="size-3.5" />
                {modal.mode === 'add' ? '确认新增' : '保存修改'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Delete Confirm Modal ══ */}
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
              即将删除挂点「<span className="text-slate-600">{delConfirm.name}</span>」及全部点位，不可撤销
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDelConfirm(null)}
                className="flex-1 py-2 rounded-xl text-sm text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors">
                取消
              </button>
              <button onClick={handleDeleteZone}
                className="flex-1 py-2 rounded-xl text-sm text-white bg-red-400 hover:bg-red-500 transition-colors">
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Detail Drawer ══ */}
      {selectedSlot && selectedSlot.status !== 'free' && (
        <DetailPanel
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onMarkCollected={handleMarkCollected}
        />
      )}
    </div>
  );
}
