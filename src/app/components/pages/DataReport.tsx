import { BarChart2, TrendingUp, FileText, Store, Network } from 'lucide-react';

const features = [
  { icon: TrendingUp, title: '门店营收统计', desc: '今日/本周/本月收入、订单量、客单价等核心指标' },
  { icon: FileText,   title: '订单报表', desc: '全量订单明细导出，支持多维度筛选与对账' },
  { icon: BarChart2,  title: '品类销量分析', desc: '各洗护品类订单占比、销售趋势分析' },
  { icon: Store,      title: '对账明细', desc: '按支付方式汇总收款，辅助日结/月结对账' },
  { icon: Network,    title: 'SaaS 多门店汇总', desc: '连锁门店营收汇总，跨店数据横向对比' },
];

export default function DataReport() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 gap-6 lg:gap-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ backgroundColor: '#fff3e8' }}>
          <BarChart2 className="size-8" style={{ color: '#fd780f' }} />
        </div>
        <h1 className="text-xl font-semibold text-slate-800 mb-1">数据</h1>
        <p className="text-sm text-slate-400">营收统计 · 订单报表 · 品类分析 · 多门店汇总</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fff3e8' }}>
                <Icon className="size-5" style={{ color: '#fd780f' }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 mb-0.5">{f.title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-5 py-2.5 rounded-xl text-sm text-white" style={{ backgroundColor: '#fd780f' }}>
        功能开发中，敬请期待
      </div>
    </div>
  );
}
