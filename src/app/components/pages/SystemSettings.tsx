import { useState, useRef, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Plus, Pencil, Trash2, X, Check, GripVertical } from 'lucide-react';
import { useAppStore } from '../../data/AppContext';

type TabId      = 'color' | 'brand' | 'defect' | 'accessory' | 'service';
type EditTarget = 'color' | 'brand' | 'defectItem' | 'outcome' | 'accessory' | 'service';

interface ColorItem  { id: string; name: string; hex: string; }
interface SimpleItem { id: string; name: string; }
interface PricedItem { id: string; name: string; price: number; }

const DNDt = {
  COLOR:     'SS_COLOR',
  BRAND:     'SS_BRAND',
  DEFECT:    'SS_DEFECT',
  OUTCOME:   'SS_OUTCOME',
  ACCESSORY: 'SS_ACCESSORY',
  SERVICE:   'SS_SERVICE',
} as const;

const TABS: { id: TabId; label: string }[] = [
  { id: 'color',     label: '颜色' },
  { id: 'brand',     label: '品牌' },
  { id: 'defect',    label: '瑕疵及预计效果' },
  { id: 'accessory', label: '附件' },
  { id: 'service',   label: '服务' },
];

const TARGET_LABEL: Record<EditTarget, string> = {
  color:      '颜色',
  brand:      '品牌',
  defectItem: '瑕疵',
  outcome:    '预计效果',
  accessory:  '附件',
  service:    '服务',
};

const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

function SortableRow({ id, index, dndType, onMove, children }: {
  id: string;
  index: number;
  dndType: string;
  onMove: (from: number, to: number) => void;
  children: (dragRef: React.Ref<HTMLDivElement>, isDragging: boolean) => React.ReactNode;
}) {
  const rowRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: dndType,
    item: () => ({ id, index }),
    collect: m => ({ isDragging: m.isDragging() }),
  }), [dndType, id, index]);

  const [, drop] = useDrop<{ id: string; index: number }>(() => ({
    accept: dndType,
    hover(dragItem) {
      if (dragItem.index !== index) {
        onMove(dragItem.index, index);
        dragItem.index = index;
      }
    },
  }), [dndType, index, onMove]);

  drop(rowRef);

  return (
    <div ref={rowRef} style={{ opacity: isDragging ? 0.3 : 1 }} className="transition-opacity">
      {children(drag as React.Ref<HTMLDivElement>, isDragging)}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-slate-300">
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
        <Plus className="size-5" />
      </div>
      <p className="text-sm">暂无数据，点击右上角新增</p>
    </div>
  );
}

export default function SystemSettings() {
  return (
    <DndProvider backend={HTML5Backend}>
      <SystemSettingsContent />
    </DndProvider>
  );
}

