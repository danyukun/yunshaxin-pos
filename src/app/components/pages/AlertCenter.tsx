import { AlertTriangle, Clock, PackageSearch, Thermometer } from 'lucide-react';

const features = [
  { icon: Clock,         title: '超期未取预警', desc: '衣物超过约定取衣日期仍未取，自动触发提醒' },
  { icon: AlertTriangle, title: '滞留订单预警', desc: '长期未处理的滞留订单列表，支持一键跟进' },
  { icon: PackageSearch, title: '待分拣预警', desc: '待分拣衣物积压超阈值时发出提醒' },
  { icon: Thermometer,   title: '超时洗护异常', desc: '洗护时长超出标准工时，自动标记异常订单' },
];

export default function AlertCenter() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 gap-6 lg:gap-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ backgroundColor: '#fff3e8' }}>
          <AlertTriangle className="size-8" style={{ color: '#fd780f' }} />
        </div>
        <h1 className="text-xl font-semibold text-slate-800 mb-1">预警</h1>
        <p className="text-sm text-slate-400">超期提醒 · 滞留订单 · 洗护异常预警</p>
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
