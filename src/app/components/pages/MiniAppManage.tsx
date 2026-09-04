import { Smartphone, QrCode, Bell, PackageSearch, UserCheck } from 'lucide-react';

const features = [
  { icon: QrCode,        title: '小程序绑定',    desc: '绑定微信小程序 AppID，关联门店收单与会员体系' },
  { icon: UserCheck,     title: '客户自助查单',  desc: '客户扫码即可查询订单状态、洗护进度与取衣时间' },
  { icon: Bell,          title: '消息通知配置',  desc: '下单成功、洗护完成、可取衣等节点自动推送模板消息' },
  { icon: PackageSearch, title: '智柜对接',      desc: '对接自助取衣智柜，订单完成后自动开柜通知客户' },
  { icon: Smartphone,    title: '小程序页面设置', desc: '配置小程序首页 Banner、公告、入口展示等内容' },
];

export default function MiniAppManage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 gap-6 lg:gap-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ backgroundColor: '#fff3e8' }}>
          <Smartphone className="size-8" style={{ color: '#fd780f' }} />
        </div>
        <h1 className="text-xl text-slate-800 mb-1">小程序管理</h1>
        <p className="text-sm text-slate-400">小程序绑定 · 客户查单 · 智柜对接 · 消息通知</p>
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
