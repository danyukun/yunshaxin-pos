import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ReceiveOrder from './components/pages/ReceiveOrder';
import PickupOrder from './components/pages/PickupOrder';
import { type Member } from './data/AppContext';
import MemberManagement from './components/pages/MemberManagement';
import WashDispatch from './components/pages/WashDispatch';
import HangManage from './components/pages/HangManage';
import ClothesStock from './components/pages/ClothesStock';
import AlertCenter from './components/pages/AlertCenter';
import RechargeManage from './components/pages/RechargeManage';
import DataReport from './components/pages/DataReport';
import Dashboard from './components/pages/Dashboard';
import StoreManage from './components/pages/StoreManage';
import StaffManage from './components/pages/StaffManage';
import PriceManage from './components/pages/PriceManage';
import SystemSettings from './components/pages/SystemSettings';
import PrinterManage from './components/pages/PrinterManage';
import MarketingManage from './components/pages/MarketingManage';
import HookManage from './components/pages/HookManage';
import MiniAppManage from './components/pages/MiniAppManage';
import ArchDoc from './components/pages/ArchDoc';
import { AppProvider } from './data/AppContext';
import { FileDown, BookOpen, Code2, LayoutDashboard, ClipboardList, Database, FileText, GitBranch } from 'lucide-react';

function DocsDownload() {
  const files = [
    { icon: LayoutDashboard, name: '00_总目录.md', desc: '导航索引与业务流程总览' },
    { icon: BookOpen, name: '01_产品需求文档PRD.md', desc: '完整 SaaS PRD，四端功能+定价' },
    { icon: Code2, name: '02_技术架构文档.md', desc: '微服务架构、API清单、部署方案' },
    { icon: ClipboardList, name: '03_UI-UX走查报告.md', desc: '全页面走查，三级优先级整改清单' },
    { icon: FileText, name: '04_功能清单.md', desc: '~165项功能实现状态逐一标注' },
    { icon: Database, name: '05_数据模型参考.md', desc: '全量 TypeScript 类型与状态机' },
    { icon: LayoutDashboard, name: '06_页面功能说明.md', desc: '22个页面逐一说明与数据流向' },
    { icon: GitBranch, name: '07_开发状态追踪.md', desc: 'Backlog、已知问题、技术债务' },
  ];
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fff3e8' }}>
          <FileDown className="size-5" style={{ color: '#fd780f' }} />
        </div>
        <div>
          <h2 className="text-lg text-slate-800">开发文档包</h2>
          <p className="text-xs text-slate-400">云奢品干洗 POS · 2026-09-04 · 8 份文档 · 48.8 KB</p>
        </div>
        <a href="/docs-package.zip" download="云奢品干洗POS_开发文档包.zip" className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-white" style={{ backgroundColor: '#fd780f' }}>
          <FileDown className="size-4" />下载 ZIP 包
        </a>
      </div>
      <div className="space-y-2">
        {files.map(({ icon: Icon, name, desc }) => (
          <div key={name} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-slate-200">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-slate-50">
              <Icon className="size-4 text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700 font-mono">{name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
            </div>
            <a href={`/docs-export/${name}`} target="_blank" rel="noreferrer" className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 flex-shrink-0">预览</a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 1024
  );
  const [currentPage, setCurrentPage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderMember, setOrderMember] = useState<Member | null>(null);

  const navigate = (page: string) => { setCurrentPage(page); setSearchQuery(''); setOrderMember(null); };

  const renderPage = () => {
    const q = searchQuery;
    switch (currentPage) {
      case 'home': return <Dashboard onNavigate={navigate} />;
      case 'order': return <ReceiveOrder searchQuery={q} preselectedMember={orderMember} onMemberConsumed={() => setOrderMember(null)} />;
      case 'wash': return <WashDispatch searchQuery={q} />;
      case 'hang': return <HangManage searchQuery={q} />;
      case 'clothes': return <ClothesStock searchQuery={q} />;
      case 'arrive': return <PickupOrder searchQuery={q} />;
      case 'alert': return <AlertCenter />;
      case 'customer': return <MemberManagement searchQuery={q} />;
      case 'recharge': return <RechargeManage />;
      case 'data': return <DataReport />;
      case 'store-manage': return <StoreManage />;
      case 'staff-manage': return <StaffManage searchQuery={q} />;
      case 'price-manage': return <PriceManage searchQuery={q} />;
      case 'settings': return <SystemSettings />;
      case 'printer-manage': return <PrinterManage />;
      case 'marketing': return <MarketingManage />;
      case 'hook-manage': return <HookManage />;
      case 'miniapp': return <MiniAppManage />;
      case 'arch-doc': return <ArchDoc />;
      case 'docs-download': return <DocsDownload />;
      default: return <ReceiveOrder searchQuery={q} />;
    }
  };

  return (
    <AppProvider>
      <div className="size-full flex bg-gray-50 overflow-hidden">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} currentPage={currentPage} onNavigate={navigate} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} currentPage={currentPage} searchQuery={searchQuery} onSearch={setSearchQuery} onSelectMember={m => { setOrderMember(m); setSearchQuery(''); }} />
          <main className="flex-1 overflow-auto p-4 sm:p-5 lg:p-6">{renderPage()}</main>
        </div>
      </div>
    </AppProvider>
  );
}