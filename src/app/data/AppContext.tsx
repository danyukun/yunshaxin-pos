import { createContext, useContext, useState, ReactNode } from 'react';

/* ════════════════════════════════════════════════════════════════
   共享类型（供所有页面 import）
════════════════════════════════════════════════════════════════ */
export interface ColorItem  { id: string; name: string; hex: string; }
export interface SimpleItem { id: string; name: string; }
export interface PricedItem { id: string; name: string; price: number; }
export interface Category   { id: string; code: string; name: string; color: string; }

export interface CatalogItem {
  id: string; name: string; mnemonicCode: string;
  categoryId: string; price: number; status: 'active' | 'inactive';
  serviceCycleHours?: number;
}
export interface MemberTier {
  id: string; name: string; minSpent: number;
  discountRate: number; color: string; badge: string;
}
export interface MemberAddress {
  id: string; label: string; address: string; phone: string; isDefault: boolean;
}
export interface MemberCoupon {
  id: string; name: string; amount: number; minSpend: number; expiry: string;
}
export interface Store {
  id: string; name: string;
}
export interface Member {
  id: string; name: string; phone: string;
  balance: number; totalSpent: number; registrationDate: string;
  addresses: MemberAddress[]; coupons: MemberCoupon[];
  isImportant?: boolean;
  importantLevel?: 1 | 2 | 3;
  isFollowWechat?: boolean;
  storeId?: string;
}

export type GarmentStatus =
  | 'ordered'          // 客户下单
  | 'assigned'         // 预约单分配（C型上门取）
  | 'picking_up'       // 取衣中（C型）
  | 'pickup_done'      // 取衣完成（C型）
  | 'received'         // 已收衣
  | 'sent_wash'        // 已送洗
  | 'factory_in'       // 已入厂
  | 'factory_sorted'   // 工厂已分拣
  | 'washing'          // 洗涤中
  | 'initial_check'    // 初检
  | 'ironing'          // 熨烫
  | 'final_check'      // 总检
  | 'packing'          // 打包
  | 'factory_out'      // 已出厂
  | 'store_in'         // 已入库
  | 'on_shelf'         // 已上架
  | 'delivering'       // 配送中（B/C型）
  | 'completed'        // 已完成（自取或已配送）
  | 'cancelled'        // 已退单
  | 'compensated';     // 已退赔

export type BatchStatus = 'in_transit' | 'arrived';
export type OrderType   = 'A' | 'B' | 'C';
export type OrderSource = 'store' | 'miniapp' | 'meituan' | 'douyin' | 'third_party';

/* ── 挂点区域 ── */
export interface HookZone {
  id: string;
  name: string;
  capacity: number;
  categoryIds?: string[];
}

export type HookSlotStatus = 'free' | 'washing' | 'ready' | 'collected';

export interface HookSlot {
  id: string;
  zoneId: string;
  zoneName: string;
  label: string;
  status: HookSlotStatus;
  garmentId?: string;
  garmentLabel?: string;
  orderId?: string;
  orderNo?: string;
  customerName?: string;
  garmentType?: string;
  garmentColor?: string;
  receivedAt?: string;
  expectedAt?: string;
  serviceCycleHours?: number;
}

export function buildHookSlots(zones: HookZone[], existing: HookSlot[] = []): HookSlot[] {
  return zones.flatMap(zone =>
    Array.from({ length: zone.capacity }, (_, i) => {
      const label = `${zone.name}-${i + 1}`;
      const prev = existing.find(s => s.label === label && s.zoneId === zone.id);
      if (prev) return prev;
      return { id: `${zone.id}-${i + 1}`, zoneId: zone.id, zoneName: zone.name, label, status: 'free' as const };
    })
  );
}

export function allocateHookSlot(
  categoryId: string,
  hookZones: HookZone[],
  hookSlots: HookSlot[],
): HookSlot | null {
  const zones = hookZones.filter(z => !z.categoryIds?.length || z.categoryIds.includes(categoryId));
  for (const zone of zones) {
    const free = hookSlots
      .filter(s => s.zoneId === zone.id && s.status === 'free')
      .sort((a, b) => {
        const n = (l: string) => parseInt(l.split('-').pop() ?? '0');
        return n(a.label) - n(b.label);
      });
    if (free.length > 0) return free[0];
  }
  return null;
}

