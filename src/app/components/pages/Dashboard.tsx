import { useMemo } from 'react';
import { useAppStore } from '../../data/AppContext';
import {
  ShoppingBag, DollarSign, UserPlus, Package, Truck, AlertCircle,
  ChevronRight, ShoppingCart, Shirt, Users,
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string | number; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '1a' }}>
        <Icon className="size-6" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 mb-0.5">{label}</p>
        <p className="text-2xl text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function PendingCard({ icon: Icon, label, count, color }: {
  icon: React.ElementType; label: string; count: number; color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '1a' }}>
        <Icon className="size-4" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-xl text-slate-800">{count} <span className="text-xs text-slate-400">件</span></p>
      </div>
    </div>
  );
}

export default function Dashboard({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { orders } = useAppStore();

  const stats = useMemo(() => {
    let pendingHang = 0, pendingDeliver = 0, pendingPay = 0;
    orders.forEach(o => {
      o.garments.forEach(g => {
        if (g.status === 'store_in') pendingHang++;
        if (g.status === 'on_shelf' && (o.type === 'B' || o.type === 'C')) pendingDeliver++;
      });
      if (o.isHang) pendingPay++;
    });
    const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
    const uniqueCustomers = new Set(orders.map(o => o.phone)).size;
    return { totalRevenue, customerCount: uniqueCustomers, pendingHang, pendingDeliver, pendingPay };
  }, [orders]);

  const recentOrders = useMemo(() =>
    [...orders].sort((a, b) => b.receivedAt.localeCompare(a.receivedAt)).slice(0, 5),
    [orders]
  );

  const statusLabel: Record<string, string> = {
    ordered: '已下单', received: '已收衣', sent_wash: '送洗中',
    on_shelf: '待取衣', delivering: '配送中', completed: '已完成',
    washing: '洗涤中', store_in: '待上架', cancelled: '已取消',
    factory_in: '已入厂', factory_out: '已出厂', packing: '打包中',
  };

  const quickActions = [
    { label: '快速下单', page: 'order', icon: ShoppingCart, color: '#fd780f' },
    { label: '查看订单', page: 'clothes', icon: Shirt, color: '#6366f1' },
    { label: '客户管理', page: 'customer', icon: Users, color: '#10b981' },
  ];

  return (
    <div className="space-y-5 max-w-4xl mx-auto">

      {/* 今日数据 */}
      <section>
        <h2 className="text-xs text-slate-400 mb-3 px-0.5 tracking-wider uppercase">今日数据</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard icon={ShoppingBag} label="订单总数" value={`${orders.length} 单`} color="#fd780f" />
          <StatCard icon={DollarSign} label="累计营业额" value={`¥${stats.totalRevenue.toFixed(0)}`} color="#6366f1" />
          <StatCard icon={UserPlus} label="会员总数" value={`${stats.customerCount} 位`} color="#10b981" />
        </div>
      </section>

      {/* 待办事项 */}
      <section>
        <h2 className="text-xs text-slate-400 mb-3 px-0.5 tracking-wider uppercase">待办事项</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <PendingCard icon={Package} label="待上架" count={stats.pendingHang} color="#f59e0b" />
          <PendingCard icon={Truck} label="待配送" count={stats.pendingDeliver} color="#3b82f6" />
          <PendingCard icon={AlertCircle} label="挂单未付" count={stats.pendingPay} color="#ef4444" />
        </div>
      </section>

      {/* 最近订单 + 快捷操作 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* 最近订单 */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm text-slate-700">最近订单</h3>
            {onNavigate && (
              <button onClick={() => onNavigate('clothes')}
                className="flex items-center gap-1 text-xs hover:underline"
                style={{ color: '#fd780f' }}>
                全部 <ChevronRight className="size-3" />
              </button>
            )}
          </div>
          <div className="divide-y divide-slate-50">
            {recentOrders.map(order => {
              const firstStatus = order.garments[0]?.status ?? 'ordered';
              return (
                <div key={order.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs text-white"
                    style={{ backgroundColor: order.type === 'A' ? '#6366f1' : order.type === 'B' ? '#10b981' : '#fd780f' }}>
                    {order.type}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-800">{order.customerName}</span>
                      <span className="text-xs text-slate-400">#{order.orderNo}</span>
                    </div>
                    <p className="text-xs text-slate-400">{order.garments.length} 件 · {order.receivedAt}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-sm text-slate-700">¥{order.totalAmount.toFixed(0)}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      {statusLabel[firstStatus] ?? firstStatus}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm text-slate-700">快捷操作</h3>
          </div>
          <div className="p-4 flex flex-col gap-2.5">
            {quickActions.map(({ label, page, icon: Icon, color }) => (
              <button key={page} onClick={() => onNavigate?.(page)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors text-left active:scale-[0.98]">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '1a' }}>
                  <Icon className="size-4" style={{ color }} />
                </div>
                <span className="text-sm text-slate-700">{label}</span>
                <ChevronRight className="size-4 text-slate-300 ml-auto" />
              </button>
            ))}
            <div className="mt-1 p-3 rounded-xl" style={{ backgroundColor: '#fff7ed' }}>
              <p className="text-xs text-slate-500 mb-1">门店状态</p>
              <p className="text-xs text-slate-600">正常营业中 · 共 {orders.length} 单在流转</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
