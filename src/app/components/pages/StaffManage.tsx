import { useState, useMemo } from 'react';
import {
  UserCog, Plus, Pencil, Trash2, Shield, X, Check,
  ShoppingCart, Shirt, Tag, Users, BarChart2, Truck,
  Store, Building2, Tags, SlidersHorizontal, Printer,
  Megaphone, Network, Smartphone, MapPin,
} from 'lucide-react';
import { useAppStore } from '../../data/AppContext';

type Role = 'super_admin' | 'store_manager' | 'cashier' | 'operator' | 'finance';

interface RoleDef {
  id: Role;
  name: string;
  color: string;
  bg: string;
  desc: string;
  permissions: string[];
  allStores: boolean;
}

const ROLES: RoleDef[] = [
  {
    id: 'super_admin', name: '超级管理员', color: '#ef4444', bg: '#fef2f2', allStores: true,
    desc: '拥有系统全部权限，可管理所有门店和员工',
    permissions: ['下单', '订单管理', '上挂管理', '客户管理', '数据报表', '送洗管理', '到店管理',
      '门店管理', '员工管理', '价格管理', '参数设置', '打印机管理', '营销管理', '挂点管理', '小程序管理'],
  },
  {
    id: 'store_manager', name: '门店店长', color: '#fd780f', bg: '#fff7ed', allStores: false,
    desc: '管理指定门店日常运营，可查看数据报表和员工信息',
    permissions: ['下单', '订单管理', '上挂管理', '客户管理', '数据报表', '送洗管理', '到店管理',
      '员工管理', '价格管理', '营销管理'],
  },
  {
    id: 'cashier', name: '收银员', color: '#6366f1', bg: '#eef2ff', allStores: false,
    desc: '负责前台收银和下单，可查看订单状态',
    permissions: ['下单', '订单管理', '客户管理'],
  },
  {
    id: 'operator', name: '操作员', color: '#10b981', bg: '#ecfdf5', allStores: false,
    desc: '负责后场操作，包括收衣、上挂、送洗流程',
    permissions: ['订单管理', '上挂管理', '送洗管理', '到店管理'],
  },
  {
    id: 'finance', name: '财务', color: '#8b5cf6', bg: '#f5f3ff', allStores: true,
    desc: '查看所有门店营收数据和财务报表',
    permissions: ['数据报表'],
  },
];

const PERMISSION_ICONS: Record<string, React.ElementType> = {
  '下单': ShoppingCart, '订单管理': Shirt, '上挂管理': Tag,
  '客户管理': Users, '数据报表': BarChart2, '送洗管理': Truck,
  '到店管理': Store, '门店管理': Building2, '员工管理': UserCog,
  '价格管理': Tags, '参数设置': SlidersHorizontal, '打印机管理': Printer,
  '营销管理': Megaphone, '挂点管理': Network, '小程序管理': Smartphone,
};

interface Staff {
  id: string;
  name: string;
  phone: string;
  role: Role;
  joinDate: string;
  status: 'active' | 'inactive';
  storeIds: string[];
}

const INIT_STAFF: Staff[] = [
  { id: 's1', name: '张明', phone: '13800138001', role: 'store_manager', joinDate: '2024-01-15', status: 'active', storeIds: ['st2'] },
  { id: 's2', name: '李欢', phone: '13900139002', role: 'cashier',       joinDate: '2024-03-20', status: 'active', storeIds: ['st2'] },
  { id: 's3', name: '王磊', phone: '13700137003', role: 'operator',      joinDate: '2024-06-01', status: 'active', storeIds: ['st1', 'st2'] },
  { id: 's4', name: '赵芳', phone: '13600136004', role: 'finance',       joinDate: '2025-01-10', status: 'active', storeIds: ['st1', 'st2', 'st3', 'st4'] },
];

