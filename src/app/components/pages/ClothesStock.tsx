import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppStore, type OrderMessage } from '../../data/AppContext';
import {
  Search, X, Phone, MapPin, Clock, ChevronDown, ChevronUp,
  Printer, ArrowLeft, Package, User, Calendar, Hash,
  Shirt, CheckCircle, AlertTriangle, Tag,
  Banknote, CreditCard, Wallet, Truck, Navigation,
  CheckSquare, Square, RefreshCw, Send, UserCog,
  DollarSign, MessageSquare, SendHorizontal,
} from 'lucide-react';

/* ══════════════════════════════════════
   类型定义
══════════════════════════════════════ */
type GarmentStatus =
  | 'ordered' | 'assigned' | 'picking_up' | 'pickup_done'
  | 'received' | 'sent_wash' | 'factory_in' | 'factory_sorted'
  | 'washing' | 'initial_check' | 'ironing' | 'final_check'
  | 'packing' | 'factory_out' | 'store_in' | 'on_shelf'
  | 'delivering' | 'completed' | 'cancelled' | 'compensated';

type OrderType   = 'A' | 'B' | 'C';
type OrderSource = 'store' | 'miniapp' | 'meituan' | 'douyin' | 'third_party';

interface GarmentItem {
  id: string; label: string; type: string; service: string;
  price: number; color?: string; brand?: string; defects: string[];
  status: GarmentStatus;
  batchId?: string;
  warehousingAt?: string; serviceCycleHours?: number;
  isOverdue?: boolean;
  isAttachmentRow?: boolean; parentLabel?: string;
  photos?: string[];
  bindTag?: string;
  hookSlotId?: string;
  hookSlotLabel?: string;
}
interface TrackEvent { time: string; action: string; operator: string; }
interface Order {
  id: string; orderNo: string; type: OrderType; source: OrderSource;
  customerName: string; phone: string; address: string;
  garments: GarmentItem[]; totalAmount: number;
  receivedAt: string; expectedAt: string;
  notes: string; tracking: TrackEvent[];
  messages?: OrderMessage[];
  isHang?: boolean;
  compensationAmount?: number;
}

/* ══════════════════════════════════════
   状态配置（20状态）
══════════════════════════════════════ */
const GS: Record<GarmentStatus, { label: string; badge: string; dot: string; phase: number }> = {
  ordered:        { label:'客户下单',   dot:'bg-slate-400',   badge:'bg-slate-50 border-slate-200 text-slate-600',     phase:0 },
  assigned:       { label:'预约分配',   dot:'bg-blue-400',    badge:'bg-blue-50 border-blue-200 text-blue-700',        phase:1 },
  picking_up:     { label:'取衣中',     dot:'bg-indigo-400',  badge:'bg-indigo-50 border-indigo-200 text-indigo-700',  phase:2 },
  pickup_done:    { label:'取衣完成',   dot:'bg-indigo-500',  badge:'bg-indigo-50 border-indigo-300 text-indigo-800',  phase:3 },
  received:       { label:'已收衣',     dot:'bg-teal-400',    badge:'bg-teal-50 border-teal-200 text-teal-700',        phase:4 },
  sent_wash:      { label:'已送洗',     dot:'bg-cyan-400',    badge:'bg-cyan-50 border-cyan-200 text-cyan-700',        phase:5 },
  factory_in:     { label:'已入厂',     dot:'bg-sky-400',     badge:'bg-sky-50 border-sky-200 text-sky-700',           phase:6 },
  factory_sorted: { label:'工厂分拣',   dot:'bg-sky-500',     badge:'bg-sky-50 border-sky-300 text-sky-800',           phase:7 },
  washing:        { label:'洗涤中',     dot:'bg-blue-500',    badge:'bg-blue-50 border-blue-300 text-blue-800',        phase:8 },
  initial_check:  { label:'初检',       dot:'bg-violet-400',  badge:'bg-violet-50 border-violet-200 text-violet-700',  phase:9 },
  ironing:        { label:'熨烫',       dot:'bg-purple-400',  badge:'bg-purple-50 border-purple-200 text-purple-700',  phase:10 },
  final_check:    { label:'总检',       dot:'bg-violet-500',  badge:'bg-violet-50 border-violet-300 text-violet-800',  phase:11 },
  packing:        { label:'打包',       dot:'bg-amber-400',   badge:'bg-amber-50 border-amber-200 text-amber-700',     phase:12 },
  factory_out:    { label:'已出厂',     dot:'bg-orange-400',  badge:'bg-orange-50 border-orange-200 text-orange-700',  phase:13 },
  store_in:       { label:'已入库',     dot:'bg-lime-500',    badge:'bg-lime-50 border-lime-200 text-lime-700',        phase:14 },
  on_shelf:       { label:'已上架',     dot:'bg-green-500',   badge:'bg-green-50 border-green-200 text-green-700',     phase:15 },
  delivering:     { label:'配送中',     dot:'bg-purple-500',  badge:'bg-purple-50 border-purple-300 text-purple-800',  phase:16 },
  completed:      { label:'已完成',     dot:'bg-emerald-500', badge:'bg-emerald-50 border-emerald-200 text-emerald-700',phase:17 },
  cancelled:      { label:'已退单',     dot:'bg-red-400',     badge:'bg-red-50 border-red-200 text-red-600',           phase:99 },
  compensated:    { label:'已退赔',     dot:'bg-rose-500',    badge:'bg-rose-50 border-rose-300 text-rose-700',        phase:99 },
};