export interface GarmentRecord {
  id: string; label: string; type: string; service: string;
  price: number; color: string; brand: string; defects: string[];
  status: GarmentStatus;
  batchId?: string;
  warehousingAt?: string; serviceCycleHours?: number; isOverdue?: boolean;
  photos?: string[];
  isAttachmentRow?: boolean; parentLabel?: string;
  bindTag?: string;
  hookSlotId?: string;
  hookSlotLabel?: string;
}
export interface TrackEvent { time: string; action: string; operator: string; }
export interface OrderMessage { id: string; time: string; content: string; operator: string; }
export interface AppOrder {
  id: string; orderNo: string; type: OrderType; source: OrderSource;
  customerName: string; phone: string; address: string;
  garments: GarmentRecord[]; totalAmount: number;
  receivedAt: string; expectedAt: string; notes: string;
  tracking: TrackEvent[];
  messages?: OrderMessage[];
  isHang?: boolean;
  compensationAmount?: number;
  bagNo?: string;
}

/* ════════════════════════════════════════════════════════════════
   初始数据
════════════════════════════════════════════════════════════════ */
export const INIT_COLORS: ColorItem[] = [
  { id:'c1', name:'黑色', hex:'#1a1a1a' }, { id:'c2', name:'白色', hex:'#f0f0f0' },
  { id:'c3', name:'藏青', hex:'#1e3a5f' }, { id:'c4', name:'卡其', hex:'#c3a882' },
  { id:'c5', name:'红色', hex:'#dc2626' }, { id:'c6', name:'米白', hex:'#f0e8d8' },
  { id:'c7', name:'灰色', hex:'#9ca3af' }, { id:'c8', name:'深棕', hex:'#7c4a1e' },
  { id:'c9', name:'花色', hex:''        },
];
export const INIT_BRANDS: SimpleItem[] = [
  { id:'b1', name:'Armani' }, { id:'b2', name:'Burberry' }, { id:'b3', name:'Chanel' },
  { id:'b4', name:'Gucci'  }, { id:'b5', name:'Louis Vuitton' }, { id:'b6', name:'Prada' },
  { id:'b7', name:'Versace'}, { id:'b8', name:'Hermès'   },
];
export const INIT_DEFECTS: SimpleItem[] = [
  { id:'d1', name:'领口污渍' }, { id:'d2', name:'袖口磨损' }, { id:'d3', name:'纽扣缺失' },
  { id:'d4', name:'下摆开线' }, { id:'d5', name:'背面掉色' }, { id:'d6', name:'拉链损坏' },
  { id:'d7', name:'起球起毛' }, { id:'d8', name:'油渍污染' },
];
export const INIT_OUTCOMES: SimpleItem[] = [
  { id:'o1', name:'可完全去除' },    { id:'o2', name:'可淡化处理' },
  { id:'o3', name:'不可去除，已告知' }, { id:'o4', name:'待专业评估' },
  { id:'o5', name:'补配处理' },      { id:'o6', name:'缝补修复' },
];
export const INIT_ACCESSORIES: PricedItem[] = [
  { id:'a1', name:'腰带', price:3 }, { id:'a2', name:'帽子', price:5 },
  { id:'a3', name:'胸针', price:2 }, { id:'a4', name:'毛领', price:8 },
  { id:'a5', name:'肩带', price:2 }, { id:'a6', name:'腰绳', price:1 },
];
export const INIT_SERVICES: PricedItem[] = [
  { id:'s1', name:'单独洗涤', price:5  }, { id:'s2', name:'烘干处理', price:8  },
  { id:'s3', name:'手洗',     price:10 }, { id:'s4', name:'去味处理', price:6  },
  { id:'s5', name:'特殊护理', price:15 }, { id:'s6', name:'防缩处理', price:12 },
];
export const INIT_CATEGORIES: Category[] = [
  { id:'A', code:'A', name:'拼单团购', color:'#3b82f6' }, { id:'B', code:'B', name:'上衣外套', color:'#fd780f' },
  { id:'C', code:'C', name:'裤子裙子', color:'#22c55e' }, { id:'D', code:'D', name:'皮衣皮具', color:'#a855f7' },
  { id:'E', code:'E', name:'小件饰品', color:'#ec4899' }, { id:'F', code:'F', name:'家纺家居', color:'#14b8a6' },
  { id:'G', code:'G', name:'鞋类洗护', color:'#6366f1' }, { id:'H', code:'H', name:'单独熨烫', color:'#eab308' },
  { id:'R', code:'R', name:'商品销售', color:'#ef4444' },
];

