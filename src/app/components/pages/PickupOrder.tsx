import { useState, useMemo, useEffect } from 'react';
import { useAppStore, type GarmentRecord } from '../../data/AppContext';
import {
  Store, Package, Shirt, CheckSquare, Square,
  CheckCircle, Hash, MapPin, X,
} from 'lucide-react';

function getNow(): string {
  return new Date().toLocaleString('zh-CN', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).replace(/\//g, '-');
}

interface BatchGarment {
  orderId: string; orderNo: string; customerName: string; phone: string;
  garment: GarmentRecord;
}

export default function PickupOrder({ searchQuery = '' }: { searchQuery?: string }) {
  const { orders, setOrders } = useAppStore();

  const [batchInput, setBatchInput] = useState(searchQuery);
  const [searchedBatch, setSearchedBatch] = useState(searchQuery);

  useEffect(() => {
    if (searchQuery.trim()) {
      setBatchInput(searchQuery.trim());
      setSearchedBatch(searchQuery.trim());
      setSelectedIds(new Set());
    }
  }, [searchQuery]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const activeBatches = useMemo(() => {
    const inTransitStatuses = new Set([
      'sent_wash','factory_in','factory_sorted','washing',
      'initial_check','ironing','final_check','packing','factory_out',
    ]);
    const batchSet = new Set<string>();
    orders.forEach(o => o.garments.forEach(g => {
      if (g.batchId && inTransitStatuses.has(g.status)) batchSet.add(g.batchId);
    }));
    return Array.from(batchSet).sort();
  }, [orders]);

  const batchItems: BatchGarment[] = useMemo(() => {
    if (!searchedBatch) return [];
    const q = searchedBatch.trim().toLowerCase();
    const result: BatchGarment[] = [];
    orders.forEach(o => {
      o.garments.forEach(g => {
        const matchBatch = g.batchId && (g.batchId === searchedBatch.trim() || g.batchId.toLowerCase().includes(q));
        const matchCustomer = o.customerName.includes(q) || o.phone.includes(q);
        if (matchBatch || matchCustomer) {
          result.push({ orderId: o.id, orderNo: o.orderNo, customerName: o.customerName, phone: o.phone, garment: g });
        }
      });
    });
    return result;
  }, [orders, searchedBatch]);

  const allSelected = batchItems.length > 0 && batchItems.every(item => selectedIds.has(item.garment.id));

  const toggleItem = (garmentId: string) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(garmentId) ? n.delete(garmentId) : n.add(garmentId); return n; });
  };

  const toggleAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(batchItems.map(i => i.garment.id)));
  };

  const confirmArrival = () => {
    if (selectedIds.size === 0) return;
    const now = getNow();
    setOrders(orders.map(order => {
      const toUpdate = order.garments.filter(g => selectedIds.has(g.id)).map(g => g.id);
      if (toUpdate.length === 0) return order;
      return {
        ...order,
        garments: order.garments.map(g =>
          toUpdate.includes(g.id) ? { ...g, status: 'store_in' as const } : g
        ),
        tracking: [...order.tracking, {
          time: now,
          action: `批次 ${searchedBatch} 到店，${toUpdate.length}件已入库`,
          operator: '前台',
        }],
      };
    }));
    setSelectedIds(new Set());
  };

  const statusCN: Record<string, string> = {
    sent_wash:'已送洗', factory_in:'已入厂', factory_sorted:'工厂分拣',
    washing:'洗涤中', initial_check:'初检', ironing:'熨烫',
    final_check:'总检', packing:'打包', factory_out:'已出厂', store_in:'已入库',
  };

  return (
    <div className="-m-4 sm:-m-5 lg:-m-6 flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
      <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor:'#fff3e8' }}>
            <Store className="size-5" style={{ color:'#fd780f' }} />
          </div>
          <div>
            <h2 className="text-base text-slate-800">批次到店</h2>
            <p className="text-xs text-slate-400">输入或扫描批次号，确认衣物到店入库</p>
          </div>
        </div>
        {searchedBatch && (
          <p className="text-xs text-orange-600 bg-orange-50 rounded-xl px-3 py-1.5 inline-block">
            批次：{searchedBatch} · {batchItems.length} 件
          </p>
        )}
      </div>

      <div className="flex-1 overflow-hidden flex">
        <div className="hidden lg:flex flex-col w-52 border-r border-slate-200 bg-white flex-shrink-0">
          <p className="px-4 pt-3 pb-2 text-xs text-slate-400 border-b border-slate-100">在途批次</p>
          <div className="flex-1 overflow-y-auto">
            {activeBatches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-300 px-4">
                <Hash className="size-6 mb-1" />
                <p className="text-[11px] text-center">暂无在途批次</p>
              </div>
            ) : (
              activeBatches.map(bn => (
                <button key={bn} onClick={() => { setBatchInput(bn); setSearchedBatch(bn); setSelectedIds(new Set()); }}
                  className={`w-full text-left px-4 py-2.5 text-xs border-b border-slate-100 transition-colors ${
                    searchedBatch === bn ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'
                  }`}>
                  <span className="font-mono">{bn}</span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
          {!searchedBatch ? (
            <div className="flex flex-col items-center justify-center flex-1 text-slate-300 px-4">
              <Package className="size-12 mb-3" />
              <p className="text-sm">请输入批次号查询</p>
            </div>
          ) : batchItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-slate-300 px-4">
              <X className="size-10 mb-2" />
              <p className="text-sm">未找到批次 {searchedBatch}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-b border-slate-200 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <button onClick={toggleAll} className="text-slate-400 hover:text-orange-500 transition-colors">
                    {allSelected
                      ? <CheckSquare className="size-4" style={{ color:'#fd780f' }} />
                      : <Square className="size-4" />}
                  </button>
                  <div>
                    <p className="text-sm text-slate-800">批次 <span className="font-mono">{searchedBatch}</span></p>
                    <p className="text-xs text-slate-400">{batchItems.length} 件衣物</p>
                  </div>
                </div>
                <button onClick={confirmArrival} disabled={selectedIds.size === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white transition-all active:scale-95 disabled:opacity-40"
                  style={{ backgroundColor: '#fd780f' }}>
                  <CheckCircle className="size-4" />
                  确认到店{selectedIds.size > 0 ? `（${selectedIds.size}件）` : ''}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 space-y-2">
                {batchItems.map(({ orderId, orderNo, customerName, garment }) => (
                  <div key={garment.id} onClick={() => toggleItem(garment.id)}
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
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                          garment.status === 'factory_out' ? 'bg-orange-50 border-orange-200 text-orange-600'
                          : garment.status === 'store_in' ? 'bg-green-50 border-green-200 text-green-700'
                          : 'bg-sky-50 border-sky-200 text-sky-700'
                        }`}>{statusCN[garment.status] ?? garment.status}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono text-slate-400">{garment.label}</span>
                        <span className="text-[10px] text-slate-400">{customerName} · #{orderNo}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-sm text-slate-700">¥{garment.price.toFixed(2)}</span>
                      {garment.hookSlotLabel ? (
                        <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600">
                          <MapPin className="size-2.5" />{garment.hookSlotLabel}
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-400">未分配挂点</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