const TYPE_CFG: Record<OrderType, { label: string; desc: string; color: string; flow: GarmentStatus[] }> = {
  A: {
    label: '自送/自取', desc: '客户自送 · 到店自取', color: 'bg-sky-50 text-sky-700 border-sky-200',
    flow: ['ordered','received','sent_wash','factory_in','factory_sorted','washing',
           'initial_check','ironing','final_check','packing','factory_out','store_in','on_shelf','completed'],
  },
  B: {
    label: '自送/送件', desc: '客户自送 · 上门送件', color: 'bg-violet-50 text-violet-700 border-violet-200',
    flow: ['ordered','received','sent_wash','factory_in','factory_sorted','washing',
           'initial_check','ironing','final_check','packing','factory_out','store_in','on_shelf','delivering','completed'],
  },
  C: {
    label: '取件/送件', desc: '上门取件 · 上门送件', color: 'bg-teal-50 text-teal-700 border-teal-200',
    flow: ['ordered','assigned','picking_up','pickup_done','received','sent_wash','factory_in','factory_sorted',
           'washing','initial_check','ironing','final_check','packing','factory_out','store_in','on_shelf','delivering','completed'],
  },
};

const SRC_CFG: Record<OrderSource, { label: string; color: string }> = {
  store:       { label: '到店',   color: 'bg-slate-100 text-slate-600' },
  miniapp:     { label: '小程序', color: 'bg-blue-50 text-blue-600'    },
  meituan:     { label: '美团',   color: 'bg-yellow-50 text-yellow-700'},
  douyin:      { label: '抖音',   color: 'bg-pink-50 text-pink-600'   },
  third_party: { label: '第三方', color: 'bg-purple-50 text-purple-600'},
};