function SystemSettingsContent() {
  const {
    colors, setColors, brands, setBrands,
    defects, setDefects, outcomes, setOutcomes,
    accessories, setAccessories, services, setServices,
  } = useAppStore();

  const [activeTab,     setActiveTab]     = useState<TabId>('color');
  const [defectSubTab,  setDefectSubTab]  = useState<'defect' | 'outcome'>('defect');

  const [modal, setModal] = useState<{
    open: boolean; mode: 'add' | 'edit'; target: EditTarget; editId?: string;
  }>({ open: false, mode: 'add', target: 'color' });

  const [fName,  setFName]  = useState('');
  const [fHex,   setFHex]   = useState('#fd780f');
  const [fPrice, setFPrice] = useState('');

  const [delConfirm, setDelConfirm] = useState<{ target: EditTarget; id: string; label: string } | null>(null);

  const colorInputRef = useRef<HTMLInputElement>(null);

  const moveColor     = useCallback((f: number, t: number) => setColors(p     => reorder(p, f, t)), []);
  const moveBrand     = useCallback((f: number, t: number) => setBrands(p     => reorder(p, f, t)), []);
  const moveDefect    = useCallback((f: number, t: number) => setDefects(p    => reorder(p, f, t)), []);
  const moveOutcome   = useCallback((f: number, t: number) => setOutcomes(p   => reorder(p, f, t)), []);
  const moveAccessory = useCallback((f: number, t: number) => setAccessories(p => reorder(p, f, t)), []);
  const moveService   = useCallback((f: number, t: number) => setServices(p   => reorder(p, f, t)), []);

  const currentTarget = (): EditTarget => {
    if (activeTab === 'defect') return defectSubTab === 'defect' ? 'defectItem' : 'outcome';
    return activeTab as EditTarget;
  };

  const openAdd = () => {
    setFName(''); setFHex('#fd780f'); setFPrice('');
    setModal({ open: true, mode: 'add', target: currentTarget() });
  };

  const openEdit = (target: EditTarget, item: ColorItem | SimpleItem | PricedItem) => {
    if (target === 'color') {
      const c = item as ColorItem;
      setFName(c.name); setFHex(c.hex);
    } else if (target === 'accessory' || target === 'service') {
      const p = item as PricedItem;
      setFName(p.name); setFPrice(String(p.price));
    } else {
      setFName((item as SimpleItem).name);
    }
    setModal({ open: true, mode: 'edit', target, editId: item.id });
  };

  const handleSave = () => {
    const { mode, target, editId } = modal;
    const isAdd = mode === 'add';
    const newId = isAdd ? genId() : editId!;

    switch (target) {
      case 'color': {
        const item: ColorItem = { id: newId, name: fName.trim(), hex: fHex };
        setColors(p => isAdd ? [...p, item] : p.map(c => c.id === editId ? item : c));
        break;
      }
      case 'brand': {
        const item: SimpleItem = { id: newId, name: fName.trim() };
        setBrands(p => isAdd ? [...p, item] : p.map(b => b.id === editId ? item : b));
        break;
      }
      case 'defectItem': {
        const item: SimpleItem = { id: newId, name: fName.trim() };
        setDefects(p => isAdd ? [...p, item] : p.map(d => d.id === editId ? item : d));
        break;
      }
      case 'outcome': {
        const item: SimpleItem = { id: newId, name: fName.trim() };
        setOutcomes(p => isAdd ? [...p, item] : p.map(o => o.id === editId ? item : o));
        break;
      }
      case 'accessory': {
        const item: PricedItem = { id: newId, name: fName.trim(), price: parseFloat(fPrice) };
        setAccessories(p => isAdd ? [...p, item] : p.map(a => a.id === editId ? item : a));
        break;
      }
      case 'service': {
        const item: PricedItem = { id: newId, name: fName.trim(), price: parseFloat(fPrice) };
        setServices(p => isAdd ? [...p, item] : p.map(s => s.id === editId ? item : s));
        break;
      }
    }
    setModal(m => ({ ...m, open: false }));
  };

  const handleDelete = () => {
    if (!delConfirm) return;
    const { target, id } = delConfirm;
    if (target === 'color')      setColors(p      => p.filter(i => i.id !== id));
    if (target === 'brand')      setBrands(p      => p.filter(i => i.id !== id));
    if (target === 'defectItem') setDefects(p     => p.filter(i => i.id !== id));
    if (target === 'outcome')    setOutcomes(p    => p.filter(i => i.id !== id));
    if (target === 'accessory')  setAccessories(p => p.filter(i => i.id !== id));
    if (target === 'service')    setServices(p    => p.filter(i => i.id !== id));
    setDelConfirm(null);
  };

  const formValid = (): boolean => {
    const { target } = modal;
    if (target === 'accessory' || target === 'service') {
      const p = parseFloat(fPrice);
      return fName.trim() !== '' && fPrice !== '' && !isNaN(p) && p >= 0;
    }
    return fName.trim() !== '';
  };

  const getTabCount = (tab: TabId) => {
    if (tab === 'color')     return colors.length;
    if (tab === 'brand')     return brands.length;
    if (tab === 'defect')    return defects.length + outcomes.length;
    if (tab === 'accessory') return accessories.length;
    return services.length;
  };

  const currentCount = () => {
    if (activeTab === 'defect')
      return defectSubTab === 'defect' ? defects.length : outcomes.length;
    return getTabCount(activeTab);
  };

  const addLabel = () => `新增${TARGET_LABEL[currentTarget()]}`;

  const renderColorList = () => (
    <div>
      <div className="hidden sm:grid grid-cols-[1.5rem_2rem_1fr_8rem_4.5rem] gap-x-4 px-4 py-2 text-xs text-slate-400 border-b border-slate-100">
        <span /><span>色块</span><span>名称</span><span>色值</span><span className="text-right">操作</span>
      </div>
      {colors.map((item, idx) => (
        <SortableRow key={item.id} id={item.id} index={idx} dndType={DNDt.COLOR} onMove={moveColor}>
          {(dragRef, isDragging) => (
            <div className={`flex sm:grid sm:grid-cols-[1.5rem_2rem_1fr_8rem_4.5rem] gap-x-4 items-center px-4 py-3
              ${rowBg(idx, isDragging)}`}>
              <DragHandle dragRef={dragRef} />
              <div className="w-6 h-6 rounded-full border border-slate-200 shadow-sm flex-shrink-0"
                style={{ backgroundColor: item.hex }} />
              <span className="flex-1 sm:flex-none text-sm text-slate-700 truncate">{item.name}</span>
              <span className="hidden sm:block text-xs text-slate-400 font-mono tracking-wide">
                {item.hex.toUpperCase()}
              </span>
              <RowActions
                onEdit={() => openEdit('color', item)}
                onDelete={() => setDelConfirm({ target: 'color', id: item.id, label: item.name })}
              />
            </div>
          )}
        </SortableRow>
      ))}
      {colors.length === 0 && <EmptyState />}
    </div>
  );

  const renderSimpleList = (
    items: SimpleItem[],
    dndType: string,
    target: EditTarget,
    onMove: (f: number, t: number) => void,
  ) => (
    <div>
      <div className="hidden sm:grid grid-cols-[1.5rem_1fr_4.5rem] gap-x-4 px-4 py-2 text-xs text-slate-400 border-b border-slate-100">
        <span /><span>名称</span><span className="text-right">操作</span>
      </div>
      {items.map((item, idx) => (
        <SortableRow key={item.id} id={item.id} index={idx} dndType={dndType} onMove={onMove}>
          {(dragRef, isDragging) => (
            <div className={`flex sm:grid sm:grid-cols-[1.5rem_1fr_4.5rem] gap-x-4 items-center px-4 py-3
              ${rowBg(idx, isDragging)}`}>
              <DragHandle dragRef={dragRef} />
              <span className="flex-1 sm:flex-none text-sm text-slate-700 truncate">{item.name}</span>
              <RowActions
                onEdit={() => openEdit(target, item)}
                onDelete={() => setDelConfirm({ target, id: item.id, label: item.name })}
              />
            </div>
          )}
        </SortableRow>
      ))}
      {items.length === 0 && <EmptyState />}
    </div>
  );

  const renderPricedList = (
    items: PricedItem[],
    dndType: string,
    target: EditTarget,
    onMove: (f: number, t: number) => void,
  ) => (
    <div>
      <div className="hidden sm:grid grid-cols-[1.5rem_1fr_7rem_4.5rem] gap-x-4 px-4 py-2 text-xs text-slate-400 border-b border-slate-100">
        <span /><span>名称</span><span>附加价格</span><span className="text-right">操作</span>
      </div>
      {items.map((item, idx) => (
        <SortableRow key={item.id} id={item.id} index={idx} dndType={dndType} onMove={onMove}>
          {(dragRef, isDragging) => (
            <div className={`flex sm:grid sm:grid-cols-[1.5rem_1fr_7rem_4.5rem] gap-x-4 items-center px-4 py-3
              ${rowBg(idx, isDragging)}`}>
              <DragHandle dragRef={dragRef} />
              <span className="flex-1 sm:flex-none text-sm text-slate-700 truncate">{item.name}</span>
              <div className="hidden sm:flex items-center gap-1">
                <span className="text-sm" style={{ color: '#fd780f' }}>￥{item.price.toFixed(2)}</span>
              </div>
              <span className="sm:hidden text-xs ml-auto mr-2" style={{ color: '#fd780f' }}>￥{item.price.toFixed(2)}</span>
              <RowActions
                onEdit={() => openEdit(target, item)}
                onDelete={() => setDelConfirm({ target, id: item.id, label: item.name })}
              />
            </div>
          )}
        </SortableRow>
      ))}
      {items.length === 0 && <EmptyState />}
    </div>
  );

  const renderDefectTab = () => (
    <div>
      <div className="flex gap-0 border-b border-slate-100 bg-slate-50/40">
        {(['defect', 'outcome'] as const).map(sub => {
          const label = sub === 'defect' ? '瑕疵' : '预计效果';
          const count = sub === 'defect' ? defects.length : outcomes.length;
          const active = defectSubTab === sub;
          return (
            <button
              key={sub}
              onClick={() => setDefectSubTab(sub)}
              className={`relative flex items-center gap-1.5 px-5 py-2.5 text-xs transition-colors ${
                active ? 'text-orange-500' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                active ? 'bg-orange-100 text-orange-500' : 'bg-slate-100 text-slate-400'
              }`}>
                {count}
              </span>
              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ backgroundColor: '#fd780f' }} />
              )}
            </button>
          );
        })}
      </div>
      {defectSubTab === 'defect'
        ? renderSimpleList(defects,  DNDt.DEFECT,  'defectItem', moveDefect)
        : renderSimpleList(outcomes, DNDt.OUTCOME, 'outcome',    moveOutcome)}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'color':     return renderColorList();
      case 'brand':     return renderSimpleList(brands, DNDt.BRAND, 'brand', moveBrand);
      case 'defect':    return renderDefectTab();
      case 'accessory': return renderPricedList(accessories, DNDt.ACCESSORY, 'accessory', moveAccessory);
      case 'service':   return renderPricedList(services,    DNDt.SERVICE,   'service',   moveService);
    }
  };

  const renderForm = () => {
    const { target } = modal;

    if (target === 'color') return (
      <div className="space-y-4">
        <FormField label="颜色名称" required>
          <input type="text" value={fName} onChange={e => setFName(e.target.value)}
            placeholder="如：米白、深藏青"
            className={inputCls} />
        </FormField>
        <FormField label="颜色选择" required>
          <div
            className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:border-orange-400 transition-colors"
            onClick={() => colorInputRef.current?.click()}
          >
            <div className="w-8 h-8 rounded-lg border border-slate-200 shadow-sm flex-shrink-0"
              style={{ backgroundColor: fHex }} />
            <div className="flex-1">
              <p className="text-sm text-slate-700 font-mono">{fHex.toUpperCase()}</p>
              <p className="text-xs text-slate-400">点击更换颜色</p>
            </div>
            <div className="w-6 h-6 rounded-full flex-shrink-0 border-2 border-dashed border-slate-300"
              style={{ background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)', opacity: 0.7 }} />
          </div>
          <input ref={colorInputRef} type="color" value={fHex}
            onChange={e => setFHex(e.target.value)} className="sr-only" />
        </FormField>
      </div>
    );

    if (target === 'accessory' || target === 'service') return (
      <div className="space-y-4">
        <FormField label={`${TARGET_LABEL[target]}名称`} required>
          <input type="text" value={fName} onChange={e => setFName(e.target.value)}
            placeholder={target === 'accessory' ? '如：腰带、毛领' : '如：单独洗涤、烘干'}
            className={inputCls} />
        </FormField>
        <FormField label="附加价格（元）" required>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">￥</span>
            <input type="number" min="0" step="0.5" value={fPrice}
              onChange={e => setFPrice(e.target.value)}
              placeholder="0.00"
              className={`${inputCls} pl-7`} />
          </div>
        </FormField>
      </div>
    );

    const placeholder =
      target === 'brand'      ? '如：Armani、Burberry' :
      target === 'defectItem' ? '如：领口污渍、袖口磨损' :
                                '如：可完全去除、可淡化处理';
    return (
      <FormField label={`${TARGET_LABEL[target]}名称`} required>
        <input type="text" value={fName} onChange={e => setFName(e.target.value)}
          placeholder={placeholder}
          className={inputCls} />
      </FormField>
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-5 lg:mb-6">
        <h1 className="text-xl text-slate-800">参数设置</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          管理收衣时的衣物标注选项，可拖拽手柄调整排列顺序
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto border-b border-gray-100">
          <div className="flex min-w-max sm:min-w-0">
            {TABS.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`relative px-5 py-3.5 text-sm whitespace-nowrap transition-colors ${
                    active ? 'text-orange-500' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                    active ? 'bg-orange-100 text-orange-500' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {getTabCount(tab.id)}
                  </span>
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                      style={{ backgroundColor: '#fd780f' }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-slate-50/50">
          <span className="text-sm text-slate-400">共 {currentCount()} 条记录</span>
          <button onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-white transition-all active:scale-95"
            style={{ backgroundColor: '#fd780f' }}
          >
            <Plus className="size-4" />
            {addLabel()}
          </button>
        </div>

        <div>{renderTabContent()}</div>
      </div>

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <span className="text-sm text-slate-800">
                {modal.mode === 'add' ? '新增' : '编辑'} {TARGET_LABEL[modal.target]}
              </span>
              <button onClick={() => setModal(m => ({ ...m, open: false }))}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <X className="size-4" />
              </button>
            </div>
            <div className="px-5 py-4">{renderForm()}</div>
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">
              <button onClick={() => setModal(m => ({ ...m, open: false }))}
                className="px-4 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-100 transition-colors">
                取消
              </button>
              <button onClick={handleSave} disabled={!formValid()}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-white transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#fd780f' }}>
                <Check className="size-3.5" />
                {modal.mode === 'add' ? '确认新增' : '保存修改'}
              </button>
            </div>
          </div>
        </div>
      )}

      {delConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: '#fff1f0' }}>
              <Trash2 className="size-5 text-red-400" />
            </div>
            <p className="text-sm text-slate-800 mb-1">确认删除</p>
            <p className="text-xs text-slate-400 mb-5">
              即将删除「<span className="text-slate-600">{delConfirm.label}</span>」，此操作不可撤销
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDelConfirm(null)}
                className="flex-1 py-2 rounded-xl text-sm text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors">
                取消
              </button>
              <button onClick={handleDelete}
                className="flex-1 py-2 rounded-xl text-sm text-white bg-red-400 hover:bg-red-500 transition-colors">
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const DragHandle = ({ dragRef }: { dragRef: React.Ref<HTMLDivElement> }) => (
  <div ref={dragRef}
    className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors flex-shrink-0 flex items-center">
    <GripVertical className="size-4" />
  </div>
);

const RowActions = ({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) => (
  <div className="flex items-center justify-end gap-1 ml-auto sm:ml-0 flex-shrink-0">
    <button onClick={onEdit}
      className="p-1.5 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-colors">
      <Pencil className="size-3.5" />
    </button>
    <button onClick={onDelete}
      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
      <Trash2 className="size-3.5" />
    </button>
  </div>
);

const FormField = ({ label, required, children }: {
  label: string; required?: boolean; children: React.ReactNode;
}) => (
  <div>
    <label className="block text-xs text-slate-500 mb-1.5">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

function reorder<T>(arr: T[], from: number, to: number): T[] {
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

const rowBg = (idx: number, isDragging: boolean) =>
  `${isDragging ? 'bg-orange-50' : idx % 2 === 0 ? 'bg-white hover:bg-orange-50/30' : 'bg-slate-50/60 hover:bg-orange-50/30'} transition-colors`;

const inputCls =
  'w-full h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all';
