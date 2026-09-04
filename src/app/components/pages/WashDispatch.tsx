import { useState, useMemo } from 'react';
import { useAppStore, type AppOrder, type GarmentRecord } from '../../data/AppContext';
import {
  Truck, Package, Shirt, CheckSquare, Square, Hash,
  ChevronDown, ChevronUp, AlertTriangle, X, Check,
} from 'lucide-react';

function getNow(): string {
  return new Date().toLocaleString('zh-CN', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).replace(/\//g, '-');
}

function genBatchNo(): string {
  const d = new Date();
  const ds = `${String(d.getFullYear()).slice(2)}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  return `B${ds}-${String(Math.floor(Math.random()*90+10))}`;
}

function GarmentLine({ garment, orderId, orderNo, customerName, isSelected, onToggle }: {
  garment: GarmentRecord; orderId: string; orderNo: string; customerName: string;
  isSelected: boolean; onToggle: (orderId: string, garmentId: string) => void;
}) {
  return (
    <div
      onClick={() => onToggle(orderId, garment.id)}
      className={`flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-0 cursor-pointer transition-colors
        ${isSelected ? 'bg-orange-50' : 'hover:bg-slate-50'}`}
    >
      {isSelected
        ? <CheckSquare className="size-4 flex-shrink-0" style={{ color:'#fd780f' }} />
        : <Square className="size-4 flex-shrink-0 text-slate-300" />}
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor:'#fff3e8' }}>
        <Shirt className="size-3.5" style={{ color:'#fd780f' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-800">{garment.type}</span>
          {garment.brand && <span className="text-xs text-slate-400">{garment.brand}</span>}
          {garment.color && <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{garment.color}</span>}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-mono text-slate-400">{garment.label}</span>
          <span className="text-[10px] text-slate-400">单# {orderNo}</span>
          <span className="text-[10px] text-slate-400">{customerName}</span>
        </div>
      </div>
      <span className="text-sm text-slate-700 flex-shrink-0">¥{garment.price.toFixed(2)}</span>
    </div>
  );
}

function OrderGroup({ order, selectedKeys, onToggle, onToggleAll }: {
  order: AppOrder; selectedKeys: Set<string>;
  onToggle: (orderId: string, garmentId: string) => void;
  onToggleAll: (orderId: string, garmentIds: string[]) => void;
}) {
  const [open, setOpen] = useState(true);
  const receivedGarments = order.garments.filter(g => g.status === 'received');
  const allSel = receivedGarments.length > 0 && receivedGarments.every(g => selectedKeys.has(`${order.id}:${g.id}`));

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div onClick={() => setOpen(o => !o)}
        className="flex items-center gap-3 px-4 py-3 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
        <div onClick={e => { e.stopPropagation(); onToggleAll(order.id, receivedGarments.map(g => g.id)); }}>
          {allSel
            ? <CheckSquare className="size-4" style={{ color:'#fd780f' }} />
            : <Square className="size-4 text-slate-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-800">{order.customerName}</span>
            <span className="text-xs text-slate-400">#{order.orderNo}</span>
          </div>
          <span className="text-[10px] text-slate-400">{receivedGarments.length} 件待送洗</span>
        </div>
        {open ? <ChevronUp className="size-4 text-slate-400" /> : <ChevronDown className="size-4 text-slate-400" />}
      </div>
      {open && receivedGarments.map(g => (
        <GarmentLine key={g.id} garment={g} orderId={order.id} orderNo={order.orderNo}
          customerName={order.customerName}
          isSelected={selectedKeys.has(`${order.id}:${g.id}`)} onToggle={onToggle} />
      ))}
    </div>
  );
}

export default function WashDispatch({ searchQuery = '' }: { searchQuery?: string }) {
  const { orders, setOrders } = useAppStore();

  const readyOrders = useMemo(() => {
    const all = orders.filter(o => o.garments.some(g => g.status === 'received'));
    if (!searchQuery.trim()) return all;
    const q = searchQuery.trim().toLowerCase();
    return all.filter(o => o.customerName.includes(q) || o.orderNo.includes(q) || o.phone.includes(q));
  }, [orders, searchQuery]);

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchNo, setBatchNo]   = useState('');
  const [batchNote, setBatchNote] = useState('');

  const toggleGarment = (orderId: string, garmentId: string) => {
    const key = `${orderId}:${garmentId}`;
    setSelectedKeys(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  };

  const toggleOrderAll = (orderId: string, garmentIds: string[]) => {
    const keys = garmentIds.map(gid => `${orderId}:${gid}`);
    const allSel = keys.every(k => selectedKeys.has(k));
    setSelectedKeys(prev => {
      const n = new Set(prev);
      if (allSel) keys.forEach(k => n.delete(k)); else keys.forEach(k => n.add(k));
      return n;
    });
  };

  const openBatchModal = () => { setBatchNo(genBatchNo()); setBatchNote(''); setBatchModalOpen(true); };

  const confirmBatch = () => {
    if (!batchNo.trim() || selectedKeys.size === 0) return;
    const now = getNow();
    const bn = batchNo.trim();
    setOrders(orders.map(order => {
      const toUpdate = order.garments.filter(g => selectedKeys.has(`${order.id}:${g.id}`)).map(g => g.id);
      if (toUpdate.length === 0) return order;
      return {
        ...order,
        garments: order.garments.map(g =>
          toUpdate.includes(g.id) ? { ...g, status: 'sent_wash' as const, batchId: bn } : g
        ),
        tracking: [...order.tracking, {
          time: now,
          action: `${toUpdate.length}件打包送洗，批次 ${bn}${batchNote ? '：'+batchNote : ''}`,
          operator: '门店',
        }],
      };
    }));
    setSelectedKeys(new Set());
    setBatchModalOpen(false);
  };

  const selectedCount = selectedKeys.size;
  const totalGarments = readyOrders.reduce((s, o) => s + o.garments.filter(g => g.status === 'received').length, 0);

  return (
    <div className="-m-4 sm:-m-5 lg:-m-6 flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-200 bg-white flex-shrink-0">
        <div>
          <h2 className="text-base text-slate-800">送洗管理</h2>
          <p className="text-xs text-slate-400 mt-0.5">共 {totalGarments} 件衣物已收衣待送洗</p>
        </div>
        <button onClick={openBatchModal} disabled={selectedCount === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white transition-all active:scale-95 disabled:opacity-40"
          style={{ backgroundColor: '#fd780f' }}>
          <Truck className="size-4" />
          打包送洗{selectedCount > 0 ? `（${selectedCount}件）` : ''}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 bg-slate-50">
        {readyOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-300">
            <Package className="size-12 mb-3" />
            <p className="text-sm">暂无待送洗衣物</p>
            <p className="text-xs mt-1">下单收衣后将在此列表显示</p>
          </div>
        ) : (
          readyOrders.map(order => (
            <OrderGroup key={order.id} order={order} selectedKeys={selectedKeys}
              onToggle={toggleGarment} onToggleAll={toggleOrderAll} />
          ))
        )}
      </div>

      {batchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-80 overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
              <h3 className="text-base text-slate-800">创建送洗批次</h3>
              <button onClick={() => setBatchModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="size-4" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">批次号</label>
                <div className="flex gap-2">
                  <input value={batchNo} onChange={e => setBatchNo(e.target.value)}
                    className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-sm font-mono text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
                  <button onClick={() => setBatchNo(genBatchNo())}
                    className="px-2.5 h-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 flex-shrink-0">
                    <Hash className="size-3.5" />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">备注（可选）</label>
                <input value={batchNote} onChange={e => setBatchNote(e.target.value)} placeholder="如：今日下午批次"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
              </div>
              <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-xl">
                <AlertTriangle className="size-4 flex-shrink-0 mt-0.5" style={{ color:'#fd780f' }} />
                <p className="text-xs text-slate-600">共 <strong>{selectedCount}</strong> 件衣物，确认后状态更新为"已送洗"</p>
              </div>
            </div>
            <div className="px-5 pb-5 flex gap-3">
              <button onClick={() => setBatchModalOpen(false)}
                className="flex-1 h-10 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-50">取消</button>
              <button onClick={confirmBatch} disabled={!batchNo.trim()}
                className="flex-1 h-10 rounded-xl text-white text-sm active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                style={{ backgroundColor: '#fd780f' }}>
                <Check className="size-4" />确认送洗
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
