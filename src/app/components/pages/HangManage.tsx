import { useState, useMemo } from 'react';
import { useAppStore, type GarmentRecord } from '../../data/AppContext';
import {
  Tag, Shirt, CheckSquare, Square, CheckCircle, Package, MapPin,
} from 'lucide-react';

function getNow(): string {
  return new Date().toLocaleString('zh-CN', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).replace(/\//g, '-');
}

interface StoreInItem {
  orderId: string; orderNo: string; customerName: string; phone: string;
  garment: GarmentRecord;
}

export default function HangManage({ searchQuery = '' }: { searchQuery?: string }) {
  const { orders, setOrders, hookSlots, setHookSlots } = useAppStore();

  const allStoreInItems: StoreInItem[] = useMemo(() => {
    const result: StoreInItem[] = [];
    orders.forEach(o => {
      o.garments.forEach(g => {
        if (g.status === 'store_in') {
          result.push({ orderId: o.id, orderNo: o.orderNo, customerName: o.customerName, phone: o.phone, garment: g });
        }
      });
    });
    return result;
  }, [orders]);

  const storeInItems: StoreInItem[] = useMemo(() => {
    if (!searchQuery.trim()) return allStoreInItems;
    const q = searchQuery.trim().toLowerCase();
    return allStoreInItems.filter(item =>
      item.garment.label.toLowerCase().includes(q) ||
      (item.garment.batchId && item.garment.batchId.toLowerCase().includes(q)) ||
      item.customerName.includes(q) || item.orderNo.includes(q)
    );
  }, [allStoreInItems, searchQuery]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const allSelected = storeInItems.length > 0 && storeInItems.every(i => selectedIds.has(i.garment.id));

  const toggle = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(storeInItems.map(i => i.garment.id)));
  };

  const confirmHang = () => {
    if (selectedIds.size === 0) return;
    const now = getNow();
    setOrders(orders.map(order => {
      const toUpdate = order.garments.filter(g => selectedIds.has(g.id)).map(g => g.id);
      if (toUpdate.length === 0) return order;
      return {
        ...order,
        garments: order.garments.map(g =>
          toUpdate.includes(g.id) ? { ...g, status: 'on_shelf' as const } : g
        ),
        tracking: [...order.tracking, {
          time: now,
          action: `${toUpdate.length}件已上架`,
          operator: '仓管',
        }],
      };
    }));
    const slotIds = storeInItems
      .filter(i => selectedIds.has(i.garment.id) && i.garment.hookSlotId)
      .map(i => i.garment.hookSlotId as string);
    if (slotIds.length > 0) {
      setHookSlots(hookSlots.map(s => slotIds.includes(s.id) ? { ...s, status: 'ready' as const } : s));
    }
    setSelectedIds(new Set());
  };

  return (
    <div className="-m-4 sm:-m-5 lg:-m-6 flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor:'#fff3e8' }}>
            <Tag className="size-5" style={{ color:'#fd780f' }} />
          </div>
          <div>
            <h2 className="text-base text-slate-800">上挂管理</h2>
            <p className="text-xs text-slate-400">{storeInItems.length} 件衣物已入库等待上架</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
            {allSelected ? <CheckSquare className="size-4" style={{ color:'#fd780f' }} /> : <Square className="size-4" />}
            全选
          </button>
          <button onClick={confirmHang} disabled={selectedIds.size === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white transition-all active:scale-95 disabled:opacity-40"
            style={{ backgroundColor: '#fd780f' }}>
            <CheckCircle className="size-4" />
            确认上架{selectedIds.size > 0 ? `（${selectedIds.size}件）` : ''}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 bg-slate-50">
        {storeInItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-300">
            <Package className="size-12 mb-3" />
            <p className="text-sm">暂无待上架衣物</p>
            <p className="text-xs mt-1">批次到店入库后将在此列表显示</p>
          </div>
        ) : (
          <div className="space-y-2">
            {storeInItems.map(({ orderId, orderNo, customerName, garment }) => (
              <div key={garment.id} onClick={() => toggle(garment.id)}
                className={`flex items-center gap-3 bg-white rounded-xl px-4 py-3 border cursor-pointer transition-all
                  ${selectedIds.has(garment.id) ? 'border-orange-300 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}>
                {selectedIds.has(garment.id)
                  ? <CheckSquare className="size-4 flex-shrink-0" style={{ color:'#fd780f' }} />
                  : <Square className="size-4 flex-shrink-0 text-slate-300" />}
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor:'#fff3e8' }}>
                  <Shirt className="size-4" style={{ color:'#fd780f' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-slate-800">{garment.type}</span>
                    {garment.brand && <span className="text-xs text-slate-400">{garment.brand}</span>}
                    {garment.color && <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{garment.color}</span>}
                    {garment.batchId && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-600 font-mono">{garment.batchId}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[10px] font-mono text-slate-400">{garment.label}</span>
                    <span className="text-[10px] text-slate-400">{customerName} · #{orderNo}</span>
                    {garment.defects.length > 0 && <span className="text-[10px] text-red-400">{garment.defects.join('、')}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-sm text-slate-700">¥{garment.price.toFixed(2)}</span>
                  {garment.hookSlotLabel ? (
                    <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600">
                      <MapPin className="size-2.5"/>{garment.hookSlotLabel}
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-400">未分配挂点</span>
                  )}
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-lime-50 border border-lime-200 text-lime-700">已入库</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