function RoleBadge({ role }: { role: Role }) {
  const def = ROLES.find(r => r.id === role)!;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]"
      style={{ backgroundColor: def.bg, color: def.color }}>
      <Shield className="size-2.5" />
      {def.name}
    </span>
  );
}

interface StaffFormProps {
  initial?: Partial<Staff>;
  onSave: (s: Omit<Staff, 'id'>) => void;
  onCancel: () => void;
}

function StaffForm({ initial, onSave, onCancel }: StaffFormProps) {
  const { stores } = useAppStore();
  const [name, setName] = useState(initial?.name ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [role, setRole] = useState<Role>(initial?.role ?? 'cashier');
  const [joinDate, setJoinDate] = useState(initial?.joinDate ?? new Date().toISOString().slice(0, 10));
  const [storeIds, setStoreIds] = useState<string[]>(initial?.storeIds ?? []);

  const roleDef = ROLES.find(r => r.id === role)!;
  const isAllStores = roleDef.allStores;

  const toggleStore = (id: string) => {
    setStoreIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const submit = () => {
    if (!name.trim() || !phone.trim()) return;
    const finalStoreIds = isAllStores ? stores.map(s => s.id) : storeIds;
    onSave({ name: name.trim(), phone: phone.trim(), role, joinDate, status: 'active', storeIds: finalStoreIds });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
          <h3 className="text-base text-slate-800">{initial?.name ? '编辑员工' : '新增员工'}</h3>
          <button onClick={onCancel} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="size-4" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">姓名 *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="员工姓名"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">手机号 *</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="11位手机号"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">角色</label>
            <select value={role} onChange={e => setRole(e.target.value as Role)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-orange-400 bg-white">
              {ROLES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <p className="text-xs text-slate-400 mt-1">{roleDef.desc}</p>
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-2 block">
              门店权限范围
              {isAllStores && (
                <span className="ml-2 text-orange-500 font-medium">（该角色自动覆盖所有门店）</span>
              )}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {stores.map(store => {
                const checked = isAllStores || storeIds.includes(store.id);
                return (
                  <label key={store.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                      checked ? 'border-orange-300 bg-orange-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                    } ${isAllStores ? 'opacity-60 cursor-not-allowed' : ''}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={isAllStores}
                      onChange={() => !isAllStores && toggleStore(store.id)}
                      className="accent-orange-500"
                    />
                    <MapPin className="size-3 text-slate-400 flex-shrink-0" />
                    <span className="text-xs text-slate-700">{store.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">入职日期</label>
            <input type="date" value={joinDate} onChange={e => setJoinDate(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onCancel}
            className="flex-1 h-10 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-50">取消</button>
          <button onClick={submit} disabled={!name.trim() || !phone.trim() || (!isAllStores && storeIds.length === 0)}
            className="flex-1 h-10 rounded-xl text-white text-sm flex items-center justify-center gap-1.5 disabled:opacity-40 active:scale-95"
            style={{ backgroundColor: '#fd780f' }}>
            <Check className="size-4" />保存
          </button>
        </div>
      </div>
    </div>
  );
}

type Tab = 'staff' | 'roles';

export default function StaffManage({ searchQuery = '' }: { searchQuery?: string }) {
  const { stores } = useAppStore();
  const [tab, setTab] = useState<Tab>('staff');
  const [staffList, setStaffList] = useState<Staff[]>(INIT_STAFF);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>('super_admin');
  const [filterStoreId, setFilterStoreId] = useState<string>('all');

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (s: Staff) => { setEditing(s); setFormOpen(true); };

  const handleSave = (data: Omit<Staff, 'id'>) => {
    if (editing) {
      setStaffList(list => list.map(s => s.id === editing.id ? { ...s, ...data } : s));
    } else {
      setStaffList(list => [...list, { ...data, id: `s${Date.now()}` }]);
    }
    setFormOpen(false);
  };

  const handleDelete = (id: string) => setStaffList(list => list.filter(s => s.id !== id));

  const filteredStaff = useMemo(() => {
    let list = staffList;
    if (searchQuery.trim()) {
      list = list.filter(s => s.name.includes(searchQuery.trim()) || s.phone.includes(searchQuery.trim()));
    }
    if (filterStoreId !== 'all') {
      list = list.filter(s => s.storeIds.includes(filterStoreId));
    }
    return list;
  }, [staffList, searchQuery, filterStoreId]);

  const selectedRoleDef = ROLES.find(r => r.id === selectedRole)!;

  const storeStaffCount = useMemo(() => {
    const m: Record<string, number> = {};
    stores.forEach(s => { m[s.id] = 0; });
    staffList.forEach(st => st.storeIds.forEach(sid => { m[sid] = (m[sid] ?? 0) + 1; }));
    return m;
  }, [stores, staffList]);

  return (
    <div className="-m-4 sm:-m-5 lg:-m-6 flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fff3e8' }}>
            <UserCog className="size-5" style={{ color: '#fd780f' }} />
          </div>
          <div>
            <h2 className="text-base text-slate-800">员工管理</h2>
            <p className="text-xs text-slate-400">{staffList.length} 名员工 · {stores.length} 家门店</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-slate-200 overflow-hidden text-xs">
            <button onClick={() => setTab('staff')} className="px-3 py-1.5 transition-colors"
              style={tab === 'staff' ? { backgroundColor: '#fd780f', color: '#fff' } : { color: '#64748b' }}>
              员工列表
            </button>
            <button onClick={() => setTab('roles')} className="px-3 py-1.5 transition-colors"
              style={tab === 'roles' ? { backgroundColor: '#fd780f', color: '#fff' } : { color: '#64748b' }}>
              角色权限
            </button>
          </div>
          {tab === 'staff' && (
            <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-white active:scale-95"
              style={{ backgroundColor: '#fd780f' }}>
              <Plus className="size-4" />新增
            </button>
          )}
        </div>
      </div>

      {/* 门店筛选 */}
      {tab === 'staff' && (
        <div className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-white border-b border-slate-100 overflow-x-auto flex-shrink-0">
          <button
            onClick={() => setFilterStoreId('all')}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
              filterStoreId === 'all' ? 'text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
            style={filterStoreId === 'all' ? { backgroundColor: '#fd780f' } : undefined}
          >
            全部门店
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              filterStoreId === 'all' ? 'bg-white/30 text-white' : 'bg-white text-slate-500'
            }`}>{staffList.length}</span>
          </button>
          {stores.map(store => (
            <button
              key={store.id}
              onClick={() => setFilterStoreId(store.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                filterStoreId === store.id ? 'text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
              style={filterStoreId === store.id ? { backgroundColor: '#fd780f' } : undefined}
            >
              {store.name}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                filterStoreId === store.id ? 'bg-white/30 text-white' : 'bg-white text-slate-500'
              }`}>{storeStaffCount[store.id] ?? 0}</span>
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-slate-50">

        {tab === 'staff' && (
          <div className="px-4 sm:px-6 py-4 space-y-2">
            {filteredStaff.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                <UserCog className="size-12 mb-3" />
                <p className="text-sm">
                  {searchQuery.trim() ? '未找到匹配员工' : filterStoreId !== 'all' ? '该门店暂无员工' : '暂无员工，点击新增添加'}
                </p>
              </div>
            )}
            {filteredStaff.map(staff => {
              const roleDef = ROLES.find(r => r.id === staff.role)!;
              const staffStores = stores.filter(s => staff.storeIds.includes(s.id));
              return (
                <div key={staff.id} className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: roleDef.color }}>
                    {staff.name.slice(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-slate-800">{staff.name}</span>
                      <RoleBadge role={staff.role} />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{staff.phone} · 入职 {staff.joinDate}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {roleDef.allStores ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-orange-50 text-orange-500">
                          <MapPin className="size-2.5" />全部门店
                        </span>
                      ) : staffStores.map(s => (
                        <span key={s.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-500">
                          <MapPin className="size-2.5" />{s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => openEdit(staff)}
                      className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                      <Pencil className="size-4" />
                    </button>
                    <button onClick={() => handleDelete(staff.id)}
                      className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'roles' && (
          <div className="px-4 sm:px-6 py-4 flex flex-col lg:flex-row gap-4">
            <div className="lg:w-56 flex-shrink-0 space-y-2">
              {ROLES.map(role => (
                <button key={role.id} onClick={() => setSelectedRole(role.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                    selectedRole === role.id ? 'border-orange-200 shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                  style={selectedRole === role.id ? { backgroundColor: role.bg, borderColor: role.color + '66' } : undefined}>
                  <div className="flex items-center gap-2">
                    <Shield className="size-4 flex-shrink-0" style={{ color: role.color }} />
                    <span className="text-sm" style={{ color: selectedRole === role.id ? role.color : '#334155' }}>{role.name}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">{role.desc}</p>
                </button>
              ))}
            </div>

            <div className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100"
                style={{ backgroundColor: selectedRoleDef.bg }}>
                <Shield className="size-5" style={{ color: selectedRoleDef.color }} />
                <div>
                  <h3 className="text-sm" style={{ color: selectedRoleDef.color }}>{selectedRoleDef.name}</h3>
                  <p className="text-xs text-slate-500">{selectedRoleDef.desc}</p>
                </div>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: selectedRoleDef.color + '22', color: selectedRoleDef.color }}>
                  {selectedRoleDef.permissions.length} 项权限
                </span>
              </div>
              <div className="p-5 space-y-5">
                <div>
                  <p className="text-xs text-slate-400 mb-3">可访问功能模块</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedRoleDef.permissions.map(perm => {
                      const Icon = PERMISSION_ICONS[perm] ?? Shield;
                      return (
                        <div key={perm} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-100 bg-slate-50">
                          <Icon className="size-3.5 flex-shrink-0" style={{ color: selectedRoleDef.color }} />
                          <span className="text-xs text-slate-600">{perm}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-3">门店权限范围</p>
                  {selectedRoleDef.allStores ? (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-orange-200 bg-orange-50 text-xs text-orange-600 w-fit">
                      <MapPin className="size-3.5" />
                      覆盖所有门店（{stores.length} 家）
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {stores.map(store => {
                        const count = staffList.filter(s => s.role === selectedRole && s.storeIds.includes(store.id)).length;
                        return (
                          <div key={store.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs ${
                            count > 0 ? 'border-slate-300 bg-slate-50 text-slate-700' : 'border-dashed border-slate-200 text-slate-300'
                          }`}>
                            <MapPin className="size-3" />
                            {store.name}
                            {count > 0 && <span className="ml-1 text-[10px] text-slate-400">{count}人</span>}
                          </div>
                        );
                      })}
                      <p className="w-full text-[11px] text-slate-400 mt-1">虚线边框表示该门店暂无此角色员工</p>
                    </div>
                  )}
                </div>

                {staffList.filter(s => s.role === selectedRole).length > 0 && (
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-400 mb-3">该角色在职员工</p>
                    <div className="flex flex-wrap gap-2">
                      {staffList.filter(s => s.role === selectedRole).map(s => (
                        <div key={s.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs text-slate-600">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] flex-shrink-0"
                            style={{ backgroundColor: selectedRoleDef.color }}>
                            {s.name.slice(0, 1)}
                          </div>
                          {s.name}
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-400 text-[11px]">
                            {selectedRoleDef.allStores
                              ? '全部门店'
                              : stores.filter(st => s.storeIds.includes(st.id)).map(st => st.name).join('、')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {formOpen && (
        <StaffForm initial={editing ?? undefined} onSave={handleSave} onCancel={() => setFormOpen(false)} />
      )}
    </div>
  );
}
