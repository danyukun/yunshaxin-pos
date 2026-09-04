import { Building2, MapPin, Phone, Settings, Users } from 'lucide-react';

const features = [
  { icon: Building2, title: '门店档案',    desc: '管理门店名称、地址、营业时间等基本信息' },
  { icon: MapPin,    title: '多门店切换',  desc: '支持同一账号管理多个门店，快速切换工作门店' },
  { icon: Users,     title: '门店权限配置', desc: '为不同门店配置独立的操作权限与功能开关' },
  { icon: Phone,     title: '客服联系方式', desc: '设置门店对外展示的电话、微信等联系信息' },
  { icon: Settings,  title: '营业参数',    desc: '配置门店收单价格区间、送洗周期等运营参数' },
];

export default function StoreManage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 gap-6 lg:gap-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ backgroundColor: '#fff3e8' }}>
          <Building2 className="size-8" style={{ color: '#fd780f' }} />
        </div>
        <h1 className="text-xl text-slate-800 mb-1">门店管理</h1>
        <p className="text-sm text-slate-400">门店档案 · 多门店切换 · 营业参数配置</p>
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
