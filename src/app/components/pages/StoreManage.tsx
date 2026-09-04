import { useState, useMemo } from 'react';
import {
  Building2, MapPin, Phone, Clock, Users, Plus, Pencil, Trash2,
  ToggleLeft, ToggleRight, X, Check, AlertTriangle, Store,
} from 'lucide-react';
import { useAppStore, type Store as StoreType } from '../data/AppContext';

/* ── 门店扩展信息（本地管理，含名称外的字段） ── */
interface StoreDetail {
  id: string;
  address: string;
  phone: string;
  businessHours: string;
  manager: string;
  status: 'active' | 'inactive';
}

const INIT_DETAIL: Record<string, Omit<StoreDetail, 'id'>> = {
  st1: { address: '四川省成都市武侯区科华北路103号', phone: '028-8512-3456', businessHours: '09:00 – 21:00', manager: '王经理', status: 'active' },
  st2: { address: '四川省成都市锦江区天府大道北段688号', phone: '028-8523-7890', businessHours: '09:00 – 21:00', manager: '刘经理', status: 'active' },
  st3: { address: '四川省成都市高新区天府五街100号', phone: '028-8534-2345', businessHours: '09:30 – 21:30', manager: '孙经理', status: 'active' },
  st4: { address: '四川省成都市锦江区春熙路步行街59号', phone: '028-8545-6789', businessHours: '10:00 – 22:00', manager: '李经理', status: 'active' },
};

function genId() {
  return 'st' + Date.now().toString(36);
}

interface ModalProps {
  initial?: { name: string } & Omit<StoreDetail, 'id'>;
  onSave: (name: string, detail: Omit<StoreDetail, 'id'>) => void;
  onClose: () => void;
  title: string;
}