const CATALOG_RAW: Omit<CatalogItem,'id'|'serviceCycleHours'>[] = [
  { name:'任意3件',    mnemonicCode:'RY3', categoryId:'A', price:68,  status:'active'   },
  { name:'任意5件',    mnemonicCode:'RY5', categoryId:'A', price:99,  status:'active'   },
  { name:'任意10件',   mnemonicCode:'R10', categoryId:'A', price:188, status:'active'   },
  { name:'衬衫',       mnemonicCode:'CS',  categoryId:'B', price:15,  status:'active'   },
  { name:'T恤',        mnemonicCode:'TX',  categoryId:'B', price:10,  status:'active'   },
  { name:'西装上衣',   mnemonicCode:'XZ',  categoryId:'B', price:30,  status:'active'   },
  { name:'风衣',       mnemonicCode:'FY',  categoryId:'B', price:45,  status:'active'   },
  { name:'棉长大衣',   mnemonicCode:'MD',  categoryId:'B', price:55,  status:'active'   },
  { name:'羽绒服长',   mnemonicCode:'YC',  categoryId:'B', price:52,  status:'active'   },
  { name:'羽绒服短',   mnemonicCode:'YD',  categoryId:'B', price:32,  status:'active'   },
  { name:'羊绒大衣',   mnemonicCode:'YR',  categoryId:'B', price:65,  status:'active'   },
  { name:'针织毛衣',   mnemonicCode:'ZM',  categoryId:'B', price:25,  status:'active'   },
  { name:'卫衣',       mnemonicCode:'WY',  categoryId:'B', price:18,  status:'inactive' },
  { name:'西裤',       mnemonicCode:'XK',  categoryId:'C', price:20,  status:'active'   },
  { name:'牛仔裤',     mnemonicCode:'NK',  categoryId:'C', price:18,  status:'active'   },
  { name:'休闲裤',     mnemonicCode:'XP',  categoryId:'C', price:15,  status:'active'   },
  { name:'半身裙',     mnemonicCode:'BQ',  categoryId:'C', price:18,  status:'active'   },
  { name:'连衣裙',     mnemonicCode:'LQ',  categoryId:'C', price:25,  status:'active'   },
  { name:'羽绒裙',     mnemonicCode:'YQ',  categoryId:'C', price:30,  status:'inactive' },
  { name:'皮衣',       mnemonicCode:'PY',  categoryId:'D', price:80,  status:'active'   },
  { name:'皮夹克',     mnemonicCode:'PJ',  categoryId:'D', price:75,  status:'active'   },
  { name:'皮包清洁',   mnemonicCode:'PB',  categoryId:'D', price:45,  status:'active'   },
  { name:'皮带',       mnemonicCode:'PD',  categoryId:'D', price:20,  status:'active'   },
  { name:'皮鞋护理',   mnemonicCode:'PX',  categoryId:'D', price:35,  status:'active'   },
  { name:'领带',       mnemonicCode:'LD',  categoryId:'E', price:15,  status:'active'   },
  { name:'丝巾',       mnemonicCode:'SJ',  categoryId:'E', price:12,  status:'active'   },
  { name:'手套',       mnemonicCode:'ST',  categoryId:'E', price:10,  status:'active'   },
  { name:'帽子',       mnemonicCode:'MZ',  categoryId:'E', price:10,  status:'inactive' },
  { name:'被子(单人)', mnemonicCode:'BD',  categoryId:'F', price:40,  status:'active'   },
  { name:'被子(双人)', mnemonicCode:'BS',  categoryId:'F', price:60,  status:'active'   },
  { name:'窗帘(每㎡)', mnemonicCode:'CL',  categoryId:'F', price:8,   status:'active'   },
  { name:'毛毯',       mnemonicCode:'MT',  categoryId:'F', price:35,  status:'active'   },
  { name:'床单',       mnemonicCode:'CC',  categoryId:'F', price:20,  status:'active'   },
  { name:'枕套',       mnemonicCode:'ZT',  categoryId:'F', price:8,   status:'active'   },
  { name:'运动鞋',     mnemonicCode:'YX',  categoryId:'G', price:25,  status:'active'   },
  { name:'皮鞋抛光',   mnemonicCode:'PG',  categoryId:'G', price:35,  status:'active'   },
  { name:'休闲鞋',     mnemonicCode:'XX',  categoryId:'G', price:20,  status:'active'   },
  { name:'高跟鞋',     mnemonicCode:'GG',  categoryId:'G', price:30,  status:'active'   },
  { name:'靴子',       mnemonicCode:'XZI', categoryId:'G', price:45,  status:'inactive' },
  { name:'衬衫熨烫',   mnemonicCode:'CY',  categoryId:'H', price:10,  status:'active'   },
  { name:'裤子熨烫',   mnemonicCode:'KY',  categoryId:'H', price:10,  status:'active'   },
  { name:'西装熨烫',   mnemonicCode:'XY',  categoryId:'H', price:20,  status:'active'   },
  { name:'大衣熨烫',   mnemonicCode:'DY',  categoryId:'H', price:25,  status:'active'   },
  { name:'衣物防尘袋', mnemonicCode:'FB',  categoryId:'R', price:5,   status:'active'   },
  { name:'去污剂',     mnemonicCode:'QW',  categoryId:'R', price:15,  status:'active'   },
  { name:'护理套餐',   mnemonicCode:'HL',  categoryId:'R', price:28,  status:'active'   },
];

