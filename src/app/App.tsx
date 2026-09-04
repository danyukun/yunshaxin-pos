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
// 更多子页
import StoreManage from './components/pages/StoreManage';
import StaffManage from './components/pages/StaffManage';
import PriceManage from './components/pages/PriceManage';
import SystemSettings from './components/pages/SystemSettings';
import PrinterManage from './components/pages/PrinterManage';
import MarketingManage from './components/pages/MarketingManage';
import HookManage from './components/pages/HookManage';
import MiniAppManage from './components/pages/MiniAppManage';
import FeatureGuide from './components/pages/FeatureGuide';
import { AppProvider } from './data/AppContext';

export default function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 1024
  );
  const [currentPage, setCurrentPage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderMember, setOrderMember] = useState<Member | null>(null);

  const navigate = (page: string) => {
    setCurrentPage(page);
    setSearchQuery('');
    setOrderMember(null);
  };

  const renderPage = () => {
    const q = searchQuery;
    switch (currentPage) {
      case 'home':           return <Dashboard onNavigate={navigate} />;
      case 'order':          return <ReceiveOrder searchQuery={q} preselectedMember={orderMember} onMemberConsumed={() => setOrderMember(null)} />;
      case 'wash':           return <WashDispatch searchQuery={q} />;
      case 'hang':           return <HangManage searchQuery={q} />;
      case 'clothes':        return <ClothesStock searchQuery={q} />;
      case 'arrive':         return <PickupOrder searchQuery={q} />;
      case 'alert':          return <AlertCenter />;
      case 'customer':       return <MemberManagement searchQuery={q} />;
      case 'recharge':       return <RechargeManage />;
      case 'data':           return <DataReport />;
      // 更多子页
      case 'store-manage':   return <StoreManage />;
      case 'staff-manage':   return <StaffManage searchQuery={q} />;
      case 'price-manage':   return <PriceManage searchQuery={q} />;
      case 'settings':       return <SystemSettings />;
      case 'printer-manage': return <PrinterManage />;
      case 'marketing':      return <MarketingManage />;
      case 'hook-manage':    return <HookManage />;
      case 'miniapp':        return <MiniAppManage />;
      case 'feature-guide':  return <FeatureGuide />;
      default:               return <ReceiveOrder searchQuery={q} />;
    }
  };

  return (
    <AppProvider>
    <div className="size-full flex bg-gray-50 overflow-hidden">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        currentPage={currentPage}
        onNavigate={navigate}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          currentPage={currentPage}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          onSelectMember={m => { setOrderMember(m); setSearchQuery(''); }}
        />
        <main className="flex-1 overflow-auto p-4 sm:p-5 lg:p-6">
          {renderPage()}
        </main>
      </div>
    </div>
    </AppProvider>
  );
}
