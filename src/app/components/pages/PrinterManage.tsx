import { Printer, FileText, Wifi, Settings2, LayoutTemplate } from 'lucide-react';

const features = [
  { icon: Wifi,            title: '打印机连接',  desc: '支持蓝牙/WiFi 热敏打印机配置与连接管理' },
  { icon: LayoutTemplate,  title: '小票模板设计', desc: '自定义收衣小票、取衣凭证的内容排版与 LOGO' },
  { icon: FileText,        title: '标签打印',    desc: '订单标签、衣挂标签批量打印，支持条码/二维码' },
  { icon: Settings2,       title: '打印参数',    desc: '纸张宽度、字体大小、打印份数等参数配置' },
  { icon: Printer,         title: '打印记录',    desc: '查看打印历史，支持补打任意历史小票或标签' },
];

export default function PrinterManage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 gap-6 lg:gap-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ backgroundColor: '#fff3e8' }}>
          <Printer className="size-8" style={{ color: '#fd780f' }} />
        </div>
        <h1 className="text-xl text-slate-800 mb-1">打印机管理</h1>
        <p className="text-sm text-slate-400">设备连接 · 小票模板 · 标签打印 · 打印记录</p>
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