const WASH_CYCLE_HOURS: Record<string, number> = {
  A: 72, B: 96, C: 72, D: 168, E: 48, F: 120, G: 120, H: 24, R: 0,
};

export const INIT_CATALOG: CatalogItem[] = CATALOG_RAW.map((item,i)=>({
  ...item,
  id: `ci${i+1}`,
  serviceCycleHours: WASH_CYCLE_HOURS[item.categoryId] ?? 72,
}));

export const INIT_STORES: Store[] = [
  { id:'st1', name:'工厂店' },
  { id:'st2', name:'天府店' },
  { id:'st3', name:'高新店' },
  { id:'st4', name:'春熙路店' },
];

export const INIT_MEMBER_TIERS: MemberTier[] = [
  { id:'mt1', name:'普通会员', minSpent:0,    discountRate:1.0,  color:'#6b7280', badge:'bg-slate-100 text-slate-600' },
  { id:'mt2', name:'银卡会员', minSpent:500,  discountRate:0.95, color:'#9ca3af', badge:'bg-gray-100 text-gray-500'   },
  { id:'mt3', name:'金卡会员', minSpent:1500, discountRate:0.90, color:'#f59e0b', badge:'bg-amber-50 text-amber-700'  },
  { id:'mt4', name:'黑卡会员', minSpent:5000, discountRate:0.85, color:'#374151', badge:'bg-gray-800 text-gray-100'   },
];

