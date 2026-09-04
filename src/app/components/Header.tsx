import { useRef, useEffect, useState } from 'react';
import { Menu, Bell, User, Search, X, CalendarDays, Plus, Check } from 'lucide-react';
import { useAppStore, getMemberTier, type Member } from '../data/AppContext';

function todayLabel(): string {
  const d = new Date();
  return `${d.getFullYear()}年${String(d.getMonth()+1).padStart(2,'0')}月${String(d.getDate()).padStart(2,'0')}日`;
}
const uid = () => Math.random().toString(36).slice(2,9);
const todayStr = () => new Date().toISOString().slice(0,10);

const pageLabels: Record<string,string> = {
  order:'下单', wash:'送洗', hang:'上挂', clothes:'订单', arrive:'到店取衣',
  alert:'预警中心', customer:'客户管理', recharge:'充值管理', data:'数据报表',
  'store-manage':'门店管理','staff-manage':'员工管理','price-manage':'价格管理',
  settings:'参数设置','printer-manage':'打印机管理',marketing:'营销管理',
  'hook-manage':'挂点管理',miniapp:'小程序管理','arch-doc':'技术架构文档',
};
const searchPlaceholders: Record<string,string> = {
  order:'搜索手机号 / 姓名', clothes:'搜索订单号 / 客户名 / 手机号 / 衣物标签',
  customer:'搜索客户姓名 / 手机号', hang:'搜索衣物标签 / 批次号 / 客户名',
  wash:'搜索客户名 / 订单号', arrive:'搜索批次号 / 客户名',
  'staff-manage':'搜索员工姓名 / 手机号','price-manage':'搜索衣物名称 / 助记码',
};

