import { useEffect, useRef, useState } from 'react';
import { ShoppingCart, Truck, Tag, Shirt, Store, Users, BarChart2, X, MoreHorizontal, LayoutDashboard, Building2, UserCog, Tags, SlidersHorizontal, Printer, Megaphone, Network, Smartphone, BookOpen, ChevronDown, Check } from 'lucide-react';
import { useAppStore } from '../data/AppContext';

interface SidebarProps { isCollapsed:boolean; onToggle:()=>void; currentPage:string; onNavigate:(page:string)=>void; }

const mainMenuItems = [
  { id:'home', icon:LayoutDashboard, label:'首页' },
  { id:'order', icon:ShoppingCart, label:'下单' },
  { id:'clothes', icon:Shirt, label:'订单' },
  { id:'hang', icon:Tag, label:'上挂' },
  { id:'customer', icon:Users, label:'客户' },
  { id:'data', icon:BarChart2, label:'数据' },
  { id:'wash', icon:Truck, label:'送洗' },
  { id:'arrive', icon:Store, label:'到店' },
];

const moreGroups = [
  { label:'经营管理', items:[
    { id:'price-manage', icon:Tags, label:'价格管理' },
    { id:'marketing', icon:Megaphone, label:'营销管理' },
    { id:'store-manage', icon:Building2, label:'门店管理' },
    { id:'staff-manage', icon:UserCog, label:'员工管理' },
  ]},
  { label:'系统配置', items:[
    { id:'settings', icon:SlidersHorizontal, label:'参数设置' },
    { id:'printer-manage', icon:Printer, label:'打印机管理' },
    { id:'hook-manage', icon:Network, label:'挂点管理' },
    { id:'miniapp', icon:Smartphone, label:'小程序管理' },
  ]},
  { label:'文档', items:[
    { id:'arch-doc', icon:BookOpen, label:'技术架构文档' },
    { id:'docs-download', icon:BookOpen, label:'📦 下载文档包' },
  ]},
];
const allMoreItems = moreGroups.flatMap(g=>g.items);

export default function Sidebar({ isCollapsed, onToggle, currentPage, onNavigate }:SidebarProps) {
  const { stores } = useAppStore();
  const [currentStoreId, setCurrentStoreId] = useState(stores[0]?.id??'');
  const [storeMenuOpen, setStoreMenuOpen] = useState(false);
  const storeMenuRef = useRef<HTMLDivElement>(null);
  const currentStore = stores.find(s=>s.id===currentStoreId)??stores[0];
  const isMoreActive = allMoreItems.some(item=>item.id===currentPage);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{ const handler=(e:MouseEvent)=>{ if(moreRef.current&&!moreRef.current.contains(e.target as Node))setIsMoreOpen(false); if(storeMenuRef.current&&!storeMenuRef.current.contains(e.target as Node))setStoreMenuOpen(false); }; document.addEventListener('mousedown',handler); return()=>document.removeEventListener('mousedown',handler); },[]);
  const handleNavClick=(id:string)=>{ onNavigate(id); setIsMoreOpen(false); if(window.innerWidth<1024)onToggle(); };
  return (
    <>
      {!isCollapsed&&<div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onToggle} aria-hidden="true"/>}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-40 bg-slate-800 text-white flex flex-col transition-transform duration-300 ease-in-out h-full w-28 flex-shrink-0 ${isCollapsed?'-translate-x-full lg:translate-x-0':'translate-x-0'}`}>
        <div className="border-b border-slate-700/80 flex-shrink-0 relative px-3 py-3" ref={storeMenuRef}>
          <div className="flex flex-col items-center gap-0.5 select-none mb-2"><span className="text-xl leading-none" style={{color:'#fd780f'}}>☁</span><span className="text-[11px] font-semibold tracking-widest text-white/90">云奢品</span></div>
          <button onClick={()=>setStoreMenuOpen(v=>!v)} className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 transition-colors"><span className="text-[11px] text-white/80 truncate max-w-[60px]">{currentStore?.name??'选择门店'}</span><ChevronDown className="size-3 text-white/50 flex-shrink-0"/></button>
          {storeMenuOpen&&(<div className="absolute top-full left-full ml-2 z-50 w-44 bg-white text-gray-800 shadow-xl rounded-xl border border-gray-100 overflow-hidden" style={{top:'8px'}}><p className="px-3 pt-3 pb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">切换门店</p><div className="py-1">{stores.map(store=>(<button key={store.id} onClick={()=>{setCurrentStoreId(store.id);setStoreMenuOpen(false);}} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors" style={store.id===currentStoreId?{color:'#fd780f'}:{color:'#374151'}}><Store className="size-3.5 flex-shrink-0"/><span className="flex-1 text-left text-sm">{store.name}</span>{store.id===currentStoreId&&<Check className="size-3.5 flex-shrink-0" style={{color:'#fd780f'}}/>}</button>))}</div></div>)}
          <button onClick={onToggle} className="absolute right-2 top-2 p-1.5 hover:bg-slate-700 rounded-lg transition-colors lg:hidden"><X className="size-4"/></button>
        </div>
        <nav className="flex-1 py-3 flex flex-col gap-1 overflow-y-auto overflow-x-hidden px-2">
          {mainMenuItems.map(item=>{ const Icon=item.icon; const isActive=currentPage===item.id; return(<button key={item.id} onClick={()=>handleNavClick(item.id)} className={`w-full flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl transition-all duration-150 active:scale-95 ${isActive?'text-white shadow-md':'text-slate-400 hover:bg-slate-700 hover:text-white'}`} style={isActive?{backgroundColor:'#fd780f'}:undefined}><Icon className="size-[22px] flex-shrink-0"/><span className="text-[11px] font-medium leading-none tracking-wide">{item.label}</span></button>); })}
        </nav>
        <div ref={moreRef} className="border-t border-slate-700/80 flex-shrink-0 px-2 py-3 relative">
          <button onClick={()=>setIsMoreOpen(v=>!v)} className={`w-full flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl transition-all duration-150 active:scale-95 ${isMoreActive?'text-white':isMoreOpen?'bg-slate-700 text-white':'text-slate-400 hover:bg-slate-700 hover:text-white'}`} style={isMoreActive?{backgroundColor:'#fd780f'}:undefined}><MoreHorizontal className="size-[22px] flex-shrink-0"/><span className="text-[11px] font-medium leading-none tracking-wide">更多</span></button>
          {isMoreOpen&&(<div className="absolute bottom-3 left-full ml-2 z-50 w-52 bg-white text-gray-800 shadow-xl rounded-2xl border border-gray-100 overflow-hidden">{moreGroups.map((group,gi)=>(<div key={group.label}>{gi>0&&<div className="h-px bg-gray-100 mx-2"/>}<p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{group.label}</p><div className="pb-1">{group.items.map(item=>{ const Icon=item.icon; const active=currentPage===item.id; return(<button key={item.id} onClick={()=>handleNavClick(item.id)} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors active:scale-[0.98] ${active?'':'text-gray-600 hover:bg-gray-50'}`} style={active?{color:'#fd780f',backgroundColor:'#fff7ed'}:undefined}><Icon className="size-4 flex-shrink-0"/><span className="text-sm">{item.label}</span></button>); })}</div></div>))}</div>)}
        </div>
        <div className="px-2 pb-3 flex-shrink-0"><p className="text-[10px] text-slate-500 text-center">v 1.0.0</p></div>
      </aside>
    </>
  );
}