export const INIT_MEMBERS: Member[] = [
  { id:'m1', name:'张伟',  phone:'13812349707', balance:238.5, totalSpent:1580,
    registrationDate:'2025-08-15',
    isImportant:true, importantLevel:3, isFollowWechat:true, storeId:'st1',
    addresses:[
      { id:'ad1', label:'家',   address:'四川省成都市武侯区学前路1号西南大学宿舍5A 205', phone:'13812349707', isDefault:true  },
      { id:'ad2', label:'公司', address:'四川省成都市高新区天府大道688号写字楼B座',      phone:'13812349707', isDefault:false },
    ],
    coupons:[
      { id:'cp1', name:'满100减20',  amount:20, minSpend:100, expiry:'2026-12-31' },
      { id:'cp2', name:'免费熨烫券', amount:10, minSpend:0,   expiry:'2026-06-30' },
    ],
  },
  { id:'m2', name:'刘先生', phone:'18111251244', balance:600, totalSpent:1200,
    registrationDate:'2026-02-25',
    isImportant:true, importantLevel:2, isFollowWechat:true, storeId:'st2',
    addresses:[{ id:'ad3', label:'家', address:'四川省成都市锦江区大业路56号', phone:'18111251244', isDefault:true }],
    coupons:[{ id:'cp3', name:'满200减30', amount:30, minSpend:200, expiry:'2026-09-30' }],
  },
  { id:'m3', name:'孙丹',   phone:'15961291607', balance:188, totalSpent:650,
    registrationDate:'2026-02-27',
    isImportant:false, isFollowWechat:true, storeId:'st1',
    addresses:[], coupons:[] },
  { id:'m4', name:'李梅',   phone:'13512342207', balance:50,  totalSpent:480,
    registrationDate:'2025-11-03',
    isImportant:false, isFollowWechat:false, storeId:'st3',
    addresses:[],
    coupons:[{ id:'cp4', name:'新客立减10', amount:10, minSpend:0, expiry:'2026-07-01' }] },
  { id:'m5', name:'王磊',   phone:'13956783388', balance:0,   totalSpent:120,
    registrationDate:'2026-01-20',
    isImportant:true, importantLevel:1, isFollowWechat:true, storeId:'st2',
    addresses:[{ id:'ad4', label:'家', address:'四川省成都市锦江区红星路88号', phone:'13956783388', isDefault:true }],
    coupons:[] },
  { id:'m6', name:'潘新兴', phone:'13861005537', balance:7,   totalSpent:80,
    registrationDate:'2026-02-27',
    isImportant:false, isFollowWechat:false, storeId:'st4',
    addresses:[], coupons:[] },
  { id:'m7', name:'王艺贤', phone:'13291305085', balance:41,  totalSpent:320,
    registrationDate:'2026-02-27',
    isImportant:false, isFollowWechat:true, storeId:'st3',
    addresses:[], coupons:[] },
  { id:'m8', name:'朱逵',   phone:'13685263613', balance:101, totalSpent:450,
    registrationDate:'2026-02-27',
    isImportant:true, importantLevel:1, isFollowWechat:false, storeId:'st1',
    addresses:[], coupons:[] },
];

