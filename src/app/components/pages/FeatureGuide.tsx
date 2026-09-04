import { useState } from 'react';
import {
  ShoppingCart, Shirt, Tag, Users, BarChart2, Truck, Store,
  LayoutDashboard, Tags, Megaphone, Building2, UserCog,
  SlidersHorizontal, Printer, Network, Smartphone, ChevronRight,
  CheckCircle2, Layers, Zap, Shield, Globe,
} from 'lucide-react';

const modules = [
  {
    id: 'home',
    icon: LayoutDashboard,
    label: '首页看板',
    color: '#fd780f',
    bg: '#fff7ed',
    desc: '核心经营数据一览：今日营业额、订单量、新客数、待处理告警。快捷入口直达常用功能，实时数据自动刷新。',
    features: ['今日营收 / 订单统计', '待处理事项提醒', '快速跳转下单 / 取衣', '门店数据对比'],
  },
  {
    id: 'order',
    icon: ShoppingCart,
    label: '收衣下单',
    color: '#3b82f6',
    bg: '#eff6ff',
    desc: '核心收衣流程：扫码或搜索会员，逐件录入服装信息（颜色、品牌、污渍、特殊备注），自动推荐洗护服务，支持捆绑件和快速充值。',
    features: ['会员身份识别与快速建档', '服装颜色 / 品牌 / 污渍多维录入', '相机拍照记录外观状态', '自动分配挂架槽位', '捆绑多件统一计费', '结账弹窗（储值 / 微信 / 支付宝）'],
  },
  {
    id: 'clothes',
    icon: Shirt,
    label: '订单追踪',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    desc: '全生命周期订单管理：从收衣到取走共 20 种状态，左侧列表筛选，右侧详情面板展示单件轨迹，支持补款、赔偿、状态推进操作。',
    features: ['20 种精细化洗护状态', '左右分栏布局，详情一目了然', '补款 / 赔偿金额记录', '订单状态批量操作', '挂架位置精确定位'],
  },
  {
    id: 'hang',
    icon: Tag,
    label: '上挂管理',
    color: '#10b981',
    bg: '#ecfdf5',
    desc: '可视化挂架网格：门店所有挂点实时状态展示，支持按区域筛选，点击挂点直接查看占用订单，快速完成上挂确认操作。',
    features: ['挂架网格可视化展示', '区域分组与筛选', '悬停预览订单信息', '批量上挂确认'],
  },
  {
    id: 'customer',
    icon: Users,
    label: '客户管理',
    color: '#f59e0b',
    bg: '#fffbeb',
    desc: '完整的会员 CRM 系统：分级会员体系（普通 / 银卡 / 金卡 / 铂金 / 钻石），支持多地址管理、优惠券钱包、历史订单回溯，一键转至下单。',
    features: ['5 级会员体系与积分', '多收件地址管理', '优惠券钱包 & 使用记录', '完整消费历史时间线', '标记重要客户', '一键快速下单'],
  },
  {
    id: 'data',
    icon: BarChart2,
    label: '数据报表',
    color: '#6366f1',
    bg: '#eef2ff',
    desc: '多维度经营分析：按日 / 周 / 月切换营收趋势，服务项目占比，员工业绩排行，门店横向对比，支持导出报表。',
    features: ['营收趋势折线图', '服务品类占比饼图', '员工业绩排行', '多门店数据对比'],
  },
  {
    id: 'wash',
    icon: Truck,
    label: '送洗调度',
    color: '#0ea5e9',
    bg: '#f0f9ff',
    desc: '统一调配待送洗服装：按批次打包，记录送出时间与司机信息，追踪在途状态，工厂确认接收后自动更新订单状态。',
    features: ['批次打包与清单', '送出 / 在途 / 到厂状态', '司机 & 车辆记录', '自动同步订单状态'],
  },
  {
    id: 'arrive',
    icon: Store,
    label: '到店取衣',
    color: '#ec4899',
    bg: '#fdf2f8',
    desc: '取衣收银台：扫码或会员搜索快速匹配待取订单，展示挂架位置，确认后打印取衣单，支持余额支付与找零。',
    features: ['扫码 / 搜索快速匹配', '挂架位置提示', '余额抵扣与补差', '打印取衣凭证'],
  },
];

const mgmtModules = [
  { icon: Tags,            label: '价格管理',   desc: '配置洗护服务价格表，按品类、材质、服务类型分级定价，支持批量调价。' },
  { icon: Megaphone,       label: '营销管理',   desc: '创建优惠券、满减活动、充值赠送方案，设置有效期与使用规则。' },
  { icon: Building2,       label: '门店管理',   desc: '多门店基础信息、营业时间、联系方式、区域归属统一配置。' },
  { icon: UserCog,         label: '员工管理',   desc: '员工档案、权限角色分配、排班记录与业绩归属设置。' },
  { icon: SlidersHorizontal, label: '参数设置', desc: '可拖拽排序的系统参数：服装颜色、品牌库、污渍类型、配件、洗护服务项五大维度。' },
  { icon: Printer,         label: '打印机管理', desc: '配置小票打印机与吊牌打印机，网络或 USB 连接，测试打印。' },
  { icon: Network,         label: '挂点管理',   desc: '定义门店挂架布局：区域划分、挂点编号、容量上限，生成挂架网格。' },
  { icon: Smartphone,      label: '小程序管理', desc: '微信小程序端配置：品牌形象、公告横幅、自助查单开关、在线支付绑定。' },
];