function StoreModal({ initial, onSave, onClose, title }: ModalProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [hours, setHours] = useState(initial?.businessHours ?? '09:00 – 21:00');
  const [manager, setManager] = useState(initial?.manager ?? '');

  const valid = name.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="size-4" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <Field label="门店名称 *">
            <input
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400 transition-colors"
              value={name} onChange={e => setName(e.target.value)}
              placeholder="如：春熙路店"
            />
          </Field>
          <Field label="详细地址">
            <input
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400 transition-colors"
              value={address} onChange={e => setAddress(e.target.value)}
              placeholder="如：成都市锦江区春熙路…"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="联系电话">
              <input
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400 transition-colors"
                value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="028-xxxx-xxxx"
              />
            </Field>
            <Field label="负责人">
              <input
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400 transition-colors"
                value={manager} onChange={e => setManager(e.target.value)}
                placeholder="如：王经理"
              />
            </Field>
          </div>
          <Field label="营业时间">
            <input
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400 transition-colors"
              value={hours} onChange={e => setHours(e.target.value)}
              placeholder="09:00 – 21:00"
            />
          </Field>
        </div>
        <div className="px-6 pb-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            取消
          </button>
          <button
            disabled={!valid}
            onClick={() => onSave(name.trim(), { address, phone, businessHours: hours, manager, status: initial?.status ?? 'active' })}
            className="px-5 py-2 rounded-lg text-sm text-white transition-colors disabled:opacity-40"
            style={{ backgroundColor: '#fd780f' }}
          >
            <span className="flex items-center gap-1.5"><Check className="size-3.5" />保存</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function DeleteConfirm({ storeName, memberCount, onConfirm, onClose }: {
  storeName: string; memberCount: number;
  onConfirm: () => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="size-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1">确认删除门店？</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              将删除「{storeName}」。
              {memberCount > 0 && <span className="text-orange-600"> 该门店有 {memberCount} 位关联会员，删除后其门店归属将被清空。</span>}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">取消</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">确认删除</button>
        </div>
      </div>
    </div>
  );
}

export default function StoreManage() {
  const { stores, setStores, members, setMembers } = useAppStore();

  /* 扩展信息本地管理 */
  const [details, setDetails] = useState<Record<string, Omit<StoreDetail, 'id'>>>(INIT_DETAIL);

  const [modal, setModal] = useState<'add' | { store: StoreType } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StoreType | null>(null);

  /* 每家门店会员数 */
  const memberCountMap = useMemo(() => {
    const m: Record<string, number> = {};
    stores.forEach(s => { m[s.id] = 0; });
    members.forEach(mb => { if (mb.storeId) m[mb.storeId] = (m[mb.storeId] ?? 0) + 1; });
    return m;
  }, [stores, members]);

  function handleAdd(name: string, detail: Omit<StoreDetail, 'id'>) {
    const id = genId();
    setStores([...stores, { id, name }]);
    setDetails(prev => ({ ...prev, [id]: detail }));
    setModal(null);
  }

  function handleEdit(store: StoreType, name: string, detail: Omit<StoreDetail, 'id'>) {
    setStores(stores.map(s => s.id === store.id ? { ...s, name } : s));
    setDetails(prev => ({ ...prev, [store.id]: detail }));
    setModal(null);
  }

  function handleDelete(store: StoreType) {
    setStores(stores.filter(s => s.id !== store.id));
    setMembers(members.map(m => m.storeId === store.id ? { ...m, storeId: undefined } : m));
    setDeleteTarget(null);
  }

  function toggleStatus(id: string) {
    setDetails(prev => ({
      ...prev,
      [id]: { ...prev[id], status: prev[id]?.status === 'active' ? 'inactive' : 'active' },
    }));
  }

  const activeCount = stores.filter(s => (details[s.id]?.status ?? 'active') === 'active').length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 顶部统计 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fff3e8' }}>
            <Building2 className="size-5" style={{ color: '#fd780f' }} />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-800">门店管理</h1>
            <p className="text-xs text-slate-400">共 {stores.length} 家门店 · {activeCount} 家营业中</p>
          </div>
        </div>
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white transition-colors active:scale-95"
          style={{ backgroundColor: '#fd780f' }}
        >
          <Plus className="size-4" />新增门店
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '门店总数',   value: stores.length,                        unit: '家' },
          { label: '营业中',     value: activeCount,                           unit: '家' },
          { label: '关联会员数', value: members.filter(m => m.storeId).length, unit: '人' },
        ].map(item => (
          <div key={item.label} className="bg-white rounded-xl border border-slate-200 px-5 py-4">
            <p className="text-xs text-slate-400 mb-1">{item.label}</p>
            <p className="text-2xl font-semibold text-slate-800">
              {item.value}<span className="text-sm font-normal text-slate-400 ml-1">{item.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* 门店列表 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stores.map(store => {
          const d = details[store.id] ?? { address: '', phone: '', businessHours: '', manager: '', status: 'active' };
          const isActive = d.status === 'active';
          const memCount = memberCountMap[store.id] ?? 0;

          return (
            <div key={store.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* 卡片头部 */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: isActive ? '#fff3e8' : '#f8f8f8' }}
                  >
                    <Store className="size-5" style={{ color: isActive ? '#fd780f' : '#9ca3af' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{store.name}</p>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-0.5 ${
                      isActive ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-slate-300'}`} />
                      {isActive ? '营业中' : '已停业'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setModal({ store })}
                    className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                    title="编辑"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(store)}
                    className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="删除"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              {/* 门店信息 */}
              <div className="px-5 pb-4 space-y-2">
                {d.address && <InfoRow icon={MapPin} text={d.address} />}
                {d.phone && <InfoRow icon={Phone} text={d.phone} />}
                {d.businessHours && <InfoRow icon={Clock} text={d.businessHours} />}
                {d.manager && <InfoRow icon={Users} text={`负责人：${d.manager}`} />}
              </div>

              {/* 卡片底部 */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/60">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Users className="size-3" />关联会员 <strong className="text-slate-700">{memCount}</strong> 人
                </span>
                <button
                  onClick={() => toggleStatus(store.id)}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {isActive
                    ? <ToggleRight className="size-5 text-green-500" />
                    : <ToggleLeft className="size-5 text-slate-300" />}
                  {isActive ? '点击停业' : '点击开启'}
                </button>
              </div>
            </div>
          );
        })}

        {/* 新增门店占位卡 */}
        <button
          onClick={() => setModal('add')}
          className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 py-10 text-slate-400 hover:border-orange-300 hover:text-orange-400 hover:bg-orange-50/30 transition-colors"
        >
          <Plus className="size-6" />
          <span className="text-sm">新增门店</span>
        </button>
      </div>

      {/* 新增弹窗 */}
      {modal === 'add' && (
        <StoreModal
          title="新增门店"
          onSave={handleAdd}
          onClose={() => setModal(null)}
        />
      )}

      {/* 编辑弹窗 */}
      {modal !== null && modal !== 'add' && (
        <StoreModal
          title="编辑门店"
          initial={{
            name: modal.store.name,
            ...(details[modal.store.id] ?? { address: '', phone: '', businessHours: '', manager: '', status: 'active' }),
          }}
          onSave={(name, detail) => handleEdit(modal.store, name, detail)}
          onClose={() => setModal(null)}
        />
      )}

      {/* 删除确认 */}
      {deleteTarget && (
        <DeleteConfirm
          storeName={deleteTarget.name}
          memberCount={memberCountMap[deleteTarget.id] ?? 0}
          onConfirm={() => handleDelete(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-start gap-2 text-xs text-slate-500">
      <Icon className="size-3.5 mt-0.5 flex-shrink-0 text-slate-300" />
      <span className="leading-relaxed">{text}</span>
    </div>
  );
}