const INIT_ORDERS: AppOrder[] = [
  {
    id:'o1', orderNo:'1012569', type:'A', source:'store',
    customerName:'张伟', phone:'138****9707', address:'',
    garments:[
      { id:'g1', label:'S011012569001', type:'运动鞋', service:'标准洗涤', price:25,
        color:'白色', brand:'Nike', defects:['鞋底磨损'], status:'on_shelf',
        warehousingAt:'05-10 09:00', serviceCycleHours:48, bindTag:'A001' },
    ],
    totalAmount:25, receivedAt:'05-10 09:00', expectedAt:'05-12 10:00-12:00', notes:'', isHang:true,
    tracking:[
      { time:'05-10 09:00', action:'客户到店，已收衣', operator:'前台' },
      { time:'05-10 16:00', action:'打包送洗，批次 B20260510-01', operator:'王师傅' },
      { time:'05-11 09:00', action:'工厂已入库', operator:'工厂' },
      { time:'05-12 10:00', action:'洗护完成，已入库待上架', operator:'工厂' },
      { time:'05-12 14:00', action:'已上架，等待客户取件', operator:'前台' },
    ],
  },
  {
    id:'o2', orderNo:'1012568', type:'A', source:'miniapp',
    customerName:'李梅', phone:'135****2207', address:'', bagNo:'SF1234567890',
    garments:[
      { id:'g2', label:'S011012568001', type:'西装上衣', service:'干洗', price:30,
        color:'深灰', brand:'Armani', defects:['领口污渍'], status:'washing',
        batchId:'B20260512-01', warehousingAt:'05-12 10:00', serviceCycleHours:72 },
      { id:'g3', label:'S011012568002', type:'西裤', service:'干洗', price:20,
        color:'深灰', brand:'Armani', defects:[], status:'washing',
        batchId:'B20260512-01', warehousingAt:'05-12 10:00', serviceCycleHours:72 },
    ],
    totalAmount:50, receivedAt:'05-12 10:25', expectedAt:'05-14 10:00-12:00', notes:'客户要求当日完成',
    tracking:[
      { time:'05-12 10:25', action:'客户到店，已收衣', operator:'前台' },
      { time:'05-12 14:00', action:'打包送洗，批次 B20260512-01', operator:'王师傅' },
      { time:'05-12 15:30', action:'工厂已收到批次，开始分拣', operator:'工厂' },
    ],
  },
  {
    id:'o3', orderNo:'1012567', type:'B', source:'meituan',
    customerName:'王磊', phone:'139****5508',
    address:'四川省成都市高新区天府大道666号',
    garments:[
      { id:'g4', label:'S011012567001', type:'羽绒服长', service:'标准洗涤', price:52,
        color:'黑色', brand:'Canada Goose', defects:[], status:'on_shelf',
        batchId:'B20260511-02', warehousingAt:'05-10 09:15', serviceCycleHours:48 },
      { id:'g5', label:'S011012567002', type:'羽绒服短', service:'标准洗涤', price:32,
        color:'深蓝', brand:'', defects:['拉链损坏'], status:'on_shelf',
        batchId:'B20260511-02', warehousingAt:'05-10 09:15', serviceCycleHours:48 },
    ],
    totalAmount:84, receivedAt:'05-10 09:15', expectedAt:'05-13 09:00-11:00', notes:'',
    tracking:[
      { time:'05-10 09:15', action:'客户到店，已收衣', operator:'前台' },
      { time:'05-11 14:30', action:'洗护完成，已入库', operator:'工厂' },
      { time:'05-12 09:00', action:'已上架，等待配送', operator:'前台' },
    ],
  },
  {
    id:'o4', orderNo:'1012566', type:'A', source:'store',
    customerName:'陈秀英', phone:'186****3302', address:'',
    garments:[
      { id:'g6', label:'S011012566001', type:'连衣裙', service:'精洗', price:55,
        color:'白色', brand:'Chanel', defects:[], status:'received',
        warehousingAt:'05-12 14:30', serviceCycleHours:72 },
    ],
    totalAmount:55, receivedAt:'05-12 14:30', expectedAt:'05-14 14:00-16:00', notes:'',
    tracking:[{ time:'05-12 14:30', action:'客户到店，已收衣', operator:'前台' }],
  },
  {
    id:'o5', orderNo:'1012565', type:'C', source:'douyin',
    customerName:'刘洋', phone:'158****6601',
    address:'四川省成都市成华区二环路东五段1号',
    garments:[
      { id:'g7', label:'S011012565001', type:'皮衣', service:'皮革护理', price:128,
        color:'棕色', brand:'Zara', defects:[], status:'store_in',
        batchId:'B20260512-02', warehousingAt:'05-09 16:45', serviceCycleHours:72 },
      { id:'g8', label:'S011012565002', type:'皮裤', service:'皮革护理', price:89,
        color:'黑色', brand:'', defects:[], status:'store_in',
        batchId:'B20260512-02', warehousingAt:'05-09 16:45', serviceCycleHours:72 },
    ],
    totalAmount:217, receivedAt:'05-09 08:00', expectedAt:'05-12 14:00-16:00', notes:'',
    tracking:[
      { time:'05-09 08:00', action:'下单，分配骑手上门取件', operator:'系统' },
      { time:'05-09 16:45', action:'上门取件完成，已收衣', operator:'张骑手' },
      { time:'05-10 09:00', action:'送至工厂，批次 B20260512-02', operator:'李师傅' },
      { time:'05-12 10:00', action:'洗护完成，已出厂', operator:'工厂' },
      { time:'05-12 13:00', action:'批次到店，已入库待上架', operator:'前台' },
    ],
  },
];

