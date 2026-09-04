import { Wallet, Gift, BookOpen, History } from 'lucide-react';

const features = [
  { icon: Wallet,   title: '会员储值充值', desc: '支持现金/微信/支付宝充值，实时到账会员余额' },
  { icon: Gift,     title: '充值活动管理', desc: '配置充值赠送、充值打折等促销活动规则' },
  { icon: BookOpen, title: '余额查询', desc: '查询会员当前余额、赠送金、次卡及年卡状态' },
  { icon: History,  title: '充值记录流水', desc: '查看充值明细，支持按时间/会员/金额筛选导出' },
];

export default function RechargeManage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 gap-6 lg:gap-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ backgroundColor: '#fff3e8' }}>
          <Wallet className="size-8" style={{ color: '#fd780f' }} />
        </div>
        <h1 className="text-xl font-semibold text-slate-800 mb-1">充值</h1>
        <p className="text-sm text-slate-400">会员储值 · 充值活动 · 余额查询 · 流水记录</p>
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
