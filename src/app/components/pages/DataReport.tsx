import { useState, useMemo } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import {
  TrendingUp, ShoppingCart, Users, Wallet,
  Building2, Info, CreditCard,
} from 'lucide-react';
import { useAppStore, getMemberTier } from '../../data/AppContext';

/* ── static mock historical data (supplements real AppContext data) ─── */
const MONTHLY = [
  { m: '4月', rev: 42800, orders: 318, recharge: 18200, redemption: 13800, newMbr: 24 },
  { m: '5月', rev: 38600, orders: 291, recharge: 15600, redemption: 11200, newMbr: 19 },
  { m: '6月', rev: 45200, orders: 342, recharge: 21800, redemption: 17600, newMbr: 31 },
  { m: '7月', rev: 51400, orders: 386, recharge: 23600, redemption: 19400, newMbr: 28 },
  { m: '8月', rev: 48100, orders: 363, recharge: 18900, redemption: 15300, newMbr: 22 },
  { m: '9月', rev: 15200, orders: 118, recharge: 7200,  redemption: 5800,  newMbr: 8  },
];

const PAYMENT_DATA = [
  { name: '微信支付', value: 42, color: '#22c55e' },
  { name: '支付宝',   value: 28, color: '#3b82f6' },
  { name: '储值消费', value: 18, color: '#fd780f' },
  { name: '现金',     value: 12, color: '#8b5cf6' },
];

const CATEGORY_DATA = [
  { name: '上衣外套', rev: 85400, color: '#fd780f' },
  { name: '皮衣皮具', rev: 72100, color: '#a855f7' },
  { name: '裤子裙子', rev: 48200, color: '#22c55e' },
  { name: '家纺家居', rev: 36800, color: '#14b8a6' },
  { name: '鞋类洗护', rev: 29600, color: '#6366f1' },
  { name: '小件饰品', rev: 18400, color: '#ec4899' },
  { name: '单独熨烫', rev: 15200, color: '#eab308' },
];

const SOURCE_DATA = [
  { name: '到店收衣', value: 45, color: '#fd780f' },
  { name: '小程序',   value: 22, color: '#3b82f6' },
  { name: '美团',     value: 18, color: '#22c55e' },
  { name: '抖音',     value: 10, color: '#ec4899' },
  { name: '其他',     value: 5,  color: '#9ca3af' },
];

const STORE_PERF = [
  { name: '工厂店',   id: 'st1', rev: 72400, orders: 580 },
  { name: '天府店',   id: 'st2', rev: 84200, orders: 641 },
  { name: '高新店',   id: 'st3', rev: 65800, orders: 498 },
  { name: '春熙路店', id: 'st4', rev: 57100, orders: 432 },
];

/* ── helpers ───────────────────────────────────────────────────────── */
const ORANGE = '#fd780f';

const fmtMoney = (n: number) =>
  n >= 10000 ? `¥${(n / 10000).toFixed(1)}万` : `¥${n.toLocaleString()}`;

const fmtYAxis = (v: number) =>
  v >= 10000 ? `${(v / 10000).toFixed(0)}w` : String(v);