export const INIT_HOOK_ZONES: HookZone[] = [
  { id: 'z1', name: '第1层', capacity: 20, categoryIds: [] },
  { id: 'z2', name: '第2层', capacity: 20, categoryIds: [] },
  { id: 'z3', name: 'VIP专区', capacity: 10, categoryIds: [] },
];
export const INIT_HOOK_SLOTS: HookSlot[] = buildHookSlots(INIT_HOOK_ZONES);

export function getMemberTier(totalSpent: number, tiers: MemberTier[]): MemberTier {
  const sorted = [...tiers].sort((a,b)=>b.minSpent-a.minSpent);
  return sorted.find(t=>totalSpent>=t.minSpent) ?? tiers[0];
}

interface AppContextType {
  colors:ColorItem[];      setColors:(v:ColorItem[])=>void;
  brands:SimpleItem[];     setBrands:(v:SimpleItem[])=>void;
  defects:SimpleItem[];    setDefects:(v:SimpleItem[])=>void;
  outcomes:SimpleItem[];   setOutcomes:(v:SimpleItem[])=>void;
  accessories:PricedItem[];setAccessories:(v:PricedItem[])=>void;
  services:PricedItem[];   setServices:(v:PricedItem[])=>void;
  categories:Category[];   setCategories:(v:Category[])=>void;
  catalog:CatalogItem[];   setCatalog:(v:CatalogItem[])=>void;
  members:Member[];        setMembers:(v:Member[])=>void;
  memberTiers:MemberTier[];setMemberTiers:(v:MemberTier[])=>void;
  stores:Store[];          setStores:(v:Store[])=>void;
  orders:AppOrder[];       addOrder:(o:AppOrder)=>void; setOrders:(v:AppOrder[])=>void;
  hookZones:HookZone[];    setHookZones:(v:HookZone[])=>void;
  hookSlots:HookSlot[];    setHookSlots:(v:HookSlot[])=>void;
}

const Ctx = createContext<AppContextType|null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [colors,      setColors]      = useState(INIT_COLORS);
  const [brands,      setBrands]      = useState(INIT_BRANDS);
  const [defects,     setDefects]     = useState(INIT_DEFECTS);
  const [outcomes,    setOutcomes]    = useState(INIT_OUTCOMES);
  const [accessories, setAccessories] = useState(INIT_ACCESSORIES);
  const [services,    setServices]    = useState(INIT_SERVICES);
  const [categories,  setCategories]  = useState(INIT_CATEGORIES);
  const [catalog,     setCatalog]     = useState(INIT_CATALOG);
  const [members,     setMembers]     = useState(INIT_MEMBERS);
  const [memberTiers, setMemberTiers] = useState(INIT_MEMBER_TIERS);
  const [stores,      setStores]      = useState(INIT_STORES);
  const [orders,      setOrders]      = useState(INIT_ORDERS);
  const [hookZones,   setHookZones]   = useState(INIT_HOOK_ZONES);
  const [hookSlots,   setHookSlots]   = useState(INIT_HOOK_SLOTS);

  return (
    <Ctx.Provider value={{
      colors,setColors, brands,setBrands, defects,setDefects,
      outcomes,setOutcomes, accessories,setAccessories, services,setServices,
      categories,setCategories, catalog,setCatalog,
      members,setMembers, memberTiers,setMemberTiers,
      stores,setStores,
      orders, addOrder:(o)=>setOrders(p=>[o,...p]), setOrders,
      hookZones,setHookZones, hookSlots,setHookSlots,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAppStore(): AppContextType {
  const ctx = useContext(Ctx);
  if(!ctx) throw new Error('useAppStore must be used within AppProvider');
  return ctx;
}