const workflow = [
  { step: '01', label: '客户到店', sub: '搜索 / 扫码会员' },
  { step: '02', label: '收衣录入', sub: '颜色·污渍·拍照' },
  { step: '03', label: '选择服务', sub: '自动推荐洗护项' },
  { step: '04', label: '结账收款', sub: '储值/微信/支付宝' },
  { step: '05', label: '上挂分配', sub: '自动分配挂架位' },
  { step: '06', label: '送洗调度', sub: '批次打包发厂' },
  { step: '07', label: '洗护完成', sub: '工厂确认回传' },
  { step: '08', label: '到店取衣', sub: '挂架定位·打印单' },
];

export default function FeatureGuide() {
  const [activeModule, setActiveModule] = useState<string | null>(null);

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-10">
      {/* Hero */}
      <div
        className="rounded-2xl px-8 py-10 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #fd780f 0%, #e85d04 60%, #c44b00 100%)' }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">☁</span>
            <span className="text-2xl font-bold tracking-wider">云奢品干洗 POS</span>
          </div>
          <p className="text-white/85 text-base max-w-2xl leading-relaxed">
            专为干洗门店设计的一体化收银管理系统，覆盖收衣、洗护、上挂、取衣全流程，
            内置会员 CRM、多门店管理与数据报表，让每一件衣物都可追溯。
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            {[
              { icon: Layers,  text: '22 个功能页面' },
              { icon: Zap,     text: '全流程数字化' },
              { icon: Shield,  text: '多级权限管理' },
              { icon: Globe,   text: '微信小程序联动' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-sm text-white/90">
                <Icon className="size-4 text-white/70" />
                {text}
              </div>
            ))}
          </div>
        </div>
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full opacity-10" style={{ background: 'white' }} />
        <div className="absolute -right-4 -bottom-20 w-48 h-48 rounded-full opacity-10" style={{ background: 'white' }} />
      </div>

      {/* 核心业务流程 */}
      <section>
        <h2 className="text-base font-semibold text-slate-700 mb-4">核心业务流程</h2>
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex flex-wrap items-center gap-2">
            {workflow.map((item, i) => (
              <div key={item.step} className="flex items-center gap-2">
                <div className="flex flex-col items-center text-center">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold mb-1"
                    style={{ backgroundColor: '#fd780f' }}
                  >
                    {item.step}
                  </div>
                  <p className="text-xs font-medium text-slate-700 whitespace-nowrap">{item.label}</p>
                  <p className="text-[10px] text-slate-400 whitespace-nowrap mt-0.5">{item.sub}</p>
                </div>
                {i < workflow.length - 1 && (
                  <ChevronRight className="size-4 text-slate-300 flex-shrink-0 mb-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 主功能模块 */}
      <section>
        <h2 className="text-base font-semibold text-slate-700 mb-4">主功能模块</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {modules.map((mod) => {
            const Icon = mod.icon;
            const isOpen = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveModule(isOpen ? null : mod.id)}
                className={`
                  text-left rounded-2xl border p-5 transition-all duration-200
                  ${isOpen ? 'border-transparent shadow-lg' : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'}
                `}
                style={isOpen ? { backgroundColor: mod.bg, borderColor: 'transparent' } : undefined}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: isOpen ? mod.color : mod.bg }}
                  >
                    <Icon className="size-5" style={{ color: isOpen ? 'white' : mod.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-slate-800">{mod.label}</span>
                      <ChevronRight
                        className="size-3.5 text-slate-400 transition-transform duration-200"
                        style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{mod.desc}</p>
                    {isOpen && (
                      <ul className="mt-3 space-y-1.5">
                        {mod.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
                            <CheckCircle2 className="size-3.5 flex-shrink-0" style={{ color: mod.color }} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 经营管理 & 系统配置 */}
      <section>
        <h2 className="text-base font-semibold text-slate-700 mb-4">经营管理 & 系统配置</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {mgmtModules.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className="bg-white rounded-xl border border-slate-100 p-4 hover:border-slate-200 hover:shadow-sm transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mb-3">
                  <Icon className="size-4 text-slate-500" />
                </div>
                <p className="text-xs font-semibold text-slate-700 mb-1">{m.label}</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">{m.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 技术特性 */}
      <section>
        <h2 className="text-base font-semibold text-slate-700 mb-4">技术特性</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { title: '响应式布局', desc: 'PC 全功能 / 平板触屏友好，侧边栏可折叠，适配各类收银硬件。', color: '#3b82f6', bg: '#eff6ff' },
            { title: '全局状态管理', desc: 'React Context 集中管理会员、订单、门店、挂架数据，跨页面实时同步。', color: '#8b5cf6', bg: '#f5f3ff' },
            { title: '拖拽可配置', desc: '参数设置页支持 react-dnd 拖拽排序，颜色/品牌/污渍/配件/服务项均可自定义顺序。', color: '#10b981', bg: '#ecfdf5' },
            { title: '20 种订单状态', desc: '从收衣到取走，精细化定义服装全生命周期，每步有时间戳与操作人记录。', color: '#f59e0b', bg: '#fffbeb' },
            { title: '挂架网格可视化', desc: '门店挂点按区域二维网格展示，颜色编码区分空闲 / 占用 / 待取状态。', color: '#fd780f', bg: '#fff7ed' },
            { title: '多门店切换', desc: '侧边栏顶部一键切换当前门店，所有数据按门店隔离，支持连锁品牌统一管理。', color: '#ec4899', bg: '#fdf2f8' },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border p-4" style={{ backgroundColor: item.bg, borderColor: `${item.color}20` }}>
              <p className="text-sm font-semibold mb-1.5" style={{ color: item.color }}>{item.title}</p>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