const PAY_METHODS = [
  { id:'cash',   label:'现金',   icon: Banknote,    color:'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { id:'wechat', label:'微信',   icon: Wallet,      color:'bg-green-50 border-green-200 text-green-700'      },
  { id:'alipay', label:'支付宝', icon: CreditCard,  color:'bg-blue-50 border-blue-200 text-blue-700'         },
  { id:'card',   label:'银行卡', icon: CreditCard,  color:'bg-slate-50 border-slate-200 text-slate-700'      },
  { id:'other',  label:'其他',   icon: Wallet,      color:'bg-gray-50 border-gray-200 text-gray-700'         },
];

/* ══════════════════════════════════════
   工具函数
══════════════════════════════════════ */
const EXCEPTION_STATUSES: GarmentStatus[] = ['cancelled', 'compensated'];

function derivedStatus(order: Order): GarmentStatus {
  const statuses = order.garments.map(g => g.status);
  const exc = statuses.find(s => EXCEPTION_STATUSES.includes(s));
  if (exc) return exc;
  const flow = TYPE_CFG[order.type].flow;
  let minIdx = flow.length - 1;
  for (const s of statuses) {
    const i = flow.indexOf(s);
    if (i !== -1 && i < minIdx) minIdx = i;
  }
  return flow[minIdx];
}

function getNow(): string {
  return new Date().toLocaleString('zh-CN', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).replace(/\//g, '-');
}

/* ══════════════════════════════════════
   收款弹窗
══════════════════════════════════════ */
function PaymentModal({ amount, onClose, onConfirm }: {
  amount: number; onClose: () => void; onConfirm: (method: string) => void;
}) {
  const [method, setMethod] = useState('wechat');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-80 overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-slate-100">
          <h3 className="text-base text-slate-800">选择收款方式</h3>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-xs text-slate-400">应收</span>
            <span className="text-2xl" style={{ color: '#fd780f' }}>¥{amount.toFixed(2)}</span>
          </div>
        </div>
        <div className="px-6 py-4 grid grid-cols-3 gap-2">
          {PAY_METHODS.map(m => {
            const Icon = m.icon;
            const active = method === m.id;
            return (
              <button key={m.id} onClick={() => setMethod(m.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                  active ? m.color + ' border-current' : 'border-transparent hover:bg-slate-50 text-slate-500'
                }`}>
                <Icon className="size-5" />
                <span className="text-[11px]">{m.label}</span>
              </button>
            );
          })}
        </div>
        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-50 transition-colors">
            取消
          </button>
          <button onClick={() => onConfirm(method)}
            className="flex-1 h-10 rounded-xl text-white text-sm transition-all active:scale-95"
            style={{ backgroundColor: '#fd780f' }}>
            确认收款
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   地址编辑弹窗
══════════════════════════════════════ */
function AddressEditModal({ currentAddress, customerName, customerPhone, onClose, onSave }: {
  currentAddress: string; customerName: string; customerPhone: string;
  onClose: () => void; onSave: (address: string) => void;
}) {
  const [addr, setAddr] = useState(currentAddress);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-[360px] overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
          <h3 className="text-base text-slate-800">更改配送地址</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X className="size-4" /></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">联系人</label>
            <input readOnly value={customerName}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-500 bg-slate-50" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">手机号</label>
            <input readOnly value={customerPhone}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-500 bg-slate-50" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">详细地址</label>
            <textarea value={addr} onChange={e => setAddr(e.target.value)} rows={3}
              placeholder="请输入详细地址"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none resize-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-50 transition-colors">取消</button>
          <button onClick={() => addr.trim() && onSave(addr.trim())} disabled={!addr.trim()}
            className="flex-1 h-10 rounded-xl text-white text-sm transition-all active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: '#fd780f' }}>保存地址</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   退赔弹窗
══════════════════════════════════════ */
function CompensateModal({ onClose, onConfirm }: {
  onClose: () => void; onConfirm: (amount: number, reason: string) => void;
}) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const valid = parseFloat(amount) > 0 && reason.trim().length > 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-[360px] overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
          <h3 className="text-base text-slate-800">订单退赔</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X className="size-4" /></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">赔付金额（元）</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">¥</span>
              <input type="number" min="0" step="0.01" value={amount}
                onChange={e => setAmount(e.target.value)} placeholder="0.00"
                className="w-full h-9 pl-7 pr-3 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">退赔原因</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
              placeholder="请描述退赔原因（衣物损坏、丢失等）"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none resize-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-50">取消</button>
          <button onClick={() => valid && onConfirm(parseFloat(amount), reason.trim())} disabled={!valid}
            className="flex-1 h-10 rounded-xl text-white text-sm transition-all active:scale-95 disabled:opacity-50 bg-rose-500">
            确认退赔
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   可折叠区块
══════════════════════════════════════ */
function Section({ title, extra, defaultOpen = true, children }: {
  title: string; extra?: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <div onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
        <span className="text-xs text-slate-500">{title}</span>
        <div className="flex items-center gap-2">
          {extra && <div onClick={e => e.stopPropagation()}>{extra}</div>}
          {open ? <ChevronUp className="size-3.5 text-slate-400" /> : <ChevronDown className="size-3.5 text-slate-400" />}
        </div>
      </div>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

/* ══════════════════════════════════════
   留言备注区块
══════════════════════════════════════ */
function NotesSection({ order, onAddMessage }: {
  order: Order; onAddMessage: (content: string) => void;
}) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const msgs = order.messages ?? [];
  const hasNote = !!order.notes;
  const count = msgs.length + (hasNote ? 1 : 0);

  const submit = () => {
    const val = input.trim();
    if (!val) return;
    onAddMessage(val);
    setInput('');
    setTimeout(() => listRef.current?.scrollTo({ top: 9999, behavior: 'smooth' }), 50);
  };

  return (
    <div className="border-b border-slate-100">
      <div onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-3.5 text-slate-400" />
          <span className="text-xs text-slate-500">留言备注</span>
          {count > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">{count}</span>
          )}
        </div>
        {open ? <ChevronUp className="size-3.5 text-slate-400" /> : <ChevronDown className="size-3.5 text-slate-400" />}
      </div>

      {open && (
        <div className="px-4 pb-3">
          {hasNote && (
            <div className="mb-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] text-slate-400 mb-0.5">下单备注</p>
              <p className="text-xs text-slate-600 leading-relaxed">{order.notes}</p>
            </div>
          )}

          {msgs.length > 0 && (
            <div ref={listRef} className="space-y-2 mb-3 max-h-40 overflow-y-auto">
              {msgs.map(m => (
                <div key={m.id} className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[10px] mt-0.5"
                    style={{ backgroundColor: '#fd780f' }}>
                    {m.operator[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">{m.operator}</span>
                      <span className="text-[10px] text-slate-300">{m.time}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed mt-0.5">{m.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!hasNote && msgs.length === 0 && (
            <p className="text-xs text-slate-300 mb-3">暂无备注留言</p>
          )}

          <div className="flex gap-2 items-end">
            <textarea
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
              rows={2} placeholder="写下留言…（Enter 发送，Shift+Enter 换行）"
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 outline-none resize-none
                focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
            />
            <button onClick={submit} disabled={!input.trim()}
              className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-white transition-all active:scale-95 disabled:opacity-40"
              style={{ backgroundColor: '#fd780f' }}>
              <SendHorizontal className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   衣物状态徽章
══════════════════════════════════════ */
function GarmentBadge({ status, size = 'sm' }: { status: GarmentStatus; size?: 'sm' | 'xs' }) {
  const cfg = GS[status];
  return (
    <span className={`inline-flex items-center gap-1 border rounded-full flex-shrink-0 ${
      size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-[10px] px-1.5 py-0.5'
    } ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

/* ══════════════════════════════════════
   单件衣物行
══════════════════════════════════════ */
function GarmentRow({ garment, canSelect, isSelected, onToggleSelect }: {
  garment: GarmentItem; canSelect: boolean; isSelected: boolean; onToggleSelect: (id: string) => void;
}) {
  const isTerminal = garment.status === 'completed' || garment.status === 'cancelled' || garment.status === 'compensated';
  return (
    <div className={`py-3 border-b border-slate-100 last:border-0 ${garment.isOverdue ? 'bg-red-50/30' : ''}`}>
      <div className="flex items-start gap-2">
        {canSelect && (
          <button onClick={() => onToggleSelect(garment.id)}
            className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-orange-500 transition-colors">
            {isSelected
              ? <CheckSquare className="size-4" style={{ color: '#fd780f' }} />
              : <Square className="size-4" />}
          </button>
        )}
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ backgroundColor: '#fff3e8' }}>
          <Shirt className="size-4" style={{ color: '#fd780f' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm text-slate-800">{garment.type}</span>
              {garment.brand && <span className="text-xs text-slate-400">{garment.brand}</span>}
              {garment.color && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{garment.color}</span>
              )}
            </div>
            <span className="text-sm text-slate-800 flex-shrink-0">¥{garment.price.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{garment.label}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor:'#fff3e8', color:'#fd780f' }}>
              {garment.service}
            </span>
            {garment.bindTag && (
              <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600">
                <Tag className="size-2.5" />{garment.bindTag}
              </span>
            )}
            {garment.defects.map(d => (
              <span key={d} className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-500 flex items-center gap-0.5">
                <AlertTriangle className="size-2.5" />{d}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <GarmentBadge status={garment.status} size="xs" />
            {isTerminal && garment.status === 'completed' && <CheckCircle className="size-3.5 text-emerald-400" />}
            {garment.hookSlotLabel ? (
              <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600">
                <MapPin className="size-2.5" />{garment.hookSlotLabel}
              </span>
            ) : null}
          </div>
          {garment.photos && garment.photos.length > 0 && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {garment.photos.map((url, i) => (
                <img key={i} src={url} alt={`照片${i+1}`}
                  className="w-14 h-14 object-cover rounded-lg border border-slate-200 bg-slate-100" />
              ))}
            </div>
          )}
          {garment.batchId && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-300 flex-shrink-0" />
              <span className="text-[10px] text-slate-400">
                批次 <span className="font-mono text-slate-600">{garment.batchId}</span>
              </span>
            </div>
          )}
          {garment.isOverdue && (
            <div className="flex items-center gap-1 mt-1">
              <AlertTriangle className="size-3 text-red-500" />
              <span className="text-[10px] text-red-500">已超出洗护周期</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   左侧订单卡片
══════════════════════════════════════ */
function OrderCard({ order, selected, onClick }: { order: Order; selected: boolean; onClick: () => void }) {
  const ds = derivedStatus(order);
  const cfg = GS[ds];
  const isException = EXCEPTION_STATUSES.includes(ds);
  return (
    <button onClick={onClick}
      className={`w-full text-left px-3 py-3 border-b border-slate-100 transition-all ${
        selected ? 'bg-orange-50 border-l-2 border-l-orange-400' : 'hover:bg-slate-50 border-l-2 border-l-transparent'
      }`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span className={`text-sm ${selected ? 'text-orange-600' : 'text-slate-800'}`}>{order.orderNo}</span>
          {order.isHang && <span className="text-[10px] px-1 py-0.5 rounded bg-amber-100 text-amber-700">挂单</span>}
          {isException && <span className={`text-[10px] px-1 py-0.5 rounded ${cfg.badge} border`}>{cfg.label}</span>}
        </div>
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${SRC_CFG[order.source].color}`}>
          {SRC_CFG[order.source].label}
        </span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap mb-1">
        <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border ${cfg.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 truncate flex-1">{order.customerName}</span>
        <span className="text-xs text-slate-400 ml-2 flex-shrink-0">{order.garments.length}件</span>
      </div>
      <div className="flex items-center gap-1 mt-0.5">
        <Clock className="size-3 text-slate-300 flex-shrink-0" />
        <span className="text-[10px] text-slate-400">{order.receivedAt}</span>
        <span className="text-[10px] text-slate-400 ml-auto">¥{order.totalAmount}</span>
      </div>
    </button>
  );
}

/* ══════════════════════════════════════
   右侧详情面板
══════════════════════════════════════ */
function OrderDetail({ order, onBack, onUpdate, onReleaseSlots }: {
  order: Order; onBack: () => void;
  onUpdate: (orderId: string, patch: Partial<Order>) => void;
  onReleaseSlots: (garmentIds: string[]) => void;
}) {
  const ds = derivedStatus(order);
  const cfg = GS[ds];

  const [paymentOpen, setPaymentOpen]     = useState(false);
  const [addressOpen, setAddressOpen]     = useState(false);
  const [compensateOpen, setCompensateOpen] = useState(false);
  const [changingType, setChangingType]   = useState<'B'|'C'|null>(null);
  const [selectedIds, setSelectedIds]     = useState<Set<string>>(new Set());

  const pickupReady = order.garments.filter(g => g.status === 'on_shelf' && order.type === 'A');
  const hasPendingPickup = pickupReady.length > 0;
  const allSelected = hasPendingPickup && pickupReady.every(g => selectedIds.has(g.id));

  const toggleGarment = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(pickupReady.map(g => g.id)));
  };

  const handleConfirmPickup = () => {
    const now = getNow();
    const completedIds = Array.from(selectedIds);
    const labels = order.garments.filter(g => selectedIds.has(g.id)).map(g => g.label).join('、');
    onUpdate(order.id, {
      garments: order.garments.map(g =>
        selectedIds.has(g.id) ? { ...g, status: 'completed' as GarmentStatus } : g
      ),
      tracking: [...order.tracking, { time: now, action: `客户自取：${labels}`, operator: '前台' }],
    });
    onReleaseSlots(completedIds);
    setSelectedIds(new Set());
  };

  const handleConfirmPayment = (method: string) => {
    const label = PAY_METHODS.find(m => m.id === method)?.label ?? method;
    onUpdate(order.id, {
      isHang: false,
      tracking: [...order.tracking, {
        time: getNow(), action: `收款 ¥${order.totalAmount.toFixed(2)}（${label}）`, operator: '收银',
      }],
    });
    setPaymentOpen(false);
  };

  const handleCompensate = (amount: number, reason: string) => {
    onUpdate(order.id, {
      compensationAmount: amount,
      garments: order.garments.map(g => ({ ...g, status: 'compensated' as GarmentStatus })),
      tracking: [...order.tracking, {
        time: getNow(), action: `退赔 ¥${amount.toFixed(2)}：${reason}`, operator: '管理员',
      }],
    });
    setCompensateOpen(false);
  };

  const handleCancel = () => {
    onUpdate(order.id, {
      garments: order.garments.map(g => ({ ...g, status: 'cancelled' as GarmentStatus })),
      tracking: [...order.tracking, { time: getNow(), action: '订单退单取消', operator: '管理员' }],
    });
  };

  const handleSaveAddress = (newAddr: string) => {
    const newType = changingType ?? order.type;
    onUpdate(order.id, {
      type: newType,
      address: newAddr,
      tracking: [...order.tracking, {
        time: getNow(),
        action: changingType
          ? `订单类型改为 ${TYPE_CFG[newType].label}，地址：${newAddr}`
          : `配送地址改为：${newAddr}`,
        operator: '门店',
      }],
    });
    setAddressOpen(false);
    setChangingType(null);
  };

  const handleShip = () => {
    onUpdate(order.id, {
      garments: order.garments.map(g =>
        g.status === 'on_shelf' ? { ...g, status: 'delivering' as GarmentStatus } : g
      ),
      tracking: [...order.tracking, { time: getNow(), action: '立即发货，配送中', operator: '门店' }],
    });
  };

  const isDeliveryType = order.type === 'B' || order.type === 'C';
  const isException = EXCEPTION_STATUSES.includes(ds);

  return (
    <div className="flex flex-col h-full min-w-0 bg-white">
      <div className="flex items-start gap-3 px-4 py-3 border-b border-slate-100 flex-shrink-0">
        <button onClick={onBack}
          className="sm:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex-shrink-0 mt-0.5">
          <ArrowLeft className="size-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className={`text-xs px-2 py-0.5 rounded border ${TYPE_CFG[order.type].color}`}>
              {TYPE_CFG[order.type].desc}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded ${SRC_CFG[order.source].color}`}>
              {SRC_CFG[order.source].label}
            </span>
            <span className="text-xs text-slate-400">#{order.orderNo}</span>
            {order.isHang && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">挂单未付</span>}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${cfg.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
            </span>
            {order.compensationAmount != null && (
              <span className="text-xs text-rose-500">退赔 ¥{order.compensationAmount.toFixed(2)}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
          <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border border-slate-200 text-slate-500 hover:bg-slate-50">
            <Printer className="size-3.5" /><span className="hidden sm:inline">打小票</span>
          </button>
          {!isException && (
            <>
              <button
                onClick={() => {
                  if (window.confirm('确认退单？此操作将标记所有衣物为已退单状态。')) handleCancel();
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border border-red-200 text-red-500 hover:bg-red-50">
                <RefreshCw className="size-3.5" /><span className="hidden sm:inline">退单</span>
              </button>
              <button onClick={() => setCompensateOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border border-rose-300 text-rose-600 hover:bg-rose-50">
                <DollarSign className="size-3.5" /><span className="hidden sm:inline">退赔</span>
              </button>
            </>
          )}
          {order.isHang && (
            <button onClick={() => setPaymentOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-white active:scale-95"
              style={{ backgroundColor: '#16a34a' }}>
              <Wallet className="size-3.5" />立即收款
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 border-b border-slate-100 space-y-2">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <User className="size-3.5 text-slate-400" />
              <span className="text-xs text-slate-600">{order.customerName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="size-3.5 text-slate-400" />
              <span className="text-xs text-slate-600">{order.phone}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5 text-slate-400" />
            <span className="text-xs text-slate-400">预计：</span>
            <span className="text-xs text-slate-600">{order.expectedAt}</span>
          </div>

          {order.type === 'A' && !isException && (
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <button onClick={() => { setChangingType('C'); setAddressOpen(true); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border border-slate-300 text-slate-600 hover:bg-slate-50">
                <Navigation className="size-3.5" />更改为上门
              </button>
              {hasPendingPickup && (
                <button onClick={() => { setChangingType('B'); setAddressOpen(true); }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border border-violet-200 text-violet-600 hover:bg-violet-50">
                  <Truck className="size-3.5" />更改为配送
                </button>
              )}
            </div>
          )}

          {order.type === 'B' && (
            <div className="mt-2 rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-violet-50">
                <div className="flex items-center gap-1.5">
                  <Send className="size-3.5 text-violet-500" />
                  <span className="text-xs text-violet-700">送上门</span>
                </div>
                {!isException && (
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => { setChangingType(null); setAddressOpen(true); }}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] border border-violet-300 text-violet-600 hover:bg-violet-100">
                      <UserCog className="size-3" />改地址
                    </button>
                    <button onClick={handleShip}
                      disabled={!order.garments.some(g => g.status === 'on_shelf')}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-white disabled:opacity-40"
                      style={{ backgroundColor: '#fd780f' }}>
                      <Truck className="size-3" />发货
                    </button>
                    <button className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] border border-slate-200 text-slate-500 hover:bg-slate-50">
                      <Navigation className="size-3" />派单
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-start gap-2 px-3 py-2">
                <MapPin className="size-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-slate-600 leading-relaxed">{order.address || '暂无地址'}</p>
              </div>
            </div>
          )}

          {order.type === 'C' && (
            <div className="mt-2 space-y-2">
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-teal-50">
                  <div className="flex items-center gap-1.5">
                    <Navigation className="size-3.5 text-teal-500" />
                    <span className="text-xs text-teal-700">上门取衣</span>
                  </div>
                  {!isException && (
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => { setChangingType(null); setAddressOpen(true); }}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] border border-teal-300 text-teal-600 hover:bg-teal-100">
                        <UserCog className="size-3" />改地址
                      </button>
                      <button className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] border border-slate-200 text-slate-500 hover:bg-slate-50">
                        <Navigation className="size-3" />派单
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-start gap-2 px-3 py-2">
                  <MapPin className="size-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-600 leading-relaxed">{order.address || '暂无地址'}</p>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-violet-50">
                  <div className="flex items-center gap-1.5">
                    <Send className="size-3.5 text-violet-500" />
                    <span className="text-xs text-violet-700">送上门</span>
                  </div>
                  {!isException && (
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => { setChangingType(null); setAddressOpen(true); }}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] border border-violet-300 text-violet-600 hover:bg-violet-100">
                        <UserCog className="size-3" />改地址
                      </button>
                      <button onClick={handleShip}
                        disabled={!order.garments.some(g => g.status === 'on_shelf')}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-white disabled:opacity-40"
                        style={{ backgroundColor: '#fd780f' }}>
                        <Truck className="size-3" />发货
                      </button>
                      <button className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] border border-slate-200 text-slate-500 hover:bg-slate-50">
                        <Navigation className="size-3" />派单
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-start gap-2 px-3 py-2">
                  <MapPin className="size-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-600 leading-relaxed">{order.address || '暂无地址'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <NotesSection order={order} onAddMessage={(content) => {
          const msg: OrderMessage = {
            id: Date.now().toString(),
            time: getNow(),
            content,
            operator: '门店',
          };
          onUpdate(order.id, { messages: [...(order.messages ?? []), msg] });
        }} />

        <Section
          title="衣物信息"
          extra={
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                共{order.garments.length}件
                <span className="ml-2 text-slate-800">¥{order.totalAmount.toFixed(2)}</span>
              </span>
              {hasPendingPickup && (
                <button onClick={toggleAll}
                  className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-orange-500 transition-colors">
                  {allSelected
                    ? <CheckSquare className="size-3.5" style={{ color:'#fd780f' }} />
                    : <Square className="size-3.5" />}
                  全选
                </button>
              )}
            </div>
          }
        >
          <div>
            {order.garments.map(g => (
              <GarmentRow key={g.id} garment={g}
                canSelect={g.status === 'on_shelf' && order.type === 'A'}
                isSelected={selectedIds.has(g.id)}
                onToggleSelect={toggleGarment}
              />
            ))}
          </div>
          {selectedIds.size > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">已选 {selectedIds.size} 件</span>
              <button onClick={handleConfirmPickup}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs text-white active:scale-95"
                style={{ backgroundColor: '#fd780f' }}>
                <CheckCircle className="size-3.5" />确认自取（{selectedIds.size}件）
              </button>
            </div>
          )}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-1">
            <span className="text-xs text-slate-400">实付金额</span>
            <span className="text-base" style={{ color: '#fd780f' }}>¥{order.totalAmount.toFixed(2)}</span>
          </div>
        </Section>

        <Section title="订单信息" defaultOpen={false}>
          <div className="space-y-2">
            {[
              { Icon: Hash,     label: '订单编号', value: order.orderNo },
              { Icon: Calendar, label: '收衣时间', value: order.receivedAt },
              { Icon: Package,  label: '衣物数量', value: `${order.garments.length} 件` },
              { Icon: Clock,    label: '预计完成', value: order.expectedAt },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon className="size-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-xs text-slate-400 w-16 flex-shrink-0">{label}</span>
                <span className="text-xs text-slate-700">{value}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="订单跟踪">
          <div className="relative pl-2">
            <div className="absolute left-[13px] top-2 bottom-4 w-px bg-slate-100" />
            <div className="space-y-4">
              {[...order.tracking].reverse().map((ev, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${i === 0 ? '' : 'bg-slate-100'}`}
                    style={i === 0 ? { backgroundColor: '#fd780f' } : {}}>
                    {i === 0 && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1 pt-0.5 min-w-0">
                    <p className="text-xs text-slate-700">{ev.action}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400">{ev.time}</span>
                      <span className="text-[10px] text-slate-400">{ev.operator}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>

      {paymentOpen && <PaymentModal amount={order.totalAmount} onClose={() => setPaymentOpen(false)} onConfirm={handleConfirmPayment} />}
      {addressOpen && <AddressEditModal currentAddress={order.address} customerName={order.customerName} customerPhone={order.phone}
        onClose={() => { setAddressOpen(false); setChangingType(null); }} onSave={handleSaveAddress} />}
      {compensateOpen && <CompensateModal onClose={() => setCompensateOpen(false)} onConfirm={handleCompensate} />}
    </div>
  );
}

/* ══════════════════════════════════════
   主组件
══════════════════════════════════════ */
export default function ClothesStock({ searchQuery: externalSearch = '' }: { searchQuery?: string }) {
  const { orders: ctxOrders, setOrders: setCtxOrders, hookSlots, setHookSlots } = useAppStore();
  const [orders, setOrdersLocal] = useState<Order[]>(ctxOrders as unknown as Order[]);
  const [selectedId, setSelectedId] = useState<string>(ctxOrders[0]?.id ?? '');
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const searchQuery = externalSearch;

  useEffect(() => { setOrdersLocal(ctxOrders as unknown as Order[]); }, [ctxOrders]);

  const setOrders = (updater: Order[] | ((prev: Order[]) => Order[])) => {
    const next = typeof updater === 'function' ? updater(orders) : updater;
    setOrdersLocal(next);
    setCtxOrders(next as unknown as any);
  };

  const handleUpdate = (orderId: string, patch: Partial<Order>) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...patch } : o));
  };

  const handleReleaseSlots = (garmentIds: string[]) => {
    const allGarments = orders.flatMap(o => o.garments);
    const slotIds = garmentIds
      .map(gid => allGarments.find(g => g.id === gid)?.hookSlotId)
      .filter((id): id is string => !!id);
    if (slotIds.length > 0) {
      setHookSlots(hookSlots.map(s => slotIds.includes(s.id)
        ? { id: s.id, zoneId: s.zoneId, zoneName: s.zoneName, label: s.label, status: 'free' as const }
        : s
      ));
    }
  };

  const selectedOrder = useMemo(() => orders.find(o => o.id === selectedId), [orders, selectedId]);

  type FilterDef = { value: string; label: string; test: (o: Order) => boolean };
  const FILTER_GROUPS: FilterDef[] = [
    { value: 'all',      label: '全部',   test: () => true },
    { value: 'pickup',   label: '取收衣',  test: o => { const p = GS[derivedStatus(o)].phase; return p >= 0 && p <= 4; } },
    { value: 'wash',     label: '洗涤中',  test: o => { const p = GS[derivedStatus(o)].phase; return p >= 5 && p <= 12; } },
    { value: 'ready',    label: '待交付',  test: o => { const p = GS[derivedStatus(o)].phase; return p >= 13 && p <= 16; } },
    { value: 'done',     label: '已完成',  test: o => derivedStatus(o) === 'completed' },
    { value: 'exception',label: '异常',   test: o => EXCEPTION_STATUSES.includes(derivedStatus(o)) },
  ];

  const filteredOrders = useMemo(() => {
    const group = FILTER_GROUPS.find(g => g.value === filterGroup)!;
    return orders.filter(o => {
      if (!group.test(o)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchOrder = o.orderNo.includes(q) || o.customerName.includes(q) || o.phone.includes(q)
          || ((o as any).bagNo && (o as any).bagNo.toLowerCase().includes(q));
        const matchGarment = o.garments.some(g =>
          g.label.toLowerCase().includes(q) || (g.bindTag && g.bindTag.toLowerCase().includes(q))
        );
        return matchOrder || matchGarment;
      }
      return true;
    });
  }, [orders, filterGroup, searchQuery]);

  const groupCounts = useMemo(() => {
    const map: Record<string, number> = {};
    FILTER_GROUPS.forEach(g => { map[g.value] = orders.filter(g.test).length; });
    return map;
  }, [orders]);

  return (
    <div className="-m-4 sm:-m-5 lg:-m-6 flex overflow-hidden bg-slate-50" style={{ height: 'calc(100vh - 4rem)' }}>

      <div className={`flex flex-col border-r border-slate-200 bg-white flex-shrink-0
        w-full sm:w-60 lg:w-64
        ${mobileView === 'detail' ? 'hidden sm:flex' : 'flex'}`}>
        <div className="px-4 pt-4 pb-3 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-base text-slate-700">洗护订单</span>
            <span className="text-sm text-slate-400">{orders.length} 单</span>
          </div>
          {searchQuery && (
            <div className="text-xs text-orange-600 bg-orange-50 rounded-xl px-3 py-1.5 mb-2">
              正在搜索：{searchQuery}，共 {filteredOrders.length} 条结果
            </div>
          )}
        </div>
        <div className="overflow-x-auto flex-shrink-0 border-b border-slate-100">
          <div className="flex min-w-max px-2">
            {FILTER_GROUPS.map(g => {
              const active = filterGroup === g.value;
              return (
                <button key={g.value} onClick={() => setFilterGroup(g.value)}
                  className={`relative px-2.5 py-2 text-xs whitespace-nowrap transition-colors ${
                    active ? 'text-orange-500' : 'text-slate-500 hover:text-slate-700'
                  }`}>
                  {g.label}
                  {groupCounts[g.value] > 0 && (
                    <span className={`ml-1 text-[10px] px-1 rounded-full ${
                      active ? 'bg-orange-100 text-orange-500' : 'bg-slate-100 text-slate-400'
                    }`}>{groupCounts[g.value]}</span>
                  )}
                  {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: '#fd780f' }} />}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-300">
              <Package className="size-8 mb-2" /><p className="text-xs">暂无订单</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <OrderCard key={order.id} order={order} selected={order.id === selectedId}
                onClick={() => { setSelectedId(order.id); setMobileView('detail'); }} />
            ))
          )}
        </div>
      </div>

      <div className={`flex-1 min-w-0 overflow-hidden ${mobileView === 'list' ? 'hidden sm:block' : 'block'}`}>
        {selectedOrder ? (
          <OrderDetail order={selectedOrder} onBack={() => setMobileView('list')} onUpdate={handleUpdate} onReleaseSlots={handleReleaseSlots} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-300">
            <Shirt className="size-10 mb-3" /><p className="text-sm">从左侧选择订单查看详情</p>
          </div>
        )}
      </div>
    </div>
  );
}