function QuickCreateModal({ initialQuery, onCreated, onClose }: { initialQuery:string; onCreated:(m:Member)=>void; onClose:()=>void }) {
  const { members, setMembers } = useAppStore();
  const isPhone = /^1\d{0,10}$/.test(initialQuery.trim());
  const [name,setName] = useState(isPhone?'':initialQuery.trim());
  const [phone,setPhone] = useState(isPhone?initialQuery.trim():'');
  const [done,setDone] = useState(false);
  const [created,setCreated] = useState<Member|null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  useEffect(()=>{ setTimeout(()=>(isPhone?nameRef:phoneRef).current?.focus(),50); },[]);
  const phoneExists = phone.trim()&&members.some(m=>m.phone===phone.trim());
  const canSave = name.trim()&&phone.trim()&&!phoneExists;
  const handleSave = () => {
    if(!canSave) return;
    const m:Member = { id:uid(),name:name.trim(),phone:phone.trim(),balance:0,totalSpent:0,registrationDate:todayStr(),addresses:[],coupons:[] };
    setMembers([...members,m]); setCreated(m); setDone(true);
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <p className="text-sm text-slate-800">新建客户</p>
          {!done&&<button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="size-4 text-slate-500"/></button>}
        </div>
        <div className="p-5 space-y-4">
          {!done?(<>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">手机号 <span className="text-red-400">*</span></label>
              <input ref={phoneRef} value={phone} onChange={e=>setPhone(e.target.value)} onKeyDown={e=>e.key==='Enter'&&nameRef.current?.focus()} placeholder="请输入手机号" className={`w-full h-9 px-3 rounded-xl border text-sm outline-none transition-colors ${phoneExists?'border-red-400':'border-slate-200 focus:border-orange-400'}`}/>
              {phoneExists&&<p className="text-[11px] text-red-500 mt-1">该手机号已存在</p>}
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">姓名 <span className="text-red-400">*</span></label>
              <input ref={nameRef} value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSave()} placeholder="请输入客户姓名" className="w-full h-9 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-orange-400 transition-colors"/>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">取消</button>
              <button onClick={handleSave} disabled={!canSave} className="flex-1 py-2.5 rounded-xl text-sm text-white disabled:opacity-40" style={{backgroundColor:'#fd780f'}}>创建并选中</button>
            </div>
          </>):(
            <div className="text-center py-3 space-y-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{backgroundColor:'#e8f8f0'}}><Check className="size-6 text-emerald-500"/></div>
              <div><p className="text-sm text-slate-700">创建成功</p><p className="text-xs text-slate-400 mt-0.5">{name} · {phone}</p></div>
              <button onClick={()=>{if(created)onCreated(created);onClose();}} className="w-full py-2.5 rounded-xl text-sm text-white" style={{backgroundColor:'#fd780f'}}>确认选中</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface HeaderProps { isSidebarCollapsed:boolean; onToggleSidebar:()=>void; currentPage?:string; searchQuery?:string; onSearch?:(q:string)=>void; onSelectMember?:(m:Member)=>void; }

export default function Header({ onToggleSidebar, currentPage='', searchQuery='', onSearch, onSelectMember }:HeaderProps) {
  const { members, memberTiers } = useAppStore();
  const pageLabel = pageLabels[currentPage]??'';
  const placeholder = searchPlaceholders[currentPage]??'';
  const showSearch = !!placeholder;
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen,setDropdownOpen] = useState(false);
  const [showCreate,setShowCreate] = useState(false);
  const isOrderPage = currentPage==='order';
  const memberMatches = isOrderPage&&searchQuery.trim() ? members.filter(m=>m.phone.includes(searchQuery.trim())||m.name.includes(searchQuery.trim())).slice(0,6) : [];
  useEffect(()=>{ const h=(e:MouseEvent)=>{ if(dropdownRef.current&&!dropdownRef.current.contains(e.target as Node))setDropdownOpen(false); }; document.addEventListener('mousedown',h); return()=>document.removeEventListener('mousedown',h); },[]);
  useEffect(()=>{ if(isOrderPage&&searchQuery.trim())setDropdownOpen(true); else setDropdownOpen(false); },[searchQuery,isOrderPage]);
  const handleSelectMember=(m:Member)=>{ onSelectMember?.(m); onSearch?.(''); setDropdownOpen(false); };
  const handleKeyDown=(e:React.KeyboardEvent<HTMLInputElement>)=>{ if(!isOrderPage)return; if(e.key==='Enter'&&searchQuery.trim()){ if(memberMatches.length===1){handleSelectMember(memberMatches[0]);}else if(memberMatches.length===0){setDropdownOpen(false);setShowCreate(true);} } if(e.key==='Escape')setDropdownOpen(false); };
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 gap-3">
      <div className="flex items-center gap-3 flex-shrink-0 min-w-0">
        <button onClick={onToggleSidebar} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"><Menu className="size-5 text-gray-600"/></button>
        {pageLabel&&<span className="text-sm text-gray-400 hidden lg:block whitespace-nowrap">{pageLabel}</span>}
        {pageLabel&&<span className="lg:hidden text-sm text-gray-400 whitespace-nowrap">{pageLabel}</span>}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100"><CalendarDays className="size-3.5 text-gray-400"/><span className="text-xs text-gray-500 whitespace-nowrap">{todayLabel()}</span></div>
      </div>
      {showSearch&&(
        <div ref={dropdownRef} className="flex-1 max-w-xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none z-10"/>
          <input ref={inputRef} type="text" value={searchQuery} onChange={e=>onSearch?.(e.target.value)} onFocus={()=>{if(isOrderPage&&searchQuery.trim())setDropdownOpen(true);}} onKeyDown={handleKeyDown} placeholder={placeholder} className="w-full h-9 pl-9 pr-8 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-gray-50 transition-all placeholder:text-gray-400"/>
          {searchQuery&&<button onClick={()=>{onSearch?.('');setDropdownOpen(false);}} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 z-10"><X className="size-3.5"/></button>}
          {isOrderPage&&dropdownOpen&&(
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
              {memberMatches.length>0?(<>
                {memberMatches.map(m=>{ const tier=getMemberTier(m.totalSpent,memberTiers); return(<button key={m.id} onMouseDown={e=>e.preventDefault()} onClick={()=>handleSelectMember(m)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 transition-colors text-left border-b border-slate-50 last:border-0"><div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0" style={{backgroundColor:tier.color}}>{m.name.slice(0,1)}</div><div className="flex-1 min-w-0"><span className="text-sm text-slate-800">{m.name}</span><span className="text-xs text-slate-400 ml-2">{m.phone}</span></div><span className={`text-[10px] px-1.5 py-0.5 rounded-lg flex-shrink-0 ${tier.badge}`}>{tier.name}</span></button>);})}
                <button onMouseDown={e=>e.preventDefault()} onClick={()=>{setDropdownOpen(false);setShowCreate(true);}} className="w-full flex items-center gap-2 px-4 py-2.5 text-left border-t border-slate-100 hover:bg-slate-50"><div className="w-7 h-7 rounded-full flex items-center justify-center bg-slate-100 flex-shrink-0"><Plus className="size-3.5 text-slate-500"/></div><span className="text-xs text-slate-500">新建客户「{searchQuery.trim()}」</span></button>
              </>):(
                <div className="px-4 py-3 space-y-2"><p className="text-xs text-slate-400">未找到「{searchQuery.trim()}」匹配的客户</p><button onMouseDown={e=>e.preventDefault()} onClick={()=>{setDropdownOpen(false);setShowCreate(true);}} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm text-white" style={{backgroundColor:'#fd780f'}}><Plus className="size-4"/>新建客户</button><p className="text-[10px] text-slate-300 text-center">也可按 Enter 快速新建</p></div>
              )}
            </div>
          )}
        </div>
      )}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative"><Bell className="size-5 text-gray-600"/><span className="absolute top-1.5 right-1.5 min-w-[14px] h-3.5 flex items-center justify-center rounded-full text-[9px] font-bold text-white px-0.5" style={{backgroundColor:'#ef4444'}}>3</span></button>
        <button className="flex items-center gap-2 px-2.5 py-2 hover:bg-gray-100 rounded-xl transition-colors"><div className="size-8 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{backgroundColor:'#fd780f'}}>管</div><div className="hidden sm:block text-left"><p className="text-sm text-gray-700 leading-none">管理员</p><p className="text-xs text-gray-400 mt-0.5 leading-none">超级管理员</p></div><User className="size-4 text-gray-400 hidden sm:block"/></button>
      </div>
      {showCreate&&<QuickCreateModal initialQuery={searchQuery.trim()} onCreated={m=>{handleSelectMember(m);}} onClose={()=>{setShowCreate(false);onSearch?.('');}}/>}
    </header>
  );
}