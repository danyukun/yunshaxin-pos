import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Search, X, Plus, Trash2, CreditCard, Wallet, Smartphone,
  Printer, Tag, MoreHorizontal, Check, AlertTriangle,
  ChevronLeft, User, Gift, MapPin, Clock, ChevronDown, Store,
  Shirt, Package, Briefcase, Gem, LayoutGrid, Zap, ShoppingBag,
  Layers, Footprints, Pencil, Copy, RotateCcw, Camera,
  Paperclip, FileText, ChevronUp, ImageOff,
} from 'lucide-react';
import {
  useAppStore, getMemberTier, allocateHookSlot, buildHookSlots,
  type CatalogItem, type Member, type GarmentRecord,
  type HookSlot,
} from '../../data/AppContext';

const IMPORTANT_LEVELS = [
  { level: 1 as const, stars: '⭐',    color: 'text-yellow-600', bg: 'bg-yellow-50',  border: 'border-yellow-200' },
  { level: 2 as const, stars: '⭐⭐',  color: 'text-orange-600', bg: 'bg-orange-50',  border: 'border-orange-200' },
  { level: 3 as const, stars: '⭐⭐⭐', color: 'text-red-600',    bg: 'bg-red-50',     border: 'border-red-200'    },
];
function getImportantInfo(level?: 1|2|3) {
  return IMPORTANT_LEVELS.find(l=>l.level===level) ?? IMPORTANT_LEVELS[0];
}

type OrderType = 'A' | 'B' | 'C';

interface GarmentRow {
  id: string;
  catalogId: string; typeName: string; categoryId: string;
  unitPrice: number;
  color: string; colorHex: string; brand: string;
  surchargeIds: string[];
  attachmentIds: string[];
  surchargeOverrides: Record<string, number>;
  attachmentOverrides: Record<string, number>;
  defects: string[]; defectNote: string;
  photos: string[];
  isBundleHeader?: boolean;
  isBundleLabel?: boolean;
  bundleGroupId?: string;
  manualTotal?: number;
  isAttachmentRow?: boolean;
  parentRowId?: string;
  attachmentId?: string;
  serviceCycleHours?: number;
  bindTag?: string;
  hookSlotId?: string;
  hookSlotLabel?: string;
}

interface SolidColor { name: string; hex: string; }

const COLOR_GROUPS: { id: string; name: string; colors: SolidColor[] }[] = [
  { id: 'neutral', name: '黑白灰', colors: [
    { name:'纯黑', hex:'#0a0a0a' }, { name:'黑色', hex:'#1c1c1c' },
    { name:'深灰', hex:'#374151' }, { name:'铁灰', hex:'#52525b' },
    { name:'中灰', hex:'#71717a' }, { name:'浅灰', hex:'#a1a1aa' },
    { name:'银灰', hex:'#d4d4d8' }, { name:'白色', hex:'#f8f8f8' },
  ]},
  { id: 'red', name: '红粉色系', colors: [
    { name:'深红', hex:'#7f1d1d' }, { name:'酒红', hex:'#991b1b' },
    { name:'红色', hex:'#dc2626' }, { name:'橘红', hex:'#f97316' },
    { name:'玫红', hex:'#e11d48' }, { name:'桃红', hex:'#f43f5e' },
    { name:'粉色', hex:'#f9a8d4' }, { name:'浅粉', hex:'#fce7f3' },
  ]},
  { id: 'orange', name: '橙黄色系', colors: [
    { name:'深橙', hex:'#c2410c' }, { name:'橙色', hex:'#ea580c' },
    { name:'琥珀', hex:'#b45309' }, { name:'金色', hex:'#ca8a04' },
    { name:'明黄', hex:'#eab308' }, { name:'柠黄', hex:'#fde047' },
    { name:'卡其', hex:'#c3a882' }, { name:'米色', hex:'#f5e6d3' },
  ]},
  { id: 'green', name: '绿色系', colors: [
    { name:'墨绿', hex:'#064e3b' }, { name:'深绿', hex:'#15803d' },
    { name:'军绿', hex:'#4d7c0f' }, { name:'草绿', hex:'#16a34a' },
    { name:'翠绿', hex:'#22c55e' }, { name:'青绿', hex:'#10b981' },
    { name:'薄荷', hex:'#6ee7b7' }, { name:'橄榄', hex:'#84793a' },
  ]},
  { id: 'blue', name: '蓝色系', colors: [
    { name:'藏青',   hex:'#1e3a5f' }, { name:'深蓝',   hex:'#1e3a8a' },
    { name:'宝蓝',   hex:'#1d4ed8' }, { name:'蓝色',   hex:'#2563eb' },
    { name:'天蓝',   hex:'#0ea5e9' }, { name:'浅蓝',   hex:'#7dd3fc' },
    { name:'冰蓝',   hex:'#bae6fd' }, { name:'牛仔蓝', hex:'#2554a5' },
  ]},
  { id: 'purple', name: '紫色系', colors: [
    { name:'深紫',   hex:'#3b0764' }, { name:'紫色',   hex:'#7e22ce' },
    { name:'淡紫',   hex:'#a855f7' }, { name:'薰衣草', hex:'#c084fc' },
    { name:'浅紫',   hex:'#e9d5ff' }, { name:'紫红',   hex:'#be185d' },
    { name:'玫瑰紫', hex:'#db2777' }, { name:'丁香',   hex:'#d8b4fe' },
  ]},
  { id: 'brown', name: '棕色系', colors: [
    { name:'深棕',  hex:'#431407' }, { name:'巧克力', hex:'#7c2d12' },
    { name:'棕色',  hex:'#92400e' }, { name:'焦糖',   hex:'#b45309' },
    { name:'驼色',  hex:'#c2956a' }, { name:'沙色',   hex:'#d4b896' },
    { name:'米白',  hex:'#f0e8d8' }, { name:'奶油',   hex:'#fef9ef' },
  ]},
];

const PATTERNS: { name: string; css: string }[] = [
  { name:'花色', css:'linear-gradient(135deg,#ff6b6b 0%,#feca57 25%,#48dbfb 50%,#a29bfe 75%,#fd79a8 100%)' },
  { name:'格子', css:'repeating-conic-gradient(#555 0% 25%,#ddd 0% 50%) 0 0/12px 12px' },
  { name:'条纹', css:'repeating-linear-gradient(45deg,#1a1a1a 0px,#1a1a1a 4px,#e5e7eb 4px,#e5e7eb 12px)' },
  { name:'横纹', css:'repeating-linear-gradient(0deg,#1a1a1a 0px,#1a1a1a 3px,#e5e7eb 3px,#e5e7eb 10px)' },
  { name:'迷彩', css:'radial-gradient(ellipse at 25% 35%,#5c5e3a 28%,transparent 28%),radial-gradient(ellipse at 75% 65%,#3a4a2a 28%,transparent 28%),linear-gradient(#7a8a55,#7a8a55)' },
  { name:'豹纹', css:'radial-gradient(ellipse 7px 5px at 20% 25%,#4a2c00 65%,transparent 65%),radial-gradient(ellipse 6px 7px at 68% 70%,#4a2c00 65%,transparent 65%),linear-gradient(#D4A055,#D4A055)' },
  { name:'印花', css:'radial-gradient(circle at 30% 35%,#ff9fb2 15%,transparent 15%),radial-gradient(circle at 70% 65%,#ff9fb2 15%,transparent 15%),linear-gradient(#fff0f3,#fff0f3)' },
  { name:'碎花', css:'radial-gradient(circle at 25% 20%,#ff8fab 9%,transparent 9%),radial-gradient(circle at 75% 75%,#ff8fab 9%,transparent 9%),linear-gradient(#fff8f9,#fff8f9)' },
];

const CAT_ICON: Record<string, React.FC<{ className?: string }>> = {
  A: Package, B: Shirt, C: Layers, D: Briefcase,
  E: Gem, F: LayoutGrid, G: Footprints, H: Zap, R: ShoppingBag,
};
function CatIcon({ catId, className }: { catId: string; className?: string }) {
  const Icon = CAT_ICON[catId] ?? Shirt;
  return <Icon className={className} />;
}