/* ── sub-components ────────────────────────────────────────────────── */
function KpiCard({
  icon: Icon, label, value, sub, trend, trendUp,
}: {
  icon: React.ElementType; label: string; value: string;
  sub?: string; trend?: string; trendUp?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fff3e8' }}>
          <Icon className="size-5" style={{ color: ORANGE }} />
        </div>
        {trend && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-800 mb-0.5">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-slate-700 mb-4">{children}</h3>;
}

const TABS = ['概览', '收支 & 储值', '订单分析', '会员报表', '门店对比'];

/* ── main component ────────────────────────────────────────────────── */
export default function DataReport() {
  const [tab, setTab] = useState(0);
  const { members, orders, memberTiers, stores } = useAppStore();

  const totalBalance = useMemo(() => members.reduce((s, m) => s + m.balance, 0), [members]);
  const totalRevenue = useMemo(() => orders.reduce((s, o) => s + o.totalAmount, 0), [orders]);

  const tierDist = useMemo(() => {
    const map: Record<string, number> = {};
    members.forEach(m => {
      const tier = getMemberTier(m.totalSpent, memberTiers);
      map[tier.name] = (map[tier.name] || 0) + 1;
    });
    const colors: Record<string, string> = {
      '普通会员': '#9ca3af', '银卡会员': '#6b7280', '金卡会员': '#f59e0b', '黑卡会员': '#374151',
    };
    return Object.entries(map).map(([name, value]) => ({
      name, value, color: colors[name] ?? '#9ca3af',
    }));
  }, [members, memberTiers]);

  const curMonth  = MONTHLY[5];
  const prevMonth = MONTHLY[4];
  const rechargeTrend = ((curMonth.recharge - prevMonth.recharge) / prevMonth.recharge * 100).toFixed(1);

  /* ── Tab 1: 概览 ─────────────────────────────────────────────── */
  function renderOverview() {
    const histRev = MONTHLY.slice(0, 5).reduce((s, m) => s + m.rev, 0);
    const histOrders = MONTHLY.slice(0, 5).reduce((s, m) => s + m.orders, 0);

    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon={TrendingUp}   label="累计营收"   value={fmtMoney(histRev + totalRevenue)}
            sub="含本月实时数据" trend="12.8%" trendUp />
          <KpiCard icon={ShoppingCart} label="累计订单"   value={`${histOrders + orders.length}单`}
            sub="含进行中订单" trend="8.4%" trendUp />
          <KpiCard icon={Users}        label="注册会员"   value={`${members.length + 142}人`}
            sub="活跃会员 89人" trend="3.2%" trendUp />
          <KpiCard icon={Wallet}       label="储值余额"   value={fmtMoney(totalBalance + 12450)}
            sub="全部会员未消费余额" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <SectionTitle>月度营收趋势（近6个月）</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MONTHLY} margin={{ top: 5, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis key="x" dataKey="m" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis key="y" tickFormatter={fmtYAxis} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={36} />
              <Tooltip key="tip" formatter={(v: any) => [fmtMoney(Number(v)), '营收']}
                contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9', fontSize: 12 }} />
              <Area key="area-rev" type="monotone" dataKey="rev" stroke={ORANGE} strokeWidth={2} fill={ORANGE} fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <SectionTitle>订单来源分布</SectionTitle>
            <div className="flex items-center gap-4">
              <PieChart width={140} height={140}>
                <Pie key="source-pie" data={SOURCE_DATA} cx="50%" cy="50%" innerRadius={42} outerRadius={62}
                  dataKey="value" strokeWidth={2} stroke="#fff">
                  {SOURCE_DATA.map(d => <Cell key={d.name} fill={d.color} />)}
                </Pie>
              </PieChart>
              <div className="flex-1 space-y-2.5">
                {SOURCE_DATA.map(d => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-xs text-slate-600">{d.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <SectionTitle>月度订单量</SectionTitle>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={MONTHLY} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis key="x" dataKey="m" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis key="y" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={30} />
                <Tooltip key="tip" formatter={(v: any) => [v, '订单数']}
                  contentStyle={{ borderRadius: 10, border: '1px solid #f1f5f9', fontSize: 12 }} />
                <Bar key="bar-orders" dataKey="orders" fill={ORANGE} radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  /* ── Tab 2: 收支 & 储值 ───────────────────────────────────────── */
  function renderCashFlow() {
    const directPay = Math.round(curMonth.rev * 0.82);
    const cashIn    = curMonth.recharge + directPay;
    const recognized = curMonth.redemption + directPay;
    const liability  = totalBalance + 12450;

    return (
      <div className="space-y-5">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
          <Info className="size-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800 mb-1">储值充值 ≠ 营收</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              会员充值到账时，您收到了现金但<strong>尚未提供服务</strong>——这笔钱在财务上属于
              <strong>预收账款（负债）</strong>，不能计入营收。只有会员实际消费核销时，才确认营收。
              储值余额是门店对会员的<strong>未来服务义务</strong>，请勿将其与利润混淆。
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="size-4" style={{ color: ORANGE }} />
              <span className="text-xs text-slate-500 font-medium">本月实收现金</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{fmtMoney(cashIn)}</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>充值收款</span><span className="font-medium text-slate-600">{fmtMoney(curMonth.recharge)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>现收服务款</span><span className="font-medium text-slate-600">{fmtMoney(directPay)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="size-4 text-green-500" />
              <span className="text-xs text-slate-500 font-medium">本月确认营收</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{fmtMoney(recognized)}</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>储值核销</span><span className="font-medium text-slate-600">{fmtMoney(curMonth.redemption)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>现收服务款</span><span className="font-medium text-slate-600">{fmtMoney(directPay)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="size-4 text-amber-500" />
              <span className="text-xs text-slate-500 font-medium">储值负债余额</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{fmtMoney(liability)}</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>本月净增</span>
                <span className={`font-medium ${curMonth.recharge > curMonth.redemption ? 'text-amber-500' : 'text-green-600'}`}>
                  +{fmtMoney(curMonth.recharge - curMonth.redemption)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>充值环比</span>
                <span className="font-medium text-slate-600">{rechargeTrend}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <SectionTitle>月度充值 vs. 核销对比</SectionTitle>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={MONTHLY} margin={{ top: 5, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis key="x" dataKey="m" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis key="y" tickFormatter={fmtYAxis} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={36} />
              <Tooltip key="tip" formatter={(v: any) => [fmtMoney(Number(v)), '']}
                contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9', fontSize: 12 }} />
              <Legend key="legend" iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Bar key="bar-recharge"   dataKey="recharge"   name="充值收款" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={26} />
              <Bar key="bar-redemption" dataKey="redemption" name="储值核销" fill={ORANGE}  radius={[4, 4, 0, 0]} maxBarSize={26} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 mt-1.5">
            充值 − 核销 = 本期净增储值负债。长期充值远超核销，说明门店对会员欠有大量服务义务。
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <SectionTitle>收款方式构成（本月）</SectionTitle>
          <div className="flex items-center gap-6">
            <PieChart width={160} height={160}>
              <Pie key="payment-pie" data={PAYMENT_DATA} cx="50%" cy="50%" outerRadius={70}
                dataKey="value" strokeWidth={2} stroke="#fff">
                {PAYMENT_DATA.map(d => <Cell key={d.name} fill={d.color} />)}
              </Pie>
            </PieChart>
            <div className="flex-1 grid grid-cols-2 gap-4">
              {PAYMENT_DATA.map(d => (
                <div key={d.name} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: d.color + '20' }}>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{d.name}</p>
                    <p className="text-sm font-semibold text-slate-700">{d.value}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Tab 3: 订单分析 ─────────────────────────────────────────── */
  function renderOrders() {
    const typeMap: Record<string, string> = {
      A: 'bg-blue-50 text-blue-600',
      B: 'bg-orange-50 text-orange-600',
      C: 'bg-purple-50 text-purple-600',
    };
    const sourceLabel: Record<string, string> = {
      store: '到店', miniapp: '小程序', meituan: '美团', douyin: '抖音', third_party: '其他',
    };

    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <SectionTitle>品类营收排行（累计）</SectionTitle>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={CATEGORY_DATA} layout="vertical"
              margin={{ top: 0, right: 24, left: 8, bottom: 0 }}>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis key="x" type="number" tickFormatter={fmtYAxis}
                tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis key="y" type="category" dataKey="name"
                tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={64} />
              <Tooltip key="tip" formatter={(v: any) => [fmtMoney(Number(v)), '营收']}
                contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9', fontSize: 12 }} />
              <Bar key="bar-cat-rev" dataKey="rev" radius={[0, 4, 4, 0]} maxBarSize={20}>
                {CATEGORY_DATA.map(d => <Cell key={d.name} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">近期订单明细</h3>
            <span className="text-xs text-slate-400">{orders.length} 条</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  {['订单号', '类型', '客户', '来源', '金额', '状态'].map(h => (
                    <th key={h} className={`text-xs font-semibold text-slate-500 py-3 ${h === '金额' ? 'text-right px-5' : 'text-left px-3 first:px-5'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map(o => {
                  const done = o.garments.every(g =>
                    g.status === 'completed' || g.status === 'on_shelf' || g.status === 'store_in'
                  );
                  return (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 text-xs text-slate-700 font-mono">{o.orderNo}</td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeMap[o.type]}`}>{o.type}型</span>
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-700">{o.customerName}</td>
                      <td className="px-3 py-3 text-xs text-slate-500">{sourceLabel[o.source]}</td>
                      <td className="px-5 py-3 text-right text-xs font-semibold text-slate-800">¥{o.totalAmount}</td>
                      <td className="px-3 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${done ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                          {done ? '已完成' : '进行中'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  /* ── Tab 4: 会员报表 ─────────────────────────────────────────── */
  function renderMembers() {
    const topMembers  = [...members].sort((a, b) => b.totalSpent - a.totalSpent);
    const totalBal    = members.reduce((s, m) => s + m.balance, 0) || 1;

    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <SectionTitle>会员等级分布</SectionTitle>
            <div className="flex items-center gap-4">
              <PieChart width={140} height={140}>
                <Pie key="tier-pie" data={tierDist} cx="50%" cy="50%" innerRadius={38} outerRadius={58}
                  dataKey="value" strokeWidth={2} stroke="#fff">
                  {tierDist.map(d => <Cell key={d.name} fill={d.color} />)}
                </Pie>
              </PieChart>
              <div className="flex-1 space-y-2.5">
                {tierDist.map(d => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-xs text-slate-600">{d.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{d.value}人</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <SectionTitle>储值余额集中度</SectionTitle>
            <div className="space-y-3">
              {topMembers.filter(m => m.balance > 0).map(m => {
                const pct = Math.round(m.balance / totalBal * 100);
                const tier = getMemberTier(m.totalSpent, memberTiers);
                return (
                  <div key={m.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-700 font-medium">{m.name}</span>
                        <span className="text-[10px] text-slate-400">{tier.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-700">¥{m.balance}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: ORANGE }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">消费排行</h3>
            <span className="text-xs text-slate-400">{topMembers.length} 名会员</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">会员</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-3 py-3">等级</th>
                  <th className="text-right text-xs font-semibold text-slate-500 px-3 py-3">累计消费</th>
                  <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3">当前余额</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {topMembers.map((m, idx) => {
                  const tier = getMemberTier(m.totalSpent, memberTiers);
                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 w-4">#{idx + 1}</span>
                          <span className="text-xs text-slate-700 font-medium">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tier.badge}`}>{tier.name}</span>
                      </td>
                      <td className="px-3 py-3 text-right text-xs font-semibold text-slate-800">
                        ¥{m.totalSpent.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right text-xs font-medium"
                        style={{ color: m.balance > 0 ? ORANGE : '#9ca3af' }}>
                        ¥{m.balance}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <SectionTitle>月度新增会员趋势</SectionTitle>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={MONTHLY} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis key="x" dataKey="m" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis key="y" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={24} />
              <Tooltip key="tip" formatter={(v: any) => [v + '人', '新增会员']}
                contentStyle={{ borderRadius: 10, border: '1px solid #f1f5f9', fontSize: 12 }} />
              <Bar key="bar-newmbr" dataKey="newMbr" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  /* ── Tab 5: 门店对比 ─────────────────────────────────────────── */
  function renderStores() {
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <SectionTitle>门店营收对比（累计）</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={STORE_PERF} margin={{ top: 5, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis key="x" dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis key="y" tickFormatter={fmtYAxis} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={36} />
              <Tooltip key="tip" formatter={(v: any, name: string) => [
                name === 'rev' ? fmtMoney(Number(v)) : v + '单', '',
              ]} contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9', fontSize: 12 }} />
              <Legend key="legend" iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Bar key="bar-store-rev" dataKey="rev" name="营收" fill={ORANGE} radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STORE_PERF.map(s => {
            const storeMembers = members.filter(m => m.storeId === s.id);
            const storeBalance = storeMembers.reduce((sum, m) => sum + m.balance, 0);
            const avgOrder = Math.round(s.rev / s.orders);
            return (
              <div key={s.name} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{s.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{storeMembers.length} 名注册会员</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#fff3e8' }}>
                    <Building2 className="size-4" style={{ color: ORANGE }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-400">累计营收</p>
                    <p className="text-base font-bold text-slate-800 mt-0.5">{fmtMoney(s.rev)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">订单量</p>
                    <p className="text-base font-bold text-slate-800 mt-0.5">{s.orders}单</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">客单价</p>
                    <p className="text-base font-bold text-slate-800 mt-0.5">¥{avgOrder}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">储值余额</p>
                    <p className="text-base font-bold mt-0.5" style={{ color: storeBalance > 0 ? ORANGE : '#9ca3af' }}>
                      ¥{storeBalance}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const tabContent = [renderOverview, renderCashFlow, renderOrders, renderMembers, renderStores];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">数据报表</h1>
        <p className="text-xs text-slate-400 mt-0.5">统计截至 2026-09-04 · 全部门店</p>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-1 bg-white border border-slate-100 rounded-xl p-1 w-fit shadow-sm min-w-max">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                tab === i ? 'text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
              style={tab === i ? { backgroundColor: ORANGE } : undefined}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tabContent[tab]()}
    </div>
  );
}