const uid = () => Math.random().toString(36).slice(2, 9);
const todayStr = () => new Date().toISOString().slice(0, 10);
const laterStr = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const nowStr = () => new Date().toLocaleString('zh-CN', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }).replace(/\//g, '-');
const isLight = (hex: string) => {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return (r*299+g*587+b*114)/1000 > 160;
};
const parseBundleCount = (name: string): number => {
  const m = name.match(/(\d+)\s*件/); if (m) return parseInt(m[1]);
  const map: Record<string,number> = {'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10};
  const cm = name.match(/([一二三四五六七八九十])件/); if (cm) return map[cm[1]]??0;
  return 0;
};
const makeEmptyRow = (overrides?: Partial<GarmentRow>): GarmentRow => ({
  id:uid(), catalogId:'', typeName:'', categoryId:'',
  unitPrice:0, color:'', colorHex:'', brand:'',
  surchargeIds:[], attachmentIds:[],
  surchargeOverrides:{}, attachmentOverrides:{},
  defects:[], defectNote:'', photos:[],
  isBundleHeader:false, isBundleLabel:false,
  bundleGroupId:undefined, manualTotal:undefined,
  isAttachmentRow:false, parentRowId:undefined, attachmentId:undefined,
  serviceCycleHours:undefined,
  bindTag:undefined,
  ...overrides,
});
const patternCss = (name: string) => PATTERNS.find(p=>p.name===name)?.css ?? '#ccc';

const PAY_METHODS = [
  { id:'member',  name:'会员卡',   Icon: CreditCard },
  { id:'cash',    name:'现金',     Icon: Wallet },
  { id:'wechat',  name:'微信支付', Icon: Smartphone },
  { id:'alipay',  name:'支付宝',   Icon: Smartphone },
  { id:'douyin',  name:'抖音团购', Icon: Tag },
  { id:'meituan', name:'美团团购', Icon: Tag },
  { id:'other',   name:'其他',     Icon: MoreHorizontal },
];
const TIME_SLOTS = Array.from({length:27},(_,i)=>{
  const h=Math.floor(i/2)+8, m=i%2===0?'00':'30';
  return `${String(h).padStart(2,'0')}:${m}`;
});

const DEFAULT_PICKUP_SLOTS = [
  '08:00-10:00','10:00-12:00','12:00-14:00',
  '14:00-16:00','16:00-18:00','18:00-20:00',
];

function CameraModal({ garmentName, initialPhotos, onSave, onClose }: {
  garmentName: string;
  initialPhotos: string[];
  onSave: (photos: string[]) => void;
  onClose: () => void;
}) {
  const [photos, setPhotos]       = useState<string[]>(initialPhotos);
  const [tab, setTab]             = useState<'camera'|'upload'>('camera');
  const [stream, setStream]       = useState<MediaStream|null>(null);
  const [camErr, setCamErr]       = useState('');
  const [preview, setPreview]     = useState<string|null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef  = useRef<HTMLInputElement>(null);

  const stopStream = useCallback(() => {
    if (stream) { stream.getTracks().forEach(t=>t.stop()); setStream(null); }
  }, [stream]);

  useEffect(() => {
    if (tab === 'camera') {
      navigator.mediaDevices?.getUserMedia({ video:{ facingMode:'environment', width:{ideal:1280}, height:{ideal:720} } })
        .then(s => {
          setStream(s); setCamErr('');
          if (videoRef.current) { videoRef.current.srcObject = s; }
        })
        .catch(() => { setCamErr('无法访问摄像头'); });
    } else {
      stopStream();
    }
    return () => { stream?.getTracks().forEach(t=>t.stop()); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => () => { stream?.getTracks().forEach(t=>t.stop()); }, [stream]);

  const capturePhoto = () => {
    const video = videoRef.current; const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const maxW = 1024, ratio = Math.min(maxW/video.videoWidth, 1);
    canvas.width = video.videoWidth*ratio; canvas.height = video.videoHeight*ratio;
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    setPhotos(p => [...p, canvas.toDataURL('image/jpeg', 0.78)]);
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        if (!ev.target?.result) return;
        const img = new Image();
        img.onload = () => {
          const c = document.createElement('canvas');
          const maxW = 1024, ratio = Math.min(maxW/img.width, 1);
          c.width = img.width*ratio; c.height = img.height*ratio;
          c.getContext('2d')?.drawImage(img, 0, 0, c.width, c.height);
          setPhotos(p => [...p, c.toDataURL('image/jpeg', 0.78)]);
        };
        img.src = ev.target.result as string;
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleConfirm = () => { stopStream(); onSave(photos); onClose(); };
  const handleClose   = () => { stopStream(); onClose(); };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4"
      onClick={e => { if (e.target===e.currentTarget) handleClose(); }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl flex flex-col overflow-hidden" style={{maxHeight:'92vh'}}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 flex-shrink-0">
          <div>
            <p className="text-sm text-slate-800">衣物拍照</p>
            <p className="text-xs text-slate-400 mt-0.5">{garmentName}</p>
          </div>
          <button onClick={handleClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="size-4 text-slate-500" />
          </button>
        </div>

        <div className="flex border-b border-slate-100 flex-shrink-0">
          {(['camera','upload'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm transition-colors border-b-2 ${tab===t ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              {t==='camera' ? '📷 拍照' : '📁 上传图片'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === 'camera' && (
            <div className="p-4 flex flex-col gap-3">
              {camErr ? (
                <div className="flex flex-col items-center justify-center h-52 gap-3 text-slate-400">
                  <ImageOff className="size-10 text-slate-300" />
                  <p className="text-sm">{camErr}</p>
                  <button onClick={() => setTab('upload')}
                    className="px-4 py-2 rounded-xl text-sm text-white" style={{backgroundColor:'#fd780f'}}>
                    改用上传图片
                  </button>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden bg-black" style={{aspectRatio:'16/9'}}>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-end justify-center pb-4">
                    <button onClick={capturePhoto}
                      className="w-14 h-14 rounded-full border-4 border-white bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center justify-center shadow-lg">
                      <div className="w-10 h-10 rounded-full bg-white" />
                    </button>
                  </div>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {tab === 'upload' && (
            <div className="p-4">
              <button onClick={() => fileRef.current?.click()}
                className="w-full h-36 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-orange-400 hover:bg-orange-50/30 transition-colors">
                <Camera className="size-8 text-slate-300" />
                <p className="text-sm text-slate-400">点击选择图片</p>
                <p className="text-xs text-slate-300">支持 JPG、PNG、HEIC 等格式</p>
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple capture="environment"
                onChange={handleFiles} className="hidden" />
            </div>
          )}

          {photos.length > 0 && (
            <div className="px-4 pb-4">
              <p className="text-xs text-slate-500 mb-2">已拍照片（{photos.length} 张）</p>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((p, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden group cursor-pointer"
                    style={{aspectRatio:'1'}}
                    onClick={() => setPreview(p)}>
                    <img src={p} alt={`photo-${i}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <button onClick={e => { e.stopPropagation(); setPhotos(prev=>prev.filter((_,j)=>j!==i)); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-500 rounded-full">
                        <X className="size-3 text-white" />
                      </button>
                    </div>
                    <div className="absolute bottom-1 left-1 text-[10px] bg-black/50 text-white px-1 rounded">
                      {i+1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-3.5 border-t border-slate-100 flex gap-2 flex-shrink-0">
          <button onClick={handleClose}
            className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">
            取消
          </button>
          <button onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm text-white" style={{backgroundColor:'#fd780f'}}>
            保存照片（{photos.length}张）
          </button>
        </div>
      </div>

      {preview && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setPreview(null)}>
          <img src={preview} alt="preview" className="max-w-full max-h-full object-contain rounded-lg" />
          <button onClick={() => setPreview(null)} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full">
            <X className="size-5 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}

function BrandCombo({ brands, value, onChange }: {
  brands: {id:string;name:string}[];
  value: string;
  onChange: (v:string) => void;
}) {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState('');
  const ref      = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const h = (e:MouseEvent) => { if(ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown',h); return ()=>document.removeEventListener('mousedown',h);
  },[]);
  const filtered = brands.filter(b=>b.name.toLowerCase().includes(search.toLowerCase()));
  const select = (name:string) => { onChange(name); setOpen(false); };
  return (
    <div ref={ref} className="relative">
      <button onClick={() => { setOpen(true); setSearch(''); setTimeout(()=>inputRef.current?.focus(),50); }}
        className="w-full text-left text-xs hover:text-orange-500 transition-colors truncate">
        {value||<span className="text-slate-300">点击选择</span>}
      </button>
      {open && (
        <div className="absolute z-40 top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl w-52 overflow-hidden"
          onClick={e=>e.stopPropagation()}>
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-slate-400" />
              <input ref={inputRef} value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="搜索或直接输入品牌名"
                className="w-full pl-6 pr-2 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-orange-400" />
            </div>
            {search.trim() && !brands.find(b=>b.name===search.trim()) && (
              <button onClick={()=>select(search.trim())}
                className="w-full text-left text-xs px-2 py-1.5 mt-1 rounded-lg hover:bg-orange-50 transition-colors"
                style={{color:'#fd780f'}}>使用「{search.trim()}」</button>
            )}
          </div>
          <div className="max-h-40 overflow-y-auto py-1">
            {value && <button onClick={()=>select('')} className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:bg-slate-50">✕ 清空</button>}
            {filtered.map(b=>(
              <button key={b.id} onClick={()=>select(b.name)}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between ${value===b.name?'bg-orange-50 text-orange-600':'text-slate-700 hover:bg-slate-50'}`}>
                {b.name}{value===b.name&&<Check className="size-3"/>}
              </button>
            ))}
            {filtered.length===0&&!search.trim()&&<div className="px-3 py-2 text-xs text-slate-400">暂无品牌库</div>}
          </div>
        </div>
      )}
    </div>
  );
}

interface DropOpt { value:string; label:string; price?:number; }
function MultiDropWithPrice({ opts, selected, overrides, onChange, onOverrideChange, placeholder }: {
  opts:DropOpt[]; selected:string[]; overrides:Record<string,number>;
  onChange:(v:string[])=>void; onOverrideChange:(id:string,price:number)=>void; placeholder:string;
}) {
  const [open, setOpen]           = useState(false);
  const [editingId, setEditingId] = useState<string|null>(null);
  const [editVal, setEditVal]     = useState('');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const h=(e:MouseEvent)=>{ if(ref.current&&!ref.current.contains(e.target as Node)){setOpen(false);setEditingId(null);} };
    document.addEventListener('mousedown',h); return ()=>document.removeEventListener('mousedown',h);
  },[]);
  const toggle = (v:string) => onChange(selected.includes(v)?selected.filter(s=>s!==v):[...selected,v]);
  const getPrice = (id:string, def:number) => overrides[id]!==undefined?overrides[id]:def;
  const selectedItems = opts.filter(o=>selected.includes(o.value));
  const startEdit = (id:string, price:number, e:React.MouseEvent) => { e.stopPropagation(); setEditingId(id); setEditVal(String(price)); setOpen(true); };
  const commitEdit = (id:string) => { const v=parseFloat(editVal); if(!isNaN(v)&&v>=0) onOverrideChange(id,v); setEditingId(null); };
  return (
    <div ref={ref} className="relative">
      <button onClick={()=>setOpen(!open)} className="flex items-center gap-1 text-xs w-full text-left min-w-0">
        <span className={`truncate ${selectedItems.length?'text-slate-700':'text-slate-300'}`}>
          {selectedItems.length===0?placeholder:selectedItems.length===1?selectedItems[0].label:`${selectedItems.length}项`}
        </span>
        <ChevronDown className="size-3 text-slate-300 ml-auto flex-shrink-0"/>
      </button>
      {selectedItems.length>0&&(
        <div className="flex flex-wrap gap-0.5 mt-0.5">
          {selectedItems.map(item=>{
            const price=getPrice(item.value,item.price??0);
            return (
              <button key={item.value} onClick={e=>startEdit(item.value,price,e)}
                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 hover:bg-orange-50 hover:text-orange-500">
                {item.label} ¥{price}
              </button>
            );
          })}
        </div>
      )}
      {open&&(
        <div className="absolute z-40 top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl py-1 min-w-[210px] max-h-56 overflow-y-auto"
          onClick={e=>e.stopPropagation()}>
          {opts.map(o=>{
            const isChecked=selected.includes(o.value); const price=getPrice(o.value,o.price??0);
            return (
              <div key={o.value} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50">
                <input type="checkbox" checked={isChecked} onChange={()=>toggle(o.value)} className="rounded accent-orange-500 flex-shrink-0"/>
                <span className="flex-1 text-xs text-slate-700 truncate">{o.label}</span>
                {isChecked?(
                  editingId===o.value?(
                    <input autoFocus type="number" min="0" step="0.5" value={editVal}
                      onChange={e=>setEditVal(e.target.value)} onBlur={()=>commitEdit(o.value)}
                      onKeyDown={e=>{if(e.key==='Enter')commitEdit(o.value);}} onClick={e=>e.stopPropagation()}
                      className="w-16 text-xs text-right border-b-2 border-orange-400 outline-none bg-transparent py-0.5"/>
                  ):(
                    <button onClick={e=>startEdit(o.value,price,e)}
                      className="text-xs px-1.5 py-0.5 rounded hover:bg-orange-50 flex-shrink-0"
                      style={{color:'#fd780f'}}>¥{price}</button>
                  )
                ):(
                  <span className="text-xs text-slate-400 flex-shrink-0">¥{o.price??0}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ColorPickerBody({ color, colorHex, onColorChange }: {
  color:string; colorHex:string; onColorChange:(name:string,hex:string)=>void;
}) {
  const [groupId, setGroupId]       = useState(()=>{ for(const g of COLOR_GROUPS){ if(g.colors.find(c=>c.name===color)) return g.id; } return 'neutral'; });
  const [showPattern, setShowPattern] = useState(()=>!!PATTERNS.find(p=>p.name===color));
  const [customName, setCustomName]   = useState('');
  const [pickerHex, setPickerHex]     = useState(colorHex||'#fd780f');
  const pickerRef = useRef<HTMLInputElement>(null);
  const currentGroup = COLOR_GROUPS.find(g=>g.id===groupId);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {COLOR_GROUPS.map(g=>(
          <button key={g.id} onClick={()=>{setGroupId(g.id);setShowPattern(false);}}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg border transition-all ${groupId===g.id&&!showPattern?'text-white border-transparent':'border-slate-200 text-slate-600'}`}
            style={groupId===g.id&&!showPattern?{backgroundColor:'#fd780f'}:{}}>
            {g.name}
          </button>
        ))}
        <button onClick={()=>setShowPattern(true)}
          className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg border transition-all ${showPattern?'text-white border-transparent':'border-slate-200 text-slate-600'}`}
          style={showPattern?{backgroundColor:'#a855f7'}:{}}>花色图案</button>
      </div>
      {!showPattern?(
        <div className="grid grid-cols-8 gap-2">
          {currentGroup?.colors.map(c=>{
            const isSelected=color===c.name; const light=isLight(c.hex);
            return (
              <button key={c.name} title={c.name} onClick={()=>onColorChange(c.name,c.hex)} className="flex flex-col items-center gap-1">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all shadow-sm relative ${isSelected?'border-orange-500 scale-110':'border-slate-200 hover:scale-110 hover:border-orange-300'}`}
                  style={{backgroundColor:c.hex}}>
                  {isSelected&&<div className="absolute inset-0 flex items-center justify-center"><Check className={`size-4 ${light?'text-slate-700':'text-white'}`}/></div>}
                  {c.hex==='#f8f8f8'&&<div className="absolute inset-0 rounded-full border border-slate-200"/>}
                </div>
                <span className="text-[10px] text-slate-500 truncate w-full text-center">{c.name}</span>
              </button>
            );
          })}
        </div>
      ):(
        <div className="grid grid-cols-4 gap-3">
          {PATTERNS.map(p=>{
            const isSelected=color===p.name;
            return (
              <button key={p.name} onClick={()=>onColorChange(p.name,'')} className="flex flex-col items-center gap-1.5">
                <div className={`w-14 h-14 rounded-xl border-2 transition-all relative ${isSelected?'border-orange-500 scale-110':'border-slate-200 hover:scale-110 hover:border-orange-300'}`}
                  style={{background:p.css}}>
                  {isSelected&&<div className="w-full h-full flex items-center justify-center bg-black/20 rounded-xl"><Check className="size-4 text-white"/></div>}
                </div>
                <span className="text-xs text-slate-600">{p.name}</span>
              </button>
            );
          })}
        </div>
      )}
      {color&&(
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50">
          {colorHex?<div className="w-5 h-5 rounded-full border border-slate-200 flex-shrink-0" style={{backgroundColor:colorHex}}/>:<div className="w-5 h-5 rounded-full flex-shrink-0" style={{background:patternCss(color)}}/>}
          <span className="text-xs text-slate-600">已选：<span className="text-slate-800">{color}</span></span>
          <button onClick={()=>onColorChange('','')} className="ml-auto text-slate-300 hover:text-red-400"><X className="size-3.5"/></button>
        </div>
      )}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
        <input value={customName} onChange={e=>setCustomName(e.target.value)} placeholder="自定义颜色名称"
          className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400"/>
        <button onClick={()=>pickerRef.current?.click()}
          className="flex items-center gap-1.5 text-xs border border-slate-200 rounded-lg px-3 py-2 hover:border-orange-400 flex-shrink-0">
          <div className="w-4 h-4 rounded border border-slate-200" style={{backgroundColor:pickerHex}}/><span className="font-mono text-slate-600">{pickerHex.toUpperCase()}</span>
        </button>
        <input ref={pickerRef} type="color" value={pickerHex} onChange={e=>setPickerHex(e.target.value)} className="sr-only"/>
        <button onClick={()=>onColorChange(customName.trim()||`自定义 ${pickerHex.toUpperCase()}`,pickerHex)}
          className="flex-shrink-0 px-3 py-2 rounded-lg text-xs text-white" style={{backgroundColor:'#fd780f'}}>使用</button>
      </div>
    </div>
  );
}

function DefectPickerBody({ defects, defectNote, defectTags, onChange, onNoteChange }:{
  defects:string[]; defectNote:string; defectTags:{id:string;name:string}[];
  onChange:(v:string[])=>void; onNoteChange:(v:string)=>void;
}) {
  const toggle=(t:string)=>onChange(defects.includes(t)?defects.filter(d=>d!==t):[...defects,t]);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs text-slate-500 mb-3">瑕疵标签 <span className="text-slate-400">（多选）</span></p>
        <div className="flex flex-wrap gap-2">
          {defectTags.map(d=>(
            <button key={d.id} onClick={()=>toggle(d.name)}
              className={`text-sm px-4 py-2 rounded-xl border-2 transition-all ${defects.includes(d.name)?'bg-red-50 border-red-300 text-red-600':'border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-500'}`}>
              {defects.includes(d.name)&&'✓ '}{d.name}
            </button>
          ))}
        </div>
      </div>
      {defects.length>0&&(
        <div className="flex flex-wrap gap-1.5 p-3 bg-red-50 rounded-xl">
          {defects.map(d=>(
            <span key={d} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-600 border border-red-200">
              <AlertTriangle className="size-3 flex-shrink-0"/>{d}
              <button onClick={()=>toggle(d)} className="ml-0.5 hover:text-red-800"><X className="size-2.5"/></button>
            </span>
          ))}
        </div>
      )}
      <div>
        <p className="text-xs text-slate-500 mb-2">补充说明</p>
        <textarea value={defectNote} onChange={e=>onNoteChange(e.target.value)}
          placeholder="如：右袖内侧约3cm破损" rows={3}
          className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-orange-400 resize-none"/>
      </div>
    </div>
  );
}

function ColorPickerModal({ garmentName, initialColor, initialColorHex, onConfirm, onClose }:{
  garmentName:string; initialColor:string; initialColorHex:string;
  onConfirm:(color:string,colorHex:string)=>void; onClose:()=>void;
}) {
  const [color, setColor]       = useState(initialColor);
  const [colorHex, setColorHex] = useState(initialColorHex);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4"
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden" style={{maxHeight:'88vh'}}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 flex-shrink-0">
          <div><p className="text-sm text-slate-800">颜色登记</p><p className="text-xs text-slate-400 mt-0.5">{garmentName}</p></div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="size-4 text-slate-500"/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <ColorPickerBody color={color} colorHex={colorHex} onColorChange={(n,h)=>{setColor(n);setColorHex(h);}}/>
        </div>
        <div className="px-5 py-3.5 border-t border-slate-100 flex gap-2 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">取消</button>
          <button onClick={()=>{onConfirm(color,colorHex);onClose();}} className="flex-1 py-2.5 rounded-xl text-sm text-white" style={{backgroundColor:'#fd780f'}}>确认颜色</button>
        </div>
      </div>
    </div>
  );
}

function DefectPickerModal({ garmentName, color, colorHex, initialDefects, initialNote, onConfirm, onClose }:{
  garmentName:string; color:string; colorHex:string;
  initialDefects:string[]; initialNote:string;
  onConfirm:(defects:string[],note:string)=>void; onClose:()=>void;
}) {
  const [defects, setDefects] = useState(initialDefects);
  const [note, setNote]       = useState(initialNote);
  const { defects:ctxDefects } = useAppStore();
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4"
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl flex flex-col overflow-hidden" style={{maxHeight:'88vh'}}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 flex-shrink-0">
          <div>
            <p className="text-sm text-slate-800">瑕疵标注</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-400">{garmentName}</span>
              {color&&<div className="flex items-center gap-1">
                {colorHex?<div className="w-2.5 h-2.5 rounded-full border border-slate-200" style={{backgroundColor:colorHex}}/>:<div className="w-2.5 h-2.5 rounded-full" style={{background:patternCss(color)}}/>}
                <span className="text-xs text-slate-400">{color}</span>
              </div>}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="size-4 text-slate-500"/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <DefectPickerBody defects={defects} defectNote={note} defectTags={ctxDefects} onChange={setDefects} onNoteChange={setNote}/>
        </div>
        <div className="px-5 py-3.5 border-t border-slate-100 flex gap-2 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">取消</button>
          <button onClick={()=>{onConfirm(defects,note);onClose();}} className="flex-1 py-2.5 rounded-xl text-sm text-white" style={{backgroundColor:'#fd780f'}}>确认瑕疵</button>
        </div>
      </div>
    </div>
  );
}

function Step1({ categories, catalog, onSelect }:{
  categories:{id:string;name:string;color:string}[];
  catalog:CatalogItem[];
  onSelect:(item:CatalogItem)=>void;
}) {
  const [search, setSearch] = useState('');
  const [catFilter, setCat] = useState('ALL');
  const filtered = catalog.filter(c=>c.status==='active').filter(item=>{
    const matchCat=catFilter==='ALL'||item.categoryId===catFilter;
    const q=search.trim().toUpperCase();
    return matchCat&&(!q||item.name.includes(search.trim())||item.mnemonicCode.toUpperCase().startsWith(q));
  });
  const grouped = categories.map(cat=>({cat,items:filtered.filter(f=>f.categoryId===cat.id)})).filter(g=>g.items.length>0);
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-4 pt-3 pb-2 flex-shrink-0 space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜索名称或助记码"
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-orange-400"/>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={()=>setCat('ALL')} className={`text-xs px-3 py-1.5 rounded-lg border ${catFilter==='ALL'?'text-white border-transparent':'border-slate-200 text-slate-600'}`} style={catFilter==='ALL'?{backgroundColor:'#fd780f'}:{}}>全部</button>
          {categories.map(c=>(
            <button key={c.id} onClick={()=>setCat(c.id)} className={`text-xs px-3 py-1.5 rounded-lg border ${catFilter===c.id?'text-white border-transparent':'border-slate-200 text-slate-600'}`} style={catFilter===c.id?{backgroundColor:c.color}:{}}>{c.name}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {grouped.length===0?<div className="flex items-center justify-center h-32 text-slate-300 text-sm">未找到匹配项目</div>
        :grouped.map(({cat,items})=>(
          <div key={cat.id} className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full" style={{backgroundColor:cat.color}}/>
              <span className="text-xs text-slate-500">{cat.name}</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {items.map(item=>{
                const isBundle=parseBundleCount(item.name)>=2;
                return (
                  <button key={item.id} onClick={()=>onSelect(item)}
                    className="border-2 border-slate-100 rounded-xl overflow-hidden text-left hover:border-orange-400 hover:shadow-md transition-all active:scale-95 group relative">
                    {isBundle&&<div className="absolute top-1 right-1 z-10 text-[9px] px-1.5 py-0.5 rounded-full text-white" style={{backgroundColor:'#fd780f'}}>套餐</div>}
                    <div className="h-16 flex items-center justify-center" style={{backgroundColor:`${cat.color}18`}}>
                      <CatIcon catId={cat.id} className="size-7 opacity-60 group-hover:opacity-90"/>
                    </div>
                    <div className="px-2 py-1.5">
                      <p className="text-xs text-slate-800 leading-tight truncate">{item.name}</p>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[10px] text-slate-400 font-mono">{item.mnemonicCode}</span>
                        <span className="text-xs" style={{color:'#fd780f'}}>¥{item.price}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddGarmentModal({ onAdd, onAddBundle, onClose }:{
  onAdd:(row:GarmentRow)=>void;
  onAddBundle:(item:CatalogItem,count:number)=>void;
  onClose:()=>void;
}) {
  const { categories, catalog, defects:ctxDefects } = useAppStore();
  const [step, setStep]         = useState<1|2|3>(1);
  const [selected, setSelected] = useState<CatalogItem|null>(null);
  const [color, setColor]       = useState('');
  const [colorHex, setColorHex] = useState('');
  const [defects, setDefects]   = useState<string[]>([]);
  const [defNote, setDefNote]   = useState('');

  const handleSelectItem = (item:CatalogItem) => {
    const cnt=parseBundleCount(item.name);
    if(cnt>=2){ onAddBundle(item,cnt); } else { setSelected(item); setStep(2); }
  };
  const handleConfirm = () => {
    if(!selected) return;
    onAdd(makeEmptyRow({catalogId:selected.id,typeName:selected.name,categoryId:selected.categoryId,unitPrice:selected.price,color,colorHex,defects,defectNote:defNote,serviceCycleHours:selected.serviceCycleHours}));
    onClose();
  };
  const STEP_LABELS=['选择项目','颜色登记','瑕疵标注'];
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col" style={{maxHeight:'88vh'}}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-800">{STEP_LABELS[step-1]}</span>
            <div className="flex items-center gap-1.5">
              {[1,2,3].map(s=>(
                <div key={s} className={`transition-all rounded-full ${s<step?'w-5 h-1.5 bg-orange-400':s===step?'w-5 h-1.5':'w-1.5 h-1.5 bg-slate-200'}`}
                  style={s===step?{backgroundColor:'#fd780f'}:{}}/>
              ))}
            </div>
            <span className="text-xs text-slate-400">{step}/3</span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="size-4 text-slate-500"/></button>
        </div>
        {step===1&&<Step1 categories={categories} catalog={catalog} onSelect={handleSelectItem}/>}
        {step===2&&selected&&(
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="px-5 pt-3 flex-shrink-0">
              <div className="flex items-center gap-3 p-3 rounded-xl mb-3" style={{backgroundColor:'#fff3e8'}}>
                <CatIcon catId={selected.categoryId} className="size-5 text-orange-400"/>
                <span className="text-sm text-slate-800 flex-1">{selected.name}</span>
                <span className="text-sm" style={{color:'#fd780f'}}>¥{selected.price}</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-3">
              <ColorPickerBody color={color} colorHex={colorHex} onColorChange={(n,h)=>{setColor(n);setColorHex(h);}}/>
            </div>
            <div className="px-5 py-3.5 border-t border-slate-100 flex gap-2 flex-shrink-0">
              <button onClick={()=>setStep(1)} className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"><ChevronLeft className="size-3.5"/>返回</button>
              <button onClick={()=>setStep(3)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">跳过颜色</button>
              <button onClick={()=>setStep(3)} className="flex-1 py-2.5 rounded-xl text-sm text-white" style={{backgroundColor:'#fd780f'}}>下一步</button>
            </div>
          </div>
        )}
        {step===3&&selected&&(
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="px-5 pt-3 flex-shrink-0">
              <div className="flex items-center gap-3 p-3 rounded-xl mb-3" style={{backgroundColor:'#fff3e8'}}>
                <CatIcon catId={selected.categoryId} className="size-5 text-orange-400"/>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-slate-800">{selected.name}</span>
                  {color&&<div className="flex items-center gap-1.5 mt-0.5">
                    {colorHex?<div className="w-3 h-3 rounded-full border border-slate-200" style={{backgroundColor:colorHex}}/>:<div className="w-3 h-3 rounded-full" style={{background:patternCss(color)}}/>}
                    <span className="text-xs text-slate-500">{color}</span>
                  </div>}
                </div>
                <span className="text-sm" style={{color:'#fd780f'}}>¥{selected.price}</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-3">
              <DefectPickerBody defects={defects} defectNote={defNote} defectTags={ctxDefects} onChange={setDefects} onNoteChange={setDefNote}/>
            </div>
            <div className="px-5 py-3.5 border-t border-slate-100 flex gap-2 flex-shrink-0">
              <button onClick={()=>setStep(2)} className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"><ChevronLeft className="size-3.5"/>返回</button>
              <button onClick={handleConfirm} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">跳过瑕疵</button>
              <button onClick={handleConfirm} className="flex-1 py-2.5 rounded-xl text-sm text-white" style={{backgroundColor:'#fd780f'}}>确认添加</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HookSlotPicker({ current, onSelect, onClose }: {
  current?: string;
  onSelect: (slot: HookSlot) => void;
  onClose: () => void;
}) {
  const { hookZones, hookSlots } = useAppStore();
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <p className="text-sm text-slate-800">手动调整挂点</p>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="size-4 text-slate-500"/></button>
        </div>
        <div className="overflow-y-auto p-4 space-y-4" style={{ maxHeight: '70vh' }}>
          {hookZones.map(zone => {
            const zSlots = hookSlots.filter(s => s.zoneId === zone.id);
            return (
              <div key={zone.id}>
                <p className="text-xs text-slate-500 mb-2">{zone.name}</p>
                <div className="flex flex-wrap gap-2">
                  {zSlots.map(slot => {
                    const isCurrent = slot.label === current;
                    const isFree = slot.status === 'free';
                    return (
                      <button key={slot.id}
                        disabled={!isFree && !isCurrent}
                        onClick={() => { onSelect(slot); onClose(); }}
                        title={!isFree && !isCurrent ? `${slot.garmentType ?? ''} · ${slot.customerName ?? '占用'}` : slot.label}
                        className={`w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 text-[10px] transition-all
                          ${isCurrent ? 'border-orange-500 bg-orange-50 text-orange-600'
                            : isFree ? 'border-dashed border-slate-200 text-slate-400 hover:border-orange-400 hover:text-orange-500'
                            : 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'}`}>
                        <MapPin className="size-3"/>
                        <span>{slot.label.split('-').pop()}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="px-5 py-3 border-t border-slate-100">
          <p className="text-[10px] text-slate-400">灰色格子为已占用点位，点击橙色边框格子可选中</p>
        </div>
      </div>
    </div>
  );
}

function GarmentTableRow({ row, displayIndex, labelStr, discountRate, existingBindTags, onUpdate, onDelete, onCopy, onReassignSlot }:{
  row:GarmentRow; displayIndex:number; labelStr:string; discountRate:number;
  existingBindTags:string[];
  onUpdate:(id:string,u:Partial<GarmentRow>)=>void;
  onDelete:(id:string)=>void;
  onCopy:(id:string)=>void;
  onReassignSlot:(id:string, slot:HookSlot)=>void;
}) {
  const { services:ctxServices, accessories:ctxAccessories, brands:ctxBrands } = useAppStore();
  const [showColorModal,  setShowColorModal]  = useState(false);
  const [showDefectModal, setShowDefectModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showSlotPicker,  setShowSlotPicker]  = useState(false);
  const [editTotal, setEditTotal] = useState(false);
  const [totalVal,  setTotalVal]  = useState('');
  const [editingBind, setEditingBind] = useState(false);
  const [bindVal,     setBindVal]     = useState('');
  const [bindError,   setBindError]   = useState('');

  const getS = (id:string) => row.surchargeOverrides[id]!==undefined?row.surchargeOverrides[id]:(ctxServices.find(x=>x.id===id)?.price??0);
  const getA = (id:string) => row.attachmentOverrides[id]!==undefined?row.attachmentOverrides[id]:(ctxAccessories.find(x=>x.id===id)?.price??0);
  const surTotal   = row.surchargeIds.reduce((s,id)=>s+getS(id),0);
  const attTotal   = row.attachmentIds.reduce((s,id)=>s+getA(id),0);
  const discPrice  = Math.round(row.unitPrice*discountRate*100)/100;
  const autoTotal  = discPrice+surTotal+attTotal;
  const displayTotal = row.manualTotal!==undefined?row.manualTotal:autoTotal;
  const isManual   = row.manualTotal!==undefined;
  const isLabel    = !!row.isBundleLabel;
  const isAtt      = !!row.isAttachmentRow;

  const startEditTotal = () => { setTotalVal(String(displayTotal)); setEditTotal(true); };
  const commitTotal = () => {
    const v=parseFloat(totalVal);
    if(!isNaN(v)&&v>=0) onUpdate(row.id,{manualTotal:v});
    setEditTotal(false);
  };

  const startEditBind = () => { setBindVal(row.bindTag??''); setBindError(''); setEditingBind(true); };
  const commitBind = () => {
    const v = bindVal.trim();
    if(v && !/^[a-zA-Z0-9]+$/.test(v)) { setBindError('仅支持字母和数字'); return; }
    if(v && existingBindTags.includes(v)) { setBindError('编号已被其他衣物使用'); return; }
    onUpdate(row.id, { bindTag: v || undefined });
    setEditingBind(false); setBindError('');
  };
  const clearBind = (e: React.MouseEvent) => { e.stopPropagation(); onUpdate(row.id, { bindTag: undefined }); };

  const rowBg = isAtt ? 'bg-indigo-50/40' : isLabel ? 'bg-orange-50/30' : 'hover:bg-slate-50/60';

  return (
    <>
      <tr className={`border-b border-slate-100 group text-xs ${rowBg}`}>
        <td className="px-3 py-2.5 text-slate-400 text-center w-8">
          {isAtt ? <span className="text-indigo-300">└</span> : displayIndex}
        </td>

        <td className="px-3 py-2.5 min-w-[120px]">
          <div className="flex items-center gap-1.5 flex-wrap">
            {row.isBundleHeader && <span className="text-[9px] px-1.5 py-0.5 rounded-full text-white flex-shrink-0" style={{backgroundColor:'#fd780f'}}>套餐</span>}
            {isLabel && <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-orange-200 text-orange-400 flex-shrink-0">标签</span>}
            {isAtt   && <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-indigo-200 text-indigo-400 flex-shrink-0 flex items-center gap-0.5"><Paperclip className="size-2"/>附件</span>}
            <span className="text-slate-800">{row.typeName||<span className="text-slate-300">未填写</span>}</span>
          </div>
          <div className="text-[10px] font-mono mt-0.5" style={{color:'#fd780f'}}>{labelStr}</div>
        </td>

        <td className="px-3 py-2.5 w-[80px] cursor-pointer group/color" onClick={()=>setShowColorModal(true)}>
          <div className="flex items-center gap-1.5">
            {row.colorHex?<div className="w-3 h-3 rounded-full border border-slate-200 flex-shrink-0" style={{backgroundColor:row.colorHex}}/>
              :row.color?<div className="w-3 h-3 rounded-full flex-shrink-0" style={{background:patternCss(row.color)}}/>:null}
            <span className="text-slate-600 flex-1 truncate">{row.color||<span className="text-slate-300">—</span>}</span>
            <Pencil className="size-2.5 text-slate-300 opacity-0 group-hover/color:opacity-100 flex-shrink-0"/>
          </div>
        </td>

        <td className="px-3 py-2.5 w-[110px]">
          <BrandCombo brands={ctxBrands} value={row.brand} onChange={v=>onUpdate(row.id,{brand:v})}/>
        </td>

        <td className="px-3 py-2.5 min-w-[120px]">
          <MultiDropWithPrice opts={ctxServices.map(s=>({value:s.id,label:s.name,price:s.price}))}
            selected={row.surchargeIds} overrides={row.surchargeOverrides}
            onChange={ids=>onUpdate(row.id,{surchargeIds:ids})}
            onOverrideChange={(id,price)=>onUpdate(row.id,{surchargeOverrides:{...row.surchargeOverrides,[id]:price}})}
            placeholder="添加工艺"/>
        </td>

        <td className="px-3 py-2.5 min-w-[110px]">
          <MultiDropWithPrice opts={ctxAccessories.map(a=>({value:a.id,label:a.name,price:a.price}))}
            selected={row.attachmentIds} overrides={row.attachmentOverrides}
            onChange={ids=>onUpdate(row.id,{attachmentIds:ids})}
            onOverrideChange={(id,price)=>onUpdate(row.id,{attachmentOverrides:{...row.attachmentOverrides,[id]:price}})}
            placeholder="随附件"/>
        </td>

        <td className="px-3 py-2.5 text-right w-[58px]">
          {isLabel||isAtt?<span className="text-slate-300">¥0</span>:<span className="text-slate-700">¥{row.unitPrice}</span>}
        </td>

        <td className="px-3 py-2.5 text-right w-[62px]">
          {isLabel||isAtt||isManual?<span className="text-slate-300">—</span>:<span style={{color:'#fd780f'}}>¥{discPrice.toFixed(2)}</span>}
        </td>

        <td className="px-3 py-2.5 text-right w-[80px]">
          {isLabel&&!isManual&&surTotal===0&&attTotal===0?(
            <span className="text-slate-300 cursor-pointer hover:text-orange-400" onClick={startEditTotal}>—</span>
          ):editTotal?(
            <input autoFocus type="number" min="0" step="0.5" value={totalVal}
              onChange={e=>setTotalVal(e.target.value)} onBlur={commitTotal}
              onKeyDown={e=>{if(e.key==='Enter')commitTotal();if(e.key==='Escape')setEditTotal(false);}}
              className="w-full text-right border-b-2 border-orange-400 outline-none bg-transparent py-0.5 text-xs"/>
          ):(
            <div className="flex items-center justify-end gap-1 group/total cursor-pointer" onClick={startEditTotal}>
              {isManual&&<span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{backgroundColor:'#fd780f'}}/>}
              <span className="text-slate-800">¥{displayTotal.toFixed(2)}</span>
              {isManual?(
                <button title="重置" onClick={e=>{e.stopPropagation();onUpdate(row.id,{manualTotal:undefined});}}
                  className="opacity-0 group-hover/total:opacity-100 ml-0.5 text-slate-300 hover:text-red-400">
                  <RotateCcw className="size-2.5"/>
                </button>
              ):(
                <Pencil className="size-2.5 text-slate-300 opacity-0 group-hover/total:opacity-100"/>
              )}
            </div>
          )}
        </td>

        <td className="px-3 py-2.5 min-w-[120px] cursor-pointer group/defect" onClick={()=>setShowDefectModal(true)}>
          <div className="flex flex-wrap gap-0.5">
            {row.defects.length>0
              ?row.defects.map(d=><span key={d} className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-100">{d}</span>)
              :<span className="text-slate-300 text-xs group-hover/defect:text-orange-300 transition-colors">无</span>}
          </div>
          {row.defectNote&&<p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[110px]">{row.defectNote}</p>}
        </td>

        <td className="px-3 py-2.5 w-[110px]">
          {editingBind ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus value={bindVal}
                onChange={e=>{ setBindVal(e.target.value.replace(/[^a-zA-Z0-9]/g,'')); setBindError(''); }}
                onBlur={commitBind}
                onKeyDown={e=>{ if(e.key==='Enter') commitBind(); if(e.key==='Escape'){setEditingBind(false);setBindError('');} }}
                placeholder="输入编号"
                className="w-full text-xs border-b-2 border-indigo-400 outline-none bg-transparent py-0.5 font-mono"
              />
              <button onMouseDown={e=>{e.preventDefault();setEditingBind(false);setBindError('');}}
                className="flex-shrink-0 text-slate-300 hover:text-red-400"><X className="size-3"/></button>
            </div>
          ) : row.bindTag ? (
            <div className="flex items-center gap-1 group/bind">
              <button onClick={startEditBind}
                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 font-mono transition-colors max-w-full truncate">
                <Tag className="size-2.5 flex-shrink-0"/>{row.bindTag}
              </button>
              <button onClick={clearBind}
                className="opacity-0 group-hover/bind:opacity-100 flex-shrink-0 text-slate-300 hover:text-red-400 transition-opacity">
                <X className="size-3"/>
              </button>
            </div>
          ) : (
            <button onClick={startEditBind}
              className="text-xs text-slate-300 hover:text-indigo-500 transition-colors flex items-center gap-1">
              <Tag className="size-3"/><span>绑标</span>
            </button>
          )}
          {bindError && <p className="text-[9px] text-red-500 mt-0.5 leading-tight">{bindError}</p>}
        </td>

        {!isAtt && (
          <td className="px-3 py-2.5 w-[90px]">
            <button onClick={() => !isAtt && setShowSlotPicker(true)}
              className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg border transition-all w-full
                ${row.hookSlotLabel
                  ? 'border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100'
                  : 'border-dashed border-slate-200 text-slate-300 hover:border-orange-300 hover:text-orange-400'}`}>
              <MapPin className="size-2.5 flex-shrink-0"/>
              <span className="truncate">{row.hookSlotLabel ?? '待分配'}</span>
            </button>
          </td>
        )}
        {isAtt && <td className="px-3 py-2.5 w-[90px]"/>}

        <td className="px-3 py-2.5 w-[52px] text-center">
          <button onClick={()=>setShowCameraModal(true)} title="拍照记录"
            className="relative inline-flex items-center justify-center p-1.5 rounded-lg hover:bg-orange-50 transition-colors group/cam">
            <Camera className={`size-4 transition-colors ${row.photos.length>0?'text-orange-500':'text-slate-300 group-hover/cam:text-orange-400'}`}/>
            {row.photos.length>0&&(
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full text-white flex items-center justify-center" style={{fontSize:'8px',backgroundColor:'#fd780f'}}>
                {row.photos.length}
              </span>
            )}
          </button>
        </td>

        <td className="px-3 py-2.5 text-center w-14">
          <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
            {!isAtt&&(
              <button onClick={()=>onCopy(row.id)} title={row.bundleGroupId?'复制整套套餐':'复制此行'}
                className="p-1 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg">
                <Copy className="size-3.5"/>
              </button>
            )}
            <button onClick={()=>onDelete(row.id)} title="删除"
              className="p-1 text-red-400 hover:bg-red-50 rounded-lg">
              <Trash2 className="size-3.5"/>
            </button>
          </div>
        </td>
      </tr>

      {showColorModal&&createPortal(
        <ColorPickerModal garmentName={row.typeName||'衣物'} initialColor={row.color} initialColorHex={row.colorHex}
          onConfirm={(c,h)=>onUpdate(row.id,{color:c,colorHex:h})} onClose={()=>setShowColorModal(false)}/>,
        document.body
      )}
      {showDefectModal&&createPortal(
        <DefectPickerModal garmentName={row.typeName||'衣物'} color={row.color} colorHex={row.colorHex}
          initialDefects={row.defects} initialNote={row.defectNote}
          onConfirm={(d,n)=>onUpdate(row.id,{defects:d,defectNote:n})} onClose={()=>setShowDefectModal(false)}/>,
        document.body
      )}
      {showCameraModal&&createPortal(
        <CameraModal garmentName={row.typeName||'衣物'} initialPhotos={row.photos}
          onSave={photos=>onUpdate(row.id,{photos})} onClose={()=>setShowCameraModal(false)}/>,
        document.body
      )}
      {showSlotPicker&&createPortal(
        <HookSlotPicker
          current={row.hookSlotLabel}
          onSelect={slot=>onReassignSlot(row.id, slot)}
          onClose={()=>setShowSlotPicker(false)}/>,
        document.body
      )}
    </>
  );
}

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

function QuickRechargeModal({ member, onConfirm, onClose }: {
  member: Member;
  onConfirm: (amount: number) => void;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState('');
  const [payMethod, setPayMethod] = useState('wechat');
  const [done, setDone] = useState(false);
  const finalAmount = parseFloat(amount) || 0;

  const handleConfirm = () => {
    if (finalAmount <= 0) return;
    onConfirm(finalAmount);
    setDone(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <div>
            <p className="text-sm text-slate-800">快捷充值</p>
            <p className="text-xs text-slate-400 mt-0.5">{member.name} · 当前余额 <span className="text-slate-700">¥{member.balance.toFixed(2)}</span></p>
          </div>
          {!done && <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="size-4 text-slate-500"/></button>}
        </div>
        <div className="p-5 space-y-4">
          {!done ? (
            <>
              <div>
                <p className="text-xs text-slate-500 mb-2">选择充值金额</p>
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_AMOUNTS.map(v => (
                    <button key={v} onClick={() => setAmount(String(v))}
                      className={`py-2.5 rounded-xl text-sm border-2 transition-all ${amount===String(v)?'border-orange-500 bg-orange-50 text-orange-600':'border-slate-200 text-slate-700 hover:border-orange-300'}`}>
                      ¥{v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1.5">或输入金额</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">¥</span>
                  <input type="number" min="0" step="1" value={amount} onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-orange-400"/>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">支付方式</p>
                <div className="flex gap-2">
                  {[{id:'wechat',name:'微信支付'},{id:'alipay',name:'支付宝'},{id:'cash',name:'现金'}].map(m=>(
                    <button key={m.id} onClick={()=>setPayMethod(m.id)}
                      className={`flex-1 py-2 rounded-xl text-xs border-2 transition-all ${payMethod===m.id?'border-orange-500 bg-orange-50 text-orange-600':'border-slate-200 text-slate-600 hover:border-orange-300'}`}>
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
              {finalAmount > 0 && (
                <div className="rounded-xl p-3 text-xs flex items-center justify-between" style={{backgroundColor:'#fff3e8'}}>
                  <span className="text-slate-500">充值后余额</span>
                  <span className="text-slate-800">¥{(member.balance + finalAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">取消</button>
                <button onClick={handleConfirm} disabled={finalAmount <= 0}
                  className="flex-1 py-2.5 rounded-xl text-sm text-white disabled:opacity-40"
                  style={{backgroundColor:'#fd780f'}}>
                  确认充值 {finalAmount > 0 ? `¥${finalAmount}` : ''}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{backgroundColor:'#e8f8f0'}}>
                <Check className="size-6 text-emerald-500"/>
              </div>
              <div>
                <p className="text-sm text-slate-700">充值成功</p>
                <p className="text-xs text-slate-400 mt-0.5">+¥{finalAmount.toFixed(2)} · 余额 ¥{(member.balance + finalAmount).toFixed(2)}</p>
              </div>
              <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm text-white" style={{backgroundColor:'#fd780f'}}>完成</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckoutModal({ grandTotal, subtotal, isHang, member, selectedCpId, onCouponChange, onConfirm, onClose }:{
  grandTotal:number; subtotal:number; isHang:boolean; member:Member|null;
  selectedCpId:string; onCouponChange:(id:string)=>void;
  onConfirm:()=>void; onClose:()=>void;
}) {
  const [payMethod, setPayMethod] = useState('member');
  const [printTicket, setPrintTicket] = useState(true);
  const [printLabel,  setPrintLabel]  = useState(true);
  const [done, setDone] = useState(false);

  const selectedCoupon = member?.coupons.find(c=>c.id===selectedCpId);
  const couponAmt = selectedCoupon?.amount ?? 0;
  const today = new Date().toISOString().slice(0,10);
  const validCoupons = member?.coupons.filter(c=>c.expiry>=today) ?? [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <span className="text-sm text-slate-800">{done?'操作完成':isHang?'确认挂账':'收银结算'}</span>
          {!done&&<button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="size-4 text-slate-500"/></button>}
        </div>
        <div className="p-5 space-y-4">
          {!done?(
            <>
              <div className="rounded-2xl p-4" style={{backgroundColor:'#fff3e8'}}>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span>{isHang?'挂账金额':'应收金额'}</span>
                  {member&&<span>{member.name} · {member.phone.slice(0,3)}****{member.phone.slice(-4)}</span>}
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl" style={{color:'#fd780f'}}>¥{grandTotal.toFixed(2)}</span>
                  {isHang&&<span className="text-xs text-slate-400">记入欠款账户</span>}
                </div>
                {couponAmt>0&&(
                  <div className="flex items-center justify-between mt-1.5 text-xs">
                    <span className="text-slate-400">原价 ¥{subtotal.toFixed(2)}</span>
                    <span className="text-red-500">优惠券 -¥{couponAmt.toFixed(2)}</span>
                  </div>
                )}
                {!isHang&&payMethod==='member'&&member&&(
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-orange-200 text-xs">
                    <span className="text-slate-500">卡余额</span>
                    <span className={member.balance<grandTotal?'text-red-500':'text-slate-700'}>
                      ¥{member.balance.toFixed(2)}{member.balance<grandTotal&&' (余额不足)'}
                    </span>
                  </div>
                )}
              </div>

              {member&&validCoupons.length>0&&!isHang&&(
                <div>
                  <p className="text-xs text-slate-500 mb-2">优惠券</p>
                  <div className="space-y-1.5">
                    <button
                      onClick={()=>onCouponChange('')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${!selectedCpId?'border-orange-400 bg-orange-50':'border-slate-200 hover:border-slate-300'}`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${!selectedCpId?'border-orange-500':'border-slate-300'}`}>
                        {!selectedCpId&&<div className="w-2 h-2 rounded-full" style={{backgroundColor:'#fd780f'}}/>}
                      </div>
                      <span className="text-sm text-slate-600">不使用优惠券</span>
                    </button>
                    {validCoupons.map(c=>{
                      const usable = c.minSpend===0||subtotal>=c.minSpend;
                      const isSelected = selectedCpId===c.id;
                      return (
                        <button key={c.id}
                          disabled={!usable}
                          onClick={()=>onCouponChange(isSelected?'':c.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${
                            !usable?'border-slate-100 opacity-40 cursor-not-allowed':
                            isSelected?'border-orange-400 bg-orange-50':'border-slate-200 hover:border-slate-300'}`}>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected?'border-orange-500':usable?'border-slate-300':'border-slate-200'}`}>
                            {isSelected&&<div className="w-2 h-2 rounded-full" style={{backgroundColor:'#fd780f'}}/>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-800">{c.name}</span>
                              <span className="text-sm font-mono text-red-500">-¥{c.amount}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {c.minSpend>0&&<span className="text-[10px] text-slate-400">满¥{c.minSpend}可用</span>}
                              <span className="text-[10px] text-slate-400">{c.expiry}到期</span>
                              {!usable&&<span className="text-[10px] text-slate-400">（未达门槛）</span>}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {!isHang&&(
                <div>
                  <p className="text-xs text-slate-500 mb-2.5">支付方式</p>
                  <div className="grid grid-cols-4 gap-2">
                    {PAY_METHODS.map(m=>{const Icon=m.Icon; return (
                      <button key={m.id} onClick={()=>setPayMethod(m.id)}
                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all ${payMethod===m.id?'border-orange-500 bg-orange-50 text-orange-600':'border-slate-200 text-slate-600 hover:border-orange-300'}`}>
                        <Icon className="size-4"/><span className="text-[10px] text-center leading-tight">{m.name}</span>
                      </button>
                    );})}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">取消</button>
                <button onClick={()=>setDone(true)} className="flex-1 py-3 rounded-xl text-sm text-white" style={{backgroundColor:'#fd780f'}}>{isHang?'确认挂账':'确认收款'}</button>
              </div>
            </>
          ):(
            <>
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{backgroundColor:'#e8f8f0'}}>
                  <Check className="size-6 text-emerald-500"/>
                </div>
                <p className="text-sm text-slate-700">{isHang?'已记账':'收款成功'}</p>
                <p className="text-xs text-slate-400 mt-0.5">¥{grandTotal.toFixed(2)}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <p className="text-xs text-slate-500">打印选项</p>
                {[{key:'ticket',label:'打印收款小票',val:printTicket,set:setPrintTicket},{key:'label',label:'打印水洗唛',val:printLabel,set:setPrintLabel}].map(item=>(
                  <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                    <div onClick={()=>item.set(!item.val)} className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${item.val?'':'border-slate-300 bg-white'}`}
                      style={item.val?{backgroundColor:'#fd780f',borderColor:'#fd780f'}:{}}>
                      {item.val&&<Check className="size-2.5 text-white"/>}
                    </div>
                    <span className="text-xs text-slate-700">{item.label}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={()=>{onConfirm();onClose();}} className="flex-1 py-3 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">跳过打印</button>
                <button onClick={()=>{onConfirm();onClose();}} className="flex-1 py-3 rounded-xl text-sm text-white flex items-center justify-center gap-1.5" style={{backgroundColor:'#fd780f'}}>
                  <Printer className="size-3.5"/>打印并完成
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReceiveOrder({
  searchQuery = '',
  preselectedMember = null,
  onMemberConsumed,
}: {
  searchQuery?: string;
  preselectedMember?: Member | null;
  onMemberConsumed?: () => void;
}) {
  const { memberTiers, services:ctxServices, accessories:ctxAccessories, addOrder, orders, members, setMembers, hookZones, hookSlots, setHookSlots } = useAppStore();

  const [collectMethod, setCollectMethod] = useState<'walk_in'|'pickup'>('walk_in');
  const [deliverMethod, setDeliverMethod] = useState<'self'|'delivery'>('self');

  const orderType: OrderType = collectMethod === 'pickup' ? 'C' : deliverMethod === 'delivery' ? 'B' : 'A';

  const [pickAddrTxt,   setPickAddrTxt]   = useState('');
  const [deliverAddrTxt,setDeliverAddrTxt]= useState('');

  const [noMemberHint, setNoMemberHint] = useState(false);

  const [pickupDate, setPickupDate] = useState(todayStr());
  const [pickupSlot, setPickupSlot] = useState('');

  const [member, setMember] = useState<Member|null>(null);
  const [selectedCpId, setSelectedCpId] = useState('');

  useEffect(() => {
    if (preselectedMember) {
      setMember(preselectedMember);
      setSelectedCpId('');
      onMemberConsumed?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedMember]);

  useEffect(() => {
    if (collectMethod === 'pickup' && member) {
      const def = member.addresses.find(a => a.isDefault) ?? member.addresses[0];
      if (def) setPickAddrTxt(def.address);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectMethod]);

  useEffect(() => {
    if (deliverMethod === 'delivery' && member) {
      const def = member.addresses.find(a => a.isDefault) ?? member.addresses[0];
      if (def) setDeliverAddrTxt(def.address);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliverMethod]);

  useEffect(() => {
    if (member) {
      const def = member.addresses.find(a => a.isDefault) ?? member.addresses[0];
      if (def) {
        if (collectMethod === 'pickup') setPickAddrTxt(def.address);
        if (deliverMethod === 'delivery') setDeliverAddrTxt(def.address);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member]);

  const [garments,  setGarments]  = useState<GarmentRow[]>([]);
  const [showAdd,   setShowAdd]   = useState(false);
  const [orderNote, setOrderNote] = useState('');
  const [noteOpen,  setNoteOpen]  = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isHang,       setIsHang]       = useState(false);

  const [grandTotalOverride, setGrandTotalOverride] = useState<number|null>(null);
  const [editingGT, setEditingGT] = useState(false);
  const [gtVal,     setGtVal]     = useState('');
  const [showRecharge, setShowRecharge] = useState(false);

  const reserveSlot = (slot: HookSlot, row: GarmentRow) => {
    setHookSlots(prev => prev.map(s => s.id === slot.id ? {
      ...s, status: 'washing' as const,
      garmentType: row.typeName,
      garmentColor: row.color,
      customerName: member?.name,
      receivedAt: new Date().toLocaleString('zh-CN',{month:'2-digit',day:'2-digit'}).replace(/\//g,'-'),
    } : s));
  };
  const releaseSlot = (slotId: string) => {
    setHookSlots(prev => prev.map(s => s.id === slotId
      ? { id:s.id, zoneId:s.zoneId, zoneName:s.zoneName, label:s.label, status:'free' as const }
      : s));
  };

  const addGarment = (row: GarmentRow) => {
    if (!row.isAttachmentRow) {
      const slot = allocateHookSlot(row.categoryId, hookZones, hookSlots);
      if (slot) {
        const rowWithSlot = { ...row, hookSlotId: slot.id, hookSlotLabel: slot.label };
        reserveSlot(slot, row);
        setGarments(p => [...p, rowWithSlot]);
      } else {
        setGarments(p => [...p, row]);
      }
    } else {
      setGarments(p => [...p, row]);
    }
    setGrandTotalOverride(null);
  };

  const updateGarment = useCallback((id:string, updates:Partial<GarmentRow>) => {
    setGarments(prev => {
      const row = prev.find(g=>g.id===id);
      if(!row) return prev;

      if(updates.attachmentIds !== undefined) {
        const oldIds = row.attachmentIds;
        const newIds = updates.attachmentIds;
        const added   = newIds.filter(x=>!oldIds.includes(x));
        const removed = oldIds.filter(x=>!newIds.includes(x));

        let next = prev.map(g=>g.id===id?{...g,...updates}:g);

        if(removed.length>0){
          next = next.filter(g=>!(g.isAttachmentRow&&g.parentRowId===id&&removed.includes(g.attachmentId??'')));
        }

        if(added.length>0){
          const parentIdx = next.findIndex(g=>g.id===id);
          let insertAfter = parentIdx;
          for(let i=parentIdx+1;i<next.length;i++){
            if(next[i].isAttachmentRow&&next[i].parentRowId===id) insertAfter=i;
            else break;
          }
          const newAttRows = added.map(attId=>{
            const attItem = ctxAccessories.find(a=>a.id===attId);
            return makeEmptyRow({ typeName:attItem?.name??'附件', isAttachmentRow:true, parentRowId:id, attachmentId:attId });
          });
          next=[...next.slice(0,insertAfter+1),...newAttRows,...next.slice(insertAfter+1)];
        }
        return next;
      }

      return prev.map(g=>g.id===id?{...g,...updates}:g);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[ctxAccessories]);

  const deleteGarment = (id: string) => {
    const row = garments.find(g => g.id === id);
    if (row?.hookSlotId) releaseSlot(row.hookSlotId);
    setGarments(p => p.filter(g => g.id !== id && !(g.isAttachmentRow && g.parentRowId === id)));
    setGrandTotalOverride(null);
  };

  const copyGarment = (id: string) => {
    const orig = garments.find(g => g.id === id);
    if (!orig || orig.isAttachmentRow) return;

    const assignNewSlot = (row: GarmentRow): GarmentRow => {
      if (row.isAttachmentRow) return { ...row };
      const slot = allocateHookSlot(row.categoryId, hookZones, hookSlots);
      if (slot) { reserveSlot(slot, row); return { ...row, hookSlotId: slot.id, hookSlotLabel: slot.label }; }
      return { ...row, hookSlotId: undefined, hookSlotLabel: undefined };
    };

    if (orig.bundleGroupId) {
      const groupRows = garments.filter(g => g.bundleGroupId === orig.bundleGroupId);
      const lastIdx = Math.max(...groupRows.map(r => garments.findIndex(g => g.id === r.id)));
      let allRows: GarmentRow[] = [];
      groupRows.forEach(gr => {
        allRows.push(gr);
        allRows.push(...garments.filter(g => g.isAttachmentRow && g.parentRowId === gr.id));
      });
      const newGroupId = uid();
      const idMap: Record<string, string> = {};
      allRows.forEach(r => { idMap[r.id] = uid(); });
      const copies = allRows.map(r => assignNewSlot({
        ...r, id: idMap[r.id],
        bundleGroupId: r.bundleGroupId ? newGroupId : undefined,
        parentRowId: r.parentRowId ? idMap[r.parentRowId] : undefined,
      }));
      setGarments(p => [...p.slice(0, lastIdx + 1), ...copies, ...p.slice(lastIdx + 1)]);
    } else {
      const idx = garments.findIndex(g => g.id === id);
      const attRows = garments.filter(g => g.isAttachmentRow && g.parentRowId === id);
      const newId = uid();
      const copies = [
        assignNewSlot({ ...orig, id: newId }),
        ...attRows.map(r => ({ ...r, id: uid(), parentRowId: newId })),
      ];
      setGarments(p => [...p.slice(0, idx + 1), ...copies, ...p.slice(idx + 1)]);
    }
    setGrandTotalOverride(null);
  };

  const reassignSlot = (rowId: string, newSlot: HookSlot) => {
    const row = garments.find(g => g.id === rowId);
    if (!row) return;
    if (row.hookSlotId && row.hookSlotId !== newSlot.id) releaseSlot(row.hookSlotId);
    setHookSlots(prev => prev.map(s => s.id === newSlot.id ? {
      ...s, status: 'washing' as const,
      garmentType: row.typeName, garmentColor: row.color, customerName: member?.name,
      receivedAt: new Date().toLocaleString('zh-CN',{month:'2-digit',day:'2-digit'}).replace(/\//g,'-'),
    } : s));
    setGarments(prev => prev.map(g => g.id === rowId
      ? { ...g, hookSlotId: newSlot.id, hookSlotLabel: newSlot.label } : g));
  };

  const handleAddBundle = (item:CatalogItem, count:number) => {
    const bundleGroupId=uid();
    const rows=Array.from({length:count},(_,i)=>makeEmptyRow({
      catalogId:item.id,
      typeName:`${item.name} 第${i+1}件`,
      categoryId:item.categoryId,
      unitPrice:i===0?item.price:0,
      isBundleHeader:i===0,
      isBundleLabel:i>0,
      bundleGroupId,
      serviceCycleHours:item.serviceCycleHours,
    }));
    setGarments(p=>[...p,...rows]);
    setShowAdd(false);
    setGrandTotalOverride(null);
  };

  const tier         = member?getMemberTier(member.totalSpent,memberTiers):null;
  const discountRate = tier?.discountRate??1;
  const selectedCoupon = member?.coupons.find(c=>c.id===selectedCpId);
  const couponAmt    = selectedCoupon?.amount??0;

  const getS2=(row:GarmentRow,id:string)=>row.surchargeOverrides[id]!==undefined?row.surchargeOverrides[id]:(ctxServices.find(x=>x.id===id)?.price??0);
  const getA2=(row:GarmentRow,id:string)=>row.attachmentOverrides[id]!==undefined?row.attachmentOverrides[id]:(ctxAccessories.find(x=>x.id===id)?.price??0);

  const unitTotal = garments.filter(g=>!g.isAttachmentRow).reduce((s,g)=>s+g.unitPrice,0);
  const surTotal  = garments.reduce((s,g)=>s+g.surchargeIds.reduce((ss,id)=>ss+getS2(g,id),0),0);
  const attTotal  = garments.reduce((s,g)=>s+g.attachmentIds.reduce((ss,id)=>ss+getA2(g,id),0),0);

  const rowSubSum = garments.reduce((s,g)=>{
    if(g.manualTotal!==undefined) return s+g.manualTotal;
    const sur=g.surchargeIds.reduce((ss,id)=>ss+getS2(g,id),0);
    const att=g.attachmentIds.reduce((ss,id)=>ss+getA2(g,id),0);
    const disc=Math.round(g.unitPrice*discountRate*100)/100;
    return s+disc+sur+att;
  },0);
  const autoGrand    = Math.round(Math.max(rowSubSum-couponAmt,0)*100)/100;
  const finalGrand   = grandTotalOverride!==null?grandTotalOverride:autoGrand;
  const isGTManual   = grandTotalOverride!==null;

  const startEditGT=()=>{setGtVal(String(finalGrand));setEditingGT(true);};
  const commitGT=()=>{const v=parseFloat(gtVal);if(!isNaN(v)&&v>=0)setGrandTotalOverride(v);setEditingGT(false);};

  const previewOrderNo = String(1012570+orders.length);

  const computeLabels = () => {
    const garmentNumbers: Record<string,number> = {};
    let gc=0;
    garments.forEach(g=>{ if(!g.isAttachmentRow){gc++;garmentNumbers[g.id]=gc;} });
    const attCounters: Record<string,number> = {};
    return garments.map(g=>{
      if(g.isAttachmentRow&&g.parentRowId){
        const parentNo = garmentNumbers[g.parentRowId]??0;
        attCounters[g.parentRowId]=(attCounters[g.parentRowId]??0)+1;
        return `S01${previewOrderNo}${String(parentNo).padStart(3,'0')}${String(attCounters[g.parentRowId]).padStart(2,'0')}`;
      }
      return `S01${previewOrderNo}${String(garmentNumbers[g.id]??0).padStart(3,'0')}`;
    });
  };
  const labels = computeLabels();

  const displayIndices = (() => {
    let cnt=0;
    return garments.map(g=>g.isAttachmentRow?0:++cnt);
  })();

  const submitOrder = () => {
    const now=nowStr(), orderNo=String(1012570+orders.length);
    const cust=member??{id:'guest',name:'散客',phone:'',balance:0,totalSpent:0,registrationDate:todayStr(),addresses:[],coupons:[]};
    const records: GarmentRecord[] = garments.map((g,i)=>{
      const surNames=g.surchargeIds.map(id=>ctxServices.find(x=>x.id===id)?.name??'').filter(Boolean);
      const svcLabel=surNames.length>0?surNames.join('/'):(g.isBundleHeader?'套餐计价':g.isBundleLabel?'套餐标签':g.isAttachmentRow?'随附件':'标准洗涤');
      const rowSur=g.surchargeIds.reduce((s,id)=>s+getS2(g,id),0);
      const rowAtt=g.attachmentIds.reduce((s,id)=>s+getA2(g,id),0);
      const rowPrice=g.manualTotal!==undefined?g.manualTotal:Math.round(g.unitPrice*discountRate*100)/100+rowSur+rowAtt;
      return {
        id:uid(), label:labels[i],
        type:g.typeName, service:svcLabel, price:rowPrice,
        color:g.color, brand:g.brand, defects:g.defects,
        status:(orderType === 'C' ? 'ordered' : 'received') as const,
        warehousingAt:now, serviceCycleHours:g.serviceCycleHours??72,
        photos:g.photos.length>0?g.photos:undefined,
        isAttachmentRow:g.isAttachmentRow||undefined,
        parentLabel:g.isAttachmentRow&&g.parentRowId?labels[garments.findIndex(x=>x.id===g.parentRowId)]:undefined,
        bindTag:g.bindTag||undefined,
        hookSlotId:g.hookSlotId||undefined,
        hookSlotLabel:g.hookSlotLabel||undefined,
      };
    });
    const pickAddr = pickAddrTxt.trim();
    const delivAddr = deliverAddrTxt.trim();
    const addr = collectMethod==='pickup' ? pickAddr : deliverMethod==='delivery' ? delivAddr : (cust.addresses[0]?.address??'');

    if (member) {
      const newAddr = collectMethod==='pickup' ? pickAddr : deliverMethod==='delivery' ? delivAddr : '';
      if (newAddr && !member.addresses.some(a => a.address === newAddr)) {
        setMembers(members.map(m => m.id === member.id ? {
          ...m,
          addresses: [...m.addresses, {
            id: uid(), label: '地址'+(m.addresses.length+1),
            address: newAddr, phone: m.phone, isDefault: m.addresses.length === 0,
          }],
        } : m));
      }
    }
    const expectedAt = collectMethod==='pickup' ? `${pickupDate} ${pickupSlot||'待定'}` : laterStr(2)+' 10:00-12:00';
    const ordId = uid();
    addOrder({
      id:ordId, orderNo, type:orderType, source:'store',
      customerName:cust.name,
      phone:cust.phone?`${cust.phone.slice(0,3)}****${cust.phone.slice(-4)}`:'',
      address:addr, garments:records, totalAmount:finalGrand,
      receivedAt:now,
      expectedAt,
      notes:orderNote,
      isHang: isHang||undefined,
      tracking:[{time:now,action:'订单创建，等待入库',operator:'门店收银'}],
    });
    const receivedDay = new Date().toLocaleString('zh-CN',{month:'2-digit',day:'2-digit'}).replace(/\//g,'-');
    garments.forEach((g, i) => {
      if (g.hookSlotId) {
        setHookSlots(prev => prev.map(s => s.id === g.hookSlotId ? {
          ...s,
          status: 'washing' as const,
          garmentId: records[i].id,
          garmentLabel: labels[i],
          orderId: ordId,
          orderNo,
          customerName: cust.name,
          garmentType: g.typeName,
          garmentColor: g.color,
          receivedAt: receivedDay,
          expectedAt,
          serviceCycleHours: g.serviceCycleHours ?? 72,
        } : s));
      }
    });
    resetFormNoRelease();
  };
  const resetFormNoRelease = () => {
    setCollectMethod('walk_in'); setDeliverMethod('self');
    setPickAddrTxt(''); setDeliverAddrTxt('');
    setPickupDate(todayStr()); setPickupSlot('');
    setMember(null); setSelectedCpId('');
    setGarments([]); setOrderNote(''); setNoteOpen(false); setGrandTotalOverride(null);
  };

  const resetForm = () => {
    const slotIds = garments.map(g => g.hookSlotId).filter(Boolean) as string[];
    if (slotIds.length > 0) {
      setHookSlots(prev => prev.map(s => slotIds.includes(s.id)
        ? { id:s.id, zoneId:s.zoneId, zoneName:s.zoneName, label:s.label, status:'free' as const }
        : s));
    }
    resetFormNoRelease();
  };

  return (
    <div className="-m-4 sm:-m-5 lg:-m-6 flex flex-col overflow-hidden bg-white" style={{height:'calc(100vh - 4rem)'}}>

      <div className="flex-shrink-0 bg-white border-b border-slate-100 px-4 py-2.5 space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          {member && (
            <>
              <div className="flex items-center gap-2 flex-shrink-0 min-w-0 flex-wrap">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                  style={{ backgroundColor: tier?.color ?? '#fd780f' }}>
                  {member.name.slice(0, 1)}
                </div>
                <span className="text-sm text-slate-800 whitespace-nowrap">{member.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded text-white flex-shrink-0"
                  style={{ backgroundColor: tier?.color ?? '#fd780f' }}>{tier?.name ?? '普通'}</span>
                {member.isImportant && member.importantLevel && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border flex-shrink-0 ${getImportantInfo(member.importantLevel).bg} ${getImportantInfo(member.importantLevel).color} ${getImportantInfo(member.importantLevel).border}`}>
                    {getImportantInfo(member.importantLevel).stars}
                  </span>
                )}
                <span className="text-xs text-slate-400 whitespace-nowrap">{member.phone}</span>
                {discountRate < 1 && (
                  <span className="text-xs flex-shrink-0" style={{ color:'#fd780f' }}>{(discountRate*10).toFixed(1)}折</span>
                )}
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  余额 <span className="text-slate-700">¥{member.balance.toFixed(2)}</span>
                </span>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  累消 <span className="text-slate-700">¥{member.totalSpent.toFixed(2)}</span>
                </span>
                {couponAmt > 0 && (
                  <span className="text-xs text-red-500 flex-shrink-0 whitespace-nowrap">券-¥{couponAmt}</span>
                )}
                <button onClick={() => setShowRecharge(true)}
                  className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors flex-shrink-0"
                  style={{ color: '#fd780f' }}>
                  <CreditCard className="size-3" />充值
                </button>
              </div>
              <div className="w-px h-5 bg-slate-200 flex-shrink-0 hidden sm:block" />
            </>
          )}

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-slate-400 whitespace-nowrap">收衣</span>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden relative">
              {(['walk_in','pickup'] as const).map(m=>(
                <button key={m} onClick={()=>{
                  if(!member){ setNoMemberHint(true); setTimeout(()=>setNoMemberHint(false),2000); return; }
                  setCollectMethod(m);setDeliverMethod(m==='pickup'?'delivery':'self');
                }}
                  className={`px-3 py-1.5 text-xs transition-all ${collectMethod===m?'text-white':!member?'text-slate-300':'text-slate-600 hover:bg-slate-50'}`}
                  style={collectMethod===m?{backgroundColor:'#fd780f'}:{}}>
                  {m==='walk_in'?'到店':'上门取件'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-slate-400 whitespace-nowrap">交付</span>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              {(['self','delivery'] as const).map(m=>(
                <button key={m} onClick={()=>{
                  if(!member){ setNoMemberHint(true); setTimeout(()=>setNoMemberHint(false),2000); return; }
                  setDeliverMethod(m);
                }}
                  className={`px-3 py-1.5 text-xs transition-all ${deliverMethod===m?'text-white':!member?'text-slate-300':'text-slate-600 hover:bg-slate-50'}`}
                  style={deliverMethod===m?{backgroundColor:'#fd780f'}:{}}>
                  {m==='self'?'到店自取':'送货上门'}
                </button>
              ))}
            </div>
          </div>

          {noMemberHint && (
            <span className="text-xs text-red-500 flex-shrink-0 animate-pulse">请先选择客户</span>
          )}

          <div className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-100 flex-shrink-0">
            <Store className="size-3 text-slate-400"/><span className="text-[11px] text-slate-400">门店收银</span>
          </div>
        </div>

        {collectMethod==='pickup'&&(
          <div className="flex flex-wrap items-start gap-3 pt-1 border-t border-slate-100">
            <div className="flex-1 min-w-[160px]">
              <p className="text-[10px] text-slate-400 mb-1">取件地址{member&&member.addresses.length>0&&<span className="text-slate-300 ml-1">（已自动填入，可修改后保存为新地址）</span>}</p>
              <input value={pickAddrTxt} onChange={e=>setPickAddrTxt(e.target.value)} placeholder="输入取件地址"
                className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-orange-400"/>
            </div>
            <div className="flex-shrink-0">
              <p className="text-[10px] text-slate-400 mb-1">取件日期</p>
              <input type="date" value={pickupDate} onChange={e=>setPickupDate(e.target.value)}
                className="h-8 px-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-orange-400"/>
            </div>
            <div className="flex-1 min-w-[200px]">
              <p className="text-[10px] text-slate-400 mb-1">取件时段</p>
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_PICKUP_SLOTS.map(slot=>(
                  <button key={slot} onClick={()=>setPickupSlot(pickupSlot===slot?'':slot)}
                    className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${pickupSlot===slot?'text-white border-transparent':'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    style={pickupSlot===slot?{backgroundColor:'#fd780f'}:{}}>
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {deliverMethod==='delivery'&&(
          <div className="pt-1 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 mb-1">送货地址{member&&member.addresses.length>0&&<span className="text-slate-300 ml-1">（已自动填入，可修改后保存为新地址）</span>}</p>
            <input value={deliverAddrTxt} onChange={e=>setDeliverAddrTxt(e.target.value)} placeholder="输入送货地址"
              className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-orange-400"/>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto bg-white">
        {garments.length===0?(
          <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-3">
            <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center"><Plus className="size-6 text-slate-300"/></div>
            <p className="text-sm">点击底部「添加衣物」开始录入</p>
          </div>
        ):(
          <div className="min-w-[1100px]">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr>
                  {['#','衣物名称','颜色','品牌','工艺加价','附件','单价','折后价','行小计','瑕疵','绑标','挂点','📷',''].map((h,i)=>(
                    <th key={i} className="px-3 py-2 text-left text-[10px] text-slate-400 whitespace-nowrap font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {garments.map((g,i)=>{
                  const usedTags=garments.filter(r=>r.id!==g.id&&r.bindTag).map(r=>r.bindTag as string);
                  return (
                    <GarmentTableRow key={g.id} row={g}
                      displayIndex={displayIndices[i]}
                      labelStr={labels[i]}
                      discountRate={discountRate}
                      existingBindTags={usedTags}
                      onUpdate={updateGarment}
                      onDelete={deleteGarment}
                      onCopy={copyGarment}
                      onReassignSlot={reassignSlot}/>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 bg-white border-t border-slate-200">
        <div className="px-4 border-b border-slate-100">
          <button onClick={()=>setNoteOpen(!noteOpen)}
            className="flex items-center gap-2 py-2 text-xs text-slate-500 hover:text-slate-700 w-full transition-colors">
            <FileText className="size-3.5 flex-shrink-0" style={orderNote?{color:'#fd780f'}:{}}/>
            <span className="flex-1 text-left truncate" style={orderNote?{color:'#fd780f'}:{}}>
              {orderNote?`订单备注：${orderNote}`:'添加订单备注…'}
            </span>
            {noteOpen?<ChevronUp className="size-3.5 flex-shrink-0"/>:<ChevronDown className="size-3.5 flex-shrink-0"/>}
          </button>
          {noteOpen&&(
            <textarea value={orderNote} onChange={e=>setOrderNote(e.target.value)}
              placeholder="输入订单整体备注，如：客户要求轻柔洗涤、3日内完成…"
              rows={2} autoFocus
              className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-orange-400 resize-none mb-2"/>
          )}
        </div>

        <div className="px-4 py-2.5 flex items-center gap-3 flex-wrap">
          <button onClick={()=>setShowAdd(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-white flex-shrink-0" style={{backgroundColor:'#fd780f'}}>
            <Plus className="size-4"/>添加衣物
          </button>

          {garments.length>0&&(
            <div className="flex items-center gap-3 text-xs flex-wrap">
              <span className="text-slate-500">共<span className="text-slate-800 mx-1">{garments.filter(g=>!g.isAttachmentRow).length}</span>件</span>
              <span className="text-slate-500">原价<span className="text-slate-800 ml-1">¥{unitTotal}</span></span>
              {surTotal>0&&<span className="text-slate-500">工艺<span className="text-slate-800 ml-1">+¥{surTotal}</span></span>}
              {attTotal>0&&<span className="text-slate-500">附件<span className="text-slate-800 ml-1">+¥{attTotal}</span></span>}
              {couponAmt>0&&<span className="text-red-500">券 -¥{couponAmt}</span>}
              {discountRate<1&&<span style={{color:'#fd780f'}}>{(discountRate*10).toFixed(1)}折</span>}
            </div>
          )}

          {garments.length>0&&(
            <div className="flex items-center gap-2 ml-auto flex-shrink-0">
              <span className="text-xs text-slate-400">实付</span>
              {editingGT?(
                <input autoFocus type="number" min="0" step="0.5" value={gtVal}
                  onChange={e=>setGtVal(e.target.value)} onBlur={commitGT}
                  onKeyDown={e=>{if(e.key==='Enter')commitGT();if(e.key==='Escape')setEditingGT(false);}}
                  className="w-28 text-right text-xl border-b-2 border-orange-400 outline-none bg-transparent" style={{color:'#fd780f'}}/>
              ):(
                <div className="flex items-center gap-1.5 cursor-pointer group/gt" onClick={startEditGT} title="点击手动修改总价">
                  {isGTManual&&<span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{backgroundColor:'#fd780f'}}/>}
                  <span className="text-xl" style={{color:'#fd780f'}}>¥{finalGrand.toFixed(2)}</span>
                  {isGTManual?(
                    <button title="重置" onClick={e=>{e.stopPropagation();setGrandTotalOverride(null);}} className="text-slate-300 hover:text-red-400"><RotateCcw className="size-3.5"/></button>
                  ):(
                    <Pencil className="size-3 text-slate-300 opacity-0 group-hover/gt:opacity-100"/>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 flex-shrink-0">
            <button onClick={()=>{setIsHang(true);setShowCheckout(true);}}
              disabled={garments.length===0||!member}
              className="px-4 py-2 rounded-xl text-sm border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed">
              挂 账
            </button>
            <button onClick={()=>{
                if(!member){ setNoMemberHint(true); setTimeout(()=>setNoMemberHint(false),2000); return; }
                setIsHang(false);setShowCheckout(true);
              }}
              disabled={garments.length===0||!member}
              className="px-5 py-2 rounded-xl text-sm text-white disabled:opacity-30 disabled:cursor-not-allowed"
              style={{backgroundColor:'#fd780f'}}>
              收 银
            </button>
          </div>
        </div>
      </div>

      {showAdd&&<AddGarmentModal onAdd={addGarment} onAddBundle={handleAddBundle} onClose={()=>setShowAdd(false)}/>}
      {showCheckout&&<CheckoutModal grandTotal={finalGrand} subtotal={autoGrand+couponAmt} isHang={isHang} member={member} selectedCpId={selectedCpId} onCouponChange={setSelectedCpId} onConfirm={submitOrder} onClose={()=>setShowCheckout(false)}/>}
      {showRecharge&&member&&<QuickRechargeModal member={member} onConfirm={amount=>{
        const updated={...member,balance:Math.round((member.balance+amount)*100)/100};
        setMembers(members.map(m=>m.id===member.id?updated:m));
        setMember(updated);
      }} onClose={()=>setShowRecharge(false)}/>}
    </div>
  );
}